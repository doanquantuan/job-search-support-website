import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyOTP,
  validateResendOTP,
  validateOAuth,
} from '../middlewares/validate.middleware.js';

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

export default router;
