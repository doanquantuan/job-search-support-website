import express from 'express';
import savedJobController from '../controllers/savedJob.controller.js';
import { authenticate } from '#shared/middlewares/auth.middleware.js';
import { validateJobIdParam, validateJobIdsArray } from '../middlewares/validate.middleware.js';

const router = express.Router();

// Lấy số lượt lưu tin (Công khai hoặc tuyển dụng xem)
router.get('/count/:jobId', validateJobIdParam, savedJobController.getSavedCount);

// Các endpoint yêu cầu đăng nhập của người dùng
router.use(authenticate);

router.get('/', savedJobController.getSavedJobs);
router.post('/check-batch', validateJobIdsArray, savedJobController.checkBatchSaved);
router.get('/check/:jobId', validateJobIdParam, savedJobController.checkIsJobSaved);
router.post('/:jobId', validateJobIdParam, savedJobController.saveJob);
router.delete('/:jobId', validateJobIdParam, savedJobController.unsaveJob);

export default router;

