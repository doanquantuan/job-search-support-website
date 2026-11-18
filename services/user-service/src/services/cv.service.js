import fs from 'fs';
import cvRepository from '../repositories/cv.repository.js';
import fileService from './file.service.js';
import { BadRequestError, NotFoundError } from '#shared/utils/errors.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class CvService {
  async uploadCv({ userId, role, file, title }) {
    if (!file || !file.path) {
      throw new BadRequestError('Vui lòng chọn tập tin CV để tải lên');
    }

    if (role && role !== 'JOB_SEEKER') {
      throw new BadRequestError('Role không hợp lệ');
    }

    const count = await cvRepository.countByUserId(userId);
    if (count >= 5) {
      throw new BadRequestError('Bạn chỉ có thể tải lên tối đa 5 CV');
    }

    let uploadResult;
    try {
      const sanitizedTitle = (title && typeof title === 'string' && title.trim())
        ? title.trim()
        : (file.originalname ? file.originalname.replace(/\.[^/.]+$/, '') : 'CV');

      const fileBuffer = fs.readFileSync(file.path);
      uploadResult = await fileService.uploadCvFile(
        fileBuffer,
        file.mimetype || 'application/pdf',
        userId
      );

      const cv = await cvRepository.create({
        userId,
        title: sanitizedTitle,
        fileUrl: uploadResult.url,
      });

      return cv;
    } catch (error) {
      if (uploadResult && uploadResult.key) {
        await fileService.deleteFile(uploadResult.key);
      }
      throw error;
    } finally {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          // Bỏ qua lỗi xóa file tạm
        }
      }
    }
  }

  async getMyCvs({ userId, role }) {
    if (role && role !== 'JOB_SEEKER') {
      throw new BadRequestError('Role không hợp lệ');
    }
    return cvRepository.findAllByUserId(userId);
  }

  async updateCv({ userId, role, cvId, data = {} }) {
    if (role && role !== 'JOB_SEEKER') {
      throw new BadRequestError('Role không hợp lệ');
    }

    if (!cvId || !UUID_REGEX.test(cvId)) {
      throw new NotFoundError('CV không tồn tại hoặc bạn không có quyền truy cập');
    }

    const cv = await cvRepository.findByIdAndUserId(cvId, userId);
    if (!cv) {
      throw new NotFoundError('CV không tồn tại hoặc bạn không có quyền truy cập');
    }

    const updateData = {};
    const newTitle = data.title !== undefined ? data.title : data.name;

    if (newTitle !== undefined) {
      if (typeof newTitle !== 'string' || !newTitle.trim()) {
        throw new BadRequestError('Tên CV không được để trống');
      }
      updateData.title = newTitle.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return cv;
    }

    return cvRepository.update(cvId, updateData);
  }

  async deleteCv({ userId, role, cvId }) {
    if (role && role !== 'JOB_SEEKER') {
      throw new BadRequestError('Role không hợp lệ');
    }

    if (!cvId || !UUID_REGEX.test(cvId)) {
      throw new NotFoundError('CV không tồn tại hoặc bạn không có quyền truy cập');
    }

    const cv = await cvRepository.findByIdAndUserId(cvId, userId);
    if (!cv) {
      throw new NotFoundError('CV không tồn tại hoặc bạn không có quyền truy cập');
    }

    await cvRepository.delete(cvId);

    const fileTarget = cv.fileUrl;
    if (fileTarget) {
      fileService.deleteFile(fileTarget).catch((err) => {
        console.warn(`[CvService] Lỗi khi xóa file CV trên R2 (${fileTarget}):`, err.message);
      });
    }

    return { message: 'Xóa CV thành công', cvId };
  }
}

export default new CvService();
