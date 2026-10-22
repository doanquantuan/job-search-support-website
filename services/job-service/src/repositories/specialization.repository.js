import prisma from '../config/prisma.js';

class SpecializationRepository {
  async findById(specializationId) {
    return await prisma.specialization.findUnique({
      where: { specializationId },
      include: {
        occupation: true,
      },
    });
  }

  async findByNameAndOccupation(occupationId, specializationName) {
    return await prisma.specialization.findUnique({
      where: {
        occupationId_specializationName: {
          occupationId,
          specializationName,
        },
      },
    });
  }

  async findAll(occupationId = null) {
    const where = occupationId ? { occupationId } : {};
    return await prisma.specialization.findMany({
      where,
      include: {
        occupation: true,
      },
      orderBy: {
        specializationName: 'asc',
      },
    });
  }

  async create(data) {
    return await prisma.specialization.create({
      data,
      include: {
        occupation: true,
      },
    });
  }

  async update(specializationId, data) {
    return await prisma.specialization.update({
      where: { specializationId },
      data,
      include: {
        occupation: true,
      },
    });
  }

  async delete(specializationId) {
    return await prisma.specialization.delete({
      where: { specializationId },
    });
  }
}

export default new SpecializationRepository();

