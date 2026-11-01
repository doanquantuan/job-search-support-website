import prisma from '../config/prisma.js';

class CompanyRepository {
  async findByTaxCode(taxCode) {
    return prisma.company.findUnique({
      where: { taxCode },
      include: {
        documents: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByRecruiterId(recruiterId) {
    return prisma.company.findFirst({
      where: { recruiterId },
      include: {
        documents: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findById(companyId) {
    return prisma.company.findUnique({
      where: { companyId },
      include: {
        documents: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async createCompany({ companyData, documentData }) {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: companyData,
      });

      if (documentData) {
        await tx.companyDocument.create({
          data: {
            ...documentData,
            companyId: company.companyId,
          },
        });
      }

      await tx.companyVerification.create({
        data: {
          companyId: company.companyId,
          status: 'PENDING',
        },
      });

      return tx.company.findUnique({
        where: { companyId: company.companyId },
        include: {
          documents: true,
          verifications: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }

  async updateCompanyVerification({ companyId, companyData, documentData }) {
    return prisma.$transaction(async (tx) => {
      if (documentData) {
        // Lưu document mới
        await tx.companyDocument.create({
          data: {
            ...documentData,
            companyId,
          },
        });
      }

      // Tạo bản ghi log verification mới
      await tx.companyVerification.create({
        data: {
          companyId,
          status: 'PENDING',
        },
      });

      return tx.company.update({
        where: { companyId },
        data: {
          ...companyData,
          verificationStatus: 'PENDING',
        },
        include: {
          documents: true,
          verifications: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }

  async updateCompany(companyId, companyData) {
    return prisma.company.update({
      where: { companyId },
      data: companyData,
      include: {
        documents: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async deleteById(companyId) {
    return prisma.company.delete({
      where: { companyId },
    });
  }
}

export default new CompanyRepository();
export { CompanyRepository };
