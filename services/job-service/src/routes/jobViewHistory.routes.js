import express from 'express';
import jwt from 'jsonwebtoken';
import jobViewHistoryController from '../controllers/jobViewHistory.controller.js';
import { authenticate } from '#shared/middlewares/auth.middleware.js';
import { validateJobIdParam } from '../middlewares/validate.middleware.js';

const router = express.Router();

/**
 * Middleware giải mã Token nếu có, nhưng không bắt buộc đăng nhập (cho phép khách vãng lai)
 */
const optionalAuthenticate = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret);
        req.user = {
          ...decoded,
          userId: decoded.userId || decoded.id,
          id: decoded.id || decoded.userId,
        };
      }
    }
  } catch {
    // Không chặn request nếu token lỗi hoặc hết hạn
  }
  next();
};

// Lấy số lượt xem của 1 bài tuyển dụng (công khai hoặc recruiter xem)
router.get('/count/:jobId', validateJobIdParam, jobViewHistoryController.getViewCount);

// Lấy thống kê lượt xem dành cho phân hệ Analytics của Recruiter
router.get('/recruiter/analytics', jobViewHistoryController.getRecruiterViewsAnalytics);

// Ghi nhận lượt xem tin tuyển dụng (cho phép cả ứng viên đã đăng nhập và khách vãng lai)
router.post('/:jobId', validateJobIdParam, optionalAuthenticate, jobViewHistoryController.recordView);

// Các endpoint yêu cầu đăng nhập bắt buộc
router.use(authenticate);

router.get('/', jobViewHistoryController.getViewHistory);
router.delete('/:jobId', validateJobIdParam, jobViewHistoryController.removeViewHistory);
router.delete('/', jobViewHistoryController.clearViewHistory);

export default router;

