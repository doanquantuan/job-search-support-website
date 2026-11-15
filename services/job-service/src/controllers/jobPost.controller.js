import jobPostService from '../services/jobPost.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class JobPostController {
  async createJobPost(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const data = req.body;
      const newJobPost = await jobPostService.createJobPost(userId, data);
      return successResponse(res, 'Tạo tin tuyển dụng thành công', newJobPost, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyJobs(req, res, next) {
    try {
      const userId = req.user.userId || req.user.id;
      const result = await jobPostService.getMyJobs(userId, req.query);
      return successResponse(res, 'Lấy danh sách tin tuyển dụng của tôi thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async getJobPosts(req, res, next) {
    try {
      const result = await jobPostService.getJobPosts(req.query);
      return successResponse(res, 'Lấy danh sách tin tuyển dụng thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async searchJobs(req, res, next) {
    try {
      const result = await jobPostService.searchJobs(req.query);
      return successResponse(res, 'Tìm kiếm tin tuyển dụng thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async autocomplete(req, res, next) {
    try {
      const { q, limit } = req.query;
      const suggestions = await jobPostService.autocompleteJobs(q, limit);
      return successResponse(res, 'Gợi ý từ khóa thành công', suggestions);
    } catch (error) {
      next(error);
    }
  }

  async getJobPostById(req, res, next) {
    try {
      const { jobId } = req.params;
      const job = await jobPostService.getJobPostById(jobId);
      return successResponse(res, 'Lấy chi tiết tin tuyển dụng thành công', job);
    } catch (error) {
      next(error);
    }
  }

  async updateJobPost(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.userId || req.user.id;
      const updatedJob = await jobPostService.updateJobPost(jobId, userId, req.body);
      return successResponse(res, 'Cập nhật tin tuyển dụng thành công', updatedJob);
    } catch (error) {
      next(error);
    }
  }

  async deleteJobPost(req, res, next) {
    try {
      const { jobId } = req.params;
      const userId = req.user.userId || req.user.id;
      await jobPostService.deleteJobPost(jobId, userId);
      return successResponse(res, 'Xóa tin tuyển dụng thành công', null);
    } catch (error) {
      next(error);
    }
  }

  async updateJobPostStatus(req, res, next) {
    try {
      const { jobId } = req.params;
      const { status } = req.body;
      const userId = req.user.userId || req.user.id;
      const updatedJob = await jobPostService.updateJobPostStatus(jobId, userId, status);
      return successResponse(res, 'Cập nhật trạng thái tin tuyển dụng thành công', updatedJob);
    } catch (error) {
      next(error);
    }
  }
}

export default new JobPostController();


