class User {
  constructor({
    id,
    fullName = null,
    avatar = null,
    createdAt,
    updatedAt,
    jobSeeker = null,
    recruiter = null,
    admin = null,
  } = {}) {
    this.id = id;
    this.fullName = fullName;
    this.avatar = avatar;
    this.createdAt = createdAt ? new Date(createdAt) : undefined;
    this.updatedAt = updatedAt ? new Date(updatedAt) : undefined;
    this.jobSeeker = jobSeeker;
    this.recruiter = recruiter;
    this.admin = admin;
  }

  toResponseFormat() {
    return {
      id: this.id,
      fullName: this.fullName,
      avatar: this.avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      jobSeeker: this.jobSeeker && typeof this.jobSeeker.toResponseFormat === 'function'
        ? this.jobSeeker.toResponseFormat()
        : this.jobSeeker,
      recruiter: this.recruiter && typeof this.recruiter.toResponseFormat === 'function'
        ? this.recruiter.toResponseFormat()
        : this.recruiter,
      admin: this.admin && typeof this.admin.toResponseFormat === 'function'
        ? this.admin.toResponseFormat()
        : this.admin,
    };
  }
}

module.exports = User;

