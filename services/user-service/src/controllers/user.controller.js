import userService from '../services/user.service.js';
import { successResponse } from '#shared/utils/response.util.js';

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

export default new UserController();

