import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    });
  } catch (err) {
    console.error("\nMongoDB connection failed.");
    console.error("Check: 1) Atlas → Network Access → Add Current IP (or 0.0.0.0/0 for dev)");
    console.error("       2) backend/.env MONGODB_URI matches Atlas Connect → Drivers string");
    console.error("       3) Avoid mongodb+srv:// if you see querySrv ECONNREFUSED — use standard mongodb:// URI\n");
    throw err;
  }
}
