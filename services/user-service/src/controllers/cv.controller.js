import cvService from '../services/cv.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class CvController {
  async uploadCv(req, res, next) {
    try {
      const { id, role } = req.user;
      const file = req.file;
      const { name, title } = req.body;

      const newCv = await cvService.uploadCv({
        userId: id,
        role,
        file,
        title: title || name,
      });
      return successResponse(res, 'Tải lên CV thành công', newCv, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyCvs(req, res, next) {
    try {
      const { id, role } = req.user;
      const cvs = await cvService.getMyCvs({ userId: id, role });
      return successResponse(res, 'Lấy danh sách CV thành công', cvs);
    } catch (error) {
      next(error);
    }
  }

  async updateCv(req, res, next) {
    try {
      const { id, role } = req.user;
      const { cvId } = req.params;
      const { name, title } = req.body;

      const updatedCv = await cvService.updateCv({
        userId: id,
        role,
        cvId,
        data: { title: title || name },
      });
      return successResponse(res, 'Cập nhật CV thành công', updatedCv);
    } catch (error) {
      next(error);
    }
  }

  async deleteCv(req, res, next) {
    try {
      const { id, role } = req.user;
      const { cvId } = req.params;

      const result = await cvService.deleteCv({ userId: id, role, cvId });
      return successResponse(res, result.message, { cvId: result.cvId });
    } catch (error) {
      next(error);
    }
  }
}

export default new CvController();
