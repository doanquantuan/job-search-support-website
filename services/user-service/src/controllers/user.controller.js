import { GetObjectCommand } from '@aws-sdk/client-s3';
import userService from '../services/user.service.js';
import fileService from '../services/file.service.js';
import { s3Client, bucketName } from '../config/r2.config.js';
import { successResponse } from '#shared/utils/response.util.js';

class UserController {
  async getProfile(req, res, next) {
    try {
      const { userId, role } = req.user;
      const profile = await userService.getProfile({ userId, role });

      return successResponse(res, 'Lấy thông tin profile thành công', profile);
    } catch (error) {
      next(error);
    }
  }

  async getAvatarFile(req, res) {
    try {
      const paramKey = req.params.key || req.params[0];
      const rawKey = Array.isArray(paramKey) ? paramKey.join('/') : (paramKey || '');
      if (!rawKey) {
        return res.status(404).send('Image key is missing');
      }
      const cleanKey = fileService.extractKey(rawKey);
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: cleanKey,
      });
      const s3Res = await s3Client.send(command);
      res.setHeader('Content-Type', s3Res.ContentType || 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      if (s3Res.ContentLength) {
        res.setHeader('Content-Length', s3Res.ContentLength);
      }
      s3Res.Body.pipe(res);
    } catch (err) {
      console.warn('[Avatar Proxy] Không tìm thấy ảnh hoặc lỗi R2:', err.message);
      return res.status(404).send('Image not found');
    }
  }
}

export default new UserController();


