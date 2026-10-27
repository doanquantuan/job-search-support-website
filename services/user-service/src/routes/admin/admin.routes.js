import express from 'express';
import adminUserController from '../../controllers/adminUser.controller.js';
import { authenticate, authorize } from '#shared/middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/users', adminUserController.getUsers);

router.get('/users/:id', adminUserController.getUserDetail);

router.patch('/users/:id/status', adminUserController.updateUserStatus);

router.patch('/users/:id/verify', adminUserController.updateUserVerification);

export default router;
