import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/env.config.js';

const createServiceProxy = (targetUrl, serviceName, pathFilter) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    xfwd: true,
    pathFilter,
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
    createServiceProxy(config.services.auth, 'Auth Service', '/api/v1/auth')
  );

  // 2. User Service (/api/v1/users, /api/v1/job-seekers, /api/v1/recruiters, /api/v1/admin)
  const userEndpoints = [
    '/api/v1/users',
    '/api/v1/job-seekers',
    '/api/v1/recruiters',
    '/api/v1/admin',
  ];
  userEndpoints.forEach((path) => {
    app.use(createServiceProxy(config.services.user, 'User Service', path));
  });

  // 3. Company Service (/api/v1/companies)
  app.use(
    createServiceProxy(config.services.company, 'Company Service', '/api/v1/companies')
  );

  // 4. Application Service (/api/v1/applications)
  app.use(
    createServiceProxy(config.services.application, 'Application Service', '/api/v1/applications')
  );
};

