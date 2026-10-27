import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const config = {
  PORT: process.env.PORT || 5003,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CLOUDFLARE_R2: {
    ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    PUBLIC_BUCKET: process.env.CLOUDFLARE_R2_PUBLIC_BUCKET || 'job-search-public',
    PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
    PRIVATE_BUCKET: process.env.CLOUDFLARE_R2_PRIVATE_BUCKET || 'job-search-private',
    PRESIGNED_EXPIRES_IN: parseInt(process.env.CLOUDFLARE_R2_PRESIGNED_EXPIRES_IN || '600', 10),
  },
};

export default config;
export { config };
