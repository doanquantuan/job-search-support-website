import {
  createSingleImageUpload,
  createSingleDocumentUpload,
  createMultiFieldsUpload,
  imageFileFilter,
  defaultStorage,
  TEMP_UPLOAD_DIR,
} from '#shared/middlewares/upload.middleware.js';

const MAX_ENVIRONMENT_IMAGES = 10;

/**
 * Upload single image (logo/avatar/image/file)
 */
const uploadSingleImage = (preferredField = 'logo') =>
  createSingleImageUpload(preferredField, {
    sizeErrorMessage: 'Kích thước ảnh tối đa là 5MB',
  });

/**
 * Upload single document (businessLicense/document/file)
 */
const uploadSingleDocument = (preferredField = 'businessLicense') =>
  createSingleDocumentUpload(preferredField, {
    sizeErrorMessage: 'Kích thước tài liệu tối đa là 10MB',
  });

/**
 * Upload đồng thời Logo (tối đa 1 ảnh) và ảnh Môi trường làm việc (tối đa 10 ảnh)
 */
const uploadCompanyMedia = createMultiFieldsUpload(
  [
    { name: 'logo', maxCount: 1 },
    { name: 'environments', maxCount: MAX_ENVIRONMENT_IMAGES },
  ],
  {
    storage: defaultStorage,
    fileFilter: imageFileFilter,
    primaryField: 'logo',
    sizeErrorMessage: 'Kích thước mỗi ảnh tối đa là 5MB',
    maxCountErrorMessage: `Chỉ cho phép tối đa 1 ảnh logo và ${MAX_ENVIRONMENT_IMAGES} ảnh môi trường làm việc trong một lần tải lên`,
  }
);

export {
  uploadSingleImage,
  uploadSingleDocument,
  uploadCompanyMedia,
  MAX_ENVIRONMENT_IMAGES,
  TEMP_UPLOAD_DIR,
};
