import express from "express";
import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  bookingRequests,
  properties,
  users,
} from "../db/schema/index.js";
import { syncUser } from "../middleware/auth.js";

const router = express.Router();

// ─── Schemas ──────────────────────────────────────────────

const createBookingSchema = z.object({
  propertyId: z.string().uuid(),
  note: z.string().trim().max(2000).optional(),
  visitDate: z.string().datetime().optional(),
});

const respondSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
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

type EnrichedBooking = {
  booking: typeof bookingRequests.$inferSelect;
  property: {
    id: string;
    name: string;
    location: string;
    rent: number;
  };
  guest: {
    id: string;
    name: string;
    phone: string | null;
    avatarUrl: string | null;
  };
};

async function enrichBookings(
  rows: (typeof bookingRequests.$inferSelect)[]
): Promise<EnrichedBooking[]> {
  if (rows.length === 0) return [];

  const propIds = Array.from(new Set(rows.map((r) => r.propertyId)));
  const guestIds = Array.from(new Set(rows.map((r) => r.guestId)));

  const [props, guests] = await Promise.all([
    db.select().from(properties).where(inArray(properties.id, propIds)),
    db.select().from(users).where(inArray(users.id, guestIds)),
  ]);

  const propMap = new Map(props.map((p) => [p.id, p]));
  const guestMap = new Map(guests.map((g) => [g.id, g]));

  return rows.map((r) => {
    const p = propMap.get(r.propertyId);
    const g = guestMap.get(r.guestId);
    return {
      booking: r,
      property: {
        id: p?.id || r.propertyId,
        name: p?.name || "Property removed",
        location: p?.location || "",
        rent: p?.rent || 0,
      },
      guest: {
        id: g?.id || r.guestId,
        name: g?.name || "Unknown",
        phone: g?.phone || null,
        avatarUrl: g?.avatarUrl || null,
      },
    };
  });
}

// ─── Routes ──────────────────────────────────────────────

// POST /bookings — guest requests a visit
router.post("/", syncUser, requireAuth, async (req, res) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
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
        message: "Only guests can request visits",
      });
    }

    const { propertyId, note, visitDate } = parsed.data;

    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    if (property.hostId === dbUser.id) {
      return res.status(400).json({
        success: false,
        message: "You can't request to visit your own property",
      });
    }

    // Block duplicate active requests for the same guest/property pair
    const [existing] = await db
      .select()
      .from(bookingRequests)
      .where(
        and(
          eq(bookingRequests.guestId, dbUser.id),
          eq(bookingRequests.propertyId, propertyId),
          eq(bookingRequests.status, "pending")
        )
      )
      .limit(1);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request for this property",
      });
    }

    const [created] = await db
      .insert(bookingRequests)
      .values({
        guestId: dbUser.id,
        propertyId,
        status: "pending",
        note: note?.trim() || null,
        visitDate: visitDate ? new Date(visitDate) : null,
      })
      .returning();

    const [enriched] = await enrichBookings([created]);
    res.status(201).json({ success: true, booking: enriched });
  } catch (err) {
    console.error("Create booking error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create booking request" });
  }
});

// GET /bookings/me — guest's own requests
router.get("/me", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    if (dbUser.role !== "guest") {
      return res
        .status(403)
        .json({ success: false, message: "Guests only" });
    }

    const rows = await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.guestId, dbUser.id))
      .orderBy(desc(bookingRequests.requestedAt));

    const bookings = await enrichBookings(rows);
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("List my bookings error:", err);
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
});

// GET /bookings/host — all requests for properties this host owns
router.get("/host", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    if (dbUser.role !== "host") {
      return res
        .status(403)
        .json({ success: false, message: "Hosts only" });
    }

    const propertyFilter =
      typeof req.query.propertyId === "string"
        ? (req.query.propertyId as string)
        : null;

    // Find properties owned by this host
    const myProps = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.hostId, dbUser.id));

    if (myProps.length === 0) {
      return res.json({ success: true, bookings: [] });
    }

    const ownedIds = myProps.map((p) => p.id);
    const filterIds = propertyFilter
      ? ownedIds.filter((id) => id === propertyFilter)
      : ownedIds;

    if (filterIds.length === 0) {
      return res.json({ success: true, bookings: [] });
    }

    const rows = await db
      .select()
      .from(bookingRequests)
      .where(inArray(bookingRequests.propertyId, filterIds))
      .orderBy(desc(bookingRequests.requestedAt));

    const bookings = await enrichBookings(rows);
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("List host bookings error:", err);
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
});

// PATCH /bookings/:id/respond — host accepts or rejects
router.patch("/:id/respond", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { id } = req.params;

    const parsed = respondSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
        errors: z.treeifyError(parsed.error),
      });
    }

    const [row] = await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.id, id))
      .limit(1);

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Verify host of the property
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, row.propertyId))
      .limit(1);

    if (!property || property.hostId !== dbUser.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not your booking" });
    }

    if (row.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been responded to",
      });
    }

    const now = new Date();
    const [updated] = await db
      .update(bookingRequests)
      .set({
        status: parsed.data.status,
        respondedAt: now,
        updatedAt: now,
      })
      .where(eq(bookingRequests.id, id))
      .returning();

    const [enriched] = await enrichBookings([updated]);
    res.json({ success: true, booking: enriched });
  } catch (err) {
    console.error("Respond booking error:", err);
    res.status(500).json({ success: false, message: "Failed to respond" });
  }
});

// DELETE /bookings/:id — guest cancels their own pending request
router.delete("/:id", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { id } = req.params;

    const [row] = await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.id, id))
      .limit(1);

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (row.guestId !== dbUser.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not your booking" });
    }

    if (row.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      });
    }

    await db.delete(bookingRequests).where(eq(bookingRequests.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ success: false, message: "Failed to cancel" });
  }
});

export default router;
