const prisma = require('../config/prisma');

class TokenRepository {
  async saveRefreshToken(userId, token, expiresAt) {
    return prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async revokeToken(token) {
    return prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async isRevoked(token) {
    const record = await prisma.refreshToken.findFirst({
      where: { token, isRevoked: true },
    });
    return !!record;
  }
}

module.exports = new TokenRepository();
