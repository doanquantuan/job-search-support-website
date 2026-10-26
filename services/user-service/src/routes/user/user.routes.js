import express from 'express';
import userController from '../../controllers/user.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.get('/me', authenticateToken, userController.getProfile);
// router.put('/me', authenticateToken, userController.updateProfile);
// router.get('/:userId', authenticateToken, userController.getProfile);
router.get('/profile/me', authenticateToken, userController.getProfile);

export default router;
