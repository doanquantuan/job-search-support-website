const express = require('express');
const router = express.Router();
const applicationRoutes = require('./application.routes');

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

module.exports = router;
