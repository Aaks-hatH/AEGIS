import { Schema } from "mongoose";

export const MedicationSchema = new Schema(
  {
    rxcui: { type: String, required: true },
    name: { type: String, required: true },
    dose: String,
    frequency: String
  },
  { _id: false }
);

export const InteractionSchema = new Schema(
  {
    drug1: String,
    drug2: String,
    severity: { type: String, enum: ["contraindicated", "major", "moderate", "minor"] },
    description: String
  },
  { _id: false }
);
