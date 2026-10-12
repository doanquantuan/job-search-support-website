const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BadRequestError } = require('../utils/errors.util');

// Đảm bảo các thư mục upload tồn tại
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const licenseDir = path.join(__dirname, '../../uploads/licenses');
const logoDir = path.join(__dirname, '../../uploads/logos');
const envPhotosDir = path.join(__dirname, '../../uploads/environment');

ensureDir(licenseDir);
ensureDir(logoDir);
ensureDir(envPhotosDir);

// Storage cho giấy phép kinh doanh 
const licenseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, licenseDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `license-${uniqueSuffix}${ext}`);
  },
});

const licenseFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Định dạng tệp không hợp lệ. Chỉ chấp nhận các tệp PDF, JPG, PNG.'), false);
  }
};

const uploadLicense = multer({
  storage: licenseStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: licenseFileFilter,
});

const uploadLicenseMiddleware = (req, res, next) => {
  const singleUpload = uploadLicense.single('businessLicense');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError('Dung lượng tệp vượt quá giới hạn tối đa cho phép (10 MB).'));
      }
      return next(new BadRequestError(`Lỗi tải lên tệp: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

// Storage Logo, Ảnh môi trường làm việc
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'logo') {
      cb(null, logoDir);
    } else {
      cb(null, envPhotosDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'logo' ? 'logo' : 'env';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

const imageOnlyFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Tệp '${file.originalname}' không đúng định dạng ảnh (chỉ chấp nhận JPG, JPEG, PNG, WEBP).`), false);
  }
};

const uploadMedia = multer({
  storage: mediaStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB mỗi ảnh
  fileFilter: imageOnlyFilter,
});

const uploadCompanyMediaMiddleware = (req, res, next) => {
  const fieldsUpload = uploadMedia.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'environmentPhotos', maxCount: 10 },
  ]);

  fieldsUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError('Dung lượng ảnh vượt quá giới hạn tối đa cho phép (5 MB).'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new BadRequestError('Số lượng tệp tải lên vượt quá giới hạn hoặc tên trường không hợp lệ.'));
      }
      return next(new BadRequestError(`Lỗi tải lên tệp: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

module.exports = {
  uploadLicenseMiddleware,
  uploadCompanyMediaMiddleware,
};
