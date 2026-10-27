import awardRepository from '../repositories/award.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

class AwardService {
    async getAwardById(awardId) {
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
        const award = await awardRepository.findById(awardId);
        if (!award) {
            throw new NotFoundError('Giải thưởng không tồn tại');
        }
        return awardRepository.update(awardId, data);
    }

    async deleteAward(awardId) {
        const award = await awardRepository.findById(awardId);
        if (!award) {
            throw new NotFoundError('Giải thưởng không tồn tại');
        }
        return awardRepository.delete(awardId);
    }
}

export default new AwardService();
