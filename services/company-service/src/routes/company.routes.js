import express from 'express';
import companyController from '../controllers/company.controller.js';
import { authenticate, authorize } from '#shared/middlewares/auth.middleware.js';
import { uploadSingleDocument, uploadSingleImage } from '../middlewares/upload.middleware.js';
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
  authenticate,
  authorize(['RECRUITER']),
  uploadSingleDocument('businessLicense'),
  validate(registerVerificationSchema),
  companyController.registerVerification
);

router.post(
  '/register-verification',
  authenticate,
  authorize(['RECRUITER']),
  uploadSingleDocument('businessLicense'),
  validate(registerVerificationSchema),
  companyController.registerVerification
);

// Xem trạng thái xác thực doanh nghiệp
router.get(
  '/verification/status',
  authenticate,
  authorize(['RECRUITER']),
  companyController.getVerificationStatus
);

// Cập nhật hồ sơ xác thực doanh nghiệp
router.put(
  '/verification',
  authenticate,
  authorize(['RECRUITER']),
  uploadSingleDocument('businessLicense'),
  validate(updateVerificationSchema),
  companyController.updateVerificationProfile
);

// Xem thông tin doanh nghiệp nội bộ (dành cho Recruiter sở hữu)
router.get(
  '/my-company',
  authenticate,
  authorize(['RECRUITER']),
  companyController.getMyCompany
);

// Lấy Presigned URL xem giấy phép kinh doanh (Recruiter sở hữu - hạn 10 phút)
router.get(
  '/my-company/license-url',
  authenticate,
  authorize(['RECRUITER']),
  companyController.getLicensePresignedUrl
);

// Cập nhật thông tin doanh nghiệp (dành cho Recruiter sở hữu)
router.put(
  '/my-company',
  authenticate,
  authorize(['RECRUITER']),
  uploadSingleImage('logo'),
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
