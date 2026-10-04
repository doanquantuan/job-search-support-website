const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/env.config');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const { NotFoundError } = require('./utils/errors.util');

const app = express();

// Middlewares
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
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

module.exports = app;
