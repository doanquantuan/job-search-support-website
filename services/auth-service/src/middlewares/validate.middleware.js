const { BadRequestError } = require('../utils/errors.util');

const validateRegister = (req, res, next) => {
  if (req.body.email && typeof req.body.email === 'string') {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  if (req.body.fullName && typeof req.body.fullName === 'string') {
    req.body.fullName = req.body.fullName.trim();
  }

  const { email, fullName, password, role } = req.body;

  if (!email || !password || !fullName) {
    return next(new BadRequestError('Email, mật khẩu và họ tên là bắt buộc'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new BadRequestError('Định dạng email không hợp lệ'));
  }

  if (typeof fullName !== 'string' || fullName.length < 2 || fullName.length > 50) {
    return next(new BadRequestError('Họ và tên phải có từ 2 đến 50 ký tự'));
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (password.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return next(
      new BadRequestError(
        'Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt'
      )
    );
  }

  if (role && !['JOB_SEEKER', 'RECRUITER'].includes(role)) {
    return next(new BadRequestError('Vai trò không hợp lệ'));
  }

  next();
};

const validateLogin = (req, res, next) => {
  if (req.body.email && typeof req.body.email === 'string') {
    req.body.email = req.body.email.trim().toLowerCase();
  }

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

const validateVerifyOTP = (req, res, next) => {
  if (req.body.email && typeof req.body.email === 'string') {
    req.body.email = req.body.email.trim().toLowerCase();
  }
  if (req.body.otp && typeof req.body.otp === 'string') {
    req.body.otp = req.body.otp.trim();
  }

  const { email, otp, purpose, type } = req.body;

  if (!email || !otp) {
    return next(new BadRequestError('Email và mã OTP là bắt buộc'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new BadRequestError('Định dạng email không hợp lệ'));
  }

  if (!/^\d{6}$/.test(otp)) {
    return next(new BadRequestError('Mã OTP phải gồm đúng 6 chữ số'));
  }

  const validTypes = ['verify-email', 'forgot-password'];
  const validPurposes = ['REGISTER', 'RESET_PASSWORD'];

  if (!type && !purpose) {
    return next(new BadRequestError('Mục đích xác thực (purpose hoặc type) là bắt buộc'));
  }

  if (type && !validTypes.includes(type)) {
    return next(new BadRequestError('Mục đích xác thực không hợp lệ'));
  }

  if (purpose && !validPurposes.includes(purpose)) {
    return next(new BadRequestError('Mục đích xác thực không hợp lệ'));
  }

  next();
};

const validateResendOTP = (req, res, next) => {
  if (req.body.email && typeof req.body.email === 'string') {
    req.body.email = req.body.email.trim().toLowerCase();
  }

  const { email, purpose, type } = req.body;

  if (!email) {
    return next(new BadRequestError('Email là bắt buộc'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new BadRequestError('Định dạng email không hợp lệ'));
  }

  const validTypes = ['verify-email', 'forgot-password'];
  const validPurposes = ['REGISTER', 'RESET_PASSWORD'];

  if (!type && !purpose) {
    return next(new BadRequestError('Mục đích gửi lại OTP (purpose hoặc type) là bắt buộc'));
  }

  if (type && !validTypes.includes(type)) {
    return next(new BadRequestError('Mục đích gửi lại mã không hợp lệ'));
  }

  if (purpose && !validPurposes.includes(purpose)) {
    return next(new BadRequestError('Mục đích gửi lại mã không hợp lệ'));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyOTP,
  validateResendOTP,
};
