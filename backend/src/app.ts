import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authLoginRateLimiter } from "./middleware/rateLimiters.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

// Render and most hosts terminate TLS at a proxy. Trust it so secure cookies
// and per-IP rate limiting observe the real client protocol and address.
if (env.nodeEnv === "production") app.set("trust proxy", 1);

// CSP disabled: the bundled SPA (Recharts / Framer Motion) injects inline styles
// that helmet's default policy would block, producing a blank page.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));
app.use("/api/auth/login", authLoginRateLimiter);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "AEGIS API" }));
app.use("/api", routes);

// Serve the built frontend when present (single-service deploy). The SPA is then
// same-origin with the API, so auth cookies need no cross-site configuration.
const clientDir = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path === "/health") return next();
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);
