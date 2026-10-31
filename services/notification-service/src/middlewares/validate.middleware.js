import { BadRequestError } from '../utils/errors.util.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const dataToValidate = req[source];
    const validatedData = schema.parse(dataToValidate);
    
    if (source === 'query') {
      req.validatedQuery = validatedData;
    } else if (source === 'params') {
      req.validatedParams = validatedData;
    } else {
      req.validatedBody = validatedData;
    }

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

export default validate;
