import express from 'express';
import jobRoutes from './jobPost.routes.js';
import occupationRoutes from './occupation.routes.js';

const router = express.Router();

router.use('/jobs', jobRoutes);
router.use('/occupations', occupationRoutes);

export default router;
