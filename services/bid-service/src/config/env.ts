import type { StringValue } from "ms";

export const validateEnv = (): void => {
  const required = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "MONGODB_URI"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

// Funzione getter per assicurarsi che process.env sia già popolato
const getEnv = () => ({
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRES_IN: (process.env.JWT_ACCESS_EXPIRES_IN ||
    "15m") as StringValue,
  JWT_REFRESH_EXPIRES_IN: (process.env.JWT_REFRESH_EXPIRES_IN ||
    "7d") as StringValue,
  MONGODB_URI: process.env.MONGODB_URI!,
  PORT: process.env.PORT || "3001",
  NODE_ENV: process.env.NODE_ENV || "development",
});

export const env = getEnv();
