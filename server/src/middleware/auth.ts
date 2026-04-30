import { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

/**
 * Middleware: Sync Clerk user to our database.
 * After Clerk verifies the JWT, this finds or creates the user in our DB
 * so downstream route handlers can trust `req.dbUser`.
 */
export async function syncUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return next(); // Not authenticated — let requireAuth handle it
    }

    // Check if user already exists in our DB
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (existing.length > 0) {
      (req as any).dbUser = existing[0];
      return next();
    }

    // First-time user: fetch from Clerk and create in our DB
    const clerkUser = await clerkClient.users.getUser(userId);

    // Build name: prefer firstName + lastName from Clerk form,
    // fall back to email prefix (e.g. "john" from john@gmail.com)
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const nameFromClerk =
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
    const nameFromEmail = email.split("@")[0] || "User";
    const resolvedName = nameFromClerk || nameFromEmail;

    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: userId,
        name: resolvedName,
        email,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
        avatarUrl: clerkUser.imageUrl || null,
        role: "guest",
        hostProfileCompleted: false,
      })
      .returning();

    (req as any).dbUser = newUser;
    next();
  } catch (error) {
    console.error("syncUser error:", error);
    next(error);
  }
}

/**
 * Middleware: Require a specific role.
 * Must be used AFTER syncUser.
 */
export function requireRole(role: "guest" | "host") {
  return (req: Request, res: Response, next: NextFunction) => {
    const dbUser = (req as any).dbUser;

    if (!dbUser) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (dbUser.role !== role) {
      res.status(403).json({
        success: false,
        message: `This action requires the '${role}' role`,
      });
      return;
    }

    next();
  };
}
