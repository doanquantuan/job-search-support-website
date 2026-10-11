class Experience {
  constructor({
    experienceId,
    id,
    userId,
    companyName,
    position,
    startDate,
    endDate = null,
    description = null,
  } = {}) {
    this.experienceId = experienceId || id;
    this.userId = userId;
    this.companyName = companyName;
    this.position = position;
    this.startDate = startDate ? new Date(startDate) : undefined;
    this.endDate = endDate ? new Date(endDate) : null;
    this.description = description;
  }

  isCurrent() {
    return !this.endDate;
  }

  getDurationInMonths() {
    if (!this.startDate) return 0;
    const end = this.endDate ? new Date(this.endDate) : new Date();
    const start = new Date(this.startDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  }

  toResponseFormat() {
    return {
      experienceId: this.experienceId,
      userId: this.userId,
      companyName: this.companyName,
      position: this.position,
      startDate: this.startDate,
      endDate: this.endDate,
      description: this.description,
      isCurrent: this.isCurrent(),
      durationInMonths: this.getDurationInMonths(),
    };
  }
}

module.exports = Experience;

