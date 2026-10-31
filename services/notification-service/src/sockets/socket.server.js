import { Server } from 'socket.io';
import socketAuthMiddleware from './socket.middleware.js';
import notificationService from '../services/notification.service.js';
import config from '../config/env.config.js';

let ioInstance = null;

export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Socket.IO] Client đã kết nối: ${socket.id} - Đã tham gia room: ${userRoom}`);
    }

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`[Socket.IO] Client đã ngắt kết nối: ${socket.id}`);
      }
    });
  });

  ioInstance = io;
  notificationService.setSocketIO(io);

  return io;
}

export function getIO() {
  return ioInstance;
}

export default {
  initSocketServer,
  getIO,
};
