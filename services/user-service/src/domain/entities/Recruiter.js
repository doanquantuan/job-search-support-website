class Recruiter {
  constructor({
    userId,
    id,
    position = null,
    isVerified = false,
    companyId = null,
    createdAt,
    updatedAt,
  } = {}) {
    this.userId = userId || id;
    this.position = position;
    this.isVerified = isVerified;
    this.companyId = companyId;
    this.createdAt = createdAt ? new Date(createdAt) : undefined;
    this.updatedAt = updatedAt ? new Date(updatedAt) : undefined;
  }

  verify() {
    this.isVerified = true;
  }

  unverify() {
    this.isVerified = false;
  }

  assignCompany(companyId) {
    if (!companyId) {
      throw new Error('companyId không được để trống khi gán công ty');
    }
    this.companyId = companyId;
  }

  removeCompany() {
    this.companyId = null;
  }

  hasCompany() {
    return Boolean(this.companyId);
  }

  toResponseFormat() {
    return {
      userId: this.userId,
      position: this.position,
      isVerified: this.isVerified,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Recruiter;

