import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const config = {
  PORT: process.env.PORT || 5007,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.NODE_ENV === 'test' && process.env.DATABASE_URL_TEST
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
  },
  INTERNAL_SERVICE_KEY: process.env.INTERNAL_SERVICE_KEY || 'job_search_internal_super_secret_key_2026',
  RABBITMQ: {
    URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    EXCHANGE: 'job_search_topic_exchange',
    DLX_EXCHANGE: 'job_search_dlx',
    DLQ_QUEUE: 'notification_service_dlq',
    MAIN_QUEUE: 'notification_service_queue',
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

export default config;
