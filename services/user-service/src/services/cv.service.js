import fs from 'fs';
import cvRepository from '../repositories/cv.repository.js';
import fileService from './file.service.js';
import { BadRequestError, NotFoundError } from '../utils/errors.util.js';

class CvService {
  async uploadCv(userId, file, customTitle) {
    if (!file) {
      throw new BadRequestError('Vui lòng chọn tập tin CV để tải lên');
    }

    const count = await cvRepository.countByUserId(userId);
    if (count >= 5) {
      this._cleanupTempFile(file);
      throw new BadRequestError('Bạn chỉ có thể tải lên tối đa 5 CV');
    }

    let uploadResult;
    try {
      uploadResult = await fileService.uploadDocument({
        buffer: file.buffer,
        filePath: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
        subfolder: 'cvs',
      });
    } catch (uploadError) {
      this._cleanupTempFile(file);
      throw uploadError;
    } finally {
      this._cleanupTempFile(file);
    }

    const cvTitle = (customTitle && typeof customTitle === 'string' && customTitle.trim())
      ? customTitle.trim()
      : file.originalname;

    try {
      const newCv = await cvRepository.create({
        userId,
        title: cvTitle,
        type: 'UPLOADED',
        fileUrl: uploadResult.url,
        content: {
          originalName: file.originalname,
          fileSize: file.size || uploadResult.size || 0,
          fileType: file.mimetype,
          fileKey: uploadResult.key,
        },
      });

      return newCv;
    } catch (dbError) {
      // Rollback R2 upload if saving metadata fails
      await fileService.deleteFile(uploadResult.key);
      throw dbError;
    }
  }

  /**
   * Retrieve all CVs of the job seeker
   * @param {string} userId - Job Seeker ID
   */
  async getMyCvs(userId) {
    return cvRepository.findAllByUserId(userId);
  }

  async updateCv(userId, cvId, data = {}) {
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

  async deleteCv(userId, cvId) {
    const cv = await cvRepository.findByIdAndUserId(cvId, userId);
    if (!cv) {
      throw new NotFoundError('CV không tồn tại hoặc bạn không có quyền truy cập');
    }

    await cvRepository.delete(cvId);

    const fileTarget = (cv.content && cv.content.fileKey) || cv.fileUrl;
    if (fileTarget) {
      await fileService.deleteFile(fileTarget);
    }

    return { message: 'Xóa CV thành công', cvId };
  }

  _cleanupTempFile(file) {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('[CvService] Không thể xóa file tạm:', err.message);
      }
    }
  }
}

export default new CvService();
