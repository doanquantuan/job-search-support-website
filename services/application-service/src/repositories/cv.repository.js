const prisma = require('../config/prisma');

class CVRepository {
  async createCV(data) {
    return prisma.cV.create({
      data,
    });
  }

  async findCVById(cvId) {
    return prisma.cV.findUnique({
      where: { cvId },
      include: {
        template: true,
      },
    });
  }

  async findCVsByJobSeekerId(jobSeekerId) {
    return prisma.cV.findMany({
      where: { jobSeekerId },
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
      },
    });
  }

  async deleteCV(cvId) {
    return prisma.cV.delete({
      where: { cvId },
    });
  }

  async findAllTemplates() {
    return prisma.cVTemplate.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }
}

module.exports = new CVRepository();

