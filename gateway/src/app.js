import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './config/env.config.js';
import { arcjetProtection } from './middlewares/arcjet.middleware.js';
import { setupProxies } from './routes/proxy.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// 1. Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// 2. Bảo mật Headers với Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// 3. Cấu hình CORS tập trung
const allowedOrigins = [
  config.clientUrl,
  config.adminUrl,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (config.nodeEnv === 'development') return true;
  if (/\.trycloudflare\.com$/.test(origin)) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (ví dụ: Mobile apps, curl, Postman), match whitelist, cloudflare tunnel, vercel hoặc trong môi trường development
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-visitor-id',
      'X-Visitor-Id',
    ],
  })
);

// 4. Cookie parser
app.use(cookieParser());

// 5. Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    gateway: 'API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// 6. Arcjet Security Layer (Shield + Bot Protection + Rate Limiting)
app.use(arcjetProtection);

// 7. Proxy Routes đến các Microservices
// Lưu ý: Không dùng express.json() hoặc express.urlencoded() trước proxy
// để tránh làm gián đoạn streaming body hoặc multipart upload (file/avatar/cv)
setupProxies(app);

// 8. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Không tìm thấy tài nguyên trên Gateway: ${req.originalUrl}`,
  });
});

// 9. Error Handler
app.use(errorHandler);

export default app;

