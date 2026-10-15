const express = require('express');
//const jobSeekerController = require('../../controllers/jobSeeker.controller');
const profileController = require('../../controllers/profile.controller');
const educationController = require('../../controllers/education.controller');
const { authenticate, authorize } = require('../../../../../shares/auth.middleware');
const { validateProfile,
        validateEducation,
        validateExperience,
        validateProject
      } = require('../../middlewares/validate.middleware');

const router = express.Router();

router.get('/me', authenticate, authorize('JOB_SEEKER'), profileController.getInfo);
router.put('/me', authenticate, authorize('JOB_SEEKER'), validateProfile, profileController.updateInfo);

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


// router.put('/me', jobSeekerController.updateProfile);
// router.get('/:userId', jobSeekerController.getProfile);
// router.get('/profile/me', jobSeekerController.getProfile);

module.exports = router;
