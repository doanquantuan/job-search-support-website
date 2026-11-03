import prisma from '../config/prisma.js';

class EducationRepository {

    async create(educationData) {
        return await prisma.education.create({ data: educationData });
    }

    async findById(educationId) {
        const rawEducation = await prisma.education.findUnique({
            where: { educationId },
        });
        return rawEducation;
    }

    async findAllByUserId(userId) {
        const rawEducations = await prisma.education.findMany({
            where: { userId },
        });
        return rawEducations;
    }

    async update(educationId, educationData) {
        return await prisma.education.update({
            where: { educationId },
            data: educationData,
        });
    }

    async delete(educationId) {
        return await prisma.education.delete({
            where: { educationId },
        });
    }
}

export default new EducationRepository();
