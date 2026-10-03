const prisma = require('../config/prisma');

class UserRepository {
  async findByEmail(email) {
    const rawUser = await prisma.user.findUnique({
      where: { email },
    });

    return rawUser;
  }

  async findById(id) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
    });

    return rawUser;
  }

  async create({ email, fullName, passwordHash, role = 'JOB_SEEKER' }) {
    const rawUser = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role,
      },
    });

    return rawUser;
  }

  async updateVerified(id, isVerified) {
    const rawUser = await prisma.user.update({
      where: { id },
      data: { isVerified },
    });

    return rawUser;
  }

  async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

module.exports = new UserRepository();
