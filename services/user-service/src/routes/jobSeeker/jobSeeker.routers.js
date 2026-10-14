const express = require('express');
//const jobSeekerController = require('../../controllers/jobSeeker.controller');
const profileController = require('../../controllers/profile.controller');
const { authenticate, authorize } = require('../../../../../shares/auth.middleware');
const validateProfile = require('../../middlewares/validate.middleware');

const router = express.Router();

router.get('/me', authenticate, authorize('JOB_SEEKER'), profileController.getInfo);
router.patch('/me', authenticate, authorize('JOB_SEEKER'), validateProfile, profileController.updateInfo);
// router.put('/me', jobSeekerController.updateProfile);
// router.get('/:userId', jobSeekerController.getProfile);
// router.get('/profile/me', jobSeekerController.getProfile);

module.exports = router;
