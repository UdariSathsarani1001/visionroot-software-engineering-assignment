import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import requestRoutes from "./routes/request.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// ── Security ──────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Global rate limit: 200 requests per 15 minutes
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." },
    },
  })
);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many auth attempts, please try again later." },
  },
});

// ── Parsing & Logging ─────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Health ────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

// ── Central error handler ─────────────────────────────────
app.use(errorMiddleware);

export default app;
