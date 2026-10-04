const prisma = require('../config/prisma');
const User = require('../domain/entities/User');

class UserRepository {
  _toEntity(rawUser) {
    if (!rawUser) return null;
    return new User(rawUser);
  }

  async findByEmail(email) {
    const rawUser = await prisma.user.findUnique({
      where: { email },
    });

    return this._toEntity(rawUser);
  }

  async findById(id) {
    const rawUser = await prisma.user.findUnique({
      where: { id },
    });

    return this._toEntity(rawUser);
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

    return this._toEntity(rawUser);
  }

  async updateVerified(id, isVerified) {
    const rawUser = await prisma.user.update({
      where: { id },
      data: { isVerified },
    });

    return this._toEntity(rawUser);
  }

  async delete(id) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

module.exports = new UserRepository();
