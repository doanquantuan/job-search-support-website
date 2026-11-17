import analyticsService from '../services/analytics.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class AnalyticsController {
  /**
   * Lấy dữ liệu thống kê & phân tích tuyển dụng cho Recruiter
   */
  async getRecruiterAnalytics(req, res, next) {
    try {
      const recruiterId = req.user.userId || req.user.id;
      const isAdmin = req.user.role === 'ADMIN';
      const { timeRange = '7d', jobId = null } = req.query;

      const data = await analyticsService.getRecruiterAnalytics(recruiterId, {
        timeRange,
        jobId,
        isAdmin,
      });

      return successResponse(res, 'Lấy dữ liệu thống kê tuyển dụng thành công', data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
