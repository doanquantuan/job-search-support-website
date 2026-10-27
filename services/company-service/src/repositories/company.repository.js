import prisma from '../config/prisma.js';

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

  async updateCompanyVerification({ companyId, locationId, companyData, locationData }) {
    return prisma.$transaction(async (tx) => {
      // Cập nhật location nếu có trường địa chỉ mới
      if (locationData && Object.keys(locationData).length > 0) {
        if (locationId) {
          await tx.location.update({
            where: { locationId },
            data: locationData,
          });
        } else {
          const newLocation = await tx.location.create({ data: locationData });
          companyData.locationId = newLocation.locationId;
        }
      }

      return tx.company.update({
        where: { companyId },
        data: companyData,
        include: { location: true },
      });
    });
  }

  async updateCompanyProfile({ companyId, locationId, companyData, locationData }) {
    return prisma.$transaction(async (tx) => {
      if (locationData && Object.keys(locationData).length > 0) {
        if (locationId) {
          await tx.location.update({
            where: { locationId },
            data: locationData,
          });
        } else {
          const newLocation = await tx.location.create({ data: locationData });
          companyData.locationId = newLocation.locationId;
        }
      }

      return tx.company.update({
        where: { companyId },
        data: companyData,
        include: { location: true },
      });
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
