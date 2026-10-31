import fs from 'fs';
import cvRepository from '../repositories/cv.repository.js';
import fileService from './file.service.js';
import { BadRequestError, NotFoundError } from '#shared/utils/errors.util.js';

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

    try {
      // 1. Upload tài liệu lên Cloudflare R2 từ file tạm trên đĩa
      const uploadResult = await fileService.uploadDocument({
        filePath: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
        subfolder: 'cvs',
      });

      const cvTitle =
        title && typeof title === 'string' && title.trim()
          ? title.trim()
          : file.originalname;

      // 2. Lưu thông tin CV vào database
      try {
        const newCv = await cvRepository.create({
          userId,
          title: cvTitle,
          fileUrl: uploadResult.url
        });

        return newCv;
      } catch (dbError) {
        // Rollback file trên Cloudflare R2 nếu lưu DB thất bại
        await fileService.deleteFile(uploadResult.key);
        throw dbError;
      }
    } finally {
      // 3. Dọn dẹp file tạm trên disk giống như cấu trúc upload avatar (image)
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.warn(`[CvService] Lỗi khi dọn dẹp file tạm (${file.path}):`, err.message);
        }
      }
    }
  }

  /**
   * Retrieve all CVs of the job seeker
   * @param {Object} params
   * @param {string} params.userId - Job Seeker ID
   * @param {string} [params.role]
   */
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
