import express from "express";
import { z } from "zod";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { inquiries, inquiryMessages, properties, propertyPhotos, users } from "../db/schema/index.js";
import { syncUser } from "../middleware/auth.js";

const router = express.Router();

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 50;

function parsePagination(query: Record<string, unknown>) {
  const rawLimit = Number(query.limit);
  const rawOffset = Number(query.offset);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_PAGE_LIMIT)
    : DEFAULT_PAGE_LIMIT;
  const offset = Number.isFinite(rawOffset)
    ? Math.max(Math.trunc(rawOffset), 0)
    : 0;
  return { limit, offset };
}

// ─── Schemas ──────────────────────────────────────────────

const createInquirySchema = z.object({
  propertyId: z.string().uuid(),
  message: z.string().trim().min(1).max(2000),
});

const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

// ─── Helpers ─────────────────────────────────────────────

async function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const dbUser = (req as any).dbUser;
  if (!dbUser) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }
  next();
}

function previewOf(body: string): string {
  const trimmed = body.trim().replace(/\s+/g, " ");
  return trimmed.length > 240 ? trimmed.slice(0, 237) + "…" : trimmed;
}

type ThreadRow = {
  inquiry: typeof inquiries.$inferSelect;
  property: {
    id: string;
    name: string;
    location: string;
    rent: number;
    coverUrl: string | null;
  };
  counterpart: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

async function enrichThreads(
  rows: (typeof inquiries.$inferSelect)[],
  currentUserId: string
): Promise<ThreadRow[]> {
  if (rows.length === 0) return [];

  const propIds = Array.from(new Set(rows.map((r) => r.propertyId)));
  const counterpartIds = Array.from(
    new Set(
      rows.map((r) => (r.guestId === currentUserId ? r.hostId : r.guestId))
    )
  );

  // Only select needed columns + get cover photos with a subquery
  const [props, partyUsers, coverPhotos] = await Promise.all([
    db
      .select({
        id: properties.id,
        name: properties.name,
        location: properties.location,
        rent: properties.rent,
      })
      .from(properties)
      .where(inArray(properties.id, propIds)),
    db
      .select({
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(inArray(users.id, counterpartIds)),
    db.execute(sql`
      SELECT DISTINCT ON (property_id) property_id, url
      FROM property_photos
      WHERE property_id IN (${sql.join(
      propIds.map((id) => sql`${id}`),
      sql`, `
    )})
      ORDER BY property_id, display_order ASC
    `),
  ]);

  const propMap = new Map(props.map((p) => [p.id, p]));
  const userMap = new Map(partyUsers.map((u) => [u.id, u]));
  type CoverRow = { property_id: string; url: string };
  const coverRows: CoverRow[] =
    (coverPhotos as unknown as { rows: CoverRow[] }).rows ??
    (coverPhotos as unknown as CoverRow[]);
  const coverMap = new Map(coverRows.map((r) => [r.property_id, r.url]));

  return rows.map((r) => {
    const p = propMap.get(r.propertyId);
    const counterpartId = r.guestId === currentUserId ? r.hostId : r.guestId;
    const u = userMap.get(counterpartId);

    return {
      inquiry: r,
      property: {
        id: p?.id || r.propertyId,
        name: p?.name || "Property removed",
        location: p?.location || "",
        rent: p?.rent || 0,
        coverUrl: (coverMap.get(r.propertyId) as string) || null,
      },
      counterpart: {
        id: u?.id || counterpartId,
        name: u?.name || "Unknown user",
        avatarUrl: u?.avatarUrl || null,
      },
    };
  });
}

// ─── Routes ──────────────────────────────────────────────

// POST /inquiries — create thread + first message (guest only)
router.post("/", syncUser, requireAuth, async (req, res) => {
  try {
    const parsed = createInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
        errors: z.treeifyError(parsed.error),
      });
    }

    const dbUser = (req as any).dbUser;
    if (dbUser.role !== "guest") {
      return res.status(403).json({
        success: false,
        message: "Only guests can start inquiries",
      });
    }

    const { propertyId, message } = parsed.data;

    // Load property + check existing thread in parallel
    const [[property], [existing]] = await Promise.all([
      db
        .select({ id: properties.id, hostId: properties.hostId })
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1),
      db
        .select()
        .from(inquiries)
        .where(
          and(
            eq(inquiries.guestId, dbUser.id),
            eq(inquiries.propertyId, propertyId)
          )
        )
        .limit(1),
    ]);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (property.hostId === dbUser.id) {
      return res.status(400).json({
        success: false,
        message: "You can't message your own property",
      });
    }

    const now = new Date();
    let inquiryRow: typeof inquiries.$inferSelect;

    if (existing) {
      inquiryRow = existing;
    } else {
      const [created] = await db
        .insert(inquiries)
        .values({
          guestId: dbUser.id,
          hostId: property.hostId,
          propertyId,
          lastMessageAt: now,
          lastMessagePreview: previewOf(message),
          guestUnread: 0,
          hostUnread: 1,
        })
        .returning();
      inquiryRow = created;
    }

    // Insert message + update metadata in parallel (if reusing thread)
    const tasks: Promise<any>[] = [
      db.insert(inquiryMessages).values({
        inquiryId: inquiryRow.id,
        senderId: dbUser.id,
        body: message.trim(),
      }),
    ];

    if (existing) {
      tasks.push(
        db
          .update(inquiries)
          .set({
            lastMessageAt: now,
            lastMessagePreview: previewOf(message),
            hostUnread: sql`${inquiries.hostUnread} + 1`,
          })
          .where(eq(inquiries.id, inquiryRow.id))
      );
    }

    await Promise.all(tasks);

    const [refreshed] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryRow.id))
      .limit(1);

    const [enriched] = await enrichThreads([refreshed], dbUser.id);
    res.status(201).json({ success: true, thread: enriched });
  } catch (err) {
    console.error("Create inquiry error:", err);
    res.status(500).json({ success: false, message: "Failed to create inquiry" });
  }
});

// GET /inquiries — list threads for current user (guest or host)
router.get("/", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const propertyFilter = typeof req.query.propertyId === "string"
      ? (req.query.propertyId as string)
      : null;

    const { limit, offset } = parsePagination(req.query as Record<string, unknown>);

    const conditions = [
      or(eq(inquiries.guestId, dbUser.id), eq(inquiries.hostId, dbUser.id)),
    ];
    if (propertyFilter) {
      conditions.push(eq(inquiries.propertyId, propertyFilter));
    }
    const whereClause = and(...conditions);

    const [countResult, rows] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(inquiries)
        .where(whereClause),
      db
        .select()
        .from(inquiries)
        .where(whereClause)
        .orderBy(desc(inquiries.lastMessageAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = Number(countResult[0]?.count) || 0;
    const threads = await enrichThreads(rows, dbUser.id);
    const nextOffset = offset + rows.length;
    const hasMore = nextOffset < total;

    res.json({
      success: true,
      threads,
      pagination: { limit, offset, total, hasMore, nextOffset: hasMore ? nextOffset : null },
    });
  } catch (err) {
    console.error("List inquiries error:", err);
    res.status(500).json({ success: false, message: "Failed to load inquiries" });
  }
});

// GET /inquiries/:id — thread detail + messages
router.get("/:id", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;

    const [row] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, req.params.id as string))
      .limit(1);

    if (!row) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    if (row.guestId !== dbUser.id && row.hostId !== dbUser.id) {
      return res.status(403).json({ success: false, message: "Not your inquiry" });
    }

    // Enrich thread + load messages in parallel
    const [enrichedArr, messages] = await Promise.all([
      enrichThreads([row], dbUser.id),
      db
        .select()
        .from(inquiryMessages)
        .where(eq(inquiryMessages.inquiryId, req.params.id as string))
        .orderBy(inquiryMessages.createdAt),
    ]);

    res.json({
      success: true,
      thread: enrichedArr[0],
      messages,
    });
  } catch (err) {
    console.error("Get inquiry error:", err);
    res.status(500).json({ success: false, message: "Failed to load inquiry" });
  }
});

// POST /inquiries/:id/messages — send a message
router.post("/:id/messages", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;

    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
        errors: z.treeifyError(parsed.error),
      });
    }

    const [row] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, req.params.id as string))
      .limit(1);

    if (!row) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    if (row.guestId !== dbUser.id && row.hostId !== dbUser.id) {
      return res.status(403).json({ success: false, message: "Not your inquiry" });
    }

    const body = parsed.data.body.trim();
    const isGuestSender = dbUser.id === row.guestId;

    // Insert message + update thread metadata in parallel
    const [[message]] = await Promise.all([
      db
        .insert(inquiryMessages)
        .values({
          inquiryId: req.params.id as string,
          senderId: dbUser.id,
          body,
        })
        .returning(),
      db
        .update(inquiries)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: previewOf(body),
          guestUnread: isGuestSender
            ? row.guestUnread
            : sql`${inquiries.guestUnread} + 1`,
          hostUnread: isGuestSender
            ? sql`${inquiries.hostUnread} + 1`
            : row.hostUnread,
        })
        .where(eq(inquiries.id, req.params.id as string)),
    ]);

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// PATCH /inquiries/:id/read — mark this user's unread count to 0
router.patch("/:id/read", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;

    const [row] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, req.params.id as string))
      .limit(1);

    if (!row) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    if (row.guestId !== dbUser.id && row.hostId !== dbUser.id) {
      return res.status(403).json({ success: false, message: "Not your inquiry" });
    }

    const isGuest = row.guestId === dbUser.id;
    await db
      .update(inquiries)
      .set({
        guestUnread: isGuest ? 0 : row.guestUnread,
        hostUnread: isGuest ? row.hostUnread : 0,
      })
      .where(eq(inquiries.id, req.params.id as string));

    res.json({ success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ success: false, message: "Failed to mark read" });
  }
});

export default router;
