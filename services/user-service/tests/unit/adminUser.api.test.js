const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const config = require('../../src/config/env.config');
const adminUserRepository = require('../../src/repositories/adminUser.repository');

const ADMIN_ID = '99999999-9999-9999-9999-999999999999';
const TARGET_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const adminToken = jwt.sign(
  { id: ADMIN_ID, email: 'admin@jobsearch.com', role: 'ADMIN' },
  config.JWT.ACCESS_SECRET
);

const seekerToken = jwt.sign(
  { id: TARGET_USER_ID, email: 'seeker@jobsearch.com', role: 'JOB_SEEKER' },
  config.JWT.ACCESS_SECRET
);

test('Admin APIs - 401 when no token is provided', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/users`);
    const json = await res.json();

    assert.equal(res.status, 401);
    assert.equal(json.status, 'error');
  } finally {
    server.close();
  }
});

test('Admin APIs - 403 when non-admin user accesses', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/users`, {
      headers: { Authorization: `Bearer ${seekerToken}` },
    });
    const json = await res.json();

    assert.equal(res.status, 403);
    assert.equal(json.status, 'error');
    assert.match(json.message, /không có quyền/i);
  } finally {
    server.close();
  }
});

test('GET /api/v1/admin/users - 200 returns paginated user list with filters', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindAll = adminUserRepository.findAllUsers;
  adminUserRepository.findAllUsers = async (query) => {
    assert.equal(query.search, 'developer');
    assert.equal(query.role, 'JOB_SEEKER');
    assert.equal(query.status, 'ACTIVE');

    return {
      data: [
        {
          id: TARGET_USER_ID,
          email: 'developer@example.com',
          fullName: 'Nguyen Van Dev',
          role: 'JOB_SEEKER',
          status: 'ACTIVE',
          isVerified: true,
          blockReason: null,
          blockedAt: null,
        },
      ],
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  };

  try {
    const res = await fetch(
      `http://127.0.0.1:${port}/api/v1/admin/users?search=developer&role=JOB_SEEKER&status=ACTIVE`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.data.length, 1);
    assert.equal(json.data.data[0].email, 'developer@example.com');
    assert.equal(json.data.pagination.totalItems, 1);
  } finally {
    adminUserRepository.findAllUsers = originalFindAll;
    server.close();
  }
});

test('GET /api/v1/admin/users/:id - 200 returns detailed user profile', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindDetail = adminUserRepository.findUserDetailById;
  adminUserRepository.findUserDetailById = async (id) => {
    if (id === TARGET_USER_ID) {
      return {
        id,
        email: 'developer@example.com',
        fullName: 'Nguyen Van Dev',
        role: 'JOB_SEEKER',
        status: 'ACTIVE',
        jobSeeker: {
          jobSeekingStatus: 'LOOKING',
          profile: {
            phone: '0988888888',
            educations: [],
            experiences: [],
            skills: [],
          },
        },
      };
    }
    return null;
  };

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/users/${TARGET_USER_ID}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.id, TARGET_USER_ID);
    assert.equal(json.data.jobSeeker.jobSeekingStatus, 'LOOKING');
  } finally {
    adminUserRepository.findUserDetailById = originalFindDetail;
    server.close();
  }
});

test('PATCH /api/v1/admin/users/:id/status - 400 when blocking without reason', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/users/${TARGET_USER_ID}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'BLOCKED' }), // Thiếu reason
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.status, 'error');
    assert.match(json.message, /lý do/i);
  } finally {
    server.close();
  }
});

test('PATCH /api/v1/admin/users/:id/status - 400 when admin tries to self-block', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/users/${ADMIN_ID}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'BLOCKED', reason: 'Self blocking test' }),
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.status, 'error');
    assert.match(json.message, /chính mình/i);
  } finally {
    server.close();
  }
});

test('PATCH /api/v1/admin/users/:id/status - 200 locks user with reason', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindDetail = adminUserRepository.findUserDetailById;
  const originalUpdateStatus = adminUserRepository.updateUserStatus;

  adminUserRepository.findUserDetailById = async (id) => ({
    id,
    email: 'violator@example.com',
    status: 'ACTIVE',
  });

  adminUserRepository.updateUserStatus = async (id, data) => ({
    id,
    email: 'violator@example.com',
    status: data.status,
    blockReason: data.blockReason,
    blockedAt: data.blockedAt,
  });

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/users/${TARGET_USER_ID}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'BLOCKED', reason: 'Spam tin tuyển dụng' }),
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.status, 'BLOCKED');
    assert.equal(json.data.blockReason, 'Spam tin tuyển dụng');
    assert.ok(json.data.blockedAt);
  } finally {
    adminUserRepository.findUserDetailById = originalFindDetail;
    adminUserRepository.updateUserStatus = originalUpdateStatus;
    server.close();
  }
});

test('PATCH /api/v1/admin/users/:id/verify - 200 verifies recruiter company', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindDetail = adminUserRepository.findUserDetailById;
  const originalUpdateRecruiterVerify = adminUserRepository.updateRecruiterVerification;

  adminUserRepository.findUserDetailById = async (id) => ({
    id,
    email: 'hr@techcorp.com',
    recruiter: {
      userId: id,
      position: 'HR Manager',
      isVerified: false,
    },
  });

  adminUserRepository.updateRecruiterVerification = async (userId, isVerified) => ({
    userId,
    position: 'HR Manager',
    isVerified,
  });

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/admin/users/${TARGET_USER_ID}/verify`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'RECRUITER_COMPANY', isVerified: true }),
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.isVerified, true);
    assert.match(json.message, /xác minh doanh nghiệp thành công/i);
  } finally {
    adminUserRepository.findUserDetailById = originalFindDetail;
    adminUserRepository.updateRecruiterVerification = originalUpdateRecruiterVerify;
    server.close();
  }
});

