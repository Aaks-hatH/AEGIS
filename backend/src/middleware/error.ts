import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http.js";
export function notFound(req: Request, _res: Response, next: NextFunction) { next(new HttpError(404, `Route not found: ${req.method} ${req.path}`)); }
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) return res.status(400).json({ success: false, message: "Validation failed", details: err.flatten() });
  if (err instanceof HttpError) return res.status(err.status).json({ success: false, message: err.message, details: err.details });
  const message = err instanceof Error ? err.message : "Unexpected server error";
  return res.status(500).json({ success: false, message });
}
