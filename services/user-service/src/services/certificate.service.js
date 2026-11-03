import certificateRepository from '../repositories/certificate.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

class CertificateService {
    async getCertificateById(certificateId) {
        const certificate = await certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new NotFoundError('Chứng chỉ không tồn tại');
        }
        return certificate;
    }

    async getAllCertificates(userId) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }
        return certificateRepository.findAllByUserId(userId);
    }

    async addCertificate(userId, data) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            throw new NotFoundError('Profile không tồn tại');
        }

        return certificateRepository.create({ ...data, userId });
    }

    async updateCertificate(certificateId, data) {
        const certificate = await certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new NotFoundError('Chứng chỉ không tồn tại');
        }
        return certificateRepository.update(certificateId, data);
    }

    async deleteCertificate(certificateId) {
        const certificate = await certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new NotFoundError('Chứng chỉ không tồn tại');
        }
        return certificateRepository.delete(certificateId);
    }
}

export default new CertificateService();
