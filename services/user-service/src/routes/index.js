const express = require('express');
const userRoutes = require('./user');
const adminRoutes = require('./admin/admin.routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

