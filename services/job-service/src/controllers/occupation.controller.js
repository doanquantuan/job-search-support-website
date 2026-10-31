import occupationService from '../services/occupation.service.js';
import { successResponse } from '#shares/utils/response.util.js';

class OccupationController {
  async getAllOccupations(req, res, next) {
    try {
      const occupations = await occupationService.getAllOccupations();
      return successResponse(res, 'Lấy danh sách ngành nghề thành công', occupations);
    } catch (error) {
      next(error);
    }
  }

  async getOccupationById(req, res, next) {
    try {
      const { occupationId } = req.params;
      const occupation = await occupationService.getOccupationById(occupationId);
      return successResponse(res, 'Lấy thông tin ngành nghề thành công', occupation);
    } catch (error) {
      next(error);
    }
  }

  async createOccupation(req, res, next) {
    try {
      const { occupationName } = req.body;
      const newOccupation = await occupationService.createOccupation(occupationName);
      return successResponse(res, 'Tạo ngành nghề thành công', newOccupation, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateOccupation(req, res, next) {
    try {
      const { occupationId } = req.params;
      const { occupationName } = req.body;
      const updatedOccupation = await occupationService.updateOccupation(occupationId, occupationName);
      return successResponse(res, 'Cập nhật ngành nghề thành công', updatedOccupation);
    } catch (error) {
      next(error);
    }
  }

  async deleteOccupation(req, res, next) {
    try {
      const { occupationId } = req.params;
      await occupationService.deleteOccupation(occupationId);
      return successResponse(res, 'Xóa ngành nghề thành công', null);
    } catch (error) {
      next(error);
    }
  }
}

export default new OccupationController();

