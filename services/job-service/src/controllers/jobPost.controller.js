import jobPostService from '../services/jobPost.service.js';
import { successResponse } from '#shares/utils/response.util.js';

class JobPostController {
  async createJobPost(req, res, next) {
    try {
      const { id: userId} = req.user;
      const data = req.body;
      const newJobPost = await jobPostService.createJobPost(userId, data);
      return successResponse(res, 'Tạo tin tuyển dụng thành công', newJobPost, 201);
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
      const { id: userId } = req.user;
      const updatedJob = await jobPostService.updateJobPost(jobId, userId, req.body);
      return successResponse(res, 'Cập nhật tin tuyển dụng thành công', updatedJob);
    } catch (error) {
      next(error);
    }
  }

  async deleteJobPost(req, res, next) {
    try {
      const { jobId } = req.params;
      const { id: userId, userId: userUid } = req.user;
      const actualUserId = userId || userUid;
      await jobPostService.deleteJobPost(jobId, actualUserId);
      return successResponse(res, 'Xóa tin tuyển dụng thành công', null);
    } catch (error) {
      next(error);
    }
  }

  async updateJobPostStatus(req, res, next) {
    try {
      const { jobId } = req.params;
      const { status } = req.body;
      const { id: userId } = req.user;
      const updatedJob = await jobPostService.updateJobPostStatus(jobId, userId, status);
      return successResponse(res, 'Cập nhật trạng thái tin tuyển dụng thành công', updatedJob);
    } catch (error) {
      next(error);
    }
  }
}

export default new JobPostController();

