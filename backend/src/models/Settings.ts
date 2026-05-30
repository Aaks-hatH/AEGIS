import mongoose, { Schema, type InferSchemaType } from "mongoose";
const SettingsSchema = new Schema({
  singletonKey: { type: String, default: "default", unique: true },
  hospitalName: { type: String, required: true },
  unitName: { type: String, required: true },
  capacity: { totalBeds: { type: Number, required: true }, resusBeds: Number, fastTrackRooms: Number, observationBeds: Number },
  triageThresholds: { critical: Number, emergent: Number, urgent: Number, semiUrgent: Number },
  queuePolicy: { waitWeight: Number, urgencyWeight: Number, ambulanceBoost: Number, manualOverrideRequiresReason: { type: Boolean, default: true } },
  notifications: { capacityWarningPercent: Number, ambulanceEtaAlertMinutes: Number },
  theme: { type: String, enum: ["light", "dark", "system"], default: "dark" },
  security: { sessionMinutes: Number, maxFailedLogins: Number, passwordMinLength: Number },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
export type SettingsDocument = InferSchemaType<typeof SettingsSchema> & mongoose.Document;
export const Settings = mongoose.model("Settings", SettingsSchema);
