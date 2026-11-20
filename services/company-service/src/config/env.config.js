import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
dotenv.config({ quiet: true });

const config = {
  PORT: process.env.PORT || 5003,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173',
  R2: {
    BUCKET:
      process.env.R2_BUCKET ||
      process.env.CLOUDFLARE_R2_PUBLIC_BUCKET ||
      'job-search-storage',
    PRIVATE_BUCKET:
      process.env.R2_PRIVATE_BUCKET ||
      process.env.CLOUDFLARE_R2_PRIVATE_BUCKET ||
      process.env.R2_BUCKET ||
      process.env.CLOUDFLARE_R2_PUBLIC_BUCKET ||
      'job-search-storage',
    ENDPOINT:
      process.env.R2_ENDPOINT ||
      (process.env.CLOUDFLARE_R2_ACCOUNT_ID
        ? `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : undefined),
    ACCESS_KEY: process.env.R2_ACCESS_KEY || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    SECRET_KEY: process.env.R2_SECRET_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    PUBLIC_URL: process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
    PRESIGNED_EXPIRES_IN: parseInt(process.env.CLOUDFLARE_R2_PRESIGNED_EXPIRES_IN, 10) || 600,
  },
};

export default config;
export { config };
