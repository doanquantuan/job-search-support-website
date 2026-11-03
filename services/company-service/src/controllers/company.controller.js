import companyService from '../services/company.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class CompanyController {
  async registerVerification(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const data = req.validatedBody;
      const file = req.file;

      const result = await companyService.registerVerification(recruiterId, data, file);

      return successResponse(
        res,
        'Đăng ký xác thực thành công. Hồ sơ đang ở trạng thái chờ kiểm duyệt (PENDING).',
        result,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async getVerificationStatus(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const result = await companyService.getVerificationStatus(recruiterId);

      return successResponse(res, 'Lấy trạng thái xác thực thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }

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

  async getMyCompany(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const result = await companyService.getMyCompany(recruiterId);

      return successResponse(res, 'Lấy thông tin doanh nghiệp thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getCompanies(req, res, next) {
    try {
      const query = req.validatedQuery || req.query;
      const result = await companyService.getCompanies(query);

      return successResponse(res, 'Lấy danh sách doanh nghiệp thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPublicCompanyProfile(req, res, next) {
    try {
      const { id } = req.params;
      const result = await companyService.getPublicCompanyProfile(id);

      return successResponse(res, 'Lấy hồ sơ doanh nghiệp thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateMyCompany(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const data = req.validatedBody;
      const file = req.file;

      const result = await companyService.updateMyCompany(recruiterId, data, file);

      return successResponse(res, 'Cập nhật thông tin doanh nghiệp thành công.', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getLicensePresignedUrl(req, res, next) {
    try {
      const recruiterId = req.user.id;
      const result = await companyService.getLicensePresignedUrl(recruiterId);

      return successResponse(
        res,
        'Lấy đường dẫn xem giấy phép kinh doanh thành công. Đường dẫn có hiệu lực trong 10 phút.',
        result,
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new CompanyController();
export { CompanyController };
