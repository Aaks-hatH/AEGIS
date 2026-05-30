import type { Request, Response } from "express";
import { AmbulanceReport } from "../models/AmbulanceReport.js";
import { analyzeAmbulance } from "../services/acuityService.js";
import { audit } from "../services/auditService.js";
import { created, HttpError, ok } from "../utils/http.js";
export async function listAmbulances(_req: Request, res: Response) { return ok(res, await AmbulanceReport.find().sort({ createdAt: -1 }).limit(100).populate("linkedPatient")); }
export async function createAmbulance(req: Request, res: Response) { const analysis = analyzeAmbulance(req.body); const report = await AmbulanceReport.create({ ...req.body, analysis, submittedBy: req.user?.id }); await audit(req, "ambulance_report_submitted", "ambulance", String(report._id), { urgency: analysis.urgencyLevel }); return created(res, report); }
export async function getAmbulance(req: Request, res: Response) { const report = await AmbulanceReport.findById(req.params.id).populate("linkedPatient"); if (!report) throw new HttpError(404, "Ambulance report not found"); return ok(res, report); }
export async function updateAmbulance(req: Request, res: Response) { const report = await AmbulanceReport.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }); if (!report) throw new HttpError(404, "Ambulance report not found"); await audit(req, "ambulance_report_updated", "ambulance", String(report._id)); return ok(res, report); }
export async function analyzeReport(req: Request, res: Response) { const report = await AmbulanceReport.findById(req.params.id); if (!report) throw new HttpError(404, "Ambulance report not found"); report.analysis = analyzeAmbulance({ reportText: report.reportText, structuredSymptoms: report.structuredSymptoms, age: report.age ?? undefined, vitals: report.vitals as any, etaMinutes: report.etaMinutes }) as any; await report.save(); await audit(req, "ambulance_report_analyzed", "ambulance", String(report._id)); return ok(res, report); }
