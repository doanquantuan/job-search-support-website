const prisma = require('../config/prisma');

class ExperienceRepository {

    async create(experienceData) {
        return await prisma.experience.create({ data: experienceData });
    }

    async findById(experienceId) {
        const rawExperience = await prisma.experience.findUnique({
            where: { experienceId },
        });
        return rawExperience;
    }

    async findAllByUserId(userId) {
        const rawExperiences = await prisma.experience.findMany({
            where: { userId },
        });
        return rawExperiences;
    }

    async update(experienceId, experienceData) {
        return await prisma.experience.update({
            where: { experienceId },
            data: experienceData,
        });
    }

    async delete(experienceId) {
        return await prisma.experience.delete({
            where: { experienceId },
        });
    }
}

module.exports = new ExperienceRepository();
