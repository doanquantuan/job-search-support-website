import jwt from 'jsonwebtoken';
import config from '../config/env.config.js';

export const socketAuthMiddleware = (socket, next) => {
  try {
    // Hỗ trợ test
    if (process.env.NODE_ENV === 'test' && socket.handshake.auth?.testUserId) {
      socket.userId = socket.handshake.auth.testUserId;
      socket.userRole = socket.handshake.auth.testUserRole || 'JOB_SEEKER';
      return next();
    }

    const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!authHeader) {
      return next(new Error('Authentication error'));
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    const decoded = jwt.verify(token, config.JWT.ACCESS_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;

    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
};

export default socketAuthMiddleware;
