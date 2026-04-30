import express from "express";
import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  savedListings,
  properties,
  propertyPhotos,
  facilities,
} from "../db/schema/index.js";
import { syncUser } from "../middleware/auth.js";

const router = express.Router();

function requireAuth(
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

// GET /saved — guest's saved properties (full property details)
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
    const [props, photos, facs] = await Promise.all([
      db.select().from(properties).where(inArray(properties.id, ids)),
      db
        .select()
        .from(propertyPhotos)
        .where(inArray(propertyPhotos.propertyId, ids)),
      db.select().from(facilities).where(inArray(facilities.propertyId, ids)),
    ]);

    const propMap = new Map(props.map((p) => [p.id, p]));

    const enriched = rows
      .map((r) => {
        const p = propMap.get(r.propertyId);
        if (!p) return null;
        return {
          ...p,
          photos: photos
            .filter((ph) => ph.propertyId === p.id)
            .sort((a, b) => a.displayOrder - b.displayOrder),
          facilities: facs
            .filter((f) => f.propertyId === p.id)
            .map((f) => f.type),
        };
      })
      .filter((x) => x !== null);

    res.json({ success: true, properties: enriched });
  } catch (err) {
    console.error("List saved error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to load saved listings" });
  }
});

// GET /saved/ids — lightweight: just the property IDs the user has saved
router.get("/ids", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const rows = await db
      .select({ propertyId: savedListings.propertyId })
      .from(savedListings)
      .where(eq(savedListings.guestId, dbUser.id));
    res.json({ success: true, ids: rows.map((r) => r.propertyId) });
  } catch (err) {
    console.error("List saved ids error:", err);
    res.status(500).json({ success: false, message: "Failed to load" });
  }
});

// POST /saved/:propertyId — save (idempotent)
router.post("/:propertyId", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { propertyId } = req.params;

    const [property] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    const [existing] = await db
      .select()
      .from(savedListings)
      .where(
        and(
          eq(savedListings.guestId, dbUser.id),
          eq(savedListings.propertyId, propertyId)
        )
      )
      .limit(1);

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
    res.status(500).json({ success: false, message: "Failed to save" });
  }
});

// DELETE /saved/:propertyId — unsave (idempotent)
router.delete("/:propertyId", syncUser, requireAuth, async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const { propertyId } = req.params;

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
    res.status(500).json({ success: false, message: "Failed to unsave" });
  }
});

export default router;
