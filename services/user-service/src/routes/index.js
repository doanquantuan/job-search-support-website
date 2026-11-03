import express from 'express';
import userRoutes from './user/index.js';
import adminRoutes from './admin/admin.routes.js';
import jobSeekerRoutes from './jobSeeker/index.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/', jobSeekerRoutes);

export default router;
