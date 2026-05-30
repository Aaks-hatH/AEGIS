import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { Role } from "@aegis/shared";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";
import { HttpError } from "../utils/http.js";
declare global { namespace Express { interface Request { user?: { id: string; email: string; role: Role; name: string }; } } }
const rolePermissions: Record<Role, string[]> = {
  admin: ["*"], physician: ["patients:read", "patients:write", "triage:write", "queue:read", "queue:write", "ambulances:read", "analytics:read"],
  nurse: ["patients:read", "patients:write", "triage:write", "queue:read", "queue:write", "ambulances:read", "analytics:read"],
  ems: ["ambulances:read", "ambulances:write", "patients:read"], dispatcher: ["ambulances:read", "ambulances:write", "queue:read", "analytics:read"],
  operations_manager: ["patients:read", "queue:read", "queue:write", "ambulances:read", "analytics:read", "audit:read", "settings:read"]
};
export function signToken(user: { _id: unknown; email: string; role: Role; name: string }) {
  return jwt.sign({ sub: String(user._id), email: user.email, role: user.role, name: user.name }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : req.cookies?.aegis_token;
    if (!token) throw new HttpError(401, "Authentication required");
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; email: string; role: Role; name: string };
    const user = await User.findById(payload.sub).lean();
    if (!user || !user.active) throw new HttpError(401, "Account inactive or missing");
    req.user = { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
    next();
  } catch { next(new HttpError(401, "Invalid or expired session")); }
}
export const requirePermission = (permission: string) => async (req: Request, _res: Response, next: NextFunction) => {
  const role = req.user?.role;
  const allowed = role && (rolePermissions[role].includes("*") || rolePermissions[role].includes(permission));
  if (!allowed) {
    await AuditLog.create({ actor: req.user?.id, actorEmail: req.user?.email, action: "permission_denied", resourceType: "permission", status: "failure", metadata: { permission, path: req.path } });
    return next(new HttpError(403, "Insufficient permissions"));
  }
  next();
};
export const permissionsForRole = (role: Role) => rolePermissions[role] ?? [];
