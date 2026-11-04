import express from 'express';
import applicationRoutes from './application.routes.js';

const router = express.Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'application-service',
    timestamp: new Date().toISOString(),
  });
});

// Mounted Sub-routes
router.use('/applications', applicationRoutes);

export default router;
