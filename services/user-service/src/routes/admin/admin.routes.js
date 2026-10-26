const express = require('express');
const adminUserController = require('../../controllers/adminUser.controller');
const { authenticateToken, authorizeRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateToken, authorizeRole('ADMIN'));

router.get('/users', adminUserController.getUsers);

router.get('/users/:id', adminUserController.getUserDetail);

router.patch('/users/:id/status', adminUserController.updateUserStatus);

router.patch('/users/:id/verify', adminUserController.updateUserVerification);

module.exports = router;

