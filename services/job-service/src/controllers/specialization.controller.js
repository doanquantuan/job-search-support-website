import specializationService from '../services/specialization.service.js';
import { successResponse } from '#shares/utils/response.util.js';
class SpecializationController {
    async getAllSpecializations(req, res, next) {
    try {
      const { occupationId } = req.query;
      const specializations = await specializationService.getAllSpecializations(occupationId);
      return successResponse(res, 'Lấy danh sách chuyên ngành thành công', specializations);
    } catch (error) {
      next(error);
    }
  }

  async getSpecializationById(req, res, next) {
    try {
      const { specializationId } = req.params;
      const specialization = await specializationService.getSpecializationById(specializationId);
      return successResponse(res, 'Lấy thông tin chuyên ngành thành công', specialization);
    } catch (error) {
      next(error);
    }
  }

  async createSpecialization(req, res, next) {
    try {
      const { occupationId, specializationName } = req.body;
      const newSpecialization = await specializationService.createSpecialization(occupationId, specializationName);
      return successResponse(res, 'Tạo chuyên ngành thành công', newSpecialization, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSpecialization(req, res, next) {
    try {
      const { specializationId } = req.params;
      const { occupationId, specializationName } = req.body;
      const updatedSpecialization = await specializationService.updateSpecialization(specializationId, {
        occupationId,
        specializationName,
      });
      return successResponse(res, 'Cập nhật chuyên ngành thành công', updatedSpecialization);
    } catch (error) {
      next(error);
    }
  }

  async deleteSpecialization(req, res, next) {
    try {
      const { specializationId } = req.params;
      await specializationService.deleteSpecialization(specializationId);
      return successResponse(res, 'Xóa chuyên ngành thành công', null);
    } catch (error) {
      next(error);
    }
  }
}

export default new SpecializationController();
