const express = require('express');
const userController = require('../../controllers/user.controller');
const { authenticateToken } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.get('/me', authenticateToken, userController.getProfile);
// router.put('/me', authenticateToken, userController.updateProfile);
// router.get('/:userId', authenticateToken, userController.getProfile);
router.get('/profile/me', authenticateToken, userController.getProfile);

module.exports = router;
