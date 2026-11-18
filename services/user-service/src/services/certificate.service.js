import certificateRepository from '../repositories/certificate.repository.js';
import profileRepository from '../repositories/profile.repository.js';
import { NotFoundError } from '#shared/utils/errors.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class CertificateService {
    async getCertificateById(certificateId) {
        if (!certificateId || !UUID_REGEX.test(certificateId)) {
            throw new NotFoundError('Chứng chỉ không tồn tại');
        }
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
        if (!certificateId || !UUID_REGEX.test(certificateId)) {
            throw new NotFoundError('Chứng chỉ không tồn tại');
        }
        const certificate = await certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new NotFoundError('Chứng chỉ không tồn tại');
        }
        return certificateRepository.update(certificateId, data);
    }

    async deleteCertificate(certificateId) {
        if (!certificateId || !UUID_REGEX.test(certificateId)) {
            throw new NotFoundError('Chứng chỉ không tồn tại');
        }
        const certificate = await certificateRepository.findById(certificateId);
        if (!certificate) {
            throw new NotFoundError('Chứng chỉ không tồn tại');
        }
        return certificateRepository.delete(certificateId);
    }
}

export default new CertificateService();
