require('dotenv').config({ quiet: true });

module.exports = {
  PORT: process.env.PORT || 5002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  R2: {
    BUCKET: process.env.R2_BUCKET || 'job-search-storage',
    ENDPOINT: process.env.R2_ENDPOINT,
    ACCESS_KEY: process.env.R2_ACCESS_KEY,
    SECRET_KEY: process.env.R2_SECRET_KEY,
    PUBLIC_URL: process.env.R2_PUBLIC_URL || '',
  },
};

