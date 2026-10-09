require('dotenv').config({ quiet: true });

module.exports = {
  PORT: process.env.PORT || 5005,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
