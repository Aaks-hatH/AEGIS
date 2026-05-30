import mongoose, { Schema, type InferSchemaType } from "mongoose";
const QueueEntrySchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, unique: true, index: true },
  position: { type: Number, required: true, index: true },
  priorityScore: { type: Number, required: true, min: 0, max: 100 },
  estimatedWaitMinutes: { type: Number, required: true, min: 0 },
  manualOverride: { type: Boolean, default: false, index: true },
  overrideReason: String,
  movementReason: { type: String, default: "Initial queue placement" },
  status: { type: String, enum: ["active", "paused", "roomed", "removed"], default: "active", index: true },
  assignedZone: String,
  history: [{ position: Number, priorityScore: Number, reason: String, createdAt: { type: Date, default: Date.now }, createdBy: { type: Schema.Types.ObjectId, ref: "User" } }]
}, { timestamps: true });
QueueEntrySchema.index({ status: 1, position: 1 });
export type QueueEntryDocument = InferSchemaType<typeof QueueEntrySchema> & mongoose.Document;
export const QueueEntry = mongoose.model("QueueEntry", QueueEntrySchema);
