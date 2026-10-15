const prisma = require('../config/prisma');
const CareerPreference = require('../domain/entities/CareerPreference');

class CareerPreferenceRepository {
    _toEntity(rawCareerPreference) {
        if (!rawCareerPreference) return null;
        return new CareerPreference(rawCareerPreference);
    }

    async findById(careerPreferenceId) {
        const rawCareerPreference = await prisma.careerPreference.findUnique({
            where: { careerPreferenceId },
        });
        return this._toEntity(rawCareerPreference);
    }

    async findByUserId(userId) {
        const rawCareerPreference = await prisma.careerPreference.findUnique({
            where: { userId },
        });
        return this._toEntity(rawCareerPreference);
    }

    async create(careerPreferenceData) {
        return this._toEntity(await prisma.careerPreference.create({ data: careerPreferenceData }));
    }

    async update(careerPreferenceId, careerPreferenceData) {
        return this._toEntity(await prisma.careerPreference.update({
            where: { careerPreferenceId },
            data: careerPreferenceData,
        }));
    }
}

module.exports = new CareerPreferenceRepository();
