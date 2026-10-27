import express from 'express';
import profileController from '../../controllers/profile.controller.js';
import educationController from '../../controllers/education.controller.js';
import experienceController from '../../controllers/experience.controller.js';
import projectController from '../../controllers/project.controller.js';
import certificateController from '../../controllers/certificate.controller.js';
import awardController from '../../controllers/award.controller.js';
import careerPreferenceController from '../../controllers/careerPreference.controller.js';
import skillController from '../../controllers/skill.controller.js';
import { authenticate, authorize } from '#shared/middlewares/auth.middleware.js';
import {
  validateProfile,
  validateEducation,
  validateExperience,
  validateProject,
  validateCertificate,
  validateAward,
  validateCareerPreference,
  validateSkills,
} from '../../middlewares/validate.middleware.js';
import { uploadSingleImage } from '../../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/me', authenticate, authorize('JOB_SEEKER'), profileController.getInfo);
router.put('/me', authenticate, authorize('JOB_SEEKER'), validateProfile, profileController.updateInfo);
router.post('/me/avatar', authenticate, authorize('JOB_SEEKER'), uploadSingleImage('image'), profileController.uploadAvatar);
router.delete('/me/avatar', authenticate, authorize('JOB_SEEKER'), profileController.deleteAvatar);



// Education
router.get('/me/profile/educations', authenticate, authorize('JOB_SEEKER'), educationController.getAllEducations);
router.get('/me/profile/educations/:educationId', authenticate, authorize('JOB_SEEKER'), educationController.getEducation);
router.post('/me/profile/educations', authenticate, authorize('JOB_SEEKER'), validateEducation, educationController.addEducation);
router.put('/me/profile/educations/:educationId', authenticate, authorize('JOB_SEEKER'), validateEducation, educationController.updateEducation);
router.delete('/me/profile/educations/:educationId', authenticate, authorize('JOB_SEEKER'), educationController.deleteEducation);

// Experience
router.get('/me/profile/experiences', authenticate, authorize('JOB_SEEKER'), experienceController.getAllExperiences);
router.get('/me/profile/experiences/:experienceId', authenticate, authorize('JOB_SEEKER'), experienceController.getExperience);
router.post('/me/profile/experiences', authenticate, authorize('JOB_SEEKER'), validateExperience, experienceController.addExperience);
router.put('/me/profile/experiences/:experienceId', authenticate, authorize('JOB_SEEKER'), validateExperience, experienceController.updateExperience);
router.delete('/me/profile/experiences/:experienceId', authenticate, authorize('JOB_SEEKER'), experienceController.deleteExperience);

// Project
router.get('/me/profile/projects', authenticate, authorize('JOB_SEEKER'), projectController.getAllProjects);
router.get('/me/profile/projects/:projectId', authenticate, authorize('JOB_SEEKER'), projectController.getProject);
router.post('/me/profile/projects', authenticate, authorize('JOB_SEEKER'), validateProject, projectController.addProject);
router.put('/me/profile/projects/:projectId', authenticate, authorize('JOB_SEEKER'), validateProject, projectController.updateProject);
router.delete('/me/profile/projects/:projectId', authenticate, authorize('JOB_SEEKER'), projectController.deleteProject);

// Certificate
router.get('/me/profile/certificates', authenticate, authorize('JOB_SEEKER'), certificateController.getAllCertificates);
router.get('/me/profile/certificates/:certificateId', authenticate, authorize('JOB_SEEKER'), certificateController.getCertificate);
router.post('/me/profile/certificates', authenticate, authorize('JOB_SEEKER'), validateCertificate, certificateController.addCertificate);
router.put('/me/profile/certificates/:certificateId', authenticate, authorize('JOB_SEEKER'), validateCertificate, certificateController.updateCertificate);
router.delete('/me/profile/certificates/:certificateId', authenticate, authorize('JOB_SEEKER'), certificateController.deleteCertificate);

// Award
router.get('/me/profile/awards', authenticate, authorize('JOB_SEEKER'), awardController.getAllAwards);
router.get('/me/profile/awards/:awardId', authenticate, authorize('JOB_SEEKER'), awardController.getAward);
router.post('/me/profile/awards', authenticate, authorize('JOB_SEEKER'), validateAward, awardController.addAward);
router.put('/me/profile/awards/:awardId', authenticate, authorize('JOB_SEEKER'), validateAward, awardController.updateAward);
router.delete('/me/profile/awards/:awardId', authenticate, authorize('JOB_SEEKER'), awardController.deleteAward);

// Career Preference
router.get('/me/profile/career-preference', authenticate, authorize('JOB_SEEKER'), careerPreferenceController.getCareerPreference);
router.put('/me/profile/career-preference', authenticate, authorize('JOB_SEEKER'), validateCareerPreference, careerPreferenceController.updateCareerPreference);
router.post('/me/profile/career-preference', authenticate, authorize('JOB_SEEKER'), validateCareerPreference, careerPreferenceController.createCareerPreference);

// Skill
router.get('/me/profile/skills', authenticate, authorize('JOB_SEEKER'), skillController.getSkills);
router.put('/me/profile/skills', authenticate, authorize('JOB_SEEKER'), validateSkills, skillController.updateSkills);

export default router;
