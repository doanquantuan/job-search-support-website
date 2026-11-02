import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  arcjet: {
    key: process.env.ARCJET_KEY || '',
    env: process.env.ARCJET_ENV || process.env.NODE_ENV || 'development',
  },

  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:5002',
    company: process.env.COMPANY_SERVICE_URL || 'http://localhost:5004',
    application: process.env.APPLICATION_SERVICE_URL || 'http://localhost:5003',
  },
};

export default config;

