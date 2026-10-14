const { BadRequestError } = require('../../.../../../../shares/errors.util');
const validateProfile = (req, res, next) => {
  const {
    fullName,
    avatar,
    contactEmail,
    phone,
    dateOfBirth,
    gender,
    address,
    githubUrl,
  } = req.body;

  // Kiểm tra fullName
  if (
    fullName !== undefined &&
    (typeof fullName !== 'string' || fullName.trim().length === 0)
  ) {
    return next(new BadRequestError('Tên đầy đủ không hợp lệ'));
  }

  // Kiểm tra avatar
  if (
    avatar !== undefined &&
    avatar !== null &&
    typeof avatar !== 'string'
  ) {
    return next(new BadRequestError('Avatar không hợp lệ'));
  }

  // Kiểm tra contactEmail
  if (
    contactEmail !== undefined &&
    contactEmail !== null &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
  ) {
    return next(new BadRequestError('Email liên hệ không hợp lệ'));
  }

  // Kiểm tra phone
  if (
    phone !== undefined &&
    phone !== null &&
    !/^\+?[0-9]{9,15}$/.test(phone)
  ) {
    return next(new BadRequestError('Số điện thoại không hợp lệ'));
  }

  // Kiểm tra dateOfBirth
  if (dateOfBirth !== undefined && dateOfBirth !== null) {
    if (
      typeof dateOfBirth !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      Number.isNaN(Date.parse(dateOfBirth)) ||
      new Date(dateOfBirth).toISOString().slice(0, 10) !== dateOfBirth
    ) {
      return next(new BadRequestError('Ngày sinh phải có định dạng YYYY-MM-DD hợp lệ'));
    }

    if (dateOfBirth > new Date().toISOString().slice(0, 10)) {
      return next(new BadRequestError('Ngày sinh không được lớn hơn ngày hiện tại'));
    }
  }

  // Kiểm tra gender
  if (
    gender !== undefined &&
    gender !== null &&
    !['MALE', 'FEMALE', 'OTHER'].includes(gender)
  ) {
    return next(new BadRequestError('Giới tính không hợp lệ'));
  }

  // Kiểm tra address
  if (
    address !== undefined &&
    address !== null &&
    typeof address !== 'string'
  ) {
    return next(new BadRequestError('Địa chỉ không hợp lệ'));
  }

  // Kiểm tra githubUrl
  if (githubUrl !== undefined && githubUrl !== null) {
    try {
      const url = new URL(githubUrl);

      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.hostname.toLowerCase() !== 'github.com'
      ) {
        return next(new BadRequestError('Đường dẫn GitHub không hợp lệ'));
      }
    } catch {
      return next(new BadRequestError('Đường dẫn GitHub không hợp lệ'));
    }
  }

  next();
};

module.exports = validateProfile;
