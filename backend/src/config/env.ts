import dotenv from "dotenv";
dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const jwtSecret = process.env.JWT_SECRET ?? "development_only_replace_me";
const anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? "";

// On Render the public URL is injected at runtime; use it as a sensible default
// so intake links and CORS work without manually pasting the deployed URL.
const renderUrl = process.env.RENDER_EXTERNAL_URL;

if (nodeEnv === "production") {
  if (!process.env.JWT_SECRET || jwtSecret === "development_only_replace_me") {
    throw new Error("JWT_SECRET must be set in production");
  }
  if (!anthropicApiKey) {
    console.warn("[AEGIS] ANTHROPIC_API_KEY is not set. ACUITY runs on its built-in rule engine; live Claude features are disabled.");
  }
}

const cookieSecure = process.env.COOKIE_SECURE === "true";

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4200),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/aegis",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "2h",
  corsOrigin: process.env.CORS_ORIGIN ?? renderUrl ?? "http://localhost:5173",
  frontendUrl: process.env.FRONTEND_URL ?? renderUrl ?? "http://localhost:5173",
  cookieSecure,
  anthropicApiKey
};
