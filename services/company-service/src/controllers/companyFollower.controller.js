import companyFollowerService from '../services/companyFollower.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class CompanyFollowerController {
  async followCompany(req, res, next) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { companyId } = req.params;
      const result = await companyFollowerService.followCompany(userId, companyId);
      return successResponse(res, 'Theo dõi công ty thành công', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async unfollowCompany(req, res, next) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { companyId } = req.params;
      const result = await companyFollowerService.unfollowCompany(userId, companyId);
      return successResponse(res, 'Đã hủy theo dõi công ty', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getFollowStatus(req, res, next) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { companyId } = req.params;
      const result = await companyFollowerService.getFollowStatus(userId, companyId);
      return successResponse(res, 'Lấy trạng thái theo dõi thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getFollowingCompanies(req, res, next) {
    try {
      const userId = req.user?.id || req.user?.userId;
      const result = await companyFollowerService.getFollowingCompanies(userId, req.query);
      return successResponse(res, 'Lấy danh sách công ty đang theo dõi thành công', result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getFollowerUserIdsInternal(req, res, next) {
    try {
      const { companyId } = req.params;
      const userIds = await companyFollowerService.getFollowerUserIds(companyId);
      return successResponse(res, 'Lấy danh sách người theo dõi thành công', { userIds }, 200);
    } catch (error) {
      next(error);
    }
  }
}

export default new CompanyFollowerController();
