const careerPreferenceService = require('../services/careerPreference.service');
const { successResponse } = require('../utils/response.util');

class CareerPreferenceController {
    async getCareerPreference(req, res, next) {
        try {
            const { id } = req.user;
            const careerPreference = await careerPreferenceService.getCareerPreference(id);
            return successResponse(res, 'Lấy thông tin sở thích nghề nghiệp thành công', careerPreference);
        } catch (error) {
            next(error);
        }
    }

    async createCareerPreference(req, res, next) {
        try {
            const { id } = req.user;
            const data = req.body;
            const newCareerPreference = await careerPreferenceService.createCareerPreference(id, data);
            return successResponse(res, 'Tạo thông tin sở thích nghề nghiệp thành công', newCareerPreference);
        } catch (error) {
            next(error);
        }
    }

    async updateCareerPreference(req, res, next) {
        try {
            const { id } = req.user;
            const data = req.body;
            const updatedCareerPreference = await careerPreferenceService.updateCareerPreference(id, data);
            return successResponse(res, 'Cập nhật thông tin sở thích nghề nghiệp thành công', updatedCareerPreference);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CareerPreferenceController();
