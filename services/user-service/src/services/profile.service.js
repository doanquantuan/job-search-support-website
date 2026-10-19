const userRepository = require('../repositories/user.repository');
const jobSeekerRepository = require('../repositories/jobSeeker.repository');
const profileRepository = require('../repositories/profile.repository');
const fileService = require('./file.service');
const { addAvatarUploadJob, addFileDeleteJob, getJobStatus } = require('../jobs/upload.queue');
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
        githubUrl: profile.githubUrl,
      };
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

  async uploadAvatar({ userId, role, file }) {
    if (!file || !file.path) {
      throw new BadRequestError('Vui lòng chọn file ảnh để tải lên');
    }

    if (role !== 'JOB_SEEKER') {
      throw new BadRequestError('Role không hợp lệ');
    }

    const currentProfile = await profileRepository.getInfo({ userId });
    if (!currentProfile) {
      throw new NotFoundError('Profile không tồn tại');
    }

    const oldAvatar = currentProfile.avatar || null;

    const job = await addAvatarUploadJob({
      userId,
      role,
      tempFilePath: file.path,
      mimetype: file.mimetype,
      originalname: file.originalname,
      oldAvatar,
    });

    return {
      jobId: job.id,
      status: 'PROCESSING',
      message: 'Yêu cầu tải lên avatar đang được xử lý ở tác vụ nền',
    };
  }

  /**
   * Lấy trạng thái xử lý upload avatar theo jobId
   */
  async getAvatarUploadStatus({ userId, jobId }) {
    const jobInfo = await getJobStatus(jobId);
    if (!jobInfo) {
      throw new NotFoundError('Không tìm thấy thông tin tác vụ upload (có thể đã hết hạn hoặc không tồn tại)');
    }

    // Kiểm tra an toàn: job có đúng của user hiện tại không
    const jobData = await (await require('../jobs/upload.queue').uploadQueue.getJob(jobId))?.data;
    if (jobData && jobData.userId && jobData.userId !== userId) {
      throw new UnauthorizedError('Bạn không có quyền xem thông tin tác vụ này');
    }

    let status = 'PROCESSING';
    if (jobInfo.state === 'completed') {
      status = 'COMPLETED';
    } else if (jobInfo.state === 'failed') {
      status = 'FAILED';
    }

    return {
      jobId: jobInfo.jobId,
      status, // 'PROCESSING' | 'COMPLETED' | 'FAILED'
      state: jobInfo.state,
      result: jobInfo.result, // { userId, avatar, key, uploadDuration } khi completed
      error: jobInfo.failedReason,
      processedAt: jobInfo.finishedOn ? new Date(jobInfo.finishedOn).toISOString() : null,
    };
  }

  /**
   * Xóa avatar người dùng và dọn dẹp file R2 thông qua background job
   */
  async deleteAvatar({ userId, role }) {
    if (role !== 'JOB_SEEKER') {
      throw new BadRequestError('Role không hợp lệ');
    }

    const currentProfile = await profileRepository.getInfo({ userId });
    if (!currentProfile) {
      throw new NotFoundError('Profile không tồn tại');
    }

    const oldAvatar = currentProfile.avatar;

    // Cập nhật avatar trong DB về null
    await profileRepository.updateInfo({
      userId,
      data: { avatar: null },
    });

    // Nếu có avatar cũ thì đẩy job xóa file R2 vào queue
    if (oldAvatar) {
      await addFileDeleteJob(oldAvatar);
    }

    return {
      message: 'Xóa avatar thành công',
    };
  }
}

module.exports = new ProfileService();
