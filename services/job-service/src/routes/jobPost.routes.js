import express from 'express';
import jobPostController from '../controllers/jobPost.controller.js';
import { authenticate, authorize } from '#shares/middlewares/auth.middleware.js';
import {
  validateJobIdParam,
  validateSearchJobsQuery,
  validateCreateJobPost,
  validateUpdateJobPost,
  validateUpdateJobStatus,
} from '../middlewares/validate.middleware.js';

const router = express.Router();

// GET /api/v1/jobs - Lấy danh sách tin tuyển dụng (Public)
router.get('/', validateSearchJobsQuery, jobPostController.getJobPosts);

// GET /api/v1/jobs/search - Tìm kiếm tin tuyển dụng nâng cao (Public)
router.get('/search', validateSearchJobsQuery, jobPostController.searchJobs);

// GET /api/v1/jobs/:jobId - Xem chi tiết tin tuyển dụng (Public)
router.get('/:jobId', validateJobIdParam, jobPostController.getJobPostById);

// POST /api/v1/jobs - Tạo tin tuyển dụng (Recruiter)
router.post(
  '/',
  authenticate,
  authorize('RECRUITER'),
  validateCreateJobPost,
  jobPostController.createJobPost
);

// PATCH /api/v1/jobs/:jobId - Cập nhật tin tuyển dụng (Recruiter sở hữu tin)
router.patch(
  '/:jobId',
  authenticate,
  authorize('RECRUITER'),
  validateJobIdParam,
  validateUpdateJobPost,
  jobPostController.updateJobPost
);

// DELETE /api/v1/jobs/:jobId - Xóa tin tuyển dụng (Recruiter sở hữu tin)
router.delete(
  '/:jobId',
  authenticate,
  authorize('RECRUITER'),
  validateJobIdParam,
  jobPostController.deleteJobPost
);

// PATCH /api/v1/jobs/:jobId/status - Đổi trạng thái tin (Recruiter sở hữu tin)
router.patch(
  '/:jobId/status',
  authenticate,
  authorize('RECRUITER'),
  validateJobIdParam,
  validateUpdateJobStatus,
  jobPostController.updateJobPostStatus
);

export default router;