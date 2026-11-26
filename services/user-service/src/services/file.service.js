import { BaseFileService } from '#shared/services/base-file.service.js';
import { s3Client, bucketName, publicUrl } from '../config/r2.config.js';

class FileService extends BaseFileService {
  constructor() {
    super({
      s3Client,
      bucketName,
      publicUrl,
      gatewayBaseUrl: process.env.API_GATEWAY_URL || 'http://localhost:5000/api/v1',
      allowedDeletePrefixes: ['images', 'documents', 'cvs'],
    });
  }

  /**
   * Tối ưu hóa ảnh đại diện (Avatar) bằng Sharp
   */
  async processAvatarImage(inputPath, options = {}) {
    return this.processImage(inputPath, {
      width: options.width || 400,
      height: options.height || 400,
      quality: options.quality || 80,
      fit: 'cover',
      position: 'center',
    });
  }

  /**
   * Upload buffer ảnh đại diện đã tối ưu lên R2
   */
  async uploadProcessedImage(buffer, extension = '.webp', mimetype = 'image/webp', subfolder = 'avatars') {
    const prefix = subfolder ? `images/${subfolder.replace(/^\/+|\/+$/g, '')}` : 'images';
    return super.uploadProcessedImage(buffer, extension, mimetype, prefix);
  }

  /**
   * Upload file từ đĩa lên R2
   */
  async uploadFileFromDisk(filePath, originalname = 'image.jpg', mimetype = 'image/jpeg', subfolder = '') {
    const prefix = subfolder ? `images/${subfolder.replace(/^\/+|\/+$/g, '')}` : 'images';
    return super.uploadFileFromDisk(filePath, originalname, mimetype, prefix);
  }

  /**
   * Upload tài liệu (CV) lên R2
   */
  async uploadDocument({ buffer, filePath, originalname = 'cv.pdf', mimetype = 'application/pdf', subfolder = 'cvs' }) {
    const cleanSubfolder = subfolder ? subfolder.replace(/^\/+|\/+$/g, '') : 'cvs';
    const folder = `documents/${cleanSubfolder}`;
    return super.uploadDocument({
      buffer,
      filePath,
      originalname,
      mimetype,
      folder,
      targetBucket: this.bucketName,
    });
  }

  /**
   * Upload file CV ứng viên
   */
  async uploadCvFile(buffer, mimetype = 'application/pdf', userId = '', originalname = 'cv.pdf') {
    return this.uploadDocument({
      buffer,
      mimetype,
      subfolder: userId ? `cvs/${userId}` : 'cvs',
      originalname: originalname || 'cv.pdf',
    });
  }

  /**
   * Chuẩn hóa URL ảnh / file sang định dạng công khai hoặc proxy Gateway
   */
  normalizeUrl(urlOrKey) {
    if (!urlOrKey) return null;
    if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
      if (urlOrKey.includes('r2.cloudflarestorage.com')) {
        const key = this.extractKey(urlOrKey);
        return this.getFileUrl(key);
      }
      return urlOrKey;
    }
    return this.getFileUrl(urlOrKey);
  }
}

export default new FileService();
