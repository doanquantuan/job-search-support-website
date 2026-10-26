import test from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../../src/config/prisma.js';
import { handleUserEvent } from '../../src/workers/authEvent.worker.js';

test('authEvent.worker - handleUserEvent synchronizes User and creates JobSeeker profile', async () => {
  const originalTransaction = prisma.$transaction;

  let upsertArgs = null;
  let jobSeekerCreateArgs = null;
  let findUniqueCalled = false;

  const mockTx = {
    user: {
      upsert: async (args) => {
        upsertArgs = args;
        return { id: args.where.id, ...args.create };
      },
    },
    jobSeeker: {
      findUnique: async () => {
        findUniqueCalled = true;
        return null;
      },
      create: async (args) => {
        jobSeekerCreateArgs = args;
        return { userId: args.data.userId };
      },
    },
  };

  prisma.$transaction = async (callback) => {
    return callback(mockTx);
  };

  try {
    const payload = {
      userId: '11111111-2222-3333-4444-555555555555',
      email: 'newuser@example.com',
      fullName: 'Nguyen Van A',
      avatar: 'https://example.com/avatar.png',
      phone: '0987654321',
      role: 'JOB_SEEKER',
      isVerified: true,
    };

    await handleUserEvent(payload);

    assert.ok(upsertArgs, 'tx.user.upsert phải được gọi');
    assert.equal(upsertArgs.where.id, payload.userId);
    assert.equal(upsertArgs.create.email, 'newuser@example.com');
    assert.equal(upsertArgs.create.fullName, 'Nguyen Van A');
    assert.equal(upsertArgs.create.role, 'JOB_SEEKER');
    assert.equal(upsertArgs.create.status, 'ACTIVE');
    assert.equal(upsertArgs.create.isVerified, true);

    assert.ok(findUniqueCalled, 'tx.jobSeeker.findUnique phải được gọi');
    assert.ok(jobSeekerCreateArgs, 'tx.jobSeeker.create phải được gọi');
    assert.equal(jobSeekerCreateArgs.data.userId, payload.userId);
    assert.equal(jobSeekerCreateArgs.data.profile.create.contactEmail, 'newuser@example.com');
    assert.equal(jobSeekerCreateArgs.data.profile.create.fullName, 'Nguyen Van A');
  } finally {
    prisma.$transaction = originalTransaction;
  }
});

test('authEvent.worker - handleUserEvent synchronizes User and creates Recruiter', async () => {
  const originalTransaction = prisma.$transaction;

  let upsertArgs = null;
  let recruiterCreateArgs = null;

  const mockTx = {
    user: {
      upsert: async (args) => {
        upsertArgs = args;
        return { id: args.where.id, ...args.create };
      },
    },
    recruiter: {
      findUnique: async () => null,
      create: async (args) => {
        recruiterCreateArgs = args;
        return { userId: args.data.userId };
      },
    },
  };

  prisma.$transaction = async (callback) => callback(mockTx);

  try {
    const payload = {
      userId: '22222222-3333-4444-5555-666666666666',
      email: 'hr@company.com',
      fullName: 'Recruiter Manager',
      role: 'RECRUITER',
      isVerified: true,
    };

    await handleUserEvent(payload);

    assert.ok(upsertArgs, 'tx.user.upsert phải được gọi');
    assert.equal(upsertArgs.where.id, payload.userId);
    assert.equal(upsertArgs.create.role, 'RECRUITER');

    assert.ok(recruiterCreateArgs, 'tx.recruiter.create phải được gọi');
    assert.equal(recruiterCreateArgs.data.userId, payload.userId);
    assert.equal(recruiterCreateArgs.data.isVerified, false);
  } finally {
    prisma.$transaction = originalTransaction;
  }
});

test('authEvent.worker - skips processing when userId is missing', async () => {
  const originalTransaction = prisma.$transaction;
  let transactionCalled = false;

  prisma.$transaction = async () => {
    transactionCalled = true;
  };

  try {
    await handleUserEvent({ email: 'nouserid@example.com' });
    assert.equal(transactionCalled, false, 'Không được gọi transaction nếu thiếu userId');
  } finally {
    prisma.$transaction = originalTransaction;
  }
});
