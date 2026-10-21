import express from 'express';
import jobPostController from '../controllers/jobPost.controller.js';
import { authenticate, authorize } from '#shares/middlewares/auth.middleware.js';
import {
  validateJobIdParam,
  validateCreateJobPost,
  validateUpdateJobPost,
  validateUpdateJobStatus,
} from '../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/', jobPostController.getJobPosts);

router.get('/:jobId', validateJobIdParam, jobPostController.getJobPostById);

router.post(
  '/',
  authenticate,
  authorize('RECRUITER'),
  validateCreateJobPost,
  jobPostController.createJobPost
);

router.patch(
  '/:jobId',
  authenticate,
  authorize('RECRUITER'),
  validateJobIdParam,
  validateUpdateJobPost,
  jobPostController.updateJobPost
);

router.delete(
  '/:jobId',
  authenticate,
  authorize('RECRUITER'),
  validateJobIdParam,
  jobPostController.deleteJobPost
);

router.patch(
  '/:jobId/status',
  authenticate,
  authorize('RECRUITER'),
  validateJobIdParam,
  validateUpdateJobStatus,
  jobPostController.updateJobPostStatus
);

export default router;
