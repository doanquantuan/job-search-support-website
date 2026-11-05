import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.util.js';

export const authenticateSystem = (req, res, next) => {
  try {
    const internalKey = req.headers['x-internal-service-key'];
    if (internalKey && internalKey === config.INTERNAL_SERVICE_KEY) {
      req.isInternalService = true;
      return next();
    }

    // Hỗ trợ test header
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-user-id']) {
      const role = req.headers['x-test-user-role'];
      if (role === 'ADMIN') {
        req.user = {
          id: req.headers['x-test-user-id'],
          role: 'ADMIN',
          email: req.headers['x-test-user-email'] || 'admin@example.com',
        };
        return next();
      }
      throw new ForbiddenError('Chỉ quản trị viên (ADMIN) hoặc dịch vụ nội bộ mới có quyền thực hiện');
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Thiếu thông tin xác thực (Bearer Token hoặc Service Key)');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT.ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token đã hết hạn');
      }
      throw new UnauthorizedError('Token không hợp lệ');
    }

    req.user = decoded;
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Chỉ quản trị viên (ADMIN) hoặc dịch vụ nội bộ mới có quyền thực hiện');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  authenticateSystem,
};
