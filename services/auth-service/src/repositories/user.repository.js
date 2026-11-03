import prisma from '../config/prisma.js';

class UserRepository {

  async findByEmail(email) {
    return await prisma.authUser.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return await prisma.authUser.findUnique({
      where: { id },
    });
  }

  async create({ email, fullName, passwordHash, role = 'JOB_SEEKER' }) {
    return await prisma.authUser.create({
      data: {
        email,
        fullName,
        passwordHash,
        role,
      },
    });
  }

  async update(id, data) {
    return await prisma.authUser.update({
      where: { id },
      data,
    });
  }

  async updateVerified(id, isVerified) {
    return await prisma.authUser.update({
      where: { id },
      data: { isVerified },
    });
  }

  async delete(id) {
    return prisma.authUser.delete({
      where: { id },
    });
  }
}

export default new UserRepository();
