const test = require('node:test');
const assert = require('node:assert/strict');
const {
  User,
  JobSeeker,
  JOB_SEEKING_STATUS,
  Recruiter,
  Admin,
  Profile,
  Education,
  Experience,
  Project,
  Award,
  Certificate,
  CareerPreference,
  Skill,
} = require('../../src/domain/entities');

test('User entity behavior', () => {
  const user = new User({
    id: 'user-uuid-1',
    fullName: 'Nguyen Van A',
    avatar: 'https://example.com/avatar.png',
    phone: '0123456789',
  });

  const res = user.toResponseFormat();
  assert.equal(res.id, 'user-uuid-1');
  assert.equal(res.fullName, 'Nguyen Van A');
  assert.equal(res.avatar, 'https://example.com/avatar.png');
  assert.equal(res.phone, '0123456789');
});

test('JobSeeker entity behavior', () => {
  const seeker = new JobSeeker({
    userId: '11111111-1111-1111-1111-111111111111',
    jobSeekingStatus: JOB_SEEKING_STATUS.LOOKING,
  });

  assert.equal(seeker.isLooking(), true);
  assert.equal(seeker.isOpenToOffer(), false);

  seeker.updateStatus(JOB_SEEKING_STATUS.OPEN_TO_OFFER);
  assert.equal(seeker.isOpenToOffer(), true);
  assert.throws(() => seeker.updateStatus('INVALID_STATUS'));
});

test('Recruiter entity behavior', () => {
  const recruiter = new Recruiter({
    userId: '22222222-2222-2222-2222-222222222222',
    position: 'HR Manager',
  });

  assert.equal(recruiter.isVerified, false);
  recruiter.verify();
  assert.equal(recruiter.isVerified, true);

  assert.equal(recruiter.hasCompany(), false);
  recruiter.assignCompany('33333333-3333-3333-3333-333333333333');
  assert.equal(recruiter.hasCompany(), true);
});

test('Admin entity behavior', () => {
  const admin = new Admin({
    userId: '44444444-4444-4444-4444-444444444444',
  });
  const res = admin.toResponseFormat();
  assert.equal(res.userId, '44444444-4444-4444-4444-444444444444');
});

test('Experience entity duration calculation', () => {
  const exp = new Experience({
    experienceId: 'exp-1',
    companyName: 'Tech Corp',
    position: 'Backend Developer',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-07-01'),
  });

  assert.equal(exp.isCurrent(), false);
  assert.equal(exp.getDurationInMonths(), 6);
});

test('Certificate entity expiration check', () => {
  const expiredCert = new Certificate({
    certificateId: 'cert-1',
    certificateName: 'AWS Certified Solutions Architect',
    issuer: 'Amazon',
    issueDate: new Date('2020-01-01'),
    expiryDate: new Date('2022-01-01'),
  });

  assert.equal(expiredCert.isExpired(), true);

  const activeCert = new Certificate({
    certificateId: 'cert-2',
    certificateName: 'CKA',
    issuer: 'Linux Foundation',
    issueDate: new Date('2025-01-01'),
    expiryDate: new Date('2030-01-01'),
  });

  assert.equal(activeCert.isExpired(), false);
});

test('Profile entity composition and completeness calculation', () => {
  const profile = new Profile({
    userId: 'profile-user-1',
    contactEmail: 'vana@example.com',
    phone: '0901234567',
    educations: [
      {
        educationId: 'edu-1',
        institution: 'HUST',
        major: 'IT',
        startDate: '2020-09-01',
      },
    ],
    skills: [
      { skillId: 'skill-1', skillName: 'Node.js' },
    ],
  });

  assert.equal(profile.educations.length, 1);
  assert.equal(profile.educations[0] instanceof Education, true);
  assert.equal(profile.skills.length, 1);
  assert.equal(profile.skills[0] instanceof Skill, true);
  assert.equal(profile.calculateCompleteness() > 0, true);
});

