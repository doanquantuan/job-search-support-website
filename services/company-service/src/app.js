import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config/env.config.js';
import routes from './routes/index.js';
import errorHandler from '#shared/middlewares/error.middleware.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = config.CORS_ORIGIN
  ? config.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        config.NODE_ENV === 'development'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} bị chặn bởi CORS`));
    },
    credentials: true,
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploaded licenses & media
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'company-service',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', routes);

// Handle 404 Undefined Routes
app.use((req, res, next) => {
  next(new NotFoundError(`Không tìm thấy tuyến đường (route): ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
export { app };
