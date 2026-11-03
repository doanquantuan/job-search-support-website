import prisma from '../config/prisma.js';

class UserRepository {
  async findById(id) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
    });
    return rawUser;
  }

  async findOne({ id }) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
    });
    return rawUser;
  }

  async findWithRoles(id) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
      include: {
        jobSeeker: true,
        recruiter: true,
        admin: true,
      },
    });
    return rawUser;
  }

  async create(data) {
    const rawUser = await prisma.user.create({
      data,
    });
    return rawUser;
  }

  async update(id, data) {
    const rawUser = await prisma.user.update({
      where: { id },
      data,
    });
    return rawUser;
  }

  async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }

}

export default new UserRepository();
