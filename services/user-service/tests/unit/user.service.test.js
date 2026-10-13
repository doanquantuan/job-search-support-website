const test = require('node:test');
const assert = require('node:assert/strict');
const userService = require('../../src/services/user.service');
const userRepository = require('../../src/repositories/user.repository');
const { NotFoundError, BadRequestError } = require('../../src/utils/errors.util');

test('UserService.getProfile - throws BadRequestError when userId is missing', async () => {
  await assert.rejects(
    () => userService.getProfile({ userId: null }),
    BadRequestError
  );
});

test('UserService.getProfile - returns JOB_SEEKER profile with relations', async () => {
  const originalFindJobSeeker = userRepository.findJobSeekerByUserId;

  userRepository.findJobSeekerByUserId = async (userId) => ({
    userId,
    jobSeekingStatus: 'LOOKING',
    profile: {
      userId,
      contactEmail: 'candidate@example.com',
      fullName: 'Tran Van B',
      phone: '0912345678',
      educations: [
        {
          educationId: 'edu-1',
          institution: 'HCMUT',
          major: 'CS',
          startDate: '2020-01-01',
        },
      ],
      experiences: [],
      skills: [
        {
          skill: {
            skillId: 's-1',
            skillName: 'JavaScript',
          },
        },
      ],
      careerPreferences: {
        careerPreferenceId: 'cp-1',
        expectedSalaryMin: 1000,
        expectedSalaryMax: 2000,
      },
    },
  });

  try {
    const result = await userService.getProfile({
      userId: 'test-user-id',
      role: 'JOB_SEEKER',
    });

    assert.equal(result.role, 'JOB_SEEKER');
    assert.equal(result.jobSeekingStatus, 'LOOKING');
    assert.equal(result.profile.contactEmail, 'candidate@example.com');
    assert.equal(result.profile.fullName, 'Tran Van B');
    assert.equal(result.profile.educations.length, 1);
    assert.equal(result.profile.skills.length, 1);
    assert.equal(result.profile.skills[0].skillName, 'JavaScript');
    assert.equal(result.profile.careerPreferences.expectedSalaryMin, 1000);
  } finally {
    userRepository.findJobSeekerByUserId = originalFindJobSeeker;
  }
});

test('UserService.getProfile - returns RECRUITER profile', async () => {
  const originalFindRecruiter = userRepository.findRecruiterByUserId;

  userRepository.findRecruiterByUserId = async (userId) => ({
    userId,
    position: 'Tech Recruiter',
    isVerified: true,
    companyId: 'company-uuid-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    const result = await userService.getProfile({
      userId: 'recruiter-id-1',
      role: 'RECRUITER',
    });

    assert.equal(result.role, 'RECRUITER');
    assert.equal(result.position, 'Tech Recruiter');
    assert.equal(result.isVerified, true);
    assert.equal(result.companyId, 'company-uuid-123');
  } finally {
    userRepository.findRecruiterByUserId = originalFindRecruiter;
  }
});

test('UserService.getProfile - throws NotFoundError when user does not exist', async () => {
  const originalFindJobSeeker = userRepository.findJobSeekerByUserId;
  const originalFindProfile = userRepository.findProfileByUserId;
  const originalFindRecruiter = userRepository.findRecruiterByUserId;
  const originalFindAdmin = userRepository.findAdminByUserId;

  userRepository.findJobSeekerByUserId = async () => null;
  userRepository.findProfileByUserId = async () => null;
  userRepository.findRecruiterByUserId = async () => null;
  userRepository.findAdminByUserId = async () => null;

  try {
    await assert.rejects(
      () => userService.getProfile({ userId: 'unknown-id', role: 'JOB_SEEKER' }),
      NotFoundError
    );
  } finally {
    userRepository.findJobSeekerByUserId = originalFindJobSeeker;
    userRepository.findProfileByUserId = originalFindProfile;
    userRepository.findRecruiterByUserId = originalFindRecruiter;
    userRepository.findAdminByUserId = originalFindAdmin;
  }
});

