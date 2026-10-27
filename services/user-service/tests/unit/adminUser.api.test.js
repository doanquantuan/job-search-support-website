import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
jest.unstable_mockModule('#shared/rabbitmq/publisher.js', () => ({ publish: jest.fn().mockResolvedValue(true) }));
import jwt from 'jsonwebtoken';
const { default: app } = await import('../../src/app.js');
import adminUserRepository from '../../src/repositories/adminUser.repository.js';

const ADMIN_ID = '99999999-9999-9999-9999-999999999999';
const TARGET_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const adminToken = jwt.sign(
  { id: ADMIN_ID, email: 'admin@jobsearch.com', role: 'ADMIN' },
  (process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_key_123456789')
);

const seekerToken = jwt.sign(
  { id: TARGET_USER_ID, email: 'seeker@jobsearch.com', role: 'JOB_SEEKER' },
  (process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_key_123456789')
);

describe('Admin APIs', () => {
  let server;
  let baseUrl;

  beforeAll((done) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('401 when no token is provided', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/users`);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.status).toBe('error');
  });

  test('403 when non-admin user accesses', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/users`, {
      headers: { Authorization: `Bearer ${seekerToken}` },
    });
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.status).toBe('error');
    expect(json.message).toMatch(/không có quyền/i);
  });

  test('GET /api/v1/admin/users - 200 returns paginated user list with filters', async () => {
    const originalFindAll = adminUserRepository.findAllUsers;
    adminUserRepository.findAllUsers = async (query) => {
      expect(query.search).toBe('developer');
      expect(query.role).toBe('JOB_SEEKER');
      expect(query.status).toBe('ACTIVE');

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
        `${baseUrl}/api/v1/admin/users?search=developer&role=JOB_SEEKER&status=ACTIVE`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe('success');
      expect(json.data.data.length).toBe(1);
      expect(json.data.data[0].email).toBe('developer@example.com');
      expect(json.data.pagination.totalItems).toBe(1);
    } finally {
      adminUserRepository.findAllUsers = originalFindAll;
    }
  });

  test('GET /api/v1/admin/users/:id - 200 returns detailed user profile', async () => {
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
      const res = await fetch(`${baseUrl}/api/v1/admin/users/${TARGET_USER_ID}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe('success');
      expect(json.data.id).toBe(TARGET_USER_ID);
      expect(json.data.jobSeeker.jobSeekingStatus).toBe('LOOKING');
    } finally {
      adminUserRepository.findUserDetailById = originalFindDetail;
    }
  });

  test('PATCH /api/v1/admin/users/:id/status - 400 when blocking without reason', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/users/${TARGET_USER_ID}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'BLOCKED' }), // Thiếu reason
    });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.status).toBe('error');
    expect(json.message).toMatch(/lý do/i);
  });

  test('PATCH /api/v1/admin/users/:id/status - 400 when admin tries to self-block', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/users/${ADMIN_ID}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'BLOCKED', reason: 'Self blocking test' }),
    });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.status).toBe('error');
    expect(json.message).toMatch(/chính mình/i);
  });

  test('PATCH /api/v1/admin/users/:id/status - 200 locks user with reason', async () => {
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
      const res = await fetch(`${baseUrl}/api/v1/admin/users/${TARGET_USER_ID}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'BLOCKED', reason: 'Spam tin tuyển dụng' }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe('success');
      expect(json.data.status).toBe('BLOCKED');
      expect(json.data.blockReason).toBe('Spam tin tuyển dụng');
      expect(json.data.blockedAt).toBeTruthy();
    } finally {
      adminUserRepository.findUserDetailById = originalFindDetail;
      adminUserRepository.updateUserStatus = originalUpdateStatus;
    }
  });

  test('PATCH /api/v1/admin/users/:id/verify - 200 verifies recruiter company', async () => {
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
      const res = await fetch(`${baseUrl}/api/v1/admin/users/${TARGET_USER_ID}/verify`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'RECRUITER_COMPANY', isVerified: true }),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.status).toBe('success');
      expect(json.data.isVerified).toBe(true);
      expect(json.message).toMatch(/xác minh doanh nghiệp thành công/i);
    } finally {
      adminUserRepository.findUserDetailById = originalFindDetail;
      adminUserRepository.updateRecruiterVerification = originalUpdateRecruiterVerify;
    }
  });
});



