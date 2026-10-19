const experienceRepository = require('../repositories/experience.repository');
const profileRepository = require('../repositories/profile.repository');
const { BadRequestError, NotFoundError } = require('../utils/errors.util');

class ExperienceService {
    async getExperience(experienceId) {
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
        const experience = await experienceRepository.findById(experienceId);
        if (!experience) {
            throw new NotFoundError('Kinh nghiệm không tồn tại');
        }
        return experienceRepository.update(experienceId, data);
}

    async deleteExperience(experienceId) {
        const experience = await experienceRepository.findById(experienceId);
        if (!experience) {
            throw new NotFoundError('Kinh nghiệm không tồn tại');
        }
        return experienceRepository.delete(experienceId);
    }
}

module.exports = new ExperienceService();
