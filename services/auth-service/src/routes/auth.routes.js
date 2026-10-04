const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateRegister, validateLogin } = require('../middlewares/validate.middleware');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);

router.post('/verify-email', authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);

router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshAccessToken);

module.exports = router;
