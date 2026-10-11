class Award {
  constructor({
    awardId,
    id,
    userId,
    awardName,
    issuer = null,
    awardDate = null,
    description = null,
  } = {}) {
    this.awardId = awardId || id;
    this.userId = userId;
    this.awardName = awardName;
    this.issuer = issuer;
    this.awardDate = awardDate ? new Date(awardDate) : null;
    this.description = description;
  }

  toResponseFormat() {
    return {
      awardId: this.awardId,
      userId: this.userId,
      awardName: this.awardName,
      issuer: this.issuer,
      awardDate: this.awardDate,
      description: this.description,
    };
  }
}

module.exports = Award;

