import prisma from '../config/prisma.js';

class OccupationRepository {
  async findByName(occupationName) {
    return await prisma.occupation.findUnique({
      where: { occupationName },
    });
  }

  async findById(occupationId) {
    return await prisma.occupation.findUnique({
      where: { occupationId },
      include: {
        specializations: true,
      },
    });
  }

  async findAll() {
    return await prisma.occupation.findMany({
      include: {
        specializations: true,
      },
      orderBy: {
        occupationName: 'asc',
      },
    });
  }

  async create(occupationName) {
    return await prisma.occupation.create({
      data: { occupationName },
    });
  }

  async update(occupationId, occupationName) {
    return await prisma.occupation.update({
      where: { occupationId },
      data: { occupationName },
    });
  }

  async delete(occupationId) {
    return await prisma.occupation.delete({
      where: { occupationId },
    });
  }
}

export default new OccupationRepository();
