import experienceRepository from '../repositories/experience.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ExperienceService {
    async getExperience(experienceId) {
        if (!experienceId || !UUID_REGEX.test(experienceId)) {
            throw new NotFoundError('Kinh nghiệm không tồn tại');
        }
        const experience = await experienceRepository.findById(experienceId);
        if (!experience) {
            throw new NotFoundError('Kinh nghiệm không tồn tại');
        }
        return experience;
    }

    async getAllExperiences(userId) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return experienceRepository.findAllByUserId(userId);
    }

    async addExperience(userId, data) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }

        return experienceRepository.create({ ...data, userId });
    }

    async updateExperience(experienceId, data) {
        if (!experienceId || !UUID_REGEX.test(experienceId)) {
            throw new NotFoundError('Kinh nghiệm không tồn tại');
        }
        const experience = await experienceRepository.findById(experienceId);
        if (!experience) {
            throw new NotFoundError('Kinh nghiệm không tồn tại');
        }
        return experienceRepository.update(experienceId, data);
    }

    async deleteExperience(experienceId) {
        if (!experienceId || !UUID_REGEX.test(experienceId)) {
            throw new NotFoundError('Kinh nghiệm không tồn tại');
        }
        const experience = await experienceRepository.findById(experienceId);
        if (!experience) {
            throw new NotFoundError('Kinh nghiệm không tồn tại');
        }
        return experienceRepository.delete(experienceId);
    }
}

export default new ExperienceService();
