import { closeRabbitMQ } from '#shared/rabbitmq/connection.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import config from '../../src/config/env.config.js';
import applicationRepository from '../../src/repositories/application.repository.js';

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
  } finally {
    server.close();
  }
});

test('POST /api/v1/applications/apply - 201 applies job successfully', async () => {
  const originalFind = applicationRepository.findApplicationBySeekerAndJob;
  const originalCreate = applicationRepository.createApplication;

  applicationRepository.findApplicationBySeekerAndJob = async () => null;
  applicationRepository.createApplication = async (data) => ({
    applicationId: APP_ID,
    ...data,
    applicationStatus: 'APPLIED',
    appliedAt: new Date().toISOString(),
  });

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/applications/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`,
      },
      body: JSON.stringify({
        jobId: JOB_ID,
        cvUrl: 'https://r2.example.com/cv.pdf',
        cvTitle: 'Senior Fullstack CV',
        coverLetter: 'Tôi có 5 năm kinh nghiệm...',
      }),
    });
    const json = await res.json();

    assert.equal(res.status, 201);
    assert.equal(json.status, 'success');
    assert.equal(json.data.applicationId, APP_ID);
    assert.equal(json.data.cvUrl, 'https://r2.example.com/cv.pdf');
    assert.equal(json.data.cvTitle, 'Senior Fullstack CV');
  } finally {
    applicationRepository.findApplicationBySeekerAndJob = originalFind;
    applicationRepository.createApplication = originalCreate;
    server.close();
  }
});

test('PATCH /api/v1/applications/:id/status - 200 recruiter updates candidate status', async () => {
  const originalFind = applicationRepository.findApplicationById;
  const originalUpdate = applicationRepository.updateApplicationStatus;

  applicationRepository.findApplicationById = async (id) => ({
    applicationId: id,
    jobSeekerId: SEEKER_ID,
    applicationStatus: 'VIEWED',
    jobPost: { recruiterId: RECRUITER_ID },
  });

  applicationRepository.updateApplicationStatus = async (id, { status }) => ({
    applicationId: id,
    applicationStatus: status,
    updatedAt: new Date().toISOString(),
  });

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/applications/${APP_ID}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        status: 'INTERVIEW',
        note: 'Phỏng vấn trực tiếp',
      }),
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

test('PATCH /api/v1/applications/:id/withdraw - 200 seeker withdraws application successfully without body', async () => {
  const originalFind = applicationRepository.findApplicationById;
  const originalWithdraw = applicationRepository.withdrawApplication;

  applicationRepository.findApplicationById = async (id) => ({
    applicationId: id,
    jobSeekerId: SEEKER_ID,
    applicationStatus: 'APPLIED',
  });

  applicationRepository.withdrawApplication = async (id, seekerId, note) => ({
    applicationId: id,
    jobSeekerId: seekerId,
    applicationStatus: 'WITHDRAWN',
    note,
    updatedAt: new Date().toISOString(),
  });

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/applications/${APP_ID}/withdraw`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${seekerToken}`,
      },
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.applicationStatus, 'WITHDRAWN');
  } finally {
    applicationRepository.findApplicationById = originalFind;
    applicationRepository.withdrawApplication = originalWithdraw;
    server.close();
  }
});

test.after(async () => {
  await closeRabbitMQ();
});
