import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'dotenv';
export default function initializeEnv() {
    const envPath = join(process.cwd(), '.env');
    const localEnvPath = join(process.cwd(), '.local.env');
    loadEnv(envPath);
    if (process.env.NODE_ENV === 'development') {
        loadEnv(localEnvPath);
    }
}
function loadEnv(envPath) {
    if (existsSync(envPath)) {
        const parsed = parse(readFileSync(envPath, 'utf-8')) || {};
        Object.keys(parsed).forEach(key => {
            process.env[key] = parsed[key];
        });
    }
}
