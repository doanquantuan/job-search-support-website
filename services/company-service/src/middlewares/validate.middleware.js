import { BadRequestError } from '#shared/utils/errors.util.js';

const validate = (schema) => (req, res, next) => {
  try {
    if (typeof req.body.location === 'string') {
      try {
        const parsedLocation = JSON.parse(req.body.location);
        req.body = { ...req.body, ...parsedLocation };
      } catch (e) {
        // ignore parse error, fallback to flat properties
      }
    } else if (typeof req.body.location === 'object' && req.body.location !== null) {
      req.body = { ...req.body, ...req.body.location };
    }

    const validatedData = schema.parse(req.body);
    req.validatedBody = validatedData;
    next();
  } catch (error) {
    const issues = error.issues || error.errors;
    if (issues && Array.isArray(issues)) {
      const formattedErrors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      const message = formattedErrors[0]?.message || 'Dữ liệu đầu vào không hợp lệ';
      const badReq = new BadRequestError(message);
      badReq.errors = formattedErrors;
      return next(badReq);
    }
    next(error);
  }
};


export const validateQuery = (schema) => (req, res, next) => {
  try {
    const validatedQuery = schema.parse(req.query);
    req.validatedQuery = validatedQuery;
    next();
  } catch (error) {
    const issues = error.issues || error.errors;
    if (issues && Array.isArray(issues)) {
      const formattedErrors = issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      const message = formattedErrors[0]?.message || 'Tham số truy vấn (query) không hợp lệ';
      const badReq = new BadRequestError(message);
      badReq.errors = formattedErrors;
      return next(badReq);
    }
    next(error);
  }
};

export default validate;
export { validate };
