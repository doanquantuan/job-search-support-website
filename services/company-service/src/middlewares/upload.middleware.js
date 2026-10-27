import multer from 'multer';
import { BadRequestError } from '../utils/errors.util.js';

// memoryStorage: file lưu tạm trong RAM (Buffer)
const memoryStorage = multer.memoryStorage();

const licenseFileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Định dạng tệp giấy phép không hợp lệ. Chỉ chấp nhận PDF, JPG, PNG.'
      ),
      false
    );
  }
};

const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Tệp '${file.originalname}' không đúng định dạng ảnh (chỉ chấp nhận JPG, JPEG, PNG, WEBP).`
      ),
      false
    );
  }
};

// upload giấy phép kinh doanh 

const uploadLicense = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: licenseFileFilter,
});

const uploadLicenseMiddleware = (req, res, next) => {
  const handler = uploadLicense.single('businessLicense');

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new BadRequestError('Dung lượng giấy phép vượt quá giới hạn tối đa cho phép (10 MB).')
        );
      }
      return next(new BadRequestError(`Lỗi tải lên tệp: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};


// upload Logo & Ảnh môi trường làm việc 

const uploadMedia = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB mỗi ảnh
  fileFilter: imageFileFilter,
});

const uploadCompanyMediaMiddleware = (req, res, next) => {
  const handler = uploadMedia.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'environmentPhotos', maxCount: 10 },
  ]);

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new BadRequestError('Dung lượng ảnh vượt quá giới hạn tối đa cho phép (5 MB).')
        );
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(
          new BadRequestError(
            'Số lượng tệp tải lên vượt quá giới hạn hoặc tên trường không hợp lệ.'
          )
        );
      }
      return next(new BadRequestError(`Lỗi tải lên tệp: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};

export {
  uploadLicenseMiddleware,
  uploadCompanyMediaMiddleware,
};
