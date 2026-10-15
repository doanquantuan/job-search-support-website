const prisma = require('../config/prisma');
const Project = require('../domain/entities/Project');

class ProjectRepository {
    _toEntity(rawProject) {
        if (!rawProject) return null;
        return new Project(rawProject);
    }

    async create(projectData) {
        return this._toEntity(await prisma.project.create({ data: projectData }));
    }

    async findById(projectId) {
        const rawProject = await prisma.project.findUnique({
            where: { projectId },
        });
        return this._toEntity(rawProject);
    }

    async findAllByUserId(userId) {
        const rawProjects = await prisma.project.findMany({
            where: { userId },
        });
        return rawProjects.map((rawProject) => this._toEntity(rawProject));
    }

    async update(projectId, projectData) {
        return this._toEntity(await prisma.project.update({
            where: { projectId },
            data: projectData,
        }));
    }

    async delete(projectId) {
        return this._toEntity(await prisma.project.delete({
            where: { projectId },
        }));
    }
}

module.exports = new ProjectRepository();
