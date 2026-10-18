const express = require('express');
const adminUserController = require('../../controllers/adminUser.controller');
const { authenticateToken, authorizeRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateToken, authorizeRole('ADMIN'));

/**
 * 1. Xem danh sách người dùng
 * 2. Tìm kiếm và Lọc theo vai trò, trạng thái
 */
router.get('/users', adminUserController.getUsers);

/**
 * 3. Xem chi tiết người dùng kèm hồ sơ
 */
router.get('/users/:id', adminUserController.getUserDetail);

/**
 * 4. Khóa hoặc mở khóa tài khoản kèm lý do
 */
router.patch('/users/:id/status', adminUserController.updateUserStatus);

/**
 * 5. Xem / Cập nhật trạng thái xác minh tài khoản hoặc doanh nghiệp
 */
router.patch('/users/:id/verify', adminUserController.updateUserVerification);

module.exports = router;

