const companyService = require('../services/company.service');
const { successResponse } = require('../utils/response.util');

class CompanyController {
  // Đăng ký xác thực doanh nghiệp
  async registerVerification(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const data = req.validatedBody;
      const file = req.file;

      const result = await companyService.registerVerification(recruiterId, data, file);

      return successResponse(
        res,
        'Đăng ký xác thực doanh nghiệp thành công. Hồ sơ đang ở trạng thái chờ kiểm duyệt (PENDING).',
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Xem trạng thái xác thực doanh nghiệp
  async getVerificationStatus(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const result = await companyService.getVerificationStatus(recruiterId);

      return successResponse(res, 'Lấy trạng thái xác thực doanh nghiệp thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật hồ sơ xác thực doanh nghiệp
  async updateVerificationProfile(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const data = req.validatedBody;
      const file = req.file;

      const result = await companyService.updateVerificationProfile(recruiterId, data, file);

      return successResponse(
        res,
        'Cập nhật hồ sơ xác thực thành công. Hồ sơ đã được nộp lại và đang ở trạng thái chờ kiểm duyệt (PENDING).',
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  }

  // Xem thông tin doanh nghiệp nội bộ (Recruiter)
  async getMyCompany(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const result = await companyService.getMyCompany(recruiterId);

      return successResponse(res, 'Lấy thông tin doanh nghiệp thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Xem thông tin doanh nghiệp công khai (Ứng viên / Khách)
  async getPublicCompanyProfile(req, res, next) {
    try {
      const { id } = req.params;
      const result = await companyService.getPublicCompanyProfile(id);

      return successResponse(res, 'Lấy hồ sơ doanh nghiệp thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật thông tin doanh nghiệp (Recruiter)
  async updateMyCompany(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const data = req.validatedBody;
      const files = req.files || {};

      const result = await companyService.updateMyCompany(recruiterId, data, files);

      return successResponse(res, 'Cập nhật thông tin doanh nghiệp thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyController();
