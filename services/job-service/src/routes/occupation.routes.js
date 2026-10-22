import express from 'express';
import occupationController from '../controllers/occupation.controller.js';
import { authenticate, authorize } from '#shares/middlewares/auth.middleware.js';
import {
  validateOccupationIdParam,
  validateSpecializationIdParam,
  validateOccupationBody,
  validateCreateSpecialization,
  validateUpdateSpecialization,
} from '../middlewares/validate.middleware.js';

const router = express.Router();

// ==========================================
// 1. NGÀNH NGHỀ (OCCUPATIONS)
// ==========================================

// GET /api/v1/occupations - Lấy danh sách ngành nghề (Public)
router.get('/', occupationController.getAllOccupations);

// GET /api/v1/occupations/:occupationId - Lấy chi tiết ngành nghề (Public)
router.get('/:occupationId', validateOccupationIdParam, occupationController.getOccupationById);

// POST /api/v1/occupations - Tạo ngành nghề mới (Admin)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateOccupationBody,
  occupationController.createOccupation
);

// PATCH /api/v1/occupations/:occupationId - Cập nhật ngành nghề (Admin)
router.patch(
  '/:occupationId',
  authenticate,
  authorize('ADMIN'),
  validateOccupationIdParam,
  validateOccupationBody,
  occupationController.updateOccupation
);

// DELETE /api/v1/occupations/:occupationId - Xóa ngành nghề (Admin)
router.delete(
  '/:occupationId',
  authenticate,
  authorize('ADMIN'),
  validateOccupationIdParam,
  occupationController.deleteOccupation
);

// ==========================================
// 2. CHUYÊN NGÀNH (SPECIALIZATIONS)
// ==========================================

// GET /api/v1/occupations/specializations - Lấy danh sách chuyên ngành (Public, query: ?occupationId=...)
router.get('/specializations/all', occupationController.getAllSpecializations);

// GET /api/v1/occupations/specializations/:specializationId - Chi tiết chuyên ngành (Public)
router.get(
  '/specializations/:specializationId',
  validateSpecializationIdParam,
  occupationController.getSpecializationById
);

// POST /api/v1/occupations/specializations - Tạo chuyên ngành (Admin)
router.post(
  '/specializations',
  authenticate,
  authorize('ADMIN'),
  validateCreateSpecialization,
  occupationController.createSpecialization
);

// PATCH /api/v1/occupations/specializations/:specializationId - Cập nhật chuyên ngành (Admin)
router.patch(
  '/specializations/:specializationId',
  authenticate,
  authorize('ADMIN'),
  validateSpecializationIdParam,
  validateUpdateSpecialization,
  occupationController.updateSpecialization
);

// DELETE /api/v1/occupations/specializations/:specializationId - Xóa chuyên ngành (Admin)
router.delete(
  '/specializations/:specializationId',
  authenticate,
  authorize('ADMIN'),
  validateSpecializationIdParam,
  occupationController.deleteSpecialization
);

export default router;

