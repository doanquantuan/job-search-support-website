import express from 'express';
import jobSeekerRoutes from './jobSeeker.routers.js';

const router = express.Router();

router.use('/job-seekers', jobSeekerRoutes);

export default router;
