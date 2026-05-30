import mongoose, { Schema, type InferSchemaType } from "mongoose";
const AuditLogSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: "User", index: true },
  actorEmail: String,
  action: { type: String, required: true, index: true },
  resourceType: { type: String, required: true, index: true },
  resourceId: { type: String, index: true },
  status: { type: String, enum: ["success", "failure"], default: "success", index: true },
  ipAddress: String,
  userAgent: String,
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });
AuditLogSchema.index({ createdAt: -1 });
export type AuditLogDocument = InferSchemaType<typeof AuditLogSchema> & mongoose.Document;
export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
