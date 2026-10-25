const cvService = require('../services/cv.service');
const { successResponse } = require('../utils/response.util');

class CVController {
  /**
   * Tạo CV mới (Tải lên file hoặc tạo trực tuyến)
   */
  async createCV(req, res, next) {
    try {
      const jobSeekerId = req.user.userId;
      const cv = await cvService.createCV(jobSeekerId, req.body);
      return successResponse(res, 'Tạo CV thành công', cv, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách CV của ứng viên hiện tại
   */
  async getMyCVs(req, res, next) {
    try {
      const jobSeekerId = req.user.userId;
      const cvs = await cvService.getMyCVs(jobSeekerId);
      return successResponse(res, 'Lấy danh sách CV thành công', cvs, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xem chi tiết 1 CV
   */
  async getCVDetail(req, res, next) {
    try {
      const { id } = req.params;
      const cv = await cvService.getCVDetail(id, req.user.userId);
      return successResponse(res, 'Lấy chi tiết CV thành công', cv, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa CV
   */
  async deleteCV(req, res, next) {
    try {
      const { id } = req.params;
      const result = await cvService.deleteCV(id, req.user.userId);
      return successResponse(res, result.message, null, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách các mẫu template CV có sẵn
   */
  async getTemplates(req, res, next) {
    try {
      const templates = await cvService.getTemplates();
      return successResponse(res, 'Lấy danh sách mẫu CV thành công', templates, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CVController();

