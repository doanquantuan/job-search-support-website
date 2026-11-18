import projectRepository from '../repositories/project.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ProjectService {
    async getProjectById(projectId) {
        if (!projectId || !UUID_REGEX.test(projectId)) {
            throw new NotFoundError('Dự án không tồn tại');
        }
        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new NotFoundError('Dự án không tồn tại');
        }
        return project;
    }

    async getAllProjects(userId) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return projectRepository.findAllByUserId(userId);
    }

    async addProject(userId, data) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }

        return projectRepository.create({ ...data, userId });
    }

    async updateProject(projectId, data) {
        if (!projectId || !UUID_REGEX.test(projectId)) {
            throw new NotFoundError('Dự án không tồn tại');
        }
        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new NotFoundError('Dự án không tồn tại');
        }
        return projectRepository.update(projectId, data);
    }

    async deleteProject(projectId) {
        if (!projectId || !UUID_REGEX.test(projectId)) {
            throw new NotFoundError('Dự án không tồn tại');
        }
        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new NotFoundError('Dự án không tồn tại');
        }
        return projectRepository.delete(projectId);
    }
}

export default new ProjectService();
