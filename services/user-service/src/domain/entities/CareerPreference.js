class CareerPreference {
  constructor({
    careerPreferenceId,
    id,
    userId,
    expectedSalaryMin = null,
    expectedSalaryMax = null,
    preferredLocation = null,
    careerGoal = null,
  } = {}) {
    this.careerPreferenceId = careerPreferenceId || id;
    this.userId = userId;
    this.expectedSalaryMin = expectedSalaryMin !== null && expectedSalaryMin !== undefined
      ? Number(expectedSalaryMin)
      : null;
    this.expectedSalaryMax = expectedSalaryMax !== null && expectedSalaryMax !== undefined
      ? Number(expectedSalaryMax)
      : null;
    this.preferredLocation = preferredLocation;
    this.careerGoal = careerGoal;
  }

  hasSalaryExpectation() {
    return this.expectedSalaryMin !== null || this.expectedSalaryMax !== null;
  }

  isValidSalaryRange() {
    if (this.expectedSalaryMin !== null && this.expectedSalaryMax !== null) {
      return this.expectedSalaryMin <= this.expectedSalaryMax;
    }
    return true;
  }

  toResponseFormat() {
    return {
      careerPreferenceId: this.careerPreferenceId,
      userId: this.userId,
      expectedSalaryMin: this.expectedSalaryMin,
      expectedSalaryMax: this.expectedSalaryMax,
      preferredLocation: this.preferredLocation,
      careerGoal: this.careerGoal,
    };
  }
}

module.exports = CareerPreference;

