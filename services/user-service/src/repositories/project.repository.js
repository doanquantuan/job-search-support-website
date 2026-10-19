const prisma = require('../config/prisma');

class ProjectRepository {

    async create(projectData) {
        return await prisma.project.create({ data: projectData });
    }

    async findById(projectId) {
        const rawProject = await prisma.project.findUnique({
            where: { projectId },
        });
        return rawProject;
    }

    async findAllByUserId(userId) {
        const rawProjects = await prisma.project.findMany({
            where: { userId },
        });
        return rawProjects;
    }

    async update(projectId, projectData) {
        return await prisma.project.update({
            where: { projectId },
            data: projectData,
        });
    }

    async delete(projectId) {
        return await prisma.project.delete({
            where: { projectId },
        });
    }
}

module.exports = new ProjectRepository();
