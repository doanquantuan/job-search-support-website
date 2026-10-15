const prisma = require('../config/prisma');
const Award = require('../domain/entities/Award');

class AwardRepository {
    _toEntity(rawAward) {
        if (!rawAward) return null;
        return new Award(rawAward);
    }

    async create(awardData) {
        return this._toEntity(await prisma.award.create({ data: awardData }));
    }

    async findById(awardId) {
        const rawAward = await prisma.award.findUnique({
            where: { awardId },
        });
        return this._toEntity(rawAward);
    }

    async findAllByUserId(userId) {
        const rawAwards = await prisma.award.findMany({
            where: { userId },
        });
        return rawAwards.map((rawAward) => this._toEntity(rawAward));
    }

    async update(awardId, awardData) {
        return this._toEntity(await prisma.award.update({
            where: { awardId },
            data: awardData,
        }));
    }

    async delete(awardId) {
        return this._toEntity(await prisma.award.delete({
            where: { awardId },
        }));
    }
}

module.exports = new AwardRepository();
