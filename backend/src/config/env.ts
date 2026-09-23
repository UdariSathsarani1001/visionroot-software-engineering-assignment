import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: parseInt(process.env["PORT"] ?? "5000", 10),
  NODE_ENV: process.env["NODE_ENV"] ?? "development",
  MONGODB_URI: requireEnv("MONGODB_URI"),
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRES_IN: process.env["ACCESS_TOKEN_EXPIRES_IN"] ?? "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env["REFRESH_TOKEN_EXPIRES_IN"] ?? "7d",
  FRONTEND_URL: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
} as const;
