const prisma = require('../config/prisma');
const Education = require('../domain/entities/Education');

class EducationRepository {
    _toEntity(rawEducation) {
        if (!rawEducation) return null;
        return new Education(rawEducation);
    }

    async create(educationData) {
        return this._toEntity(await prisma.education.create({ data: educationData }));
    }

    async findById(educationId) {
        const rawEducation = await prisma.education.findUnique({
            where: { educationId },
        });
        return this._toEntity(rawEducation);
    }

    async findAllByUserId(userId) {
        const rawEducations = await prisma.education.findMany({
            where: { userId },
        });
        return rawEducations.map((rawEducation) => this._toEntity(rawEducation));
    }

    async update(educationId, educationData) {
        return this._toEntity(await prisma.education.update({
            where: { educationId },
            data: educationData,
        }));
    }

    async delete(educationId) {
        return this._toEntity(await prisma.education.delete({
            where: { educationId },
        }));
    }
}

module.exports = new EducationRepository();
