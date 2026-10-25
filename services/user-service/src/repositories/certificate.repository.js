const prisma = require('../config/prisma');

class CertificateRepository {

    async create(certificateData) {
        return await prisma.certificate.create({ data: certificateData });
    }

    async findById(certificateId) {
        const rawCertificate = await prisma.certificate.findUnique({
            where: { certificateId },
        });
        return rawCertificate;
    }

    async findAllByUserId(userId) {
        const rawCertificates = await prisma.certificate.findMany({
            where: { userId },
        });
        return rawCertificates;
    }

    async update(certificateId, certificateData) {
        return await prisma.certificate.update({
            where: { certificateId },
            data: certificateData,
        });
    }

    async delete(certificateId) {
        return await prisma.certificate.delete({
            where: { certificateId },
        });
    }
}

module.exports = new CertificateRepository();
