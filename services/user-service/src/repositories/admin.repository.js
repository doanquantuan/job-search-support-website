const prisma = require('../config/prisma');

class AdminRepository {
  async findById(userId) {
    return prisma.admin.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async create(data) {
    return prisma.admin.create({
      data,
    });
  }

  async delete(userId) {
    return prisma.admin.delete({
      where: { userId },
    });
  }
}

module.exports = new AdminRepository();

