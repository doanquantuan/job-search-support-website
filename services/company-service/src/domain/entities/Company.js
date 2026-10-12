class Company {
  constructor({
    companyId,
    recruiterId,
    locationId,
    companyName,
    logo,
    description,
    website,
    email,
    phone,
    taxCode,
    companySize = 'SIZE_1_10',
    industry,
    businessLicenseUrl,
    environmentPhotos = [],
    verificationStatus = 'PENDING',
    rejectionReason = null,
    adminNote = null,
    verifiedBy = null,
    verifiedAt = null,
    location = null,
    createdAt,
    updatedAt,
  }) {
    this.companyId = companyId;
    this.recruiterId = recruiterId;
    this.locationId = locationId;
    this.companyName = companyName;
    this.logo = logo;
    this.description = description;
    this.website = website;
    this.email = email;
    this.phone = phone;
    this.taxCode = taxCode;
    this.companySize = companySize;
    this.industry = industry;
    this.businessLicenseUrl = businessLicenseUrl;
    this.environmentPhotos = environmentPhotos;
    this.verificationStatus = verificationStatus;
    this.rejectionReason = rejectionReason;
    this.adminNote = adminNote;
    this.verifiedBy = verifiedBy;
    const Location = require('./Location');
    this.location = location ? (location instanceof Location ? location : new Location(location)) : null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isVerified() {
    return this.verificationStatus === 'APPROVED' || this.verificationStatus === 'VERIFIED';
  }

  isPending() {
    return this.verificationStatus === 'PENDING';
  }

  isRejected() {
    return this.verificationStatus === 'REJECTED';
  }

  requiresAdditionalInfo() {
    return this.verificationStatus === 'ADDITIONAL_INFO_REQUIRED';
  }

  canUpdateVerification() {
    return this.isRejected() || this.requiresAdditionalInfo();
  }

  isOwnedBy(recruiterId) {
    return this.recruiterId === recruiterId;
  }

  toVerificationStatusResponse() {
    return {
      companyId: this.companyId,
      companyName: this.companyName,
      taxCode: this.taxCode,
      verificationStatus: this.verificationStatus,
      rejectionReason: this.rejectionReason,
      adminNote: this.adminNote,
      verifiedAt: this.verifiedAt,
      submittedAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toInternalProfile() {
    return {
      companyId: this.companyId,
      recruiterId: this.recruiterId,
      companyName: this.companyName,
      logo: this.logo,
      taxCode: this.taxCode,
      companySize: this.companySize,
      industry: this.industry,
      description: this.description,
      website: this.website,
      email: this.email,
      phone: this.phone,
      businessLicenseUrl: this.businessLicenseUrl,
      environmentPhotos: this.environmentPhotos,
      verificationStatus: this.verificationStatus,
      rejectionReason: this.rejectionReason,
      adminNote: this.adminNote,
      verifiedAt: this.verifiedAt,
      location: this.location ? (this.location.toJSON ? this.location.toJSON() : this.location) : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toPublicProfile() {
    return {
      companyId: this.companyId,
      companyName: this.companyName,
      logo: this.logo,
      description: this.description,
      website: this.website,
      email: this.email,
      phone: this.phone,
      companySize: this.companySize,
      industry: this.industry,
      environmentPhotos: this.environmentPhotos,
      location: this.location ? (this.location.toJSON ? this.location.toJSON() : this.location) : null,
      verificationStatus: this.verificationStatus,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Company;
