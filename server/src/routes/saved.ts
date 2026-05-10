import express from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/index.js";
import {
  savedListings,
  properties,
  propertyPhotos,
  facilities,
} from "../db/schema/index.js";
import { syncUser } from "../middleware/auth.js";

const router = express.Router();

// ---------- Types ----------
type PropertyParams = { propertyId: string };

// ---------- Validation ----------
const propertyParamSchema = z.object({
  propertyId: z.string().uuid(),
});

// ---------- Middleware ----------
function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const dbUser = (req as any).dbUser;
  if (!dbUser) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
  next();
}

// ---------- GET /saved ----------
router.get("/", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;

    const rows = await db
      .select({
        propertyId: savedListings.propertyId,
        savedAt: savedListings.savedAt,
      })
      .from(savedListings)
      .where(eq(savedListings.guestId, dbUser.id))
      .orderBy(desc(savedListings.savedAt));

    if (rows.length === 0) {
      return res.json({ success: true, properties: [] });
    }

    const ids = rows.map((r) => r.propertyId);

    // Load all enrichment data in parallel
    const [props, photos, facs] = await Promise.all([
      db.select().from(properties).where(inArray(properties.id, ids)),
      db
        .select()
        .from(propertyPhotos)
        .where(inArray(propertyPhotos.propertyId, ids)),
      db
        .select()
        .from(facilities)
        .where(inArray(facilities.propertyId, ids)),
    ]);

    // Use Maps for O(1) lookups instead of O(n) filters
    const propMap = new Map(props.map((p) => [p.id, p]));

    const photoMap = new Map<string, typeof photos>();
    for (const ph of photos) {
      const arr = photoMap.get(ph.propertyId) ?? [];
      arr.push(ph);
      photoMap.set(ph.propertyId, arr);
    }

    const facMap = new Map<string, string[]>();
    for (const f of facs) {
      const arr = facMap.get(f.propertyId) ?? [];
      arr.push(f.type);
      facMap.set(f.propertyId, arr);
    }

    const enriched = rows
      .map((r) => {
        const p = propMap.get(r.propertyId);
        if (!p) return null;

        return {
          ...p,
          photos: (photoMap.get(p.id) ?? []).sort(
            (a, b) => a.displayOrder - b.displayOrder
          ),
          facilities: facMap.get(p.id) ?? [],
        };
      })
      .filter((x) => x !== null);

    res.json({ success: true, properties: enriched });
  } catch (err) {
    console.error("List saved error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load saved listings",
    });
  }
});

// ---------- GET /saved/ids ----------
router.get("/ids", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;

    const rows = await db
      .select({ propertyId: savedListings.propertyId })
      .from(savedListings)
      .where(eq(savedListings.guestId, dbUser.id));

    res.json({
      success: true,
      ids: rows.map((r) => r.propertyId),
    });
  } catch (err) {
    console.error("List saved ids error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load",
    });
  }
});

// ---------- POST /saved/:propertyId ----------
router.post(
  "/:propertyId",
  syncUser,
  requireAuth,
  async (req: express.Request<PropertyParams>, res) => {
    try {
      const dbUser = (req as any).dbUser;

      // ✅ Validate param
      const { propertyId } = propertyParamSchema.parse(req.params);

      // Check property existence + existing save in parallel
      const [[property], [existing]] = await Promise.all([
        db
          .select({ id: properties.id })
          .from(properties)
          .where(eq(properties.id, propertyId))
          .limit(1),
        db
          .select({ id: savedListings.id })
          .from(savedListings)
          .where(
            and(
              eq(savedListings.guestId, dbUser.id),
              eq(savedListings.propertyId, propertyId)
            )
          )
          .limit(1),
      ]);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }

      if (existing) {
        return res.json({ success: true, saved: true });
      }

      await db.insert(savedListings).values({
        guestId: dbUser.id,
        propertyId,
      });

      res.status(201).json({ success: true, saved: true });
    } catch (err) {
      console.error("Save listing error:", err);

      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid propertyId",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to save",
      });
    }
  }
);

// ---------- DELETE /saved/:propertyId ----------
router.delete(
  "/:propertyId",
  syncUser,
  requireAuth,
  async (req: express.Request<PropertyParams>, res) => {
    try {
      const dbUser = (req as any).dbUser;

      // ✅ Validate param
      const { propertyId } = propertyParamSchema.parse(req.params);

      await db
        .delete(savedListings)
        .where(
          and(
            eq(savedListings.guestId, dbUser.id),
            eq(savedListings.propertyId, propertyId)
          )
        );

      res.json({ success: true, saved: false });
    } catch (err) {
      console.error("Unsave listing error:", err);

      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid propertyId",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to unsave",
      });
    }
  }
);

export default router;