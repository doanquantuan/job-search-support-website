const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const config = require('../../src/config/env.config');
const userRepository = require('../../src/repositories/user.repository');

test('GET /api/v1/users/profile - 401 when no token provided', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/users/profile`);
    const json = await res.json();

    assert.equal(res.status, 401);
    assert.equal(json.status, 'error');
  } finally {
    server.close();
  }
});

test('GET /api/v1/users/profile - 200 with valid token and returns profile data', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindJobSeeker = userRepository.findJobSeekerByUserId;

  const mockUserId = '11111111-1111-1111-1111-111111111111';
  userRepository.findJobSeekerByUserId = async (id) => ({
    userId: id,
    jobSeekingStatus: 'LOOKING',
    profile: {
      userId: id,
      contactEmail: 'user@example.com',
      fullName: 'Le Van C',
      phone: '0987654321',
      dateOfBirth: '2000-01-01T00:00:00.000Z',
      gender: 'MALE',
      address: 'Hanoi, Vietnam',
      githubUrl: 'https://github.com/levanc',
      educations: [],
      experiences: [],
      projects: [],
      awards: [],
      certificates: [],
      careerPreferences: null,
      skills: [],
    },
  });

  const token = jwt.sign(
    { id: mockUserId, email: 'user@example.com', role: 'JOB_SEEKER' },
    config.JWT.ACCESS_SECRET
  );

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.role, 'JOB_SEEKER');
    assert.equal(json.data.userId, mockUserId);
    assert.equal(json.data.profile.fullName, 'Le Van C');
    assert.equal(json.data.profile.contactEmail, 'user@example.com');
  } finally {
    userRepository.findJobSeekerByUserId = originalFindJobSeeker;
    server.close();
  }
});

