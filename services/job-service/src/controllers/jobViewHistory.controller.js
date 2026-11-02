import jobViewHistoryService from '../services/jobViewHistory.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class JobViewHistoryController {
  async recordView(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const { jobId } = req.params;
      const result = await jobViewHistoryService.recordView(actualUserId, jobId);
      return successResponse(res, 'Ghi nhận lịch sử xem tin tuyển dụng thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async getViewHistory(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const result = await jobViewHistoryService.getViewHistory(actualUserId, req.query);
      return successResponse(res, 'Lấy lịch sử xem tin tuyển dụng thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async getViewCount(req, res, next) {
    try {
      const { jobId } = req.params;
      const result = await jobViewHistoryService.getViewCountByJob(jobId);
      return successResponse(res, 'Lấy số lượt xem tin thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async removeViewHistory(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const { jobId } = req.params;
      await jobViewHistoryService.removeViewHistory(actualUserId, jobId);
      return successResponse(res, 'Xóa tin khỏi lịch sử xem thành công', null);
    } catch (error) {
      next(error);
    }
  }

  async clearViewHistory(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      await jobViewHistoryService.clearViewHistory(actualUserId);
      return successResponse(res, 'Xóa toàn bộ lịch sử xem tin thành công', null);
    } catch (error) {
      next(error);
    }
  }
}

export default new JobViewHistoryController();

