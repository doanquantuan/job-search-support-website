import {
  createSingleImageUpload,
  createSingleDocumentUpload,
  TEMP_UPLOAD_DIR,
} from '#shared/middlewares/upload.middleware.js';

/**
 * Upload single image (avatar/image/file)
 */
const uploadSingleImage = (preferredField = 'avatar') =>
  createSingleImageUpload(preferredField, {
    sizeErrorMessage: 'Kích thước ảnh tối đa là 5MB',
  });

/**
 * Upload single CV (cv/file/resume)
 */
const uploadSingleCv = (preferredField = 'cv') =>
  createSingleDocumentUpload(preferredField, {
    sizeErrorMessage: 'Kích thước file CV tối đa là 10MB',
  });

export {
  uploadSingleImage,
  uploadSingleCv,
  TEMP_UPLOAD_DIR,
};
