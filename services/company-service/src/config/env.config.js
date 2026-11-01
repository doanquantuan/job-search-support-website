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
  R2: {
    BUCKET: process.env.R2_BUCKET || 'job-search-storage',
    ENDPOINT: process.env.R2_ENDPOINT,
    ACCESS_KEY: process.env.R2_ACCESS_KEY,
    SECRET_KEY: process.env.R2_SECRET_KEY,
    PUBLIC_URL: process.env.R2_PUBLIC_URL || '',
  },
};

export default config;
export { config };
