export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const errorResponse = (res, message, statusCode = 500, errors = null, extra = {}) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors }),
    ...extra,
  });
};

export default {
  successResponse,
  errorResponse,
};
