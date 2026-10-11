class Education {
  constructor({
    educationId,
    id,
    userId,
    institution,
    major,
    startDate,
    endDate = null,
    description = null,
  } = {}) {
    this.educationId = educationId || id;
    this.userId = userId;
    this.institution = institution;
    this.major = major;
    this.startDate = startDate ? new Date(startDate) : undefined;
    this.endDate = endDate ? new Date(endDate) : null;
    this.description = description;
  }

  isCurrent() {
    return !this.endDate;
  }

  toResponseFormat() {
    return {
      educationId: this.educationId,
      userId: this.userId,
      institution: this.institution,
      major: this.major,
      startDate: this.startDate,
      endDate: this.endDate,
      description: this.description,
      isCurrent: this.isCurrent(),
    };
  }
}

module.exports = Education;

