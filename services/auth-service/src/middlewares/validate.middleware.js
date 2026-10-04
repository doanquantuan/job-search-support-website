const { BadRequestError } = require('../utils/errors.util');

const validateRegister = (req, res, next) => {
  const { email, fullName, password, role } = req.body;

  if (!email || !password || !fullName) {
    return next(new BadRequestError('Email, mật khẩu và họ tên là bắt buộc'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new BadRequestError('Định dạng email không hợp lệ'));
  }

  if (password.length < 8) {
    return next(new BadRequestError('Mật khẩu phải chứa ít nhất 8 ký tự'));
  }

  if (role && !['JOB_SEEKER', 'RECRUITER'].includes(role)) {
    return next(new BadRequestError('Vai trò không hợp lệ'));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Email và mật khẩu là bắt buộc'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new BadRequestError('Định dạng email không hợp lệ'));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
