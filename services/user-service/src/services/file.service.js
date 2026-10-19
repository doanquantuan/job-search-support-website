const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, bucketName, publicUrl } = require('../config/r2.config');
const { BadRequestError, InternalServerError } = require('../utils/errors.util');

class FileService {
  /**
   * Tối ưu hóa, resize và nén ảnh đại diện sang định dạng WebP hiện đại
   * @param {string} inputPath - Đường dẫn file gốc trên đĩa tạm
   * @param {Object} [options] - Cấu hình crop/resize
   * @param {number} [options.width=400] - Chiều rộng chuẩn avatar
   * @param {number} [options.height=400] - Chiều cao chuẩn avatar
   * @param {number} [options.quality=80] - Chất lượng nén WebP (1-100)
   * @returns {Promise<{ buffer: Buffer, mimetype: string, extension: string, size: number, originalSize: number }>}
   */
  async processAvatarImage(inputPath, options = {}) {
    if (!inputPath || !fs.existsSync(inputPath)) {
      throw new BadRequestError('File nguồn không tồn tại');
    }

    const { width = 400, height = 400, quality = 80 } = options;
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;

    try {
      // 1. Tự động xoay ảnh theo EXIF orientation (.rotate())
      // 2. Cắt và resize vuông thông minh theo trọng tâm khuôn mặt/chủ thể (.resize với fit: cover)
      // 3. Nén sang WebP để giảm dung lượng từ 60-80% mà chất lượng hiển thị vẫn sắc nét
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
   * Upload buffer ảnh đã xử lý lên Cloudflare R2
   * @param {Buffer} buffer - Dữ liệu ảnh
   * @param {string} [extension='.webp'] - Đuôi file
   * @param {string} [mimetype='image/webp'] - MIME type
   * @param {string} [subfolder='avatars'] - Thư mục con dưới images/
   * @returns {Promise<{ key: string, url: string }>}
   */
  async uploadProcessedImage(buffer, extension = '.webp', mimetype = 'image/webp', subfolder = 'avatars') {
    if (!buffer) {
      throw new BadRequestError('Không có dữ liệu ảnh để tải lên');
    }

    const randomHex = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomHex}${extension}`;

    const prefix = subfolder ? `images/${subfolder.replace(/^\/+|\/+$/g, '')}` : 'images';
    const key = `${prefix}/${fileName}`;

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
   * Upload file từ đường dẫn đĩa (temp path) lên R2 qua stream (dùng khi không nén)
   */
  async uploadFileFromDisk(filePath, originalname = 'image.jpg', mimetype = 'image/jpeg', subfolder = '') {
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
   * Trích xuất key R2 từ URL hoặc key
   */
  extractKey(urlOrKey) {
    if (!urlOrKey) return null;
    const match = urlOrKey.match(/images\/.+$/);
    return match ? match[0] : urlOrKey;
  }

  /**
   * Lấy URL công khai
   */
  getFileUrl(key) {
    if (publicUrl) {
      const base = publicUrl.replace(/\/+$/, '');
      return `${base}/${key}`;
    }
    return `https://${bucketName}.r2.cloudflarestorage.com/${key}`;
  }

  /**
   * Tạo Presigned URL
   */
  async getPresignedUrl(key, expiresIn = 3600) {
    try {
      const cleanKey = this.extractKey(key);
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
      });
      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error creating presigned URL:', error);
      throw new InternalServerError('Lỗi khi tạo liên kết truy cập file: ' + error.message);
    }
  }

  /**
   * Xóa file trên R2
   */
  async deleteFile(urlOrKey) {
    if (!urlOrKey) return;
    const key = this.extractKey(urlOrKey);
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      await s3Client.send(command);
      console.log(`[FileService] Đã xóa file R2 thành công: ${key}`);
    } catch (error) {
      console.error(`[FileService] Lỗi khi xóa file ${key} trên R2:`, error.message);
    }
  }
}

module.exports = new FileService();
