import dotenv from "dotenv";
dotenv.config();
export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4200),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/aegis",
  jwtSecret: process.env.JWT_SECRET ?? "development_only_replace_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "2h",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  cookieSecure: process.env.COOKIE_SECURE === "true"
};
