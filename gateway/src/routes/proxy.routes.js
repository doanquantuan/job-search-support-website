import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config/env.config.js';

const createServiceProxy = (targetUrl, serviceName, pathFilter) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    xfwd: true,
    pathFilter,
    on: {
      proxyRes: (proxyRes) => {
        // Xóa các header CORS trả về từ microservice để Gateway toàn quyền kiểm soát CORS tập trung,
        // tránh lỗi trùng lặp hoặc trả về wildcard '*' khi có credentials
        delete proxyRes.headers['access-control-allow-origin'];
        delete proxyRes.headers['access-control-allow-credentials'];
        delete proxyRes.headers['access-control-allow-methods'];
        delete proxyRes.headers['access-control-allow-headers'];
      },
      error: (err, req, res) => {
        console.error(`[Gateway Proxy Error] Không thể kết nối đến ${serviceName} (${targetUrl}):`, err.message);
        if (!res.headersSent) {
          res.status(503).json({
            status: 'error',
            message: `Dịch vụ ${serviceName} tạm thời không khả dụng. Vui lòng thử lại sau.`,
          });
        }
      },
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

  // 4. Job Service (/api/v1/jobs, /api/v1/occupations, /api/v1/specializations, /api/v1/saved-jobs, /api/v1/job-views, /api/v1/job-reports)
  const jobEndpoints = [
    '/api/v1/jobs',
    '/api/v1/occupations',
    '/api/v1/specializations',
    '/api/v1/saved-jobs',
    '/api/v1/job-views',
    '/api/v1/job-reports',
  ];
  jobEndpoints.forEach((path) => {
    app.use(createServiceProxy(config.services.job, 'Job Service', path));
  });

  // 5. Application Service (/api/v1/applications)
  app.use(
    createServiceProxy(config.services.application, 'Application Service', '/api/v1/applications')
  );

};

export default setupProxies;
