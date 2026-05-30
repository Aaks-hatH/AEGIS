import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.path}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) return res.status(400).json({ success: false, message: "Validation failed", details: err.flatten() });
  if (err instanceof HttpError) {
    const message = env.nodeEnv === "production" && err.status >= 500 ? "Internal server error" : err.message;
    return res.status(err.status).json({ success: false, message, details: err.details });
  }
  const rawMessage = err instanceof Error ? err.message : "Unexpected server error";
  const message = env.nodeEnv === "production" ? "Internal server error" : rawMessage;
  return res.status(500).json({ success: false, message });
}
