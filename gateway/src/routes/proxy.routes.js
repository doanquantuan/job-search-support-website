import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/env.config.js';

const createServiceProxy = (targetUrl, serviceName) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    xfwd: true,
    onError: (err, req, res) => {
      console.error(`[Gateway Proxy Error] Không thể kết nối đến ${serviceName} (${targetUrl}):`, err.message);
      if (!res.headersSent) {
        res.status(503).json({
          status: 'error',
          message: `Dịch vụ ${serviceName} tạm thời không khả dụng. Vui lòng thử lại sau.`,
        });
      }
    },
  });
};

export const setupProxies = (app) => {
  // 1. Auth Service (/api/v1/auth/**)
  app.use(
    '/api/v1/auth',
    createServiceProxy(config.services.auth, 'Auth Service')
  );

  // 2. User Service (/api/v1/users, /api/v1/job-seekers, /api/v1/recruiters, /api/v1/admin)
  const userEndpoints = [
    '/api/v1/users',
    '/api/v1/job-seekers',
    '/api/v1/recruiters',
    '/api/v1/admin',
  ];
  userEndpoints.forEach((path) => {
    app.use(path, createServiceProxy(config.services.user, 'User Service'));
  });

  // 3. Company Service (/api/v1/companies)
  app.use(
    '/api/v1/companies',
    createServiceProxy(config.services.company, 'Company Service')
  );

  // 4. Application Service (/api/v1/applications)
  app.use(
    '/api/v1/applications',
    createServiceProxy(config.services.application, 'Application Service')
  );
};

