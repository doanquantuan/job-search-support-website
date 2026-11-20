import awardRepository from '../repositories/award.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class AwardService {
    async getAwardById(awardId) {
        if (!awardId || !UUID_REGEX.test(awardId)) {
            throw new NotFoundError('Giải thưởng không tồn tại');
        }
        const award = await awardRepository.findById(awardId);
        if (!award) {
            throw new NotFoundError('Giải thưởng không tồn tại');
        }
        return award;
    }

    async getAllAwards(userId) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return awardRepository.findAllByUserId(userId);
    }

    async addAward(userId, data) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }

        return awardRepository.create({ ...data, userId });
    }

    async updateAward(awardId, data) {
        if (!awardId || !UUID_REGEX.test(awardId)) {
            throw new NotFoundError('Giải thưởng không tồn tại');
        }
        const award = await awardRepository.findById(awardId);
        if (!award) {
            throw new NotFoundError('Giải thưởng không tồn tại');
        }
        return awardRepository.update(awardId, data);
    }

    async deleteAward(awardId) {
        if (!awardId || !UUID_REGEX.test(awardId)) {
            throw new NotFoundError('Giải thưởng không tồn tại');
        }
        const award = await awardRepository.findById(awardId);
        if (!award) {
            throw new NotFoundError('Giải thưởng không tồn tại');
        }
        return awardRepository.delete(awardId);
    }
}

export default new AwardService();
