import awardService from '../services/award.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class AwardController {
    async getAward(req, res, next) {
        try {
            const { awardId } = req.params;
            const award = await awardService.getAward(awardId);
            return successResponse(res, 'Lấy thông tin giải thưởng thành công', award);
        } catch (error) {
            next(error);
        }
    }

    async getAllAwards(req, res, next) {
        try {
            const { userId } = req.user;
            const awards = await awardService.getAllAwards(userId);
            return successResponse(res, 'Lấy danh sách giải thưởng thành công', awards);
        } catch (error) {
            next(error);
        }
    }

    async addAward(req, res, next) {
        try {
            const { id: userId } = req.user;
            const data = req.body;
            const newAward = await awardService.addAward(userId, data);
            return successResponse(res, 'Thêm thông tin giải thưởng thành công', newAward);
        } catch (error) {
            next(error);
        }
    }

    async updateAward(req, res, next) {
        try {
            const { awardId } = req.params;
            const data = req.body;
            const updatedAward = await awardService.updateAward(awardId, data);
            return successResponse(res, 'Cập nhật thông tin giải thưởng thành công', updatedAward);
        } catch (error) {
            next(error);
        }
    }

    async deleteAward(req, res, next) {
        try {
            const { awardId } = req.params;
            await awardService.deleteAward(awardId);
            return successResponse(res, 'Xóa thông tin giải thưởng thành công');
        } catch (error) {
            next(error);
        }
    }
}

export default new AwardController();
