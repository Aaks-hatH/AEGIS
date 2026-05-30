import bcrypt from "bcryptjs";
import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { ROLES } from "@aegis/shared";
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLES, required: true, index: true },
  department: { type: String, default: "Emergency Department" },
  active: { type: Boolean, default: true, index: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  lastLoginAt: { type: Date }
}, { timestamps: true });
UserSchema.methods.verifyPassword = function(password: string) { return bcrypt.compare(password, this.passwordHash); };
UserSchema.statics.hashPassword = function(password: string) { return bcrypt.hash(password, 12); };
export type UserDocument = InferSchemaType<typeof UserSchema> & mongoose.Document & { verifyPassword(password: string): Promise<boolean> };
export const User = mongoose.model("User", UserSchema);
