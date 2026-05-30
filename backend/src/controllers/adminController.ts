import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";
import { Settings } from "../models/Settings.js";
import { audit } from "../services/auditService.js";
import { created, HttpError, ok } from "../utils/http.js";
export async function auditList(_req: Request, res: Response) { return ok(res, await AuditLog.find().sort({ createdAt: -1 }).limit(300).populate("actor")); }
export async function auditGet(req: Request, res: Response) { const log = await AuditLog.findById(req.params.id).populate("actor"); if (!log) throw new HttpError(404, "Audit log not found"); return ok(res, log); }
export async function getSettings(_req: Request, res: Response) { return ok(res, await Settings.findOne({ singletonKey: "default" })); }
export async function updateSettings(req: Request, res: Response) { const settings = await Settings.findOneAndUpdate({ singletonKey: "default" }, { ...req.body, updatedBy: req.user?.id }, { upsert: true, new: true }); await audit(req, "settings_changed", "settings", String(settings._id)); return ok(res, settings); }
export async function listUsers(_req: Request, res: Response) { return ok(res, await User.find().sort({ name: 1 })); }
export async function createUser(req: Request, res: Response) { const passwordHash = await (User as any).hashPassword(req.body.password); const user = await User.create({ ...req.body, passwordHash }); await audit(req, "user_created", "user", String(user._id)); return created(res, user); }
export async function setRole(req: Request, res: Response) { const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }); if (!user) throw new HttpError(404, "User not found"); await audit(req, "user_role_changed", "user", String(user._id), { role: req.body.role }); return ok(res, user); }
export async function setStatus(req: Request, res: Response) { const user = await User.findByIdAndUpdate(req.params.id, { active: req.body.active }, { new: true }); if (!user) throw new HttpError(404, "User not found"); await audit(req, "user_status_changed", "user", String(user._id), { active: req.body.active }); return ok(res, user); }
