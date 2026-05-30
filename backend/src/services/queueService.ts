import { QueueEntry } from "../models/QueueEntry.js";
import { Patient } from "../models/Patient.js";
const activePatientStatuses = ["waiting", "triage", "observation"];
export async function calculatePriority(patient: any) {
  const base = Number(patient.priorityScore ?? 0); const ageMinutes = Math.max(0, (Date.now() - new Date(patient.createdAt ?? Date.now()).getTime()) / 60000);
  const waitBoost = Math.min(20, Math.floor(ageMinutes / 15)); const emsBoost = patient.arrivalSource === "ems" ? 6 : 0;
  return Math.min(100, base + waitBoost + emsBoost);
}
export async function recalculateQueue(actor?: string, reason = "Queue recalculated from urgency, wait time, and workflow state") {
  const entries = await QueueEntry.find({ status: "active" }).populate("patient");
  const computed = await Promise.all(entries.map(async entry => {
    const patient = entry.patient as any; const score = entry.manualOverride ? entry.priorityScore : await calculatePriority(patient);
    return { entry, patient, score };
  }));
  computed.sort((a, b) => b.score - a.score || new Date(a.patient.createdAt).getTime() - new Date(b.patient.createdAt).getTime());
  for (let i = 0; i < computed.length; i++) {
    const item = computed[i]; const old = item.entry.position;
    item.entry.position = i + 1; item.entry.priorityScore = item.score; item.entry.estimatedWaitMinutes = Math.max(5, i * 14 + (item.score < 50 ? 20 : 0)); item.entry.movementReason = item.entry.manualOverride ? item.entry.overrideReason ?? "Manual override" : reason;
    if (old !== item.entry.position) item.entry.history.push({ position: item.entry.position, priorityScore: item.score, reason, createdBy: actor as any });
    await item.entry.save();
  }
  return QueueEntry.find({ status: "active" }).sort({ position: 1 }).populate("patient");
}
export async function ensureQueueEntry(patientId: string, actor?: string) {
  const patient = await Patient.findById(patientId); if (!patient || !activePatientStatuses.includes(patient.status)) return null;
  const score = await calculatePriority(patient); const count = await QueueEntry.countDocuments({ status: "active" });
  await QueueEntry.findOneAndUpdate({ patient: patientId }, { $setOnInsert: { patient: patientId, position: count + 1, priorityScore: score, estimatedWaitMinutes: 20, assignedZone: patient.assignedZone, history: [{ position: count + 1, priorityScore: score, reason: "Patient added to queue", createdBy: actor as any }] } }, { upsert: true, new: true });
  return recalculateQueue(actor);
}
