import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'dotenv';

export default function initializeEnv(): void {
  const envPath: string = join(process.cwd(), '.env');
  const localEnvPath: string = join(process.cwd(), '.local.env');
  loadEnv(envPath);
  if (process.env.NODE_ENV === 'development') {
    loadEnv(localEnvPath);
  }
}

function loadEnv(envPath: string): void {
  if (existsSync(envPath)) {
    const parsed = parse(readFileSync(envPath, 'utf-8')) || {};
    Object.keys(parsed).forEach(key => {
      process.env[key] = parsed[key];
    });
  }
}
