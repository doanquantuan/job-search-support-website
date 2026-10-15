const prisma = require('../config/prisma');
const Certificate = require('../domain/entities/Certificate');

class CertificateRepository {
    _toEntity(rawCertificate) {
        if (!rawCertificate) return null;
        return new Certificate(rawCertificate);
    }

    async create(certificateData) {
        return this._toEntity(await prisma.certificate.create({ data: certificateData }));
    }

    async findById(certificateId) {
        const rawCertificate = await prisma.certificate.findUnique({
            where: { certificateId },
        });
        return this._toEntity(rawCertificate);
    }

    async findAllByUserId(userId) {
        const rawCertificates = await prisma.certificate.findMany({
            where: { userId },
        });
        return rawCertificates.map((rawCertificate) => this._toEntity(rawCertificate));
    }

    async update(certificateId, certificateData) {
        return this._toEntity(await prisma.certificate.update({
            where: { certificateId },
            data: certificateData,
        }));
    }

    async delete(certificateId) {
        return this._toEntity(await prisma.certificate.delete({
            where: { certificateId },
        }));
    }
}

module.exports = new CertificateRepository();
