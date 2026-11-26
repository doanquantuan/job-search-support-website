import { BaseFileService } from '#shared/services/base-file.service.js';
import { s3Client, bucketName, privateBucketName, publicUrl } from '../config/r2.config.js';

class FileService extends BaseFileService {
  constructor() {
    super({
      s3Client,
      bucketName,
      privateBucketName,
      publicUrl,
      gatewayBaseUrl: process.env.API_GATEWAY_URL || 'http://localhost:5000/api/v1',
      allowedDeletePrefixes: ['logo', 'environments', 'images/logos', 'logos', 'documents', 'licenses'],
    });
  }

  /**
   * Tối ưu hóa ảnh Logo bằng Sharp
   */
  async processLogoImage(inputPath, options = {}) {
    return this.processImage(inputPath, {
      width: options.width || 400,
      height: options.height || 400,
      quality: options.quality || 80,
      fit: 'cover',
      position: 'center',
    });
  }

  /**
   * Tối ưu hóa ảnh môi trường làm việc (Environment) bằng Sharp
   */
  async processEnvironmentImage(inputPath, options = {}) {
    return this.processImage(inputPath, {
      width: options.width || 1600,
      height: options.height || 1200,
      quality: options.quality || 82,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  /**
   * Upload buffer ảnh đã qua xử lý lên R2 Public Bucket
   * Phân chia rõ thư mục gốc: logo/ và environments/
   */
  async uploadProcessedImage(buffer, extension = '.webp', mimetype = 'image/webp', subfolder = 'logo') {
    const cleanFolder = subfolder ? subfolder.replace(/^\/+|\/+$/g, '') : 'logo';
    return super.uploadProcessedImage(buffer, extension, mimetype, cleanFolder);
  }

  /**
   * Tối ưu và tải Logo công ty lên thư mục logo/ trên Public Bucket
   */
  async uploadCompanyLogo(inputPath) {
    const processed = await this.processLogoImage(inputPath);
    return this.uploadProcessedImage(
      processed.buffer,
      processed.extension,
      processed.mimetype,
      'logo'
    );
  }

  /**
   * Tối ưu và tải ảnh môi trường làm việc lên thư mục environments/ trên Public Bucket
   */
  async uploadCompanyEnvironmentImage(inputPath) {
    const processed = await this.processEnvironmentImage(inputPath);
    return this.uploadProcessedImage(
      processed.buffer,
      processed.extension,
      processed.mimetype,
      'environments'
    );
  }

  /**
   * Upload file trực tiếp từ ổ đĩa
   */
  async uploadFileFromDisk(filePath, originalname = 'image.jpg', mimetype = 'image/jpeg', subfolder = 'logos') {
    const prefix = subfolder ? `images/${subfolder.replace(/^\/+|\/+$/g, '')}` : 'images';
    return super.uploadFileFromDisk(filePath, originalname, mimetype, prefix);
  }

  /**
   * Upload tài liệu (Giấy phép kinh doanh, văn bản...) lên Private Bucket
   */
  async uploadDocument({ buffer, filePath, originalname = 'license.pdf', mimetype = 'application/pdf', subfolder = 'licenses' }) {
    const cleanSubfolder = subfolder ? subfolder.replace(/^\/+|\/+$/g, '') : 'licenses';
    const folder = `documents/${cleanSubfolder}`;
    return super.uploadDocument({
      buffer,
      filePath,
      originalname,
      mimetype,
      folder,
      targetBucket: this.privateBucketName,
    });
  }
}

export default new FileService();
