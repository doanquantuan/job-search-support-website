import express from 'express';
import companyController from '../controllers/company.controller.js';
import companyFollowerController from '../controllers/companyFollower.controller.js';
import { authenticate, authorize } from '#shared/middlewares/auth.middleware.js';
import { uploadSingleDocument, uploadCompanyMedia } from '../middlewares/upload.middleware.js';
import validate, { validateQuery } from '../middlewares/validate.middleware.js';
import {
  registerVerificationSchema,
  updateVerificationSchema,
  updateCompanyProfileSchema,
  getCompaniesQuerySchema,
} from '../validators/company.validator.js';

const router = express.Router();

// Đăng ký xác thực doanh nghiệp
router.post(
  '/verification',
  authenticate,
  authorize('RECRUITER'),
  uploadSingleDocument('businessLicense'),
  validate(registerVerificationSchema),
  companyController.registerVerification
);

router.post(
  '/register-verification',
  authenticate,
  authorize('RECRUITER'),
  uploadSingleDocument('businessLicense'),
  validate(registerVerificationSchema),
  companyController.registerVerification
);

// Xem trạng thái xác thực doanh nghiệp
router.get(
  '/verification/status',
  authenticate,
  authorize('RECRUITER'),
  companyController.getVerificationStatus
);

// Cập nhật hồ sơ xác thực doanh nghiệp
router.put(
  '/verification',
  authenticate,
  authorize('RECRUITER'),
  uploadSingleDocument('businessLicense'),
  validate(updateVerificationSchema),
  companyController.updateVerificationProfile
);

// Internal endpoint để các service khác (như job-service, application-service) lấy companyId theo recruiterId
router.get(
  '/internal/by-recruiter/:recruiterId',
  companyController.getCompanyByRecruiterIdInternal
);

// Xem thông tin doanh nghiệp nội bộ (dành cho Recruiter sở hữu)
router.get(
  '/my-company',
  authenticate,
  authorize('RECRUITER'),
  companyController.getMyCompany
);

// Lấy Presigned URL xem giấy phép kinh doanh (Recruiter sở hữu - hạn 10 phút)
router.get(
  '/my-company/license-url',
  authenticate,
  authorize('RECRUITER'),
  companyController.getLicensePresignedUrl
);

// Cập nhật thông tin doanh nghiệp (dành cho Recruiter sở hữu — hỗ trợ upload logo + nhiều ảnh môi trường)
router.put(
  '/my-company',
  authenticate,
  authorize('RECRUITER'),
  uploadCompanyMedia,
  validate(updateCompanyProfileSchema),
  companyController.updateMyCompany
);

// Lấy danh sách doanh nghiệp (công khai, hỗ trợ tìm kiếm, lọc và phân trang)
router.get(
  '/',
  validateQuery(getCompaniesQuerySchema),
  companyController.getCompanies
);

// Lấy danh sách công ty đang theo dõi của người dùng hiện tại
router.get(
  '/following/me',
  authenticate,
  companyFollowerController.getFollowingCompanies
);

// Internal API lấy danh sách followers của công ty cho notification-service / job-service
router.get(
  '/internal/:companyId/followers',
  companyFollowerController.getFollowerUserIdsInternal
);

// Trạng thái theo dõi công ty cụ thể
router.get(
  '/:companyId/follow-status',
  authenticate,
  companyFollowerController.getFollowStatus
);

// Theo dõi công ty
router.post(
  '/:companyId/follow',
  authenticate,
  authorize('JOB_SEEKER'),
  companyFollowerController.followCompany
);

// Hủy theo dõi công ty
router.delete(
  '/:companyId/follow',
  authenticate,
  authorize('JOB_SEEKER'),
  companyFollowerController.unfollowCompany
);

// Xem hồ sơ doanh nghiệp công khai (dành cho Ứng viên / Khách vãng lai)
router.get(
  '/:id',
  companyController.getPublicCompanyProfile
);

// Admin thẩm định xác thực doanh nghiệp (Cấp tick xanh hoặc Từ chối)
router.patch(
  '/:id/verification',
  authenticate,
  authorize(['ADMIN']),
  companyController.verifyCompanyByAdmin
);

// Admin xem tài liệu giấy phép kinh doanh
router.get(
  '/:id/license-url',
  authenticate,
  authorize(['ADMIN']),
  companyController.getCompanyLicenseByAdmin
);

export default router;
export { router as companyRoutes };
