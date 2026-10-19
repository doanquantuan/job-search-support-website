const prisma = require('../config/prisma');

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
    return prisma.oAuthAccount.create({
      data: {
        userId,
        provider,
        providerUserId,
      },
    });
  }

  async createUserWithOAuth({
    email,
    fullName,
    avatar = null,
    role = 'JOB_SEEKER',
    isVerified = true,
    provider,
    providerUserId,
  }) {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.authUser.create({
        data: {
          email,
          fullName,
          avatar,
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

module.exports = new OAuthRepository();
