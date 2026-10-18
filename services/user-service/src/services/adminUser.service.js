const adminUserRepository = require('../repositories/adminUser.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors.util');

class AdminUserService {
  /**
   * Lấy danh sách người dùng có phân trang, tìm kiếm và lọc
   */
  async getUsersList(query) {
    return adminUserRepository.findAllUsers(query);
  }

  /**
   * Xem chi tiết người dùng
   */
  async getUserDetail(id) {
    if (!id) {
      throw new BadRequestError('ID người dùng không được để trống');
    }

    const user = await adminUserRepository.findUserDetailById(id);
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    return user;
  }

  /**
   * Khóa hoặc mở khóa tài khoản người dùng kèm lý do
   */
  async changeUserStatus(currentAdminId, targetUserId, { status, reason }) {
    if (!targetUserId) {
      throw new BadRequestError('ID người dùng không được để trống');
    }

    if (!['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(status)) {
      throw new BadRequestError('Trạng thái tài khoản không hợp lệ (ACTIVE, INACTIVE, BLOCKED)');
    }

    if (currentAdminId && currentAdminId === targetUserId && status === 'BLOCKED') {
      throw new BadRequestError('Bạn không thể tự khóa tài khoản quản trị viên của chính mình');
    }

    const existingUser = await adminUserRepository.findUserDetailById(targetUserId);
    if (!existingUser) {
      throw new NotFoundError('Không tìm thấy người dùng cần cập nhật');
    }

    if (status === 'BLOCKED' && (!reason || !reason.trim())) {
      throw new BadRequestError('Vui lòng cung cấp lý do khi khóa tài khoản');
    }

    const updateData = {
      status,
      blockReason: status === 'BLOCKED' ? reason.trim() : null,
      blockedAt: status === 'BLOCKED' ? new Date() : null,
    };

    const updatedUser = await adminUserRepository.updateUserStatus(targetUserId, updateData);

    return {
      message: status === 'BLOCKED' ? 'Đã khóa tài khoản thành công' : 'Đã mở khóa tài khoản thành công',
      user: updatedUser,
    };
  }

  /**
   * Cập nhật trạng thái xác minh tài khoản hoặc doanh nghiệp
   */
  async changeVerificationStatus(userId, { type = 'ACCOUNT', isVerified }) {
    if (!userId) {
      throw new BadRequestError('ID người dùng không được để trống');
    }

    if (typeof isVerified !== 'boolean') {
      throw new BadRequestError('Trạng thái xác minh (isVerified) phải là true hoặc false');
    }

    const existingUser = await adminUserRepository.findUserDetailById(userId);
    if (!existingUser) {
      throw new NotFoundError('Không tìm thấy người dùng');
    }

    if (type === 'RECRUITER_COMPANY') {
      if (!existingUser.recruiter) {
        throw new BadRequestError('Người dùng này không phải là nhà tuyển dụng');
      }

      const updatedRecruiter = await adminUserRepository.updateRecruiterVerification(userId, isVerified);
      return {
        message: isVerified ? 'Đã xác minh doanh nghiệp thành công' : 'Đã hủy xác minh doanh nghiệp',
        recruiter: updatedRecruiter,
      };
    }

    const updatedUser = await adminUserRepository.updateUserVerification(userId, isVerified);
    return {
      message: isVerified ? 'Đã xác minh tài khoản thành công' : 'Đã hủy xác minh tài khoản',
      user: updatedUser,
    };
  }
}

module.exports = new AdminUserService();

