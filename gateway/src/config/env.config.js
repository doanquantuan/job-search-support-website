import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5008,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  arcjet: {
    key: process.env.ARCJET_KEY || '',
    env: process.env.ARCJET_ENV || process.env.NODE_ENV || 'development',
  },

  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:5002',
    job: process.env.JOB_SERVICE_URL || 'http://localhost:5003',
    company: process.env.COMPANY_SERVICE_URL || 'http://localhost:5004',
    application: process.env.APPLICATION_SERVICE_URL || 'http://localhost:5005',
  },
};

export default config;
