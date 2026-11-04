import { BadRequestError } from '../utils/errors.util.js';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Middleware kiểm tra tính hợp lệ của một hoặc nhiều tham số UUID trong req.params
 * Ví dụ sử dụng:
 * router.get('/:jobId', validateUuidParams('jobId'), controller.getJob);
 * router.get('/:jobId/applications/:applicationId', validateUuidParams('jobId', 'applicationId'), ...);
 */
export const validateUuidParams = (...paramNames) => {
  return (req, res, next) => {
    for (const name of paramNames) {
      const val = req.params[name];
      if (!val || !UUID_REGEX.test(val)) {
        return next(
          new BadRequestError(`Tham số :${name} không hợp lệ (yêu cầu định dạng chuẩn UUID)`)
        );
      }
    }
    next();
  };
};

export default {
  UUID_REGEX,
  validateUuidParams,
};

