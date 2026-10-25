const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cv.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// Tuyến công khai xem các template mẫu
router.get('/templates', cvController.getTemplates);

// Toàn bộ các tuyến thao tác CV yêu cầu đăng nhập với quyền JOB_SEEKER
router.use(authenticateToken);
router.use(authorizeRole('JOB_SEEKER'));

router.post('/', cvController.createCV);
router.get('/me', cvController.getMyCVs);
router.get('/:id', cvController.getCVDetail);
router.delete('/:id', cvController.deleteCV);

module.exports = router;

