const prisma = require('../config/prisma');

class CompanyRepository {
  async findByTaxCode(taxCode) {
    return prisma.company.findUnique({
      where: { taxCode },
      include: { location: true },
    });
  }

  async findByRecruiterId(recruiterId) {
    return prisma.company.findFirst({
      where: { recruiterId },
      include: { location: true },
    });
  }

  async findById(companyId) {
    return prisma.company.findUnique({
      where: { companyId },
      include: { location: true },
    });
  }

  async createCompanyWithLocation({ companyData, locationData }) {
    return prisma.$transaction(async (tx) => {

      const location = await tx.location.create({
        data: {
          province: locationData.province,
          district: locationData.district || null,
          ward: locationData.ward || null,
          address: locationData.address || null,
        },
      });


      const company = await tx.company.create({
        data: {
          ...companyData,
          locationId: location.locationId,
        },
        include: {
          location: true,
        },
      });

      return company;
    });
  }

  async deleteById(companyId) {
    return prisma.company.delete({
      where: { companyId },
    });
  }
}

module.exports = new CompanyRepository();
