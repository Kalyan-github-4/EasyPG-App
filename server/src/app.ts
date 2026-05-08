import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";

import { healthRouter } from "./routes/health.js";
import { userRouter } from "./routes/user.js";
import uploadRouter from "./routes/upload.js";
import propertiesRouter from "./routes/properties.js";
import inquiriesRouter from "./routes/inquiries.js";
import bookingsRouter from "./routes/bookings.js";
import savedRouter from "./routes/saved.js";
import devicesRouter from "./routes/devices.js";
import notificationsRouter from "./routes/notifications.js";

const app = express();

// ─── Core Middleware ─────────────────────────────────────

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Public Routes (no auth required) ───────────────────

app.use("/health", healthRouter);

// ─── Clerk Auth Middleware ──────────────────────────────
// Only enable Clerk if keys are configured.
// This lets the server boot for DB-only work before Clerk is set up.

const clerkKey = process.env.CLERK_PUBLISHABLE_KEY;
if (clerkKey && clerkKey.startsWith("pk_")) {
  app.use(clerkMiddleware());
  console.log("✅ Clerk auth middleware enabled");
} else {
  console.warn("⚠️  Clerk keys not configured — auth middleware DISABLED. Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env");
}

// ─── Authenticated Routes ────────────────────────────────

app.use("/users", userRouter);
app.use("/uploads", uploadRouter);
app.use("/properties", propertiesRouter);
app.use("/inquiries", inquiriesRouter);
app.use("/bookings", bookingsRouter);
app.use("/saved", savedRouter);
app.use("/devices", devicesRouter);
app.use("/notifications", notificationsRouter);

// ─── Global Error Handler ────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  }
);

export default app;
