class Skill {
  constructor({
    skillId,
    id,
    skillName,
  } = {}) {
    this.skillId = skillId || id;
    this.skillName = skillName;
  }

  toResponseFormat() {
    return {
      skillId: this.skillId,
      skillName: this.skillName,
    };
  }
}

module.exports = Skill;

