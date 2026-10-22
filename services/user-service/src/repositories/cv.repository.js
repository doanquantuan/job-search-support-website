const prisma = require('../config/prisma');

class CvRepository {
  async create(data) {
    return prisma.cV.create({
      data,
    });
  }

  async findAllByUserId(userId) {
    return prisma.cV.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
      },
    });
  }

  async findById(cvId) {
    return prisma.cV.findUnique({
      where: { cvId },
      include: {
        template: true,
      },
    });
  }

  async findByIdAndUserId(cvId, userId) {
    return prisma.cV.findFirst({
      where: { cvId, userId },
      include: {
        template: true,
      },
    });
  }

  async update(cvId, data) {
    return prisma.cV.update({
      where: { cvId },
      data,
    });
  }

  async delete(cvId) {
    return prisma.cV.delete({
      where: { cvId },
    });
  }

  async countByUserId(userId) {
    return prisma.cV.count({
      where: { userId },
    });
  }
}

module.exports = new CvRepository();
