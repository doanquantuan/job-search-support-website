const userRepository = require('../repositories/user.repository');
const { JobSeeker, Recruiter, Admin, Profile } = require('../domain/entities');
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
      const recruiter = new Recruiter(recruiterData);
      return {
        role: 'RECRUITER',
        ...recruiter.toResponseFormat(),
      };
    }

    if (normalizedRole === 'ADMIN') {
      const adminData = await userRepository.findAdminByUserId(userId);
      if (!adminData) {
        throw new NotFoundError('Không tìm thấy thông tin quản trị viên');
      }
      const admin = new Admin(adminData);
      return {
        role: 'ADMIN',
        ...admin.toResponseFormat(),
      };
    }

    // Mặc định hoặc role JOB_SEEKER
    const seekerData = await userRepository.findJobSeekerByUserId(userId);

    if (seekerData) {
      const profileEntity = seekerData.profile ? new Profile(seekerData.profile) : null;
      const jobSeeker = new JobSeeker({
        ...seekerData,
        profile: profileEntity,
      });

      const formattedSeeker = jobSeeker.toResponseFormat();
      return {
        role: 'JOB_SEEKER',
        ...formattedSeeker,
      };
    }

    // Kiểm tra trực tiếp bảng profile nếu jobSeeker chưa liên kết
    const profileData = await userRepository.findProfileByUserId(userId);
    if (profileData) {
      const profileEntity = new Profile(profileData);
      return {
        role: 'JOB_SEEKER',
        userId,
        profile: profileEntity.toResponseFormat(),
      };
    }

    // Trường hợp token không gửi kèm role hoặc role khác, thử tìm trong recruiter/admin
    const recruiterData = await userRepository.findRecruiterByUserId(userId);
    if (recruiterData) {
      const recruiter = new Recruiter(recruiterData);
      return {
        role: 'RECRUITER',
        ...recruiter.toResponseFormat(),
      };
    }

    const adminData = await userRepository.findAdminByUserId(userId);
    if (adminData) {
      const admin = new Admin(adminData);
      return {
        role: 'ADMIN',
        ...admin.toResponseFormat(),
      };
    }

    throw new NotFoundError('Không tìm thấy thông tin hồ sơ người dùng');
  }
}

module.exports = new UserService();
