const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, bucketName, publicUrl } = require('../config/r2.config');
const { BadRequestError, InternalServerError } = require('../utils/errors.util');

class FileService {

  async processAvatarImage(inputPath, options = {}) {
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

  extractKey(urlOrKey) {
    if (!urlOrKey) return null;
    const match = urlOrKey.match(/images\/.+$/);
    return match ? match[0] : urlOrKey;
  }

  getFileUrl(key) {
    if (publicUrl) {
      const base = publicUrl.replace(/\/+$/, '');
      return `${base}/${key}`;
    }
    return `https://${bucketName}.r2.cloudflarestorage.com/${key}`;
  }

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
