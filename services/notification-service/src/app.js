import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import config from './config/env.config.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';
import { NotFoundError } from './utils/errors.util.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'notification-service',
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
