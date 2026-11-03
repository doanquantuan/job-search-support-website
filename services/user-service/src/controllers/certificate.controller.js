import certificateService from '../services/certificate.service.js';
import { successResponse } from '#shared/utils/response.util.js';

class CertificateController {
    async getCertificate(req, res, next) {
        try {
            const { certificateId } = req.params;
            const certificate = await certificateService.getCertificate(certificateId);
            return successResponse(res, 'Lấy thông tin chứng chỉ thành công', certificate);
        } catch (error) {
            next(error);
        }
    }

    async getAllCertificates(req, res, next) {
        try {
            const { userId } = req.user;
            const certificates = await certificateService.getAllCertificates(userId);
            return successResponse(res, 'Lấy danh sách chứng chỉ thành công', certificates);
        } catch (error) {
            next(error);
        }
    }

    async addCertificate(req, res, next) {
        try {
            const { id: userId } = req.user;
            const data = req.body;
            const newCertificate = await certificateService.addCertificate(userId, data);
            return successResponse(res, 'Thêm thông tin chứng chỉ thành công', newCertificate);
        } catch (error) {
            next(error);
        }
    }

    async updateCertificate(req, res, next) {
        try {
            const { certificateId } = req.params;
            const data = req.body;
            const updatedCertificate = await certificateService.updateCertificate(certificateId, data);
            return successResponse(res, 'Cập nhật thông tin chứng chỉ thành công', updatedCertificate);
        } catch (error) {
            next(error);
        }
    }

    async deleteCertificate(req, res, next) {
        try {
            const { certificateId } = req.params;
            await certificateService.deleteCertificate(certificateId);
            return successResponse(res, 'Xóa thông tin chứng chỉ thành công');
        } catch (error) {
            next(error);
        }
    }
}

export default new CertificateController();
