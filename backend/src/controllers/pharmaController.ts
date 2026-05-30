import crypto from "crypto";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { Patient } from "../models/Patient.js";
import { audit } from "../services/auditService.js";
import * as pharmaService from "../services/pharmaService.js";
import { HttpError, ok } from "../utils/http.js";

export async function searchDrugs(req: Request, res: Response) {
  const q = String(req.query.q ?? "");
  const results = await pharmaService.searchDrugs(q);
  return ok(res, results);
}

export async function checkInteractions(req: Request, res: Response) {
  const interactions = await pharmaService.checkInteractions(req.body.rxcuis);
  return ok(res, interactions);
}

export async function publicIntake(req: Request, res: Response) {
  const patient = await Patient.findOne({ intakeToken: req.params.token });
  if (!patient) throw new HttpError(404, "This link has already been used or has expired.");
  const medications = req.body.medications ?? [];
  const interactions = medications.length >= 2
    ? await pharmaService.checkInteractions(medications.map((m: { rxcui: string }) => m.rxcui))
    : [];
  patient.medications = medications as typeof patient.medications;
  patient.medicationInteractions = interactions as typeof patient.medicationInteractions;
  patient.intakeToken = undefined;
  patient.timeline.push({
    event: "medication_intake_submitted",
    reason: "Patient submitted medications via intake link"
  });
  await patient.save();
  await audit(req, "medication_intake_submitted", "patient", String(patient._id), {
    medicationCount: medications.length,
    interactionCount: interactions.length,
    hasContraindications: interactions.some((i) => i.severity === "contraindicated")
  });
  if (interactions.length > 0) {
    await audit(req, "drug_interactions_found", "patient", String(patient._id), {
      interactions: interactions.map((i) => ({ drug1: i.drug1, drug2: i.drug2, severity: i.severity }))
    });
  }
  return ok(res, { medications, interactions });
}

export async function generateIntakeLink(req: Request, res: Response) {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new HttpError(404, "Patient not found");
  const token = crypto.randomBytes(32).toString("hex");
  patient.intakeToken = token;
  await patient.save();
  const intakeUrl = `${env.frontendUrl}/intake/${token}`;
  await audit(req, "intake_link_generated", "patient", String(patient._id), { intakeUrl });
  return ok(res, { intakeUrl });
}
