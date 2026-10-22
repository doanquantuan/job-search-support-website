import occupationService from '../services/occupation.service.js';
import { successResponse } from '#shares/utils/response.util.js';

class OccupationController {
  // --- OCCUPATION CONTROLLER ---
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

  // --- SPECIALIZATION CONTROLLER ---
  async getAllSpecializations(req, res, next) {
    try {
      const { occupationId } = req.query;
      const specializations = await occupationService.getAllSpecializations(occupationId);
      return successResponse(res, 'Lấy danh sách chuyên ngành thành công', specializations);
    } catch (error) {
      next(error);
    }
  }

  async getSpecializationById(req, res, next) {
    try {
      const { specializationId } = req.params;
      const specialization = await occupationService.getSpecializationById(specializationId);
      return successResponse(res, 'Lấy thông tin chuyên ngành thành công', specialization);
    } catch (error) {
      next(error);
    }
  }

  async createSpecialization(req, res, next) {
    try {
      const { occupationId, specializationName } = req.body;
      const newSpecialization = await occupationService.createSpecialization(occupationId, specializationName);
      return successResponse(res, 'Tạo chuyên ngành thành công', newSpecialization, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSpecialization(req, res, next) {
    try {
      const { specializationId } = req.params;
      const { occupationId, specializationName } = req.body;
      const updatedSpecialization = await occupationService.updateSpecialization(specializationId, {
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
      await occupationService.deleteSpecialization(specializationId);
      return successResponse(res, 'Xóa chuyên ngành thành công', null);
    } catch (error) {
      next(error);
    }
  }
}

export default new OccupationController();

