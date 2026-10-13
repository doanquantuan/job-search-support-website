const express = require('express');
const userController = require('../../controllers/user.controller');
const { authenticateToken } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Lấy thông tin profile cá nhân của người dùng đang đăng nhập
router.get('/profile', authenticateToken, userController.getProfile);
router.get('/me', authenticateToken, userController.getProfile);
router.get('/profile/me', authenticateToken, userController.getProfile);

module.exports = router;
