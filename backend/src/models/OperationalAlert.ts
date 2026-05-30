import mongoose, { Schema, type InferSchemaType } from "mongoose";
const OperationalAlertSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ["info", "watch", "warning", "critical"], required: true, index: true },
  category: { type: String, enum: ["capacity", "staffing", "ambulance", "queue", "security", "system"], required: true, index: true },
  active: { type: Boolean, default: true, index: true },
  acknowledgedBy: { type: Schema.Types.ObjectId, ref: "User" },
  acknowledgedAt: Date
}, { timestamps: true });
export type OperationalAlertDocument = InferSchemaType<typeof OperationalAlertSchema> & mongoose.Document;
export const OperationalAlert = mongoose.model("OperationalAlert", OperationalAlertSchema);
