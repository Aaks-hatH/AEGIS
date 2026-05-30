import mongoose, { Schema, type InferSchemaType } from "mongoose";
const HospitalMetricsSchema = new Schema({
  measuredAt: { type: Date, required: true, index: true },
  activePatients: Number,
  waitingPatients: Number,
  averageWaitMinutes: Number,
  capacityUtilization: Number,
  ambulanceArrivals: Number,
  admissions: Number,
  discharges: Number,
  priorityBreakdown: { critical: Number, emergent: Number, urgent: Number, semiUrgent: Number, nonUrgent: Number },
  throughputPerHour: Number
}, { timestamps: true });
export type HospitalMetricsDocument = InferSchemaType<typeof HospitalMetricsSchema> & mongoose.Document;
export const HospitalMetrics = mongoose.model("HospitalMetrics", HospitalMetricsSchema);
