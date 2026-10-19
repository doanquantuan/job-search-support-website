const projectService = require('../services/project.service');
const { successResponse } = require('../utils/response.util');

class ProjectController {
    async getProject(req, res, next) {
        try {
            const { projectId } = req.params;
            const project = await projectService.getProject(projectId);
            return successResponse(res, 'Lấy thông tin dự án thành công', project);
        } catch (error) {
            next(error);
        }
    }

    async getAllProjects(req, res, next) {
        try {
            const { userId } = req.user;
            const projects = await projectService.getAllProjects(userId);
            return successResponse(res, 'Lấy danh sách dự án thành công', projects);
        } catch (error) {
            next(error);
        }
    }

    async addProject(req, res, next) {
        try {
            const { id: userId } = req.user;
            const data = req.body;
            const newProject = await projectService.addProject(userId, data);
            return successResponse(res, 'Thêm thông tin dự án thành công', newProject);
        } catch (error) {
            next(error);
        }
    }

    async updateProject(req, res, next) {
        try {
            const { projectId } = req.params;
            const data = req.body;
            const updatedProject = await projectService.updateProject(projectId, data);
            return successResponse(res, 'Cập nhật thông tin dự án thành công', updatedProject);
        } catch (error) {
            next(error);
        }
    }

    async deleteProject(req, res, next) {
        try {
            const { projectId } = req.params;
            await projectService.deleteProject(projectId);
            return successResponse(res, 'Xóa thông tin dự án thành công');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProjectController();
