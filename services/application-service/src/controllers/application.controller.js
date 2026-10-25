const applicationService = require('../services/application.service');
const { successResponse } = require('../utils/response.util');

class ApplicationController {
  /**
   * Ứng viên nộp hồ sơ ứng tuyển
   */
  async applyJob(req, res, next) {
    try {
      const jobSeekerId = req.user.userId;
      const application = await applicationService.applyJob(jobSeekerId, req.body);
      return successResponse(res, 'Nộp hồ sơ ứng tuyển thành công', application, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ứng viên xem danh sách các đơn đã nộp
   */
  async getMyApplications(req, res, next) {
    try {
      const jobSeekerId = req.user.userId;
      const result = await applicationService.getMyApplications(jobSeekerId, req.query);
      return successResponse(res, 'Lấy danh sách đơn ứng tuyển thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xem chi tiết 1 đơn ứng tuyển
   */
  async getApplicationDetail(req, res, next) {
    try {
      const { id } = req.params;
      const application = await applicationService.getApplicationDetail(id, req.user);
      return successResponse(res, 'Lấy chi tiết đơn ứng tuyển thành công', application, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ứng viên rút đơn ứng tuyển
   */
  async withdrawApplication(req, res, next) {
    try {
      const { id } = req.params;
      const jobSeekerId = req.user.userId;
      const { note } = req.body;
      const result = await applicationService.withdrawApplication(jobSeekerId, id, note);
      return successResponse(res, 'Đã rút đơn ứng tuyển thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Nhà tuyển dụng xem danh sách ứng viên theo tin tuyển dụng
   */
  async getJobApplications(req, res, next) {
    try {
      const { jobId } = req.params;
      const recruiterId = req.user.userId;
      const result = await applicationService.getJobApplications(recruiterId, jobId, req.query);
      return successResponse(res, 'Lấy danh sách ứng viên thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Nhà tuyển dụng cập nhật trạng thái đơn ứng tuyển
   */
  async updateApplicationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const recruiterId = req.user.userId;
      const updated = await applicationService.updateApplicationStatus(recruiterId, id, req.body);
      return successResponse(res, 'Cập nhật trạng thái ứng tuyển thành công', updated, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();

