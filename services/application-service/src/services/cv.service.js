const cvRepository = require('../repositories/cv.repository');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors.util');

class CVService {
  async createCV(jobSeekerId, { title, type = 'UPLOADED', content, fileUrl, templateId }) {
    if (!jobSeekerId) {
      throw new BadRequestError('ID ứng viên không hợp lệ');
    }

    if (!title || !title.trim()) {
      throw new BadRequestError('Tiêu đề CV không được để trống');
    }

    if (!['UPLOADED', 'BUILT'].includes(type)) {
      throw new BadRequestError('Loại CV không hợp lệ (chỉ hỗ trợ UPLOADED hoặc BUILT)');
    }

    if (type === 'UPLOADED' && !fileUrl) {
      throw new BadRequestError('Vui lòng đính kèm đường dẫn tệp CV');
    }

    if (type === 'BUILT' && !content) {
      throw new BadRequestError('Nội dung CV tạo trực tuyến không được để trống');
    }

    return cvRepository.createCV({
      jobSeekerId,
      title: title.trim(),
      type,
      content: content || null,
      fileUrl: fileUrl || null,
      templateId: templateId || null,
    });
  }

  async getMyCVs(jobSeekerId) {
    if (!jobSeekerId) {
      throw new BadRequestError('ID ứng viên không hợp lệ');
    }
    return cvRepository.findCVsByJobSeekerId(jobSeekerId);
  }

  async getCVDetail(cvId, currentUserId) {
    if (!cvId) {
      throw new BadRequestError('ID CV không hợp lệ');
    }

    const cv = await cvRepository.findCVById(cvId);
    if (!cv) {
      throw new NotFoundError('Không tìm thấy thông tin CV');
    }

    return cv;
  }

  async deleteCV(cvId, currentUserId) {
    const cv = await this.getCVDetail(cvId, currentUserId);
    if (cv.jobSeekerId !== currentUserId) {
      throw new ForbiddenError('Bạn không có quyền xóa CV này');
    }

    await cvRepository.deleteCV(cvId);
    return { message: 'Đã xóa CV thành công' };
  }

  async getTemplates() {
    return cvRepository.findAllTemplates();
  }
}

module.exports = new CVService();

