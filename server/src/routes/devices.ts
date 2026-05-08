import express from "express";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { userDevices } from "../db/schema/index.js";
import { syncUser } from "../middleware/auth.js";

const router = express.Router();

const registerSchema = z.object({
  fcmToken: z.string().min(1),
  platform: z.enum(["ios", "android"]),
});

// POST /devices — register or refresh FCM token
router.post("/", syncUser, async (req, res) => {
  const dbUser = (req as any).dbUser;
  if (!dbUser) return res.status(401).json({ success: false });

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false });

  const { fcmToken, platform } = parsed.data;

  // Upsert — if token already exists for this user, skip; else insert
  const [existing] = await db
    .select()
    .from(userDevices)
    .where(
      and(
        eq(userDevices.userId, dbUser.id),
        eq(userDevices.fcmToken, fcmToken)
      )
    )
    .limit(1);

  if (!existing) {
    await db.insert(userDevices).values({
      userId: dbUser.id,
      fcmToken,
      platform,
    });
  }

  res.json({ success: true });
});

// DELETE /devices — unregister on logout
router.delete("/", syncUser, async (req, res) => {
  const dbUser = (req as any).dbUser;
  if (!dbUser) return res.status(401).json({ success: false });

  const { fcmToken } = req.body;
  if (!fcmToken) return res.status(400).json({ success: false });

  await db
    .delete(userDevices)
    .where(
      and(
        eq(userDevices.userId, dbUser.id),
        eq(userDevices.fcmToken, fcmToken)
      )
    );

  res.json({ success: true });
});

export default router;