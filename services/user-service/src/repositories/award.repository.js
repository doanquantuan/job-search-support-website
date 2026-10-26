import prisma from '../config/prisma.js';

class AwardRepository {
    async create(awardData) {
        return await prisma.award.create({ data: awardData });
    }

    async findById(awardId) {
        const rawAward = await prisma.award.findUnique({
            where: { awardId },
        });
        return rawAward;
    }

    async findAllByUserId(userId) {
        const rawAwards = await prisma.award.findMany({
            where: { userId },
        });
        return rawAwards;
    }

    async update(awardId, awardData) {
        return await prisma.award.update({
            where: { awardId },
            data: awardData,
        });
    }

    async delete(awardId) {
        return await prisma.award.delete({
            where: { awardId },
        });
    }
}

export default new AwardRepository();
