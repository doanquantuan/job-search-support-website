const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateVerifyOTP,
  validateResendOTP,
  validateOAuth,
} = require('../middlewares/validate.middleware');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);

router.post('/verify-otp', validateVerifyOTP, authController.verifyOTP);
router.post('/resend-otp', validateResendOTP, authController.resendOTP);

router.post('/login', validateLogin, authController.login);
router.post('/oauth', validateOAuth, authController.oauthLogin);
router.post('/refresh', authController.refreshAccessToken);
router.post('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
