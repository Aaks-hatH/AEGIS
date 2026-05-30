import type { Request } from "express";
import { AuditLog } from "../models/AuditLog.js";
export async function audit(req: Request, action: string, resourceType: string, resourceId?: string, metadata?: Record<string, unknown>, status: "success" | "failure" = "success") {
  await AuditLog.create({ actor: req.user?.id, actorEmail: req.user?.email, action, resourceType, resourceId, status, ipAddress: req.ip, userAgent: req.get("user-agent"), metadata });
}
