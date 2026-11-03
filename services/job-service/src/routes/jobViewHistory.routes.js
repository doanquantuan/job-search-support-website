import express from 'express';
import jobViewHistoryController from '../controllers/jobViewHistory.controller.js';
import { authenticate } from '#shared/middlewares/auth.middleware.js';
import { validateJobIdParam } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Lấy số lượt xem của 1 bài tuyển dụng (công khai hoặc recruiter xem)
router.get('/count/:jobId', validateJobIdParam, jobViewHistoryController.getViewCount);

// Các endpoint yêu cầu đăng nhập
router.use(authenticate);

router.get('/', jobViewHistoryController.getViewHistory);
router.post('/:jobId', validateJobIdParam, jobViewHistoryController.recordView);
router.delete('/:jobId', validateJobIdParam, jobViewHistoryController.removeViewHistory);
router.delete('/', jobViewHistoryController.clearViewHistory);

export default router;

