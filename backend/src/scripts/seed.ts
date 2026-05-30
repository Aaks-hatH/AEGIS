import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Patient } from "../models/Patient.js";
import { TriageAssessment } from "../models/TriageAssessment.js";
import { AmbulanceReport } from "../models/AmbulanceReport.js";
import { QueueEntry } from "../models/QueueEntry.js";
import { AuditLog } from "../models/AuditLog.js";
import { OperationalAlert } from "../models/OperationalAlert.js";
import { Settings } from "../models/Settings.js";
import { HospitalMetrics } from "../models/HospitalMetrics.js";
import { analyzeAmbulance, analyzeTriage } from "../services/acuityService.js";
import { recalculateQueue } from "../services/queueService.js";
await connectDb();
await Promise.all([User.deleteMany({}), Patient.deleteMany({}), TriageAssessment.deleteMany({}), AmbulanceReport.deleteMany({}), QueueEntry.deleteMany({}), AuditLog.deleteMany({}), OperationalAlert.deleteMany({}), Settings.deleteMany({}), HospitalMetrics.deleteMany({})]);
const passwordHash = await (User as any).hashPassword("AegisSecure123!");
const users = await User.insertMany([
  { name: "Maya Chen", email: "admin@aegis.health", passwordHash, role: "admin", department: "Emergency Operations" },
  { name: "Jonah Patel", email: "physician@aegis.health", passwordHash, role: "physician", department: "Emergency Medicine" },
  { name: "Elena Ruiz", email: "nurse@aegis.health", passwordHash, role: "nurse", department: "ED Triage" },
  { name: "Sam Walker", email: "dispatcher@aegis.health", passwordHash, role: "dispatcher", department: "Regional Dispatch" },
  { name: "Priya Nair", email: "ops@aegis.health", passwordHash, role: "operations_manager", department: "Patient Flow" },
  { name: "Luis Grant", email: "ems@aegis.health", passwordHash, role: "ems", department: "Medic 4" }
]);
await Settings.create({ hospitalName: "Northstar Medical Center", unitName: "Emergency Department", capacity: { totalBeds: 54, resusBeds: 6, fastTrackRooms: 8, observationBeds: 12 }, triageThresholds: { critical: 85, emergent: 70, urgent: 50, semiUrgent: 30 }, queuePolicy: { waitWeight: 0.25, urgencyWeight: 0.7, ambulanceBoost: 0.05, manualOverrideRequiresReason: true }, notifications: { capacityWarningPercent: 85, ambulanceEtaAlertMinutes: 12 }, theme: "dark", security: { sessionMinutes: 120, maxFailedLogins: 5, passwordMinLength: 12 }, updatedBy: users[0]._id });
const patientInputs = [
  { mrn: "AEG-10021", fullName: "Robert Miles", age: 72, sex: "male", arrivalSource: "ems", symptoms: ["chest pain", "shortness of breath", "sweating"], medicalHistory: ["hypertension"], vitalSigns: { heartRate: 118, oxygenSaturation: 91, painScore: 8 }, assignedZone: "Resus" },
  { mrn: "AEG-10022", fullName: "Alicia Morgan", age: 34, sex: "female", arrivalSource: "walk_in", symptoms: ["abdominal pain", "fever"], medicalHistory: [], vitalSigns: { heartRate: 104, temperatureC: 38.4, painScore: 7 }, assignedZone: "Main ED" },
  { mrn: "AEG-10023", fullName: "Derek Shaw", age: 51, sex: "male", arrivalSource: "transfer", symptoms: ["slurred speech", "weakness"], medicalHistory: ["diabetes"], vitalSigns: { systolicBp: 168, heartRate: 92 }, assignedZone: "Monitored" },
  { mrn: "AEG-10024", fullName: "Nina Brooks", age: 9, sex: "female", arrivalSource: "walk_in", symptoms: ["wrist pain", "fall"], medicalHistory: [], vitalSigns: { painScore: 5 }, assignedZone: "Fast Track" }
];
for (const input of patientInputs) { const result = analyzeTriage(input as any); const patient = await Patient.create({ ...input, triageStatus: result.priorityLevel, priorityScore: result.urgencyScore, status: "waiting", timeline: [{ event: "patient_created", to: "waiting", reason: "Seeded intake record", createdBy: users[0]._id }] }); await TriageAssessment.create({ patient: patient._id, createdBy: users[1]._id, inputSnapshot: input, ...result }); await QueueEntry.create({ patient: patient._id, position: 1, priorityScore: result.urgencyScore, estimatedWaitMinutes: 15, assignedZone: input.assignedZone, history: [{ position: 1, priorityScore: result.urgencyScore, reason: "Seeded queue placement", createdBy: users[0]._id }] }); }
const report = { unitId: "Medic 12", etaMinutes: 8, patientDescriptor: "72 year old male", age: 72, sex: "male", structuredSymptoms: ["chest pain", "shortness of breath"], reportText: "72 year old male with chest pain, sweating, and shortness of breath. Oxygen saturation 90 percent on room air.", vitals: { heartRate: 122, oxygenSaturation: 90, painScore: 9 }, submittedBy: users[5]._id };
await AmbulanceReport.create({ ...report, analysis: analyzeAmbulance(report as any) });
await recalculateQueue(String(users[0]._id));
await OperationalAlert.insertMany([{ title: "Capacity watch", message: "Main ED treatment beds above 82 percent utilization.", severity: "warning", category: "capacity" }, { title: "Incoming high acuity EMS", message: "Medic 12 is eight minutes out with high risk cardiac indicators.", severity: "critical", category: "ambulance" }]);
for (let i = 0; i < 24; i++) await HospitalMetrics.create({ measuredAt: new Date(Date.now() - i * 3600000), activePatients: 40 + (i % 7), waitingPatients: 8 + (i % 5), averageWaitMinutes: 28 + (i % 9), capacityUtilization: 70 + (i % 18), ambulanceArrivals: i % 4, admissions: i % 3, discharges: (i + 1) % 5, priorityBreakdown: { critical: 2, emergent: 6, urgent: 18, semiUrgent: 12, nonUrgent: 5 }, throughputPerHour: 4 + (i % 4) });
await AuditLog.create({ actor: users[0]._id, actorEmail: users[0].email, action: "seed_completed", resourceType: "system", metadata: { users: users.length } });
console.log("AEGIS seed data loaded");
process.exit(0);
