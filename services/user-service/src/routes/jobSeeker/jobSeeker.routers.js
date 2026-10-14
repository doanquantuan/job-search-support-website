const express = require('express');
//const jobSeekerController = require('../../controllers/jobSeeker.controller');
const profileController = require('../../controllers/profile.controller');
const educationController = require('../../controllers/education.controller');
const { authenticate, authorize } = require('../../../../../shares/auth.middleware');
const { validateProfile, validateEducation } = require('../../middlewares/validate.middleware');

const router = express.Router();

router.get('/me', authenticate, authorize('JOB_SEEKER'), profileController.getInfo);
router.patch('/me', authenticate, authorize('JOB_SEEKER'), validateProfile, profileController.updateInfo);

// Education
router.get('/me/profile/educations', authenticate, authorize('JOB_SEEKER'), educationController.getAllEducations);
router.get('/me/profile/educations/:educationId', authenticate, authorize('JOB_SEEKER'), educationController.getEducation);
router.post('/me/profile/educations', authenticate, authorize('JOB_SEEKER'), validateEducation, educationController.addEducation);
router.put('/me/profile/educations/:educationId', authenticate, authorize('JOB_SEEKER'), validateEducation, educationController.updateEducation);
router.delete('/me/profile/educations/:educationId', authenticate, authorize('JOB_SEEKER'), educationController.deleteEducation);
// router.put('/me', jobSeekerController.updateProfile);
// router.get('/:userId', jobSeekerController.getProfile);
// router.get('/profile/me', jobSeekerController.getProfile);

module.exports = router;
