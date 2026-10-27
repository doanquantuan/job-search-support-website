const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    message,
    data,
  });
};

const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    ...(errors && { errors }),
  });
};

export {
  successResponse,
  errorResponse,
};
