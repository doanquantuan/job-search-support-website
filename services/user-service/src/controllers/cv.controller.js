const cvService = require('../services/cv.service');
const { successResponse } = require('../utils/response.util');

class CvController {
  async uploadCv(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const file = req.file;
      const { name, title } = req.body;

      const newCv = await cvService.uploadCv(userId, file, title || name);
      return successResponse(res, 'Tải lên CV thành công', newCv, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyCvs(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const cvs = await cvService.getMyCvs(userId);
      return successResponse(res, 'Lấy danh sách CV thành công', cvs);
    } catch (error) {
      next(error);
    }
  }

  async updateCv(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const { cvId } = req.params;
      const { name, title } = req.body;

      const updatedCv = await cvService.updateCv(userId, cvId, { title: title || name });
      return successResponse(res, 'Cập nhật CV thành công', updatedCv);
    } catch (error) {
      next(error);
    }
  }

  async deleteCv(req, res, next) {
    try {
      const userId = req.user.id || req.user.userId;
      const { cvId } = req.params;

      const result = await cvService.deleteCv(userId, cvId);
      return successResponse(res, result.message, { cvId: result.cvId });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CvController();
