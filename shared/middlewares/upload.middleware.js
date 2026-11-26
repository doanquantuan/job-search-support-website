import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { BadRequestError } from '../utils/errors.util.js';

// Thư mục lưu file tạm trên đĩa
export const TEMP_UPLOAD_DIR = path.join(os.tmpdir(), 'job-search-uploads');

if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

/**
 * Xóa file tạm an toàn khỏi đĩa cứng
 */
export const cleanupFilePath = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`[UploadMiddleware] Lỗi khi dọn dẹp file tạm ${filePath}:`, err.message);
      }
    });
  }
};

/**
 * Dọn dẹp tất cả file tạm có trong request (req.file hoặc req.files)
 */
export const cleanupRequestFiles = (req) => {
  if (!req) return;
  if (req.file?.path) {
    cleanupFilePath(req.file.path);
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files.forEach((f) => cleanupFilePath(f?.path));
    } else {
      Object.values(req.files)
        .flat()
        .forEach((f) => cleanupFilePath(f?.path));
    }
  }
};

/**
 * Cấu hình Multer Disk Storage lưu vào thư mục tạm
 */
export const createDiskStorage = (destinationDir = TEMP_UPLOAD_DIR) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
      const randomHex = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname) || '';
      cb(null, `${Date.now()}_${randomHex}${ext}`);
    },
  });
};

export const defaultStorage = createDiskStorage();

// Cấu hình MIME type và kích thước mặc định
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
];
export const ALLOWED_DOCUMENT_EXTS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Filter kiểm tra định dạng ảnh
 */
export const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP'), false);
  }
};

/**
 * Filter kiểm tra định dạng tài liệu / CV / Giấy phép
 */
export const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype) || ALLOWED_DOCUMENT_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Định dạng tài liệu không hợp lệ. Chỉ chấp nhận PDF, DOC, DOCX, JPG, PNG, WEBP'), false);
  }
};

/**
 * Factory tạo middleware upload 1 file đơn với danh sách field name fallback
 */
export const createSingleUpload = ({
  preferredField = 'file',
  fallbackFields = [],
  maxSize = MAX_IMAGE_SIZE,
  fileFilter = imageFileFilter,
  sizeErrorMessage = 'Kích thước file vượt quá giới hạn cho phép',
  storage = defaultStorage,
}) => {
  const upload = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter,
  });

  const fieldNames = [preferredField, ...fallbackFields];
  const fieldsToTry = [...new Set(fieldNames)].map((name) => ({ name, maxCount: 1 }));

  return (req, res, next) => {
    const multiFieldsUpload = upload.fields(fieldsToTry);

    multiFieldsUpload(req, res, (err) => {
      if (err) {
        cleanupRequestFiles(req);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError(sizeErrorMessage));
          }
          return next(new BadRequestError(`Lỗi khi tải file: ${err.message}`));
        }
        return next(err);
      }

      // Chuẩn hóa gán vào req.file
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

/**
 * Factory tiện ích tạo middleware upload 1 file ảnh
 */
export const createSingleImageUpload = (preferredField = 'image', options = {}) => {
  return createSingleUpload({
    preferredField,
    fallbackFields: ['avatar', 'logo', 'image', 'file'],
    maxSize: options.maxSize || MAX_IMAGE_SIZE,
    fileFilter: options.fileFilter || imageFileFilter,
    sizeErrorMessage: options.sizeErrorMessage || 'Kích thước ảnh tối đa là 5MB',
    storage: options.storage || defaultStorage,
  });
};

/**
 * Factory tiện ích tạo middleware upload 1 file tài liệu / CV
 */
export const createSingleDocumentUpload = (preferredField = 'document', options = {}) => {
  return createSingleUpload({
    preferredField,
    fallbackFields: ['cv', 'businessLicense', 'resume', 'document', 'file'],
    maxSize: options.maxSize || MAX_DOCUMENT_SIZE,
    fileFilter: options.fileFilter || documentFileFilter,
    sizeErrorMessage: options.sizeErrorMessage || 'Kích thước tài liệu tối đa là 10MB',
    storage: options.storage || defaultStorage,
  });
};

/**
 * Factory tạo middleware upload nhiều field
 */
export const createMultiFieldsUpload = (
  fieldsConfig,
  {
    maxSize = MAX_IMAGE_SIZE,
    fileFilter = imageFileFilter,
    sizeErrorMessage = 'Kích thước file tối đa là 5MB',
    maxCountErrorMessage = null,
    primaryField = null,
    storage = defaultStorage,
  } = {}
) => {
  const upload = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter,
  });

  const fieldsUpload = upload.fields(fieldsConfig);

  return (req, res, next) => {
    fieldsUpload(req, res, (err) => {
      if (err) {
        cleanupRequestFiles(req);
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestError(sizeErrorMessage));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
            return next(new BadRequestError(maxCountErrorMessage || `Số lượng file tải lên vượt quá giới hạn: ${err.message}`));
          }
          return next(new BadRequestError(`Lỗi khi tải file: ${err.message}`));
        }
        return next(err);
      }

      if (primaryField && req.files?.[primaryField]?.[0]) {
        req.file = req.files[primaryField][0];
      }

      next();
    });
  };
};
