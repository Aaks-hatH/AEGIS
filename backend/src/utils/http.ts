import type { Response } from "express";
export class HttpError extends Error { status: number; details?: unknown; constructor(status: number, message: string, details?: unknown) { super(message); this.status = status; this.details = details; }}
export const ok = <T>(res: Response, data: T, message?: string, meta?: Record<string, unknown>) => res.json({ success: true, data, message, meta });
export const created = <T>(res: Response, data: T, message?: string) => res.status(201).json({ success: true, data, message });
