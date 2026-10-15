const userRepository = require('../repositories/user.repository');
const jobSeekerRepository = require('../repositories/jobSeeker.repository');
const profileRepository = require('../repositories/profile.repository');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors.util');

class ProfileService {
  async getInfo({ userId, role }) {
    if (role === 'JOB_SEEKER') {
        const profile = await profileRepository.getInfo({ userId });
        if (!profile) {
            return null;
        }

        return {
            id: profile.userId,
            fullName: profile.fullName,
            avatar: profile.avatar,
            contactEmail: profile.contactEmail,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth,
            gender: profile.gender,
            address: profile.address,
            githubUrl: profile.githubUrl
        }
    }

    throw new BadRequestError('Role không hợp lệ');
  }

  async updateInfo({ userId, role, data }) {
    if (role === 'JOB_SEEKER') {
        const profile = await profileRepository.getInfo({ userId });
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return await profileRepository.updateInfo({ userId, data });
    }

    throw new BadRequestError('Role không hợp lệ');
  }
}

module.exports = new ProfileService();
