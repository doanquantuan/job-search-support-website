import careerPreferenceRepository from '../repositories/careerPreference.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { BadRequestError, NotFoundError } from '#shared/utils/errors.util.js';

class CareerPreferenceService {
    async getCareerPreference(userId) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return careerPreferenceRepository.findByUserId(userId);
    }

    async createCareerPreference(userId, data) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }

        const existingCareerPreference = await careerPreferenceRepository.findByUserId(userId);
        if (existingCareerPreference) {
            throw new BadRequestError('Career preference đã tồn tại');
        }
        return careerPreferenceRepository.create({ ...data, userId });
    }

    async updateCareerPreference(userId, data) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return careerPreferenceRepository.updateByUserId(userId, data);
    }
}

export default new CareerPreferenceService();
