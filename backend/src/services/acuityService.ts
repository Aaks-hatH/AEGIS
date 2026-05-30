import type { AmbulanceAnalysis, TriageResult, VitalSigns } from "@aegis/shared";
type AnalyzeInput = { symptoms?: string[]; age?: number; medicalHistory?: string[]; vitalSigns?: VitalSigns; arrivalSource?: string; ambulanceReportText?: string; clinicalNotes?: string; };
const rules = [
  { keys: ["chest pain", "pressure", "stemi"], category: "Cardiac", impact: 28, action: "Route to cardiac capable monitored bed and notify physician lead" },
  { keys: ["shortness of breath", "dyspnea", "respiratory", "wheezing"], category: "Respiratory", impact: 22, action: "Prepare oxygen delivery and respiratory support evaluation" },
  { keys: ["stroke", "weakness", "facial droop", "slurred"], category: "Neurologic", impact: 30, action: "Activate stroke assessment workflow and assign monitored room" },
  { keys: ["sepsis", "fever", "confusion", "hypotension"], category: "Infectious risk", impact: 24, action: "Prioritize sepsis screening and isolation review" },
  { keys: ["trauma", "fall", "mvc", "bleeding"], category: "Trauma", impact: 24, action: "Prepare trauma bay resources and rapid provider assessment" },
  { keys: ["suicidal", "overdose", "self harm"], category: "Behavioral health safety", impact: 20, action: "Place in safe observation workflow with clinical supervision" }
];
function textOf(input: AnalyzeInput) { return [...(input.symptoms ?? []), ...(input.medicalHistory ?? []), input.ambulanceReportText ?? "", input.clinicalNotes ?? ""].join(" ").toLowerCase(); }
function level(score: number): TriageResult["priorityLevel"] { if (score >= 85) return "critical"; if (score >= 70) return "emergent"; if (score >= 50) return "urgent"; if (score >= 30) return "semi_urgent"; return "non_urgent"; }
function condition(score: number) { return score >= 85 ? "Immediate clinical review required" : score >= 70 ? "High risk presentation" : score >= 50 ? "Time sensitive presentation" : score >= 30 ? "Stable but needs ED evaluation" : "Lower acuity operational pathway"; }
export function analyzeTriage(input: AnalyzeInput): TriageResult {
  const text = textOf(input); let score = 12; const findings: TriageResult["findings"] = [];
  let category = "General emergency presentation"; let action = "Assign to standard triage workflow with clinician review";
  for (const rule of rules) if (rule.keys.some(k => text.includes(k))) { score += rule.impact; category = rule.category; action = rule.action; findings.push({ factor: rule.category, impact: rule.impact, rationale: `Reported information contains indicators associated with ${rule.category.toLowerCase()} operational risk.` }); }
  const v = input.vitalSigns ?? {};
  if ((input.age ?? 0) >= 65) { score += 10; findings.push({ factor: "Age 65 or older", impact: 10, rationale: "Older age increases risk of deterioration and supports earlier assessment." }); }
  if (input.arrivalSource === "ems") { score += 8; findings.push({ factor: "EMS arrival", impact: 8, rationale: "Prehospital transport suggests higher operational urgency and room readiness needs." }); }
  if (v.oxygenSaturation !== undefined && v.oxygenSaturation < 92) { score += 24; findings.push({ factor: "Low oxygen saturation", impact: 24, rationale: "Oxygen saturation below 92 percent increases respiratory risk." }); }
  if (v.systolicBp !== undefined && v.systolicBp < 90) { score += 25; findings.push({ factor: "Hypotension", impact: 25, rationale: "Low systolic pressure is a significant instability indicator." }); }
  if (v.heartRate !== undefined && (v.heartRate > 120 || v.heartRate < 45)) { score += 16; findings.push({ factor: "Abnormal heart rate", impact: 16, rationale: "Marked heart rate abnormality may indicate instability." }); }
  if (v.painScore !== undefined && v.painScore >= 8) { score += 8; findings.push({ factor: "Severe pain", impact: 8, rationale: "Severe reported pain increases prioritization within the queue." }); }
  score = Math.min(100, Math.round(score)); const priorityLevel = level(score);
  const routing = priorityLevel === "critical" ? "Resuscitation bay" : priorityLevel === "emergent" ? "Monitored acute care zone" : priorityLevel === "urgent" ? "Main ED treatment zone" : priorityLevel === "semi_urgent" ? "Expedited triage or vertical care" : "Fast track when available";
  const rationale = findings.length ? findings.map(f => f.rationale).join(" ") : "No high risk indicators were found in the submitted information, so standard prioritization is recommended.";
  return { urgencyScore: score, priorityLevel, riskClassification: condition(score), conditionCategory: category, confidenceScore: Math.min(0.94, 0.55 + findings.length * 0.08), recommendedRouting: routing, suggestedNextAction: action, rationale, findings };
}
export function analyzeAmbulance(report: { reportText: string; structuredSymptoms?: string[]; age?: number; vitals?: VitalSigns; etaMinutes?: number }): AmbulanceAnalysis {
  const triage = analyzeTriage({ symptoms: report.structuredSymptoms, age: report.age, vitalSigns: report.vitals, arrivalSource: "ems", ambulanceReportText: report.reportText });
  const cardiac = triage.conditionCategory === "Cardiac"; const respiratory = triage.conditionCategory === "Respiratory"; const trauma = triage.conditionCategory === "Trauma";
  return { conditionCategory: triage.conditionCategory, urgencyLevel: triage.priorityLevel, suggestedTeams: ["Charge nurse", "ED attending", ...(cardiac ? ["Cardiology notification"] : []), ...(respiratory ? ["Respiratory therapy"] : []), ...(trauma ? ["Trauma team lead"] : [])], equipmentChecklist: ["Monitored bed", "IV access supplies", "Point of care testing cart", ...(cardiac ? ["ECG machine", "Defibrillator readiness check"] : []), ...(respiratory ? ["Oxygen delivery setup", "Airway cart available"] : []), ...(trauma ? ["Trauma cart", "Rapid transfusion readiness review"] : [])], suggestedPlacement: triage.recommendedRouting, expectedPathway: `${triage.conditionCategory} assessment pathway with clinician confirmation on arrival`, preparationNotes: [`ETA ${report.etaMinutes ?? "not specified"} minutes requires receiving team awareness.`, triage.suggestedNextAction, "Decision support only. Clinician assessment determines final care pathway."], rationale: triage.rationale, confidenceScore: triage.confidenceScore };
}
