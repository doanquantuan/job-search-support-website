const educationService = require('../services/education.service');
const { successResponse } = require('../utils/response.util');

class EducationController {
    async getEducation(req, res, next) {
        try {
            const { educationId } = req.params;
            const education = await educationService.getEducation(educationId);
            return successResponse(res, 'Lấy thông tin học vấn thành công', education);
        } catch (error) {
            next(error);
        }
    }

    async getAllEducations(req, res, next) {
        try {
            const { userId } = req.user;
            const educations = await educationService.getAllEducations(userId);
            return successResponse(res, 'Lấy danh sách học vấn thành công', educations);
        } catch (error) {
            next(error);
        }
    }

    async addEducation(req, res, next) {
        try {
            const { id: userId } = req.user;
            const data = req.body;
            const newEducation = await educationService.addEducation(userId, data);
            return successResponse(res, 'Thêm thông tin học vấn thành công', newEducation);
        } catch (error) {
            next(error);
        }
    }

    async updateEducation(req, res, next) {
        try {
            const { educationId } = req.params;
            const data = req.body;
            const updatedEducation = await educationService.updateEducation(educationId, data);
            return successResponse(res, 'Cập nhật thông tin học vấn thành công', updatedEducation);
        } catch (error) {
            next(error);
        }
    }

    async deleteEducation(req, res, next) {
        try {
            const { educationId } = req.params;
            await educationService.deleteEducation(educationId);
            return successResponse(res, 'Xóa thông tin học vấn thành công');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EducationController();
