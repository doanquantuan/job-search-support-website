const express = require('express');
const jobSeekerRoutes = require('./jobSeeker.routers');

const router = express.Router();

router.use('/job-seekers', jobSeekerRoutes);

module.exports = router;
