const userRepository = require('../repositories/user.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors.util');

class UserService {
  async getProfile({ userId, role }) {
    if (!userId) {
      throw new BadRequestError('UserId không hợp lệ');
    }

    const normalizedRole = role ? role.toUpperCase() : null;

    if (normalizedRole === 'RECRUITER') {
      const recruiterData = await userRepository.findRecruiterByUserId(userId);
      if (!recruiterData) {
        throw new NotFoundError('Không tìm thấy thông tin nhà tuyển dụng');
      }
      return {
        role: 'RECRUITER',
        ...recruiterData,
      };
    }

    if (normalizedRole === 'ADMIN') {
      const adminData = await userRepository.findAdminByUserId(userId);
      if (!adminData) {
        throw new NotFoundError('Không tìm thấy thông tin quản trị viên');
      }
      return {
        role: 'ADMIN',
        ...adminData,
      };
    }

    // Mặc định hoặc role JOB_SEEKER
    const seekerData = await userRepository.findJobSeekerByUserId(userId);
    if (seekerData) {
      return {
        role: 'JOB_SEEKER',
        ...seekerData,
      };
    }

    // Kiểm tra trực tiếp bảng profile nếu jobSeeker chưa liên kết
    const profileData = await userRepository.findProfileByUserId(userId);
    if (profileData) {
      return {
        role: 'JOB_SEEKER',
        userId,
        profile: profileData,
      };
    }

    // Trường hợp token không gửi kèm role hoặc role khác, thử tìm trong recruiter/admin
    const recruiterData = await userRepository.findRecruiterByUserId(userId);
    if (recruiterData) {
      return {
        role: 'RECRUITER',
        ...recruiterData,
      };
    }

    const adminData = await userRepository.findAdminByUserId(userId);
    if (adminData) {
      return {
        role: 'ADMIN',
        ...adminData,
      };
    }

    throw new NotFoundError('Không tìm thấy thông tin hồ sơ người dùng');
  }
}

module.exports = new UserService();
