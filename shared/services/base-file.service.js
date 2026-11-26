import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import sharp from 'sharp';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestError, InternalServerError } from '../utils/errors.util.js';

export class BaseFileService {
  constructor({
    s3Client,
    bucketName,
    privateBucketName,
    publicUrl,
    gatewayBaseUrl,
    allowedDeletePrefixes = ['logo', 'environments', 'images/logos', 'logos', 'documents', 'licenses', 'images', 'cvs'],
  } = {}) {
    this.s3Client = s3Client;
    this.bucketName = bucketName;
    this.privateBucketName = privateBucketName || bucketName;
    this.publicUrl = publicUrl;
    this.gatewayBaseUrl = gatewayBaseUrl || process.env.API_GATEWAY_URL || 'http://localhost:5000/api/v1';
    this.allowedDeletePrefixes = allowedDeletePrefixes;
  }

  /**
   * Tối ưu hóa ảnh bằng Sharp (hỗ trợ resize cover, inside, xoay chiều và nén WebP)
   */
  async processImage(inputPath, options = {}) {
    if (!inputPath || !fs.existsSync(inputPath)) {
      throw new BadRequestError('File nguồn không tồn tại');
    }

    const {
      width = 400,
      height = 400,
      quality = 80,
      fit = 'cover',
      position = 'center',
      withoutEnlargement = false,
    } = options;

    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;

    try {
      const resizeOptions = fit === 'inside'
        ? { width, height, fit: 'inside', withoutEnlargement }
        : { width, height, fit, position };

      const processedBuffer = await sharp(inputPath)
        .rotate()
        .resize(resizeOptions)
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
      console.error('[BaseFileService] Lỗi khi xử lý tối ưu ảnh bằng Sharp:', error);
      throw new InternalServerError('Không thể tối ưu hóa và xử lý ảnh: ' + error.message);
    }
  }

  /**
   * Sinh key ngẫu nhiên an toàn trên S3/R2
   */
  generateFileKey(fileNameOrExt = '', folder = '', defaultExt = '.jpg') {
    const ext = path.extname(fileNameOrExt) || (fileNameOrExt.startsWith('.') ? fileNameOrExt : defaultExt);
    const randomHex = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomHex}${ext}`;
    const cleanFolder = folder ? folder.replace(/^\/+|\/+$/g, '') : '';
    return cleanFolder ? `${cleanFolder}/${fileName}` : fileName;
  }

  /**
   * Upload buffer ảnh đã xử lý lên R2/S3
   */
  async uploadProcessedImage(buffer, extension = '.webp', mimetype = 'image/webp', folder = '') {
    if (!buffer) {
      throw new BadRequestError('Không có dữ liệu ảnh để tải lên');
    }

    const key = this.generateFileKey(extension, folder, '.webp');

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      });

      await this.s3Client.send(command);
      const fileUrl = this.getFileUrl(key);

      return { key, url: fileUrl };
    } catch (error) {
      console.error('[BaseFileService] Error uploading processed image to R2:', error);
      throw new InternalServerError('Lỗi khi tải ảnh lên Cloudflare R2: ' + error.message);
    }
  }

  /**
   * Upload file trực tiếp từ ổ đĩa (dùng readStream)
   */
  async uploadFileFromDisk(filePath, originalname = 'image.jpg', mimetype = 'image/jpeg', folder = '') {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new BadRequestError('File tạm không tồn tại trên hệ thống');
    }

    const key = this.generateFileKey(originalname, folder, '.jpg');
    const fileStream = fs.createReadStream(filePath);

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileStream,
        ContentType: mimetype,
      });

      await this.s3Client.send(command);
      const fileUrl = this.getFileUrl(key);

      return { key, url: fileUrl };
    } catch (error) {
      console.error('[BaseFileService] Error uploading file stream to R2:', error);
      throw new InternalServerError('Lỗi khi tải file lên Cloudflare R2: ' + error.message);
    }
  }

  /**
   * Upload tài liệu (PDF, Word, Giấy phép, CV)
   */
  async uploadDocument({
    buffer,
    filePath,
    originalname = 'document.pdf',
    mimetype = 'application/pdf',
    folder = 'documents',
    targetBucket = null,
  }) {
    let fileBuffer = buffer;
    if (!fileBuffer && filePath && fs.existsSync(filePath)) {
      fileBuffer = fs.readFileSync(filePath);
    }

    if (!fileBuffer) {
      throw new BadRequestError('Không có dữ liệu tài liệu để tải lên');
    }

    const bucket = targetBucket || this.privateBucketName || this.bucketName;
    const key = this.generateFileKey(originalname, folder, '.pdf');

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        ContentDisposition: `inline; filename="${encodeURIComponent(originalname)}"`,
      });

      await this.s3Client.send(command);
      const fileUrl = this.getFileUrl(key, bucket);

      return {
        key,
        url: fileUrl,
        size: fileBuffer.length,
      };
    } catch (error) {
      console.error('[BaseFileService] Error uploading document to R2:', error);
      throw new InternalServerError('Lỗi khi tải tài liệu lên Cloudflare R2: ' + error.message);
    }
  }

  /**
   * Dọn dẹp file tạm trên ổ đĩa
   */
  cleanupTempFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`[BaseFileService] Lỗi khi xóa file tạm: ${filePath}`, err);
        }
      });
    }
  }

  /**
   * Trích xuất key R2 từ URL hoặc chuỗi key, chặn path traversal
   */
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

    if (raw.includes('..') || raw.includes('\\')) {
      return null;
    }

    const escapedPrefixes = this.allowedDeletePrefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedPrefixes.join('|')})\\/.+$`);
    const match = raw.match(pattern);
    return match ? match[0] : raw;
  }

  /**
   * Kiểm tra key có nằm trong whitelist prefix được phép xóa hay không
   */
  isAllowedDeleteKey(key) {
    if (!key || typeof key !== 'string') return false;
    if (key.includes('..') || key.includes('\\')) return false;
    const escapedPrefixes = this.allowedDeletePrefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`^(${escapedPrefixes.join('|')})\\/[^/].*`);
    return pattern.test(key);
  }

  /**
   * Lấy URL công khai hoặc qua Gateway của file
   */
  getFileUrl(key, targetBucket = this.bucketName) {
    if (targetBucket === this.bucketName && this.publicUrl && !this.publicUrl.includes('pub-xxxxxx')) {
      const base = this.publicUrl.replace(/\/+$/, '');
      return `${base}/${key}`;
    }

    if (this.gatewayBaseUrl) {
      if (key && (key.startsWith('documents/') || key.startsWith('cvs/'))) {
        return `${this.gatewayBaseUrl}/users/files/${key}`;
      }
      if (key && key.startsWith('images/')) {
        return `${this.gatewayBaseUrl}/users/avatar/${key}`;
      }
    }

    return `https://${targetBucket}.r2.cloudflarestorage.com/${key}`;
  }

  /**
   * Tạo presigned URL truy cập file bảo mật tạm thời
   */
  async getPresignedUrl(key, expiresIn = 3600, targetBucket = null) {
    try {
      const cleanKey = this.extractKey(key);
      const bucket = targetBucket || (/^(documents|licenses)\//.test(cleanKey) ? this.privateBucketName : this.bucketName);
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('[BaseFileService] Error creating presigned URL:', error);
      throw new InternalServerError('Lỗi khi tạo liên kết truy cập file: ' + error.message);
    }
  }

  /**
   * Xóa 1 file trên R2
   */
  async deleteFile(urlOrKey, targetBucket = null) {
    if (!urlOrKey) return;
    const key = this.extractKey(urlOrKey);
    if (!this.isAllowedDeleteKey(key)) {
      console.warn(`[FileService] Từ chối xóa key R2 không nằm trong whitelist prefix: ${urlOrKey}`);
      return;
    }
    const bucket = targetBucket || (/^(documents|licenses)\//.test(key) ? this.privateBucketName : this.bucketName);
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      console.log(`[FileService] Đã xóa file R2 thành công: ${key}`);
    } catch (error) {
      console.error(`[FileService] Lỗi khi xóa file ${key} trên R2:`, error.message);
    }
  }

  /**
   * Xóa nhiều file trên R2 song song
   */
  async deleteFiles(urlsOrKeys = [], targetBucket = null) {
    if (!Array.isArray(urlsOrKeys) || urlsOrKeys.length === 0) return;
    const uniqueTargets = [...new Set(urlsOrKeys.filter(Boolean))];
    await Promise.allSettled(uniqueTargets.map((target) => this.deleteFile(target, targetBucket)));
  }
}

export default BaseFileService;
