import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
dotenv.config({ quiet: true });

export default {
  PORT: process.env.PORT || 5005,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_key_123456789',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_key_987654321',
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
