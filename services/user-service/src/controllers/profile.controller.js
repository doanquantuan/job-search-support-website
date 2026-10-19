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

  async uploadAvatar(req, res, next) {
    try {
      const { id, role } = req.user;
      const result = await profileService.uploadAvatar({
        userId: id,
        role,
        file: req.file,
      });
      return successResponse(res, 'Yêu cầu tải lên avatar đang được xử lý', result);
    } catch (error) {
      next(error);
    }
  }

  async getAvatarStatus(req, res, next) {
    try {
      const { id } = req.user;
      const { jobId } = req.params;
      const status = await profileService.getAvatarUploadStatus({
        userId: id,
        jobId,
      });
      return successResponse(res, 'Lấy trạng thái xử lý upload avatar thành công', status);
    } catch (error) {
      next(error);
    }
  }

  async getAvatarStatus(req, res, next) {
    try {
      const { id } = req.user;
      const { jobId } = req.params;
      const status = await profileService.getAvatarUploadStatus({
        userId: id,
        jobId,
      });
      return successResponse(res, 'Lấy trạng thái xử lý upload avatar thành công', status);
    } catch (error) {
      next(error);
    }
  }

  async deleteAvatar(req, res, next) {
    try {
      const { id, role } = req.user;
      const result = await profileService.deleteAvatar({
        userId: id,
        role,
      });
      return successResponse(res, 'Xóa avatar thành công', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();

