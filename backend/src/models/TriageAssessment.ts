import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { TRIAGE_LEVELS } from "@aegis/shared";
const FindingSchema = new Schema({ factor: String, impact: Number, rationale: String }, { _id: false });
const TriageAssessmentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  inputSnapshot: { type: Schema.Types.Mixed, required: true },
  urgencyScore: { type: Number, min: 0, max: 100, required: true, index: true },
  priorityLevel: { type: String, enum: TRIAGE_LEVELS, required: true, index: true },
  riskClassification: { type: String, required: true },
  conditionCategory: { type: String, required: true },
  confidenceScore: { type: Number, min: 0, max: 1, required: true },
  recommendedRouting: { type: String, required: true },
  suggestedNextAction: { type: String, required: true },
  rationale: { type: String, required: true },
  findings: [FindingSchema]
}, { timestamps: true });
export type TriageAssessmentDocument = InferSchemaType<typeof TriageAssessmentSchema> & mongoose.Document;
export const TriageAssessment = mongoose.model("TriageAssessment", TriageAssessmentSchema);
