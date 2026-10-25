const jwt = require('jsonwebtoken');
const config = require('../config/env.config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors.util');

const authenticateToken = (req, res, next) => {
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

    const decoded = jwt.verify(token, config.JWT.ACCESS_SECRET);

    req.user = {
      ...decoded,
      userId: decoded.userId || decoded.id,
      id: decoded.id || decoded.userId,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn'));
    }
    next(error);
  }
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Bạn không có quyền thực hiện thao tác này'));
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};

