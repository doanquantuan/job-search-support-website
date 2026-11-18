import educationRepository from '../repositories/education.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class EducationService {
    async getEducationById(educationId) {
        if (!educationId || !UUID_REGEX.test(educationId)) {
            throw new NotFoundError('Học vấn không tồn tại');
        }
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
        if (!educationId || !UUID_REGEX.test(educationId)) {
            throw new NotFoundError('Học vấn không tồn tại');
        }
        const education = await educationRepository.findById(educationId);
        if (!education) {
            throw new NotFoundError('Học vấn không tồn tại');
        }
        return educationRepository.update(educationId, data);
    }

    async deleteEducation(educationId) {
        if (!educationId || !UUID_REGEX.test(educationId)) {
            throw new NotFoundError('Học vấn không tồn tại');
        }
        const education = await educationRepository.findById(educationId);
        if (!education) {
            throw new NotFoundError('Học vấn không tồn tại');
        }
        return educationRepository.delete(educationId);
    }
}

export default new EducationService();
