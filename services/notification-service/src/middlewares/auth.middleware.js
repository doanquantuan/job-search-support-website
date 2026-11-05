import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.util.js';

export const authenticateToken = (req, res, next) => {
  try {
    // Hỗ trợ header test trong môi trường test
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-user-id']) {
      req.user = {
        id: req.headers['x-test-user-id'],
        role: req.headers['x-test-user-role'] || 'JOB_SEEKER',
        email: req.headers['x-test-user-email'] || 'test-user@example.com',
      };
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token không hợp lệ hoặc thiếu thông tin xác thực');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT.ACCESS_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token đã hết hạn'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Token không hợp lệ'));
    }
    next(error);
  }
};

export const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Chưa xác thực danh tính'));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Bạn không có quyền truy cập chức năng này'));
    }

    next();
  };
};

export default {
  authenticateToken,
  authorizeRole,
};
