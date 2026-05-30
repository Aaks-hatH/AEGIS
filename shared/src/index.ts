export const ROLES = ["admin", "physician", "nurse", "ems", "dispatcher", "operations_manager"] as const;
export type Role = typeof ROLES[number];
export const PATIENT_STATUSES = ["waiting", "triage", "roomed", "in_treatment", "observation", "admitted", "discharged"] as const;
export type PatientStatus = typeof PATIENT_STATUSES[number];
export const TRIAGE_LEVELS = ["critical", "emergent", "urgent", "semi_urgent", "non_urgent"] as const;
export type TriageLevel = typeof TRIAGE_LEVELS[number];
export interface VitalSigns { heartRate?: number; respiratoryRate?: number; systolicBp?: number; diastolicBp?: number; oxygenSaturation?: number; temperatureC?: number; painScore?: number; }
export interface AcuityFinding { factor: string; impact: number; rationale: string; }
export interface TriageResult { urgencyScore: number; priorityLevel: TriageLevel; riskClassification: string; conditionCategory: string; confidenceScore: number; recommendedRouting: string; suggestedNextAction: string; rationale: string; findings: AcuityFinding[]; }
export interface AmbulanceAnalysis { conditionCategory: string; urgencyLevel: TriageLevel; suggestedTeams: string[]; equipmentChecklist: string[]; suggestedPlacement: string; expectedPathway: string; preparationNotes: string[]; rationale: string; confidenceScore: number; }
export interface ApiResponse<T> { success: boolean; data: T; message?: string; meta?: Record<string, unknown>; }
