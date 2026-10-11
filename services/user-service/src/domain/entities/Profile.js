const Education = require('./Education');
const Experience = require('./Experience');
const Project = require('./Project');
const Award = require('./Award');
const Certificate = require('./Certificate');
const CareerPreference = require('./CareerPreference');
const Skill = require('./Skill');

class Profile {
  constructor({
    userId,
    id,
    contactEmail = null,
    phone = null,
    dateOfBirth = null,
    gender = null,
    address = null,
    githubUrl = null,
    educations = [],
    experiences = [],
    projects = [],
    awards = [],
    certificates = [],
    careerPreferences = null,
    skills = [],
    createdAt,
    updatedAt,
  } = {}) {
    this.userId = userId || id;
    this.contactEmail = contactEmail;
    this.fullName = fullName;
    this.phone = phone;
    this.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    this.gender = gender;
    this.address = address;
    this.githubUrl = githubUrl;

    this.educations = Array.isArray(educations)
      ? educations.map((e) => (e instanceof Education ? e : new Education(e)))
      : [];

    this.experiences = Array.isArray(experiences)
      ? experiences.map((e) => (e instanceof Experience ? e : new Experience(e)))
      : [];

    this.projects = Array.isArray(projects)
      ? projects.map((p) => (p instanceof Project ? p : new Project(p)))
      : [];

    this.awards = Array.isArray(awards)
      ? awards.map((a) => (a instanceof Award ? a : new Award(a)))
      : [];

    this.certificates = Array.isArray(certificates)
      ? certificates.map((c) => (c instanceof Certificate ? c : new Certificate(c)))
      : [];

    this.careerPreferences = careerPreferences
      ? (careerPreferences instanceof CareerPreference
          ? careerPreferences
          : new CareerPreference(careerPreferences))
      : null;

    this.skills = Array.isArray(skills)
      ? skills.map((s) => {
          // Supports both Skill and ProfileSkill relation `{ skill: { ... } }`
          const skillData = s.skill || s;
          return skillData instanceof Skill ? skillData : new Skill(skillData);
        })
      : [];

    this.createdAt = createdAt ? new Date(createdAt) : undefined;
    this.updatedAt = updatedAt ? new Date(updatedAt) : undefined;
  }

  calculateCompleteness() {
    const weights = {
      fullName: 15,
      contactEmail: 15,
      phone: 10,
      address: 10,
      educations: 15,
      experiences: 15,
      skills: 15,
      careerPreferences: 10,
    };

    let score = 0;
    if (this.fullName) score += weights.fullName;
    if (this.contactEmail) score += weights.contactEmail;
    if (this.phone) score += weights.phone;
    if (this.address) score += weights.address;
    if (this.educations.length > 0) score += weights.educations;
    if (this.experiences.length > 0) score += weights.experiences;
    if (this.skills.length > 0) score += weights.skills;
    if (this.careerPreferences) score += weights.careerPreferences;

    return Math.min(100, score);
  }

  toResponseFormat() {
    return {
      userId: this.userId,
      contactEmail: this.contactEmail,
      fullName: this.fullName,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      address: this.address,
      githubUrl: this.githubUrl,
      completeness: this.calculateCompleteness(),
      educations: this.educations.map((e) => e.toResponseFormat()),
      experiences: this.experiences.map((e) => e.toResponseFormat()),
      projects: this.projects.map((p) => p.toResponseFormat()),
      awards: this.awards.map((a) => a.toResponseFormat()),
      certificates: this.certificates.map((c) => c.toResponseFormat()),
      careerPreferences: this.careerPreferences ? this.careerPreferences.toResponseFormat() : null,
      skills: this.skills.map((s) => s.toResponseFormat()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Profile;

