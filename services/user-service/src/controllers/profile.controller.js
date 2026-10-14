const profileService = require('../services/profile.service');
const { successResponse } = require('../utils/response.util');

class ProfileController {
  async getInfo(req, res, next) {
    try {
      const { id, role } = req.user;
      const profile = await profileService.getInfo({ userId: id, role });
      return successResponse(res, 'Lấy thông tin profile thành công', profile);
    } catch (error) {
      next(error);
    }
  }

  async updateInfo(req, res, next) {
    try {
      const { id, role } = req.user;
      const data = req.body;
      const updatedProfile = await profileService.updateInfo({ userId: id, role, data });
      return successResponse(res, 'Cập nhật thông tin profile thành công', updatedProfile);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
