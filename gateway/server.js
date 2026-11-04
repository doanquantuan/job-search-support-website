import app from './src/app.js';
import config from './src/config/env.config.js';

const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`[API-Gateway] Đang lắng nghe trên cổng: ${config.port}`);
  console.log(`[API-Gateway] Môi trường: ${config.nodeEnv}`);
  console.log(`[API-Gateway] Client Origin: ${config.clientUrl}`);
  console.log('[API-Gateway] Định tuyến đích:');
  console.log(`  - /api/v1/auth        --> ${config.services.auth}`);
  console.log(`  - /api/v1/users       --> ${config.services.user}`);
  console.log(`  - /api/v1/job-seekers --> ${config.services.user}`);
  console.log(`  - /api/v1/recruiters  --> ${config.services.user}`);
  console.log(`  - /api/v1/admin       --> ${config.services.user}`);
  console.log(`  - /api/v1/companies   --> ${config.services.company}`);
  console.log(`  - /api/v1/jobs        --> ${config.services.job}`);
  console.log(`  - /api/v1/applications--> ${config.services.application}`);
  console.log('====================================================');
});

const gracefulShutdown = () => {
  console.log('\n[API-Gateway] Đang tắt Gateway Server...');
  server.close(() => {
    console.log('[API-Gateway] Server đã đóng.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
