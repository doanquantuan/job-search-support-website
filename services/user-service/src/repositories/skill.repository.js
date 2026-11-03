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
}

export default new SkillRepository();
