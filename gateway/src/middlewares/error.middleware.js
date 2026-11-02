export const errorHandler = (err, req, res, _next) => {
  console.error('[Gateway Internal Error]:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Lỗi hệ thống Gateway',
  });
};

