const userService = require('../services/user.service');
const { successResponse } = require('../utils/response.util');

class UserController {
  async getProfile(req, res, next) {
    try {
      const { userId, role } = req.user;
      const profile = await userService.getProfile({ userId, role });

      return successResponse(res, 'Lấy thông tin profile thành công', profile);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

