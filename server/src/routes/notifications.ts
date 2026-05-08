import express from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema/index.js";
import { syncUser } from "../middleware/auth.js";

const router = express.Router();

// GET /notifications — fetch user's notifications
router.get("/", syncUser, async (req, res) => {
  const dbUser = (req as any).dbUser;
  if (!dbUser) return res.status(401).json({ success: false });

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, dbUser.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  res.json({ success: true, notifications: rows });
});

// PATCH /notifications/read-all — mark all as read (MUST be before /:id route)
router.patch("/read-all", syncUser, async (req, res) => {
  const dbUser = (req as any).dbUser;
  if (!dbUser) return res.status(401).json({ success: false });

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, dbUser.id));

  res.json({ success: true });
});

// PATCH /notifications/:id/read — mark one as read
router.patch("/:id/read", syncUser, async (req, res) => {
  const dbUser = (req as any).dbUser;
  if (!dbUser) return res.status(401).json({ success: false });

  const notificationId = req.params.id;
  
  // Validate that id is a string and not an array
  if (!notificationId || Array.isArray(notificationId)) {
    return res.status(400).json({ success: false, error: "Invalid notification ID" });
  }

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));

  res.json({ success: true });
});

export default router;