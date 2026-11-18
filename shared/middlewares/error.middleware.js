import { errorResponse } from '../utils/response.util.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi hệ thống nội bộ (Internal Server Error)';

  // Xử lý các lỗi phổ biến từ Prisma Client
  if (err.name === 'PrismaClientKnownRequestError') {
    const errorStr = (err.message || '') + (err.meta?.driverAdapterError?.message || '');
    if (
      err.code === 'P2007' ||
      err.code === 'P2023' ||
      errorStr.includes('invalid input syntax for type uuid')
    ) {
      statusCode = 400;
      message = 'Mã định danh không hợp lệ (sai định dạng UUID)';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Không tìm thấy dữ liệu yêu cầu';
    } else if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Dữ liệu đã tồn tại trong hệ thống';
    }
  }

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

export default errorHandler;
