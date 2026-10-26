import { errorResponse } from '#shared/utils/response.util.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ (Internal Server Error)';

  if (process.env.NODE_ENV === 'development') {
    console.error(' [Error Middleware Log]:', {
      statusCode,
      message,
      stack: err.stack,
    });
  }

  // Sử dụng format errorResponse chuẩn chung cho toàn bộ dự án
  return errorResponse(res, message, statusCode, {
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
