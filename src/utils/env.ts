import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Récupère une variable d’environnement
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}