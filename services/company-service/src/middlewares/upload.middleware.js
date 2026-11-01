import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { BadRequestError } from '#shared/utils/errors.util.js';

// Đường dẫn thư mục lưu file tạm trên đĩa (job-search-uploads)
const TEMP_UPLOAD_DIR = path.join(os.tmpdir(), 'job-search-uploads');

if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const randomHex = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname) || '';
    cb(null, `${Date.now()}_${randomHex}${ext}`);
  },
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
  fileFilter: imageFileFilter,
});

/**
 * Upload single image (logo/avatar/image/file)
 */
const uploadSingleImage = (preferredField = 'logo') => {
  return (req, res, next) => {
    const fieldNames = [preferredField, 'logo', 'image', 'file'];
    const fieldsToTry = [...new Set(fieldNames)].map((name) => ({ name, maxCount: 1 }));

    const multiFieldsUpload = upload.fields(fieldsToTry);

    multiFieldsUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('Kích thước ảnh tối đa là 5MB'));
        }
        return next(new BadRequestError(`Lỗi khi tải ảnh: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      if (req.files) {
        for (const name of [...new Set(fieldNames)]) {
          if (req.files[name] && req.files[name][0]) {
            req.file = req.files[name][0];
            break;
          }
        }
      }

      next();
    });
  };
};

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Định dạng tài liệu không hợp lệ. Chỉ chấp nhận PDF, JPG, PNG, WEBP'), false);
  }
};

const uploadDoc = multer({
  storage,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
  },
  fileFilter: documentFileFilter,
});

/**
 * Upload single document (businessLicense/document/file)
 */
const uploadSingleDocument = (preferredField = 'businessLicense') => {
  return (req, res, next) => {
    const fieldNames = [preferredField, 'businessLicense', 'document', 'file'];
    const fieldsToTry = [...new Set(fieldNames)].map((name) => ({ name, maxCount: 1 }));

    const multiFieldsUpload = uploadDoc.fields(fieldsToTry);

    multiFieldsUpload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('Kích thước tài liệu tối đa là 10MB'));
        }
        return next(new BadRequestError(`Lỗi khi tải tài liệu: ${err.message}`));
      } else if (err) {
        return next(err);
      }

      if (req.files) {
        for (const name of [...new Set(fieldNames)]) {
          if (req.files[name] && req.files[name][0]) {
            req.file = req.files[name][0];
            break;
          }
        }
      }

      next();
    });
  };
};

export {
  uploadSingleImage,
  uploadSingleDocument,
  TEMP_UPLOAD_DIR,
};
