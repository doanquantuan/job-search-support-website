import userRepository from '../repositories/user.repository.js';
import fileService from './file.service.js';
import { NotFoundError, BadRequestError } from '#shared/utils/errors.util.js';

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
      if (recruiterData.user?.avatar) {
        recruiterData.user.avatar = fileService.normalizeUrl(recruiterData.user.avatar);
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
      if (adminData.user?.avatar) {
        adminData.user.avatar = fileService.normalizeUrl(adminData.user.avatar);
      }
      return {
        role: 'ADMIN',
        ...adminData,
      };
    }

    // Mặc định hoặc role JOB_SEEKER
    const seekerData = await userRepository.findJobSeekerByUserId(userId);
    if (seekerData) {
      if (seekerData.user?.avatar) {
        seekerData.user.avatar = fileService.normalizeUrl(seekerData.user.avatar);
      }
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
      if (recruiterData.user?.avatar) {
        recruiterData.user.avatar = fileService.normalizeUrl(recruiterData.user.avatar);
      }
      return {
        role: 'RECRUITER',
        ...recruiterData,
      };
    }

    const adminData = await userRepository.findAdminByUserId(userId);
    if (adminData) {
      if (adminData.user?.avatar) {
        adminData.user.avatar = fileService.normalizeUrl(adminData.user.avatar);
      }
      return {
        role: 'ADMIN',
        ...adminData,
      };
    }

    throw new NotFoundError('Không tìm thấy thông tin hồ sơ người dùng');
  }
}

export default new UserService();
