import savedJobService from '../services/savedJob.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class SavedJobController {
  async saveJob(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const { jobId } = req.params;
      const result = await savedJobService.saveJob(actualUserId, jobId);
      return successResponse(res, 'Lưu tin tuyển dụng thành công', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async unsaveJob(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const { jobId } = req.params;
      await savedJobService.unsaveJob(actualUserId, jobId);
      return successResponse(res, 'Bỏ lưu tin tuyển dụng thành công', null);
    } catch (error) {
      next(error);
    }
  }

  async getSavedJobs(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const result = await savedJobService.getSavedJobs(actualUserId, req.query);
      return successResponse(res, 'Lấy danh sách tin đã lưu thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async checkIsJobSaved(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const { jobId } = req.params;
      const result = await savedJobService.checkIsJobSaved(actualUserId, jobId);
      return successResponse(res, 'Kiểm tra trạng thái đã lưu tin thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async checkBatchSaved(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const { jobIds } = req.body;
      const result = await savedJobService.checkBatchSaved(actualUserId, jobIds);
      return successResponse(res, 'Kiểm tra hàng loạt trạng thái lưu tin thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async getSavedCount(req, res, next) {
    try {
      const { jobId } = req.params;
      const result = await savedJobService.getSavedCountByJob(jobId);
      return successResponse(res, 'Lấy số lượt lưu tin thành công', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new SavedJobController();

