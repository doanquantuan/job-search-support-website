const skillService = require('../services/skill.service');
const { successResponse } = require('../utils/response.util');

class SkillController {
    async getSkills(req, res, next) {
        try {
            const { id: userId } = req.user;
            const skills = await skillService.getSkillsByUserId(userId);
            return successResponse(res, 'Lấy danh sách kỹ năng thành công', skills);
        } catch (error) {
            next(error);
        }
    }

    async updateSkills(req, res, next) {
        try {
            const { id: userId } = req.user;
            const { skills } = req.body;
            const updatedSkills = await skillService.updateSkillsByUserId(userId, skills);
            return successResponse(res, 'Cập nhật danh sách kỹ năng thành công', updatedSkills);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SkillController();
