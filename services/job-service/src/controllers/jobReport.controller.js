import jobReportService from '../services/jobReport.service.js';
import { successResponse } from '#shares/utils/response.util.js';

class JobReportController {
  async createReport(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const result = await jobReportService.createReport(actualUserId, req.body);
      return successResponse(res, 'Gửi báo cáo vi phạm thành công', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const result = await jobReportService.getReports(req.query);
      return successResponse(res, 'Lấy danh sách báo cáo vi phạm thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async getMyReports(req, res, next) {
    try {
      const { id: userId, userId: altId } = req.user;
      const actualUserId = userId || altId;
      const result = await jobReportService.getMyReports(actualUserId, req.query);
      return successResponse(res, 'Lấy danh sách báo cáo đã gửi thành công', result);
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req, res, next) {
    try {
      const { reportId } = req.params;
      const report = await jobReportService.getReportById(reportId);
      return successResponse(res, 'Lấy chi tiết báo cáo vi phạm thành công', report);
    } catch (error) {
      next(error);
    }
  }

  async updateReportStatus(req, res, next) {
    try {
      const { reportId } = req.params;
      const { id: adminId, userId: altId } = req.user;
      const actualAdminId = adminId || altId;
      const updated = await jobReportService.updateReportStatus(reportId, actualAdminId, req.body);
      return successResponse(res, 'Cập nhật trạng thái báo cáo thành công', updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteReport(req, res, next) {
    try {
      const { reportId } = req.params;
      await jobReportService.deleteReport(reportId);
      return successResponse(res, 'Xóa báo cáo vi phạm thành công', null);
    } catch (error) {
      next(error);
    }
  }
}

export default new JobReportController();
