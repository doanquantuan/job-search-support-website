import prisma from '../config/prisma.js';

class OAuthRepository {

  async findByProviderAndId(provider, providerUserId) {
    const account = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!account) return null;

    return {
      id: account.id,
      userId: account.userId,
      provider: account.provider,
      providerUserId: account.providerUserId,
      createdAt: account.createdAt,
      user: account.user,
    };
  }

  async createOAuthAccount({ userId, provider, providerUserId }) {
    return this.linkOAuthAccount({ userId, provider, providerUserId });
  }

  async linkOAuthAccount({ userId, provider, providerUserId }) {
    return prisma.$transaction(async (tx) => {
      // Dọn dẹp bất kỳ bản ghi mồ côi nào chiếm providerUserId này của user khác
      await tx.oAuthAccount.deleteMany({
        where: {
          provider,
          providerUserId,
          userId: { not: userId },
        },
      });

      // Liên kết hoặc cập nhật tài khoản OAuth cho User này
      return tx.oAuthAccount.upsert({
        where: {
          userId_provider: {
            userId,
            provider,
          },
        },
        update: {
          providerUserId,
        },
        create: {
          userId,
          provider,
          providerUserId,
        },
      });
    });
  }

  async deleteOAuthAccount(id) {
    return prisma.oAuthAccount.delete({
      where: { id },
    }).catch(() => null);
  }

  async createUserWithOAuth({
    email,
    fullName,
    role = 'JOB_SEEKER',
    isVerified = true,
    provider,
    providerUserId,
  }) {
    const result = await prisma.$transaction(async (tx) => {
      // Dọn dẹp bản ghi mồ côi trùng providerUserId nếu có
      await tx.oAuthAccount.deleteMany({
        where: {
          provider,
          providerUserId,
        },
      });

      const user = await tx.authUser.create({
        data: {
          email,
          fullName,
          role,
          isVerified,
          passwordHash: null,
        },
      });

      const oauthAccount = await tx.oAuthAccount.create({
        data: {
          userId: user.id,
          provider,
          providerUserId,
        },
      });

      return { user, oauthAccount };
    });

    return result.user;
  }
}

export default new OAuthRepository();
