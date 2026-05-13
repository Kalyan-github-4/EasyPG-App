import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
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
const isProd = process.env.NODE_ENV === "production";

// ─── Core Middleware ─────────────────────────────────────

app.use(helmet());

// CORS: explicitly allow Authorization so Clerk JWTs pass through preflight.
// In production restrict to your known origin(s); in dev allow all.
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : "*";

app.use(
  cors({
    origin: allowedOrigins,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Compress all responses (gzip/brotli) — huge win for JSON payloads
app.use(compression());

// Only log in development; skip health-check spam
if (!isProd) {
  app.use(
    morgan("dev", {
      skip: (req) => req.url === "/health",
    })
  );
} else {
  // In production, log only slow requests (>500ms) or errors
  app.use(
    morgan("short", {
      skip: (req, res) => res.statusCode < 400,
    })
  );
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Slow Request Logger (helps diagnose cold starts vs slow queries) ───
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (isProd && duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.url} — ${duration}ms`);
    }
  });
  next();
});

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
      message: isProd ? "Internal server error" : err.message,
    });
  }
);

export default app;
