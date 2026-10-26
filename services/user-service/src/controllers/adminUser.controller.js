import adminUserService from '../services/adminUser.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class AdminUserController {
  /**
   * GET /api/v1/admin/users
   * Lấy danh sách người dùng có phân trang, tìm kiếm và lọc
   */
  async getUsers(req, res, next) {
    try {
      const result = await adminUserService.getUsersList(req.query);
      return successResponse(res, 'Lấy danh sách người dùng thành công', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/users/:id
   * Xem chi tiết người dùng
   */
  async getUserDetail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await adminUserService.getUserDetail(id);
      return successResponse(res, 'Lấy chi tiết người dùng thành công', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
   * Khóa hoặc mở khóa tài khoản kèm lý do
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const currentAdminId = req.user?.id || req.user?.userId;

      const result = await adminUserService.changeUserStatus(currentAdminId, id, {
        status,
        reason,
      });

      return successResponse(res, result.message, result.user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/verify
   * Cập nhật trạng thái xác minh tài khoản hoặc doanh nghiệp
   */
  async updateUserVerification(req, res, next) {
    try {
      const { id } = req.params;
      const { type, isVerified } = req.body;

      const result = await adminUserService.changeVerificationStatus(id, {
        type,
        isVerified,
      });

      return successResponse(res, result.message, result.user || result.recruiter);
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminUserController();

