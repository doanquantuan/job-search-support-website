import express from 'express';
import specializationController from '../controllers/specialization.controller.js';
import { authenticate, authorize } from '#shares/middlewares/auth.middleware.js';
import {
  validateSpecializationIdParam,
  validateCreateSpecialization,
  validateUpdateSpecialization,
} from '../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/specializations', specializationController.getAllSpecializations);
router.get('/specializations/:specializationId', validateSpecializationIdParam, specializationController.getSpecializationById);
router.post('/specializations', authenticate, authorize('ADMIN'), validateCreateSpecialization, specializationController.createSpecialization);
router.patch('/specializations/:specializationId', authenticate, authorize('ADMIN'), validateSpecializationIdParam, validateUpdateSpecialization, specializationController.updateSpecialization);
router.delete('/specializations/:specializationId', authenticate, authorize('ADMIN'), validateSpecializationIdParam, specializationController.deleteSpecialization);
