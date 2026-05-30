import type { Request, Response } from "express";
import { Patient } from "../models/Patient.js";
import { TriageAssessment } from "../models/TriageAssessment.js";
import { analyzeTriage } from "../services/acuityService.js";
import { ensureQueueEntry } from "../services/queueService.js";
import { audit } from "../services/auditService.js";
import { ok } from "../utils/http.js";
export async function analyze(req: Request, res: Response) { const result = analyzeTriage(req.body); let saved = null; if (req.body.patientId) { saved = await TriageAssessment.create({ patient: req.body.patientId, createdBy: req.user?.id, inputSnapshot: req.body, ...result }); await Patient.findByIdAndUpdate(req.body.patientId, { triageStatus: result.priorityLevel, priorityScore: result.urgencyScore, $push: { timeline: { event: "triage_score_generated", reason: result.rationale, createdBy: req.user?.id } } }); await ensureQueueEntry(req.body.patientId, req.user?.id); await audit(req, "triage_score_generated", "patient", req.body.patientId, { urgencyScore: result.urgencyScore }); } return ok(res, { result, assessment: saved }); }
export async function history(req: Request, res: Response) { return ok(res, await TriageAssessment.find({ patient: req.params.patientId }).sort({ createdAt: -1 })); }
