import prisma from '../config/prisma.js';

class SkillRepository {
  async findByUserIdAndSkillId(userId, skillId) {
    return prisma.profileSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });
  }

  async findByName(skillName) {
    return prisma.skill.findUnique({
      where: { skillName },
    });
  }

  async findById(skillId) {
    return prisma.skill.findUnique({
      where: { skillId },
    });
  }

  async findAllByUserId(userId) {
    const profileSkills = await prisma.profileSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    return profileSkills.map((ps) => ps.skill);
  }

  async addProfileSkill(userId, skillId) {
    return prisma.profileSkill.create({
      data: { userId, skillId },
      include: { skill: true },
    });
  }

  async removeProfileSkill(userId, skillId) {
    return prisma.profileSkill.deleteMany({
      where: { userId, skillId },
    });
  }

  async createSkill(skillName) {
    return prisma.skill.create({
      data: { skillName },
    });
  }

  async update(skillId, skillName) {
    return prisma.skill.update({
      where: { skillId },
      data: { skillName },
    });
  }

  async delete(skillId) {
    return prisma.skill.delete({
      where: { skillId },
    });
  }

  async findMatchingUserIdsBySkills(skillNames = [], limit = 20) {
    if (!skillNames || !skillNames.length) {
      const seekers = await prisma.jobSeeker.findMany({
        take: limit,
        select: { userId: true },
        orderBy: { updatedAt: 'desc' },
      });
      return seekers.map((s) => s.userId);
    }

    const cleaned = skillNames.map((s) => s.trim()).filter(Boolean);
    const profileSkills = await prisma.profileSkill.findMany({
      where: {
        skill: {
          skillName: {
            in: cleaned,
            mode: 'insensitive',
          },
        },
      },
      select: { userId: true },
      distinct: ['userId'],
      take: limit,
    });

    // Nếu không có ứng viên nào match chính xác skill, fallback lấy danh sách gần nhất
    if (!profileSkills.length) {
      const fallbackSeekers = await prisma.jobSeeker.findMany({
        take: limit,
        select: { userId: true },
        orderBy: { updatedAt: 'desc' },
      });
      return fallbackSeekers.map((s) => s.userId);
    }

    return profileSkills.map((ps) => ps.userId);
  }
}

export default new SkillRepository();
