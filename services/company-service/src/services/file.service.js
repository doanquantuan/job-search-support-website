import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, bucketName, privateBucketName, publicUrl } from '../config/r2.config.js';
import { BadRequestError, InternalServerError } from '#shared/utils/errors.util.js';

class FileService {
  /**
   * Tối ưu hóa ảnh Logo bằng Sharp
   */
  async processLogoImage(inputPath, options = {}) {
    if (!inputPath || !fs.existsSync(inputPath)) {
      throw new BadRequestError('File nguồn không tồn tại');
    }

    const { width = 400, height = 400, quality = 80 } = options;
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;

    try {
      const processedBuffer = await sharp(inputPath)
        .rotate()
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality })
        .toBuffer();

      return {
        buffer: processedBuffer,
        mimetype: 'image/webp',
        extension: '.webp',
        size: processedBuffer.length,
        originalSize,
      };
    } catch (error) {
      console.error('[FileService] Lỗi khi xử lý tối ưu ảnh bằng Sharp:', error);
      throw new InternalServerError('Không thể tối ưu hóa và xử lý ảnh: ' + error.message);
    }
  }

  /**
   * Tối ưu hóa ảnh môi trường làm việc (Environment) bằng Sharp
   * Giữ nguyên tỷ lệ khung hình, giới hạn tối đa 1600x1200, nén WebP
   */
  async processEnvironmentImage(inputPath, options = {}) {
    if (!inputPath || !fs.existsSync(inputPath)) {
      throw new BadRequestError('File nguồn không tồn tại');
    }

    const { width = 1600, height = 1200, quality = 82 } = options;
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;

    try {
      const processedBuffer = await sharp(inputPath)
        .rotate()
        .resize({
          width,
          height,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toBuffer();

      return {
        buffer: processedBuffer,
        mimetype: 'image/webp',
        extension: '.webp',
        size: processedBuffer.length,
        originalSize,
      };
    } catch (error) {
      console.error('[FileService] Lỗi khi xử lý ảnh môi trường bằng Sharp:', error);
      throw new InternalServerError('Không thể tối ưu hóa và xử lý ảnh môi trường: ' + error.message);
    }
  }

  /**
   * Upload buffer ảnh đã qua xử lý lên R2 Public Bucket
   * Phân chia rõ thư mục gốc: logo/ và environments/
   */
  async uploadProcessedImage(buffer, extension = '.webp', mimetype = 'image/webp', subfolder = 'logo') {
    if (!buffer) {
      throw new BadRequestError('Không có dữ liệu ảnh để tải lên');
    }

    const randomHex = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomHex}${extension}`;

    const cleanFolder = subfolder ? subfolder.replace(/^\/+|\/+$/g, '') : 'logo';
    const key = `${cleanFolder}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      });

      await s3Client.send(command);

      const fileUrl = this.getFileUrl(key);

      return {
        key,
        url: fileUrl,
      };
    } catch (error) {
      console.error('Error uploading processed image to R2:', error);
      throw new InternalServerError('Lỗi khi tải ảnh lên Cloudflare R2: ' + error.message);
    }
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
    if (!filePath || !fs.existsSync(filePath)) {
      throw new BadRequestError('File tạm không tồn tại trên hệ thống');
    }

    const ext = path.extname(originalname) || '.jpg';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomHex}${ext}`;

    const prefix = subfolder ? `images/${subfolder.replace(/^\/+|\/+$/g, '')}` : 'images';
    const key = `${prefix}/${fileName}`;

    const fileStream = fs.createReadStream(filePath);

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileStream,
        ContentType: mimetype,
      });

      await s3Client.send(command);

      const fileUrl = this.getFileUrl(key);

      return {
        key,
        url: fileUrl,
      };
    } catch (error) {
      console.error('Error uploading file stream to R2:', error);
      throw new InternalServerError('Lỗi khi tải ảnh lên Cloudflare R2: ' + error.message);
    }
  }

  /**
   * Upload tài liệu (Giấy phép kinh doanh, văn bản...)
   */
  async uploadDocument({ buffer, filePath, originalname = 'license.pdf', mimetype = 'application/pdf', subfolder = 'licenses' }) {
    let fileBuffer = buffer;
    if (!fileBuffer && filePath && fs.existsSync(filePath)) {
      fileBuffer = fs.readFileSync(filePath);
    }

    if (!fileBuffer) {
      throw new BadRequestError('Không có dữ liệu tài liệu để tải lên');
    }

    const ext = path.extname(originalname) || '.pdf';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomHex}${ext}`;

    const cleanSubfolder = subfolder ? subfolder.replace(/^\/+|\/+$/g, '') : 'licenses';
    const key = `documents/${cleanSubfolder}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: privateBucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        ContentDisposition: `inline; filename="${encodeURIComponent(originalname)}"`,
      });

      await s3Client.send(command);

      const fileUrl = this.getFileUrl(key, privateBucketName);

      return {
        key,
        url: fileUrl,
        size: fileBuffer.length,
      };
    } catch (error) {
      console.error('Error uploading document to R2:', error);
      throw new InternalServerError('Lỗi khi tải tài liệu lên Cloudflare R2: ' + error.message);
    }
  }

  /**
   * Tự động dọn dẹp file tạm sau khi upload xong
   */
  cleanupTempFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`[FileService] Lỗi khi xóa file tạm: ${filePath}`, err);
        }
      });
    }
  }

  extractKey(urlOrKey) {
    if (!urlOrKey || typeof urlOrKey !== 'string') return null;
    let raw = urlOrKey.trim();
    if (!raw) return null;

    if (/^https?:\/\//i.test(raw)) {
      try {
        raw = new URL(raw).pathname.replace(/^\/+/, '');
      } catch {
        return null;
      }
    } else {
      raw = raw.replace(/^\/+/, '');
    }

    // Chặn path traversal
    if (raw.includes('..') || raw.includes('\\')) {
      return null;
    }

    const match = raw.match(/(logo|environments|images\/logos|logos|documents|licenses)\/.+$/);
    return match ? match[0] : raw;
  }

  /**
   * Chỉ cho phép xóa key thuộc các prefix hợp lệ trên R2 (chống xóa nhầm hoặc path traversal)
   */
  isAllowedDeleteKey(key) {
    if (!key || typeof key !== 'string') return false;
    if (key.includes('..') || key.includes('\\')) return false;
    return /^(logo|environments|images\/logos|logos|documents|licenses)\/[^/].*/.test(key);
  }

  getFileUrl(key, targetBucket = bucketName) {
    if (targetBucket === bucketName && publicUrl) {
      const base = publicUrl.replace(/\/+$/, '');
      return `${base}/${key}`;
    }
    return `https://${targetBucket}.r2.cloudflarestorage.com/${key}`;
  }

  async getPresignedUrl(key, expiresIn = 3600) {
    try {
      const cleanKey = this.extractKey(key);
      const targetBucket = /^(documents|licenses)\//.test(cleanKey)
        ? privateBucketName
        : bucketName;
      const command = new GetObjectCommand({
        Bucket: targetBucket,
        Key: cleanKey,
      });
      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error creating presigned URL:', error);
      throw new InternalServerError('Lỗi khi tạo liên kết truy cập file: ' + error.message);
    }
  }

  async deleteFile(urlOrKey) {
    if (!urlOrKey) return;
    const key = this.extractKey(urlOrKey);
    if (!this.isAllowedDeleteKey(key)) {
      console.warn(`[FileService] Từ chối xóa key R2 không nằm trong whitelist prefix: ${urlOrKey}`);
      return;
    }
    const targetBucket = /^(documents|licenses)\//.test(key)
      ? privateBucketName
      : bucketName;
    try {
      const command = new DeleteObjectCommand({
        Bucket: targetBucket,
        Key: key,
      });
      await s3Client.send(command);
      console.log(`[FileService] Đã xóa file R2 thành công: ${key}`);
    } catch (error) {
      console.error(`[FileService] Lỗi khi xóa file ${key} trên R2:`, error.message);
    }
  }

  async deleteFiles(urlsOrKeys = []) {
    if (!Array.isArray(urlsOrKeys) || urlsOrKeys.length === 0) return;
    const uniqueTargets = [...new Set(urlsOrKeys.filter(Boolean))];
    await Promise.allSettled(uniqueTargets.map((target) => this.deleteFile(target)));
  }
}

export default new FileService();
