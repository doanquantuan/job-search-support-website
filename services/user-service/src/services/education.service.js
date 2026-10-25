const educationRepository = require('../repositories/education.repository');
const profileRepository = require('../repositories/profile.repository');
const { BadRequestError, NotFoundError } = require('../utils/errors.util');

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

module.exports = new EducationService();
