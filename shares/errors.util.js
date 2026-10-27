export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource Already Exists') {
    super(message, 409);
  }
}

<<<<<<<< HEAD:shared/utils/errors.util.js
export class TooManyRequestsError extends AppError {
========
class TooManyRequestsError extends AppError {
>>>>>>>> feature/user-service-cv-management:shares/errors.util.js
  constructor(message = 'Too Many Requests', retryAfterMinutes = 5) {
    super(message, 429);
    this.retryAfterMinutes = retryAfterMinutes;
  }
}

<<<<<<<< HEAD:shared/utils/errors.util.js
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

export default {
========
module.exports = {
>>>>>>>> feature/user-service-cv-management:shares/errors.util.js
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
<<<<<<<< HEAD:shared/utils/errors.util.js
  InternalServerError,
========
>>>>>>>> feature/user-service-cv-management:shares/errors.util.js
};
