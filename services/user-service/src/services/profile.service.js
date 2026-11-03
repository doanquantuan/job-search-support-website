import profileRepository from '../repositories/profile.repository.js';
import fileService from './file.service.js';
import fs from 'fs';
import {
  BadRequestError,
  NotFoundError,
} from '#shared/utils/errors.util.js';

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

    try {
      // 1. Resize 400x400 vuông, nén WebP 80%
      const processedImage = await fileService.processAvatarImage(file.path, {
        width: 400,
        height: 400,
        quality: 80,
      });

      // 2. Upload ảnh WebP đã xử lý lên Cloudflare R2
      const uploadResult = await fileService.uploadProcessedImage(
        processedImage.buffer,
        processedImage.extension,
        processedImage.mimetype,
        'avatars'
      );

      const newAvatarUrl = uploadResult.url;

      // 3. Cập nhật URL avatar vào database
      await profileRepository.updateInfo({
        userId,
        data: { avatar: newAvatarUrl },
      });

      // 4. Xóa avatar cũ trên Cloudflare R2 nếu có
      if (oldAvatar && oldAvatar !== newAvatarUrl) {
        fileService.deleteFile(oldAvatar).catch((err) => {
          console.warn(`[ProfileService] Lỗi khi xóa avatar cũ (${oldAvatar}):`, err.message);
        });
      }

      return {
        avatar: newAvatarUrl,
      };
    } finally {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.warn(`[ProfileService] Lỗi khi dọn dẹp file tạm (${file.path}):`, err.message);
        }
      }
    }
  }


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

    // Nếu có avatar cũ thì xóa trực tiếp trên R2
    if (oldAvatar) {
      await fileService.deleteFile(oldAvatar);
    }

    return {
      message: 'Xóa avatar thành công',
    };
  }
}

export default new ProfileService();
