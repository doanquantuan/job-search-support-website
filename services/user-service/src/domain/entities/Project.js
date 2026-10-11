class Project {
  constructor({
    projectId,
    id,
    userId,
    projectName,
    position,
    startDate,
    endDate = null,
    description = null,
  } = {}) {
    this.projectId = projectId || id;
    this.userId = userId;
    this.projectName = projectName;
    this.position = position;
    this.startDate = startDate ? new Date(startDate) : undefined;
    this.endDate = endDate ? new Date(endDate) : null;
    this.description = description;
  }

  isCurrent() {
    return !this.endDate;
  }

  toResponseFormat() {
    return {
      projectId: this.projectId,
      userId: this.userId,
      projectName: this.projectName,
      position: this.position,
      startDate: this.startDate,
      endDate: this.endDate,
      description: this.description,
      isCurrent: this.isCurrent(),
    };
  }
}

module.exports = Project;

