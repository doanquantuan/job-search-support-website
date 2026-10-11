const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BadRequestError } = require('../utils/errors.util');


const uploadDir = path.join(__dirname, '../../uploads/licenses');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `license-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Định dạng tệp không hợp lệ. Chỉ chấp nhận các tệp PDF, JPG, PNG.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB 
  },
  fileFilter,
});

// Middleware bọc để bắt lỗi 400
const uploadLicenseMiddleware = (req, res, next) => {
  const singleUpload = upload.single('businessLicense');

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

module.exports = {
  uploadLicenseMiddleware,
};
