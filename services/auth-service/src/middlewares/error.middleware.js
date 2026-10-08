const { errorResponse } = require('../utils/response.util');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ (Internal Server Error)';

  if (process.env.NODE_ENV === 'development') {
    console.error(' [Error Log]:', err);
  }

  const extra = {};
  if (err.retryAfterMinutes !== undefined) {
    extra.retryAfterMinutes = err.retryAfterMinutes;
  }
  if (err.code) {
    extra.code = err.code;
  }

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined,
    extra
  );
};

module.exports = errorHandler;
