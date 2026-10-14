const prisma = require('../config/prisma');

class RecruiterRepository {
  async findById(userId) {
    return prisma.recruiter.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async findByCompanyId(companyId) {
    return prisma.recruiter.findMany({
      where: { companyId },
      include: { user: true },
    });
  }

  async create(data) {
    return prisma.recruiter.create({
      data,
    });
  }

  async update(userId, data) {
    return prisma.recruiter.update({
      where: { userId },
      data,
    });
  }

  async setVerified(userId, isVerified = true) {
    return prisma.recruiter.update({
      where: { userId },
      data: { isVerified },
    });
  }

  async assignCompany(userId, companyId) {
    return prisma.recruiter.update({
      where: { userId },
      data: { companyId },
    });
  }

  async delete(userId) {
    return prisma.recruiter.delete({
      where: { userId },
    });
  }
}

module.exports = new RecruiterRepository();

