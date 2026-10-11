const JOB_SEEKING_STATUS = Object.freeze({
  LOOKING: 'LOOKING',
  OPEN_TO_OFFER: 'OPEN_TO_OFFER',
  NOT_LOOKING: 'NOT_LOOKING',
});

class JobSeeker {
  constructor({
    userId,
    id,
    jobSeekingStatus = JOB_SEEKING_STATUS.LOOKING,
    profile = null,
    createdAt,
    updatedAt,
  } = {}) {
    this.userId = userId || id;
    this.jobSeekingStatus = jobSeekingStatus;
    this.profile = profile;
    this.createdAt = createdAt ? new Date(createdAt) : undefined;
    this.updatedAt = updatedAt ? new Date(updatedAt) : undefined;
  }

  isLooking() {
    return this.jobSeekingStatus === JOB_SEEKING_STATUS.LOOKING;
  }

  isOpenToOffer() {
    return this.jobSeekingStatus === JOB_SEEKING_STATUS.OPEN_TO_OFFER;
  }

  isNotLooking() {
    return this.jobSeekingStatus === JOB_SEEKING_STATUS.NOT_LOOKING;
  }

  updateStatus(newStatus) {
    if (!Object.values(JOB_SEEKING_STATUS).includes(newStatus)) {
      throw new Error(`Trạng thái tìm việc không hợp lệ: ${newStatus}`);
    }
    this.jobSeekingStatus = newStatus;
  }

  toResponseFormat() {
    return {
      userId: this.userId,
      jobSeekingStatus: this.jobSeekingStatus,
      profile: this.profile && typeof this.profile.toResponseFormat === 'function'
        ? this.profile.toResponseFormat()
        : this.profile,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = {
  JobSeeker,
  JOB_SEEKING_STATUS,
};

