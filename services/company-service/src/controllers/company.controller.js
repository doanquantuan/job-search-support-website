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
}

module.exports = new CompanyController();
