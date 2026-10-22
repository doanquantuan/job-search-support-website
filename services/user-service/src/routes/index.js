const express = require('express');
const userRoutes = require('./user');
const adminRoutes = require('./admin/admin.routes');
const jobSeekerRoutes = require('./jobSeeker');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use(jobSeekerRoutes);

module.exports = router;

