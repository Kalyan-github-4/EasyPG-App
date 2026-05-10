import { Router, Request, Response } from "express";
import { requireAuth } from "@clerk/express";
import { syncUser, invalidateUserCache } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

export const userRouter = Router();

/**
 * GET /users/me
 * Returns the current authenticated user's profile from our DB.
 * Creates the user record if it doesn't exist yet (first login sync).
 */
userRouter.get(
  "/me",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    const dbUser = (req as any).dbUser;
    res.json({ success: true, user: dbUser });
  }
);

/**
 * PUT /users/me/role
 * Sets the user's role (guest or host).
 * Called once during onboarding after the user picks their role.
 */
userRouter.put(
  "/me/role",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    const dbUser = (req as any).dbUser;
    const { role } = req.body;

    if (!role || !["guest", "host"].includes(role)) {
      res.status(400).json({
        success: false,
        message: "Role must be 'guest' or 'host'",
      });
      return;
    }

    const [updated] = await db
      .update(users)
      .set({
        role,
        hostProfileCompleted: role === "host" ? true : dbUser.hostProfileCompleted,
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id))
      .returning();

    // Clear cached user so next request picks up new role immediately
    invalidateUserCache(dbUser.clerkId);

    res.json({ success: true, user: updated });
  }
);

/**
 * PUT /users/me
 * Updates the current user's profile (name, phone).
 */
userRouter.put(
  "/me",
  requireAuth(),
  syncUser,
  async (req: Request, res: Response) => {
    const dbUser = (req as any).dbUser;
    const { name, phone, avatarUrl } = req.body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, dbUser.id))
      .returning();

    // Clear cached user so next request sees updated profile
    invalidateUserCache(dbUser.clerkId);

    res.json({ success: true, user: updated });
  }
);
