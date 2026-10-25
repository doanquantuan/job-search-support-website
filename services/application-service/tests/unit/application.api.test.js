const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const config = require('../../src/config/env.config');
const applicationRepository = require('../../src/repositories/application.repository');

const SEEKER_ID = '11111111-1111-1111-1111-111111111111';
const RECRUITER_ID = '22222222-2222-2222-2222-222222222222';
const JOB_ID = 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj';
const APP_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const seekerToken = jwt.sign(
  { id: SEEKER_ID, email: 'seeker@example.com', role: 'JOB_SEEKER' },
  config.JWT.ACCESS_SECRET,
);

const recruiterToken = jwt.sign(
  { id: RECRUITER_ID, email: 'recruiter@company.com', role: 'RECRUITER' },
  config.JWT.ACCESS_SECRET,
);

test('Application APIs - 401 when no token is provided', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/applications/me`);
    const json = await res.json();

    assert.equal(res.status, 401);
    assert.equal(json.status, 'error');
  } finally {
    server.close();
  }
});

test('Application APIs - 403 when recruiter accesses seeker endpoint', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/applications/me`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();

    assert.equal(res.status, 403);
    assert.equal(json.status, 'error');
    assert.match(json.message, /không có quyền/i);
  } finally {
    server.close();
  }
});

test('POST /api/v1/applications/apply - 201 applies job successfully', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFind = applicationRepository.findApplicationBySeekerAndJob;
  const originalCreate = applicationRepository.createApplication;

  applicationRepository.findApplicationBySeekerAndJob = async () => null;
  applicationRepository.createApplication = async (data) => ({
    applicationId: APP_ID,
    jobSeekerId: SEEKER_ID,
    jobId: data.jobId,
    applicationStatus: 'APPLIED',
    appliedAt: new Date().toISOString(),
  });

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/applications/apply`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${seekerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId: JOB_ID }),
    });
    const json = await res.json();

    assert.equal(res.status, 201);
    assert.equal(json.status, 'success');
    assert.equal(json.data.applicationId, APP_ID);
    assert.equal(json.data.applicationStatus, 'APPLIED');
  } finally {
    applicationRepository.findApplicationBySeekerAndJob = originalFind;
    applicationRepository.createApplication = originalCreate;
    server.close();
  }
});

test('PATCH /api/v1/applications/:id/status - 200 recruiter updates candidate status', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFind = applicationRepository.findApplicationById;
  const originalUpdate = applicationRepository.updateApplicationStatus;

  applicationRepository.findApplicationById = async (id) => ({
    applicationId: id,
    jobSeekerId: SEEKER_ID,
    applicationStatus: 'APPLIED',
  });

  applicationRepository.updateApplicationStatus = async (id, { status, note }) => ({
    applicationId: id,
    applicationStatus: status,
    note,
    updatedAt: new Date().toISOString(),
  });

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/applications/${APP_ID}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${recruiterToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'INTERVIEW', note: 'Phỏng vấn trực tiếp' }),
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.applicationStatus, 'INTERVIEW');
  } finally {
    applicationRepository.findApplicationById = originalFind;
    applicationRepository.updateApplicationStatus = originalUpdate;
    server.close();
  }
});
