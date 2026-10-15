const prisma = require('../config/prisma');
const Experience = require('../domain/entities/Experience');

class ExperienceRepository {
    _toEntity(rawExperience) {
        if (!rawExperience) return null;
        return new Experience(rawExperience);
    }

    async create(experienceData) {
        return this._toEntity(await prisma.experience.create({ data: experienceData }));
    }

    async findById(experienceId) {
        const rawExperience = await prisma.experience.findUnique({
            where: { experienceId },
        });
        return this._toEntity(rawExperience);
    }

    async findAllByUserId(userId) {
        const rawExperiences = await prisma.experience.findMany({
            where: { userId },
        });
        return rawExperiences.map((rawExperience) => this._toEntity(rawExperience));
    }

    async update(experienceId, experienceData) {
        return this._toEntity(await prisma.experience.update({
            where: { experienceId },
            data: experienceData,
        }));
    }

    async delete(experienceId) {
        return this._toEntity(await prisma.experience.delete({
            where: { experienceId },
        }));
    }
}

module.exports = new ExperienceRepository();
