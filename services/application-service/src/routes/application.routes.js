const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// Toàn bộ các tuyến ứng tuyển yêu cầu xác thực JWT
router.use(authenticateToken);

// -------------------------------------------------------------
// Tuyến dành cho Job Seeker
// -------------------------------------------------------------
router.post(
  '/apply',
  authorizeRole('JOB_SEEKER'),
  applicationController.applyJob,
);

router.get(
  '/me',
  authorizeRole('JOB_SEEKER'),
  applicationController.getMyApplications,
);

router.patch(
  '/:id/withdraw',
  authorizeRole('JOB_SEEKER'),
  applicationController.withdrawApplication,
);

// -------------------------------------------------------------
// Tuyến dành cho Recruiter
// -------------------------------------------------------------
router.get(
  '/jobs/:jobId',
  authorizeRole('RECRUITER', 'ADMIN'),
  applicationController.getJobApplications,
);

router.patch(
  '/:id/status',
  authorizeRole('RECRUITER', 'ADMIN'),
  applicationController.updateApplicationStatus,
);

// -------------------------------------------------------------
// Tuyến chung: Xem chi tiết 1 đơn ứng tuyển (kiểm tra quyền nội bộ service)
// -------------------------------------------------------------
router.get(
  '/:id',
  authorizeRole('JOB_SEEKER', 'RECRUITER', 'ADMIN'),
  applicationController.getApplicationDetail,
);

module.exports = router;

