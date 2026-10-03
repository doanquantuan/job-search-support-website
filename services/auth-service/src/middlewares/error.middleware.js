const { errorResponse } = require('../utils/response.util');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ (Internal Server Error)';

  if (process.env.NODE_ENV === 'development') {
    console.error(' [Error Log]:', err);
  }

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

module.exports = errorHandler;
