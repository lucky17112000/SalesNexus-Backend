import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
}
const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVars = ["NODE_ENV", "PORT", "DATABASE_URL"];
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: (process.env.DATABASE_URL as string) || "",
  };
};

export const envVars = loadEnvVariables();
