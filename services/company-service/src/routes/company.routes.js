import express from 'express';
import companyController from '../controllers/company.controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';
import { uploadLicenseMiddleware, uploadCompanyMediaMiddleware } from '../middlewares/upload.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  registerVerificationSchema,
  updateVerificationSchema,
  updateCompanyProfileSchema,
} from '../validators/company.validator.js';

const router = express.Router();

// Đăng ký xác thực doanh nghiệp
router.post(
  '/verification',
  authenticateToken,
  authorizeRole(['RECRUITER']),
  uploadLicenseMiddleware,
  validate(registerVerificationSchema),
  companyController.registerVerification
);

router.post(
  '/register-verification',
  authenticateToken,
  authorizeRole(['RECRUITER']),
  uploadLicenseMiddleware,
  validate(registerVerificationSchema),
  companyController.registerVerification
);

// Xem trạng thái xác thực doanh nghiệp
router.get(
  '/verification/status',
  authenticateToken,
  authorizeRole(['RECRUITER']),
  companyController.getVerificationStatus
);

// Cập nhật hồ sơ xác thực doanh nghiệp
router.put(
  '/verification',
  authenticateToken,
  authorizeRole(['RECRUITER']),
  uploadLicenseMiddleware,
  validate(updateVerificationSchema),
  companyController.updateVerificationProfile
);

// Xem thông tin doanh nghiệp nội bộ (dành cho Recruiter sở hữu)
router.get(
  '/my-company',
  authenticateToken,
  authorizeRole(['RECRUITER']),
  companyController.getMyCompany
);

// Lấy Presigned URL xem giấy phép kinh doanh (Recruiter sở hữu - hạn 10 phút)
router.get(
  '/my-company/license-url',
  authenticateToken,
  authorizeRole(['RECRUITER']),
  companyController.getLicensePresignedUrl
);

// Cập nhật thông tin doanh nghiệp (dành cho Recruiter sở hữu)
router.put(
  '/my-company',
  authenticateToken,
  authorizeRole(['RECRUITER']),
  uploadCompanyMediaMiddleware,
  validate(updateCompanyProfileSchema),
  companyController.updateMyCompany
);

// Xem hồ sơ doanh nghiệp công khai (dành cho Ứng viên / Khách vãng lai)
router.get(
  '/:id',
  companyController.getPublicCompanyProfile
);

export default router;
export { router as companyRoutes };
