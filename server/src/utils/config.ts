import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable "${name}". Copy server/.env.example to server/.env and fill in the values.`,
    );
  }
  return value;
}

export const port = Number(process.env.PORT ?? 4000);

export function getClientOrigins(): string[] {
  const raw = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getJwtSecret(): string {
  return requireEnv('JWT_SECRET');
}

export function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? '7d';
}

export function getDbPath(): string {
  return path.resolve(process.env.DB_PATH ?? './data/messenger.db');
}