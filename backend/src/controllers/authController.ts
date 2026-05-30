import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { HttpError, ok } from "../utils/http.js";
import { permissionsForRole, signToken } from "../middleware/auth.js";
import { audit } from "../services/auditService.js";
import { env } from "../config/env.js";
export async function login(req: Request, res: Response) {
  const { email, password } = req.body; const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) throw new HttpError(401, "Invalid credentials");
  if (user.lockedUntil && user.lockedUntil > new Date()) throw new HttpError(423, "Account temporarily locked");
  const valid = await user.verifyPassword(password);
  if (!valid) { user.failedLoginAttempts += 1; if (user.failedLoginAttempts >= 5) user.lockedUntil = new Date(Date.now() + 15 * 60000); await user.save(); await audit(req, "user_login_failed", "user", String(user._id), { email }, "failure"); throw new HttpError(401, "Invalid credentials"); }
  user.failedLoginAttempts = 0; user.lockedUntil = undefined; user.lastLoginAt = new Date(); await user.save();
  const token = signToken(user as any); res.cookie("aegis_token", token, { httpOnly: true, sameSite: "lax", secure: env.cookieSecure, maxAge: 2 * 60 * 60 * 1000 });
  req.user = { id: String(user._id), email: user.email, role: user.role as any, name: user.name }; await audit(req, "user_login", "user", String(user._id));
  return ok(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: permissionsForRole(user.role as any) } });
}
export async function logout(req: Request, res: Response) { await audit(req, "user_logout", "session", req.user?.id); res.clearCookie("aegis_token"); return ok(res, { loggedOut: true }); }
export async function me(req: Request, res: Response) { return ok(res, { ...req.user, permissions: req.user ? permissionsForRole(req.user.role) : [] }); }
