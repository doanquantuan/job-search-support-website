const prisma = require('../config/prisma');

class SkillRepository {
  async findById(skillId) {
    return prisma.skill.findUnique({
      where: { skillId },
    });
  }

  async findByName(skillName) {
    return prisma.skill.findUnique({
      where: { skillName },
    });
  }

  async findAll() {
    return prisma.skill.findMany({
      orderBy: { skillName: 'asc' },
    });
  }

  async create(skillName) {
    return prisma.skill.create({
      data: { skillName },
    });
  }

  async findOrCreate(skillName) {
    const existing = await this.findByName(skillName);
    if (existing) return existing;
    return this.create(skillName);
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

module.exports = new SkillRepository();

