class Certificate {
  constructor({
    certificateId,
    id,
    userId,
    certificateName,
    issuer,
    issueDate,
    expiryDate = null,
    description = null,
  } = {}) {
    this.certificateId = certificateId || id;
    this.userId = userId;
    this.certificateName = certificateName;
    this.issuer = issuer;
    this.issueDate = issueDate ? new Date(issueDate) : undefined;
    this.expiryDate = expiryDate ? new Date(expiryDate) : null;
    this.description = description;
  }

  isExpired() {
    if (!this.expiryDate) return false;
    return new Date(this.expiryDate) < new Date();
  }

  toResponseFormat() {
    return {
      certificateId: this.certificateId,
      userId: this.userId,
      certificateName: this.certificateName,
      issuer: this.issuer,
      issueDate: this.issueDate,
      expiryDate: this.expiryDate,
      isExpired: this.isExpired(),
      description: this.description,
    };
  }
}

module.exports = Certificate;

