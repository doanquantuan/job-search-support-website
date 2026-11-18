import express from 'express';
import userController from '../../controllers/user.controller.js';
import { authenticate } from '#shared/middlewares/auth.middleware.js';

const router = express.Router();

// Public route: Lấy và stream file (avatar, CV, documents) trực tiếp từ Cloudflare R2
router.get('/avatar/*key', userController.getAvatarFile);
router.get('/files/*key', userController.getAvatarFile);

router.get('/profile', authenticate, userController.getProfile);
router.get('/me', authenticate, userController.getProfile);
router.get('/profile/me', authenticate, userController.getProfile);

export default router;
