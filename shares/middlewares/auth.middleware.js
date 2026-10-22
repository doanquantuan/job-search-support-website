import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.util.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded
dotenv.config({ quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

export const authenticate = (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Vui lòng đăng nhập để tiếp tục truy cập');
    }

    const secret = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_key_123456789';
    const decoded = jwt.verify(token, secret);

    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id,
      id: decoded.id || decoded.userId,
    };

    next();
  } catch (error) {
    console.error(' [Auth Middleware Error Details]:', {
      name: error.name,
      message: error.message,
      secretUsed: process.env.JWT_ACCESS_SECRET,
      tokenReceived: req.headers.authorization?.slice(0, 30) + '...',
    });

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError(`Token không hợp lệ hoặc đã hết hạn: ${error.message}`));
    }
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Bạn không có quyền thực hiện thao tác này'));
    }
    next();
  };
};

export default {
  authenticate,
  authorize,
};
