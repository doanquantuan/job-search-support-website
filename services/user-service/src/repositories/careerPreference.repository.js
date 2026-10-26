import prisma from '../config/prisma.js';

class CareerPreferenceRepository {

    async findById(careerPreferenceId) {
        const rawCareerPreference = await prisma.careerPreference.findUnique({
            where: { careerPreferenceId },
        });
        return rawCareerPreference;
    }

    async findByUserId(userId) {
        const rawCareerPreference = await prisma.careerPreference.findUnique({
            where: { userId },
        });
        return rawCareerPreference;
    }

    async create(careerPreferenceData) {
        return await prisma.careerPreference.create({ data: careerPreferenceData });
    }

    async update(careerPreferenceId, careerPreferenceData) {
        return await prisma.careerPreference.update({
            where: { careerPreferenceId },
            data: careerPreferenceData,
        });
    }
}

export default new CareerPreferenceRepository();
