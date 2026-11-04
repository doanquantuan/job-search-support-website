import express from 'express';
import applicationController from '../controllers/application.controller.js';
import { authenticate, authorize } from '#shared/middlewares/auth.middleware.js';
import { validateUuidParams } from '#shared/middlewares/validate.middleware.js';

const router = express.Router();

// Toàn bộ các tuyến ứng tuyển yêu cầu xác thực JWT
router.use(authenticate);

// -------------------------------------------------------------
// Tuyến dành cho Job Seeker
// -------------------------------------------------------------
router.post(
  '/apply',
  authorize('JOB_SEEKER'),
  applicationController.applyJob,
);

router.get(
  '/me',
  authorize('JOB_SEEKER'),
  applicationController.getMyApplications,
);

router.patch(
  '/:id/withdraw',
  authorize('JOB_SEEKER'),
  validateUuidParams('id'),
  applicationController.withdrawApplication,
);

// -------------------------------------------------------------
// Tuyến dành cho Recruiter
// -------------------------------------------------------------
router.get(
  '/jobs/:jobId',
  authorize('RECRUITER', 'ADMIN'),
  validateUuidParams('jobId'),
  applicationController.getJobApplications,
);

router.patch(
  '/:id/status',
  authorize('RECRUITER', 'ADMIN'),
  validateUuidParams('id'),
  applicationController.updateApplicationStatus,
);

// -------------------------------------------------------------
// Tuyến chung: Xem chi tiết 1 đơn ứng tuyển (kiểm tra quyền nội bộ service)
// -------------------------------------------------------------
router.get(
  '/:id',
  authorize('JOB_SEEKER', 'RECRUITER', 'ADMIN'),
  validateUuidParams('id'),
  applicationController.getApplicationDetail,
);

export default router;
