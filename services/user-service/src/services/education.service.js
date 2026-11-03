import educationRepository from '../repositories/education.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

class EducationService {
    async getEducationById(educationId) {
        const education = await educationRepository.findById(educationId);
        if (!education) {
            throw new NotFoundError('Học vấn không tồn tại');
        }
        return education;
    }

    async getAllEducations(userId) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return educationRepository.findAllByUserId(userId);
    }

    async addEducation(userId, data) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }

        return educationRepository.create({ ...data, userId });
    }

    async updateEducation(educationId, data) {
        const education = await educationRepository.findById(educationId);
        if (!education) {
            throw new NotFoundError('Học vấn không tồn tại');
        }
        return educationRepository.update(educationId, data);
}

    async deleteEducation(educationId) {
        const education = await educationRepository.findById(educationId);
        if (!education) {
            throw new NotFoundError('Học vấn không tồn tại');
        }
        return educationRepository.delete(educationId);
    }
}

export default new EducationService();
