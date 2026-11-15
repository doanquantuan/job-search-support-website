import express from 'express';
import jobReportController from '../controllers/jobReport.controller.js';
import { authenticate, authorize } from '#shared/middlewares/auth.middleware.js';
import {
  validateReportIdParam,
  validateCreateReport,
  validateUpdateReportStatus,
} from '../middlewares/validate.middleware.js';

const router = express.Router();

router.use(authenticate);

// Cho phép người tìm việc (JOB_SEEKER) gửi báo cáo vi phạm
router.post('/', authorize('JOB_SEEKER'), validateCreateReport, jobReportController.createReport);
router.get('/my-reports', authorize('JOB_SEEKER'), jobReportController.getMyReports);

// Quản trị viên xử lý báo cáo
router.get('/', authorize('ADMIN'), jobReportController.getReports);
router.get('/:reportId', authorize('ADMIN'), validateReportIdParam, jobReportController.getReportById);
router.patch('/:reportId/status', authorize('ADMIN'), validateReportIdParam, validateUpdateReportStatus, jobReportController.updateReportStatus);
router.delete('/:reportId', authorize('ADMIN'), validateReportIdParam, jobReportController.deleteReport);

export default router;

