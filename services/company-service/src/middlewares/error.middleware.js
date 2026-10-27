import { errorResponse } from '../utils/response.util.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống máy chủ nội bộ';

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error('Lỗi [company-service]:', err);
  }

  return errorResponse(res, message, statusCode, err.errors || null);
};

export default errorHandler;
export { errorHandler };
