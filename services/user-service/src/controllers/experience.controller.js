const experienceService = require('../services/experience.service');
const { successResponse } = require('../utils/response.util');

class ExperienceController {
    async getExperience(req, res, next) {
        try {
            const { experienceId } = req.params;
            const experience = await experienceService.getExperience(experienceId);
            return successResponse(res, 'Lấy thông tin kinh nghiệm thành công', experience);
        } catch (error) {
            next(error);
        }
    }

    async getAllExperiences(req, res, next) {
        try {
            const { userId } = req.user;
            const experiences = await experienceService.getAllExperiences(userId);
            return successResponse(res, 'Lấy danh sách kinh nghiệm thành công', experiences);
        } catch (error) {
            next(error);
        }
    }

    async addExperience(req, res, next) {
        try {
            const { id: userId } = req.user;
            const data = req.body;
            const newExperience = await experienceService.addExperience(userId, data);
            return successResponse(res, 'Thêm thông tin kinh nghiệm thành công', newExperience);
        } catch (error) {
            next(error);
        }
    }

    async updateExperience(req, res, next) {
        try {
            const { experienceId } = req.params;
            const data = req.body;
            const updatedExperience = await experienceService.updateExperience(experienceId, data);
            return successResponse(res, 'Cập nhật thông tin kinh nghiệm thành công', updatedExperience);
        } catch (error) {
            next(error);
        }
    }

    async deleteExperience(req, res, next) {
        try {
            const { experienceId } = req.params;
            await experienceService.deleteExperience(experienceId);
            return successResponse(res, 'Xóa thông tin kinh nghiệm thành công');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ExperienceController();
