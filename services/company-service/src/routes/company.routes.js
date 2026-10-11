const express = require('express');
const companyController = require('../controllers/company.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const { uploadLicenseMiddleware } = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerVerificationSchema } = require('../validators/company.validator');

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

module.exports = router;
