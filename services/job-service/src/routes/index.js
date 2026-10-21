import express from 'express';
import jobRoutes from './jobPost.routes.js';

const router = express.Router();

router.use('/jobs', jobRoutes);

export default router;
