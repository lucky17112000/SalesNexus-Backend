import dotenv from "dotenv";
import AppError from "../app/errorHelper/AppError";
import status from "http-status";
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN?: string;
  REFRESH_TOKEN_EXPIRES_IN?: string;
}
const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVars = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
  ];
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new AppError(
        status.NOT_FOUND,
        `Missing required environment variable: ${varName}`,
      );
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: (process.env.DATABASE_URL as string) || "",
    BETTER_AUTH_SECRET: (process.env.BETTER_AUTH_SECRET as string) || "",
    BETTER_AUTH_URL: (process.env.BETTER_AUTH_URL as string) || "",
    ACCESS_TOKEN_SECRET: (process.env.ACCESS_TOKEN_SECRET as string) || "",
    REFRESH_TOKEN_SECRET: (process.env.REFRESH_TOKEN_SECRET as string) || "",
  };
};

export const envVars = loadEnvVariables();
