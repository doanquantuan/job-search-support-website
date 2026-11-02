import express from 'express';
import jobRoutes from './jobPost.routes.js';
import occupationRoutes from './occupation.routes.js';
import specializationRoutes from './specialization.routes.js';
import savedJobRoutes from './savedJob.routes.js';
import jobViewHistoryRoutes from './jobViewHistory.routes.js';
import jobReportRoutes from './jobReport.routes.js';

const router = express.Router();

router.use('/jobs', jobRoutes);
router.use('/occupations', occupationRoutes);
router.use('/', specializationRoutes);
router.use('/saved-jobs', savedJobRoutes);
router.use('/job-views', jobViewHistoryRoutes);
router.use('/job-reports', jobReportRoutes);

export default router;

