import express from 'express';
import occupationController from '../controllers/occupation.controller.js';
import { authenticate, authorize } from '#shares/middlewares/auth.middleware.js';
import {
  validateOccupationIdParam,
  validateOccupationBody,
} from '../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/', occupationController.getAllOccupations);
router.get('/:occupationId', validateOccupationIdParam, occupationController.getOccupationById);
router.post('/', authenticate, authorize('ADMIN'), validateOccupationBody, occupationController.createOccupation);
router.patch('/:occupationId', authenticate, authorize('ADMIN'), validateOccupationIdParam, validateOccupationBody, occupationController.updateOccupation);
router.delete('/:occupationId', authenticate, authorize('ADMIN'), validateOccupationIdParam, occupationController.deleteOccupation);

export default router;
