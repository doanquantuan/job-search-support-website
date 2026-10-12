const express = require('express');
const companyController = require('../controllers/company.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const { uploadLicenseMiddleware } = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerVerificationSchema, updateVerificationSchema } = require('../validators/company.validator');

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

// UC32 - Xem hồ sơ doanh nghiệp công khai (dành cho Ứng viên / Khách vãng lai)
router.get(
  '/:id',
  companyController.getPublicCompanyProfile
);

module.exports = router;
