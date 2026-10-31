import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import http from 'http';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import config from '../../src/config/env.config.js';
import { initSocketServer } from '../../src/sockets/socket.server.js';

describe('Socket.IO Integration Tests [ESM]', () => {
  let server;
  let ioServer;
  let port;
  const JWT_SECRET = config.JWT.ACCESS_SECRET;

  const userA = {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'userA@test.com',
    role: 'JOB_SEEKER',
  };

  const userB = {
    id: 'b0000000-0000-0000-0000-000000000002',
    email: 'userB@test.com',
    role: 'JOB_SEEKER',
  };

  const tokenUserA = jwt.sign(userA, JWT_SECRET, { expiresIn: '1h' });
  const tokenUserB = jwt.sign(userB, JWT_SECRET, { expiresIn: '1h' });

  beforeAll((done) => {
    server = http.createServer(app);
    ioServer = initSocketServer(server);

    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    ioServer.close();
    server.close(done);
  });

  it('1. Xác thực thành công: Client có JWT token hợp lệ kết nối thành công và tự động vào room user:${id}', (done) => {
    const clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${tokenUserA}` },
      transports: ['websocket'],
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);

      const sockets = ioServer.sockets.sockets;
      const serverSocket = sockets.get(clientSocket.id);
      expect(serverSocket).toBeDefined();
      expect(serverSocket.rooms.has(`user:${userA.id}`)).toBe(true);

      clientSocket.disconnect();
      done();
    });

    clientSocket.on('connect_error', (err) => {
      done(err);
    });
  });

  it('2. Xác thực thất bại: Client kết nối không có token bị từ chối kết nối (Authentication error)', (done) => {
    const clientSocket = Client(`http://localhost:${port}`, {
      transports: ['websocket'],
    });

    clientSocket.on('connect', () => {
      clientSocket.disconnect();
      done(new Error('Đáng lẽ kết nối phải bị từ chối do thiếu token'));
    });

    clientSocket.on('connect_error', (err) => {
      expect(err.message).toBe('Authentication error');
      clientSocket.disconnect();
      done();
    });
  });

  it('3. Nhận sự kiện đúng Room: Khi server emit tới room user:${userA.id}, chỉ Client A nhận được', (done) => {
    const clientA = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${tokenUserA}` },
      transports: ['websocket'],
    });

    const clientB = Client(`http://localhost:${port}`, {
      auth: { token: `Bearer ${tokenUserB}` },
      transports: ['websocket'],
    });

    let clientBReceived = false;

    clientB.on('notification:new', () => {
      clientBReceived = true;
    });

    let connectedCount = 0;
    const onBothConnected = () => {
      connectedCount++;
      if (connectedCount === 2) {
        const testPayload = {
          notificationId: 'notif-123',
          title: 'Tin nhắn gửi riêng cho User A',
          content: 'Nội dung thông báo',
        };

        ioServer.to(`user:${userA.id}`).emit('notification:new', testPayload);
      }
    };

    clientA.on('connect', onBothConnected);
    clientB.on('connect', onBothConnected);

    clientA.on('notification:new', (payload) => {
      expect(payload.notificationId).toBe('notif-123');
      expect(payload.title).toBe('Tin nhắn gửi riêng cho User A');

      setTimeout(() => {
        expect(clientBReceived).toBe(false);
        clientA.disconnect();
        clientB.disconnect();
        done();
      }, 100);
    });
  });
});
