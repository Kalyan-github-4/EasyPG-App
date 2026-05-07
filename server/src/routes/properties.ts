import express from "express";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  properties,
  propertyPhotos,
  facilities,
  facilityTypeEnum,
  propertyTypeEnum,
  propertyGenderEnum,
  users,
} from "../db/schema/index.js";
import { syncUser, requireRole } from "../middleware/auth.js";
import { deleteImages } from "../services/cloudinary.js";

const router = express.Router();

// ─── Validation ──────────────────────────────────────────

const facilityEnum = z.enum(facilityTypeEnum.enumValues);
const propertyType = z.enum(propertyTypeEnum.enumValues);
const propertyGender = z.enum(propertyGenderEnum.enumValues);

const photoSchema = z.object({
  url: z.url(),
  publicId: z.string().min(1),
  displayOrder: z.number().int().min(0).optional(),
});

const createPropertySchema = z.object({
  propertyType: propertyType.optional().default("pg"),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  city: z.string().trim().min(2).max(80),
  location: z.string().min(1).max(500),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rent: z.number().int().positive(),
  gender: propertyGender.optional().default("any"),
  isAvailable: z.boolean().optional(),
  facilities: z.array(facilityEnum).default([]),
  photos: z.array(photoSchema).default([]),
});

const updatePropertySchema = createPropertySchema.partial();

// ─── Helpers ─────────────────────────────────────────────

async function loadPropertyWithRelations(id: string) {
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!property) return null;

  const [photos, facs, hostRows] = await Promise.all([
    db.select().from(propertyPhotos).where(eq(propertyPhotos.propertyId, id)),
    db.select().from(facilities).where(eq(facilities.propertyId, id)),
    db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, property.hostId))
      .limit(1),
  ]);

  return {
    ...property,
    photos: photos.sort((a, b) => a.displayOrder - b.displayOrder),
    facilities: facs.map((f) => f.type),
    host: hostRows[0] ?? null,
  };
}

function getRouteParamId(id: string | string[] | undefined) {
  if (typeof id === "string") return id;
  if (Array.isArray(id) && id.length > 0) return id[0];
  return null;
}

// ─── Routes ──────────────────────────────────────────────

// GET /properties — public list
router.get("/", async (_req, res) => {
  try {
    const all = await db.select().from(properties);
    if (all.length === 0) return res.json({ success: true, properties: [] });

    const ids = all.map((p) => p.id);
    const [photos, facs] = await Promise.all([
      db.select().from(propertyPhotos).where(inArray(propertyPhotos.propertyId, ids)),
      db.select().from(facilities).where(inArray(facilities.propertyId, ids)),
    ]);

    const enriched = all.map((p) => ({
      ...p,
      photos: photos
        .filter((ph) => ph.propertyId === p.id)
        .sort((a, b) => a.displayOrder - b.displayOrder),
      facilities: facs.filter((f) => f.propertyId === p.id).map((f) => f.type),
    }));

    res.json({ success: true, properties: enriched });
  } catch (err) {
    console.error("List properties error:", err);
    res.status(500).json({ success: false, message: "Failed to list properties" });
  }
});

// GET /properties/me — host's own properties
router.get("/me", syncUser, requireRole("host"), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const mine = await db
      .select()
      .from(properties)
      .where(eq(properties.hostId, dbUser.id));

    if (mine.length === 0) return res.json({ success: true, properties: [] });

    const ids = mine.map((p) => p.id);
    const [photos, facs] = await Promise.all([
      db.select().from(propertyPhotos).where(inArray(propertyPhotos.propertyId, ids)),
      db.select().from(facilities).where(inArray(facilities.propertyId, ids)),
    ]);

    const enriched = mine.map((p) => ({
      ...p,
      photos: photos
        .filter((ph) => ph.propertyId === p.id)
        .sort((a, b) => a.displayOrder - b.displayOrder),
      facilities: facs.filter((f) => f.propertyId === p.id).map((f) => f.type),
    }));

    res.json({ success: true, properties: enriched });
  } catch (err) {
    console.error("List my properties error:", err);
    res.status(500).json({ success: false, message: "Failed to list properties" });
  }
});

// GET /properties/:id — public detail
router.get("/:id", async (req, res) => {
  try {
    const id = getRouteParamId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid property id" });
    }

    const property = await loadPropertyWithRelations(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, property });
  } catch (err) {
    console.error("Get property error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch property" });
  }
});

// POST /properties — create
router.post("/", syncUser, requireRole("host"), async (req, res) => {
  try {
    const parsed = createPropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
        errors: z.treeifyError(parsed.error),
      });
    }

    const dbUser = (req as any).dbUser;
    const input = parsed.data;

    const [created] = await db
      .insert(properties)
      .values({
        hostId: dbUser.id,
        propertyType: input.propertyType,
        name: input.name,
        description: input.description,
        city: input.city.trim(),
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        rent: input.rent,
        gender: input.gender,
        isAvailable: input.isAvailable ?? true,
      })
      .returning();

    if (input.photos.length > 0) {
      await db.insert(propertyPhotos).values(
        input.photos.map((ph, idx) => ({
          propertyId: created.id,
          url: ph.url,
          publicId: ph.publicId,
          displayOrder: ph.displayOrder ?? idx,
        }))
      );
    }

    if (input.facilities.length > 0) {
      await db.insert(facilities).values(
        input.facilities.map((type) => ({
          propertyId: created.id,
          type,
        }))
      );
    }

    const full = await loadPropertyWithRelations(created.id);
    res.status(201).json({ success: true, property: full });
  } catch (err) {
    console.error("Create property error:", err);
    res.status(500).json({ success: false, message: "Failed to create property" });
  }
});

// PUT /properties/:id — update (host only)
router.put("/:id", syncUser, requireRole("host"), async (req, res) => {
  try {
    const parsed = updatePropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
        errors: z.treeifyError(parsed.error),
      });
    }

    const dbUser = (req as any).dbUser;
    const id = getRouteParamId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid property id" });
    }

    const [existing] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    if (existing.hostId !== dbUser.id) {
      return res.status(403).json({ success: false, message: "Not your property" });
    }

    const input = parsed.data;
    const scalarUpdates: Record<string, unknown> = {};
    if (input.propertyType !== undefined) scalarUpdates.propertyType = input.propertyType;
    if (input.name !== undefined) scalarUpdates.name = input.name;
    if (input.description !== undefined) scalarUpdates.description = input.description;
    if (input.city !== undefined) scalarUpdates.city = input.city.trim();
    if (input.location !== undefined) scalarUpdates.location = input.location;
    if (input.latitude !== undefined) scalarUpdates.latitude = input.latitude;
    if (input.longitude !== undefined) scalarUpdates.longitude = input.longitude;
    if (input.rent !== undefined) scalarUpdates.rent = input.rent;
    if (input.gender !== undefined) scalarUpdates.gender = input.gender;
    if (input.isAvailable !== undefined) scalarUpdates.isAvailable = input.isAvailable;

    if (Object.keys(scalarUpdates).length > 0) {
      scalarUpdates.updatedAt = new Date();
      await db.update(properties).set(scalarUpdates).where(eq(properties.id, id));
    }

    // Replace photos if provided
    if (input.photos !== undefined) {
      const oldPhotos = await db
        .select()
        .from(propertyPhotos)
        .where(eq(propertyPhotos.propertyId, id));

      const oldPublicIds = oldPhotos
        .map((p) => p.publicId)
        .filter((pid): pid is string => !!pid);

      await db.delete(propertyPhotos).where(eq(propertyPhotos.propertyId, id));

      if (input.photos.length > 0) {
        await db.insert(propertyPhotos).values(
          input.photos.map((ph, idx) => ({
            propertyId: id,
            url: ph.url,
            publicId: ph.publicId,
            displayOrder: ph.displayOrder ?? idx,
          }))
        );
      }

      const keptPublicIds = new Set(input.photos.map((p) => p.publicId));
      const toDelete = oldPublicIds.filter((pid) => !keptPublicIds.has(pid));
      if (toDelete.length > 0) {
        deleteImages(toDelete).catch((e) =>
          console.error("Cloudinary cleanup failed:", e)
        );
      }
    }

    // Replace facilities if provided
    if (input.facilities !== undefined) {
      await db.delete(facilities).where(eq(facilities.propertyId, id));
      if (input.facilities.length > 0) {
        await db.insert(facilities).values(
          input.facilities.map((type) => ({ propertyId: id, type }))
        );
      }
    }

    const full = await loadPropertyWithRelations(id);
    res.json({ success: true, property: full });
  } catch (err) {
    console.error("Update property error:", err);
    res.status(500).json({ success: false, message: "Failed to update property" });
  }
});

// DELETE /properties/:id — host only, also cleans up Cloudinary
router.delete("/:id", syncUser, requireRole("host"), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const id = getRouteParamId(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid property id" });
    }

    const [existing] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    if (existing.hostId !== dbUser.id) {
      return res.status(403).json({ success: false, message: "Not your property" });
    }

    const photos = await db
      .select()
      .from(propertyPhotos)
      .where(eq(propertyPhotos.propertyId, id));

    const publicIds = photos
      .map((p) => p.publicId)
      .filter((pid): pid is string => !!pid);

    // Cascade deletes photos + facilities via FK
    await db.delete(properties).where(eq(properties.id, id));

    if (publicIds.length > 0) {
      deleteImages(publicIds).catch((e) =>
        console.error("Cloudinary cleanup failed:", e)
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete property error:", err);
    res.status(500).json({ success: false, message: "Failed to delete property" });
  }
});

export default router;
