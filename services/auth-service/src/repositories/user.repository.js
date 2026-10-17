const prisma = require('../config/prisma');
const User = require('../domain/entities/User');

class UserRepository {

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async create({ email, fullName, passwordHash, role = 'JOB_SEEKER' }) {
    return await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role,
      },
    });
  }

  async update(id, data) {
    const rawUser = await prisma.user.update({
      where: { id },
      data,
    });
    return this._toEntity(rawUser);
  }

  async updateVerified(id, isVerified) {
    return await prisma.user.update({
      where: { id },
      data: { isVerified },
    });
  }

  async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

module.exports = new UserRepository();
