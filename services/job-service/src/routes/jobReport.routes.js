import express from 'express';
import jobReportController from '../controllers/jobReport.controller.js';
import { authenticate, authorize } from '#shares/middlewares/auth.middleware.js';
import {
  validateReportIdParam,
  validateCreateReport,
  validateUpdateReportStatus,
} from '../middlewares/validate.middleware.js';

const router = express.Router();

router.use(authenticate);

// Cho phép người dùng gửi và xem danh sách báo cáo của chính mình
router.post('/', validateCreateReport, jobReportController.createReport);
router.get('/my-reports', jobReportController.getMyReports);

// Quản trị viên xử lý báo cáo
router.get('/', authorize('ADMIN'), jobReportController.getReports);
router.get('/:reportId', authorize('ADMIN'), validateReportIdParam, jobReportController.getReportById);
router.patch('/:reportId/status', authorize('ADMIN'), validateReportIdParam, validateUpdateReportStatus, jobReportController.updateReportStatus);
router.delete('/:reportId', authorize('ADMIN'), validateReportIdParam, jobReportController.deleteReport);

export default router;
