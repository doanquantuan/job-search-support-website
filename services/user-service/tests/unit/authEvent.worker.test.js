import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import prisma from '../../src/config/prisma.js';
import { handleUserEvent } from '../../src/events/auth.event.js';

describe('authEvent.worker', () => {
  let originalTransaction;

  beforeEach(() => {
    originalTransaction = prisma.$transaction;
  });

  afterEach(() => {
    prisma.$transaction = originalTransaction;
  });

  test('handleUserEvent synchronizes User and creates JobSeeker profile', async () => {
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

    expect(upsertArgs).toBeTruthy();
    expect(upsertArgs.where.id).toBe(payload.userId);
    expect(upsertArgs.create.email).toBe('newuser@example.com');
    expect(upsertArgs.create.fullName).toBe('Nguyen Van A');
    expect(upsertArgs.create.role).toBe('JOB_SEEKER');
    expect(upsertArgs.create.status).toBe('ACTIVE');
    expect(upsertArgs.create.isVerified).toBe(true);

    expect(findUniqueCalled).toBe(true);
    expect(jobSeekerCreateArgs).toBeTruthy();
    expect(jobSeekerCreateArgs.data.userId).toBe(payload.userId);
    expect(jobSeekerCreateArgs.data.profile.create.contactEmail).toBe('newuser@example.com');
  });

  test('handleUserEvent synchronizes User and creates Recruiter', async () => {
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

    const payload = {
      userId: '22222222-3333-4444-5555-666666666666',
      email: 'hr@company.com',
      fullName: 'Recruiter Manager',
      role: 'RECRUITER',
      isVerified: true,
    };

    await handleUserEvent(payload);

    expect(upsertArgs).toBeTruthy();
    expect(upsertArgs.where.id).toBe(payload.userId);
    expect(upsertArgs.create.role).toBe('RECRUITER');

    expect(recruiterCreateArgs).toBeTruthy();
    expect(recruiterCreateArgs.data.userId).toBe(payload.userId);
    expect(recruiterCreateArgs.data.isVerified).toBe(false);
  });

  test('skips processing when userId is missing', async () => {
    let transactionCalled = false;

    prisma.$transaction = async () => {
      transactionCalled = true;
    };

    await handleUserEvent({ email: 'nouserid@example.com' });
    expect(transactionCalled).toBe(false);
  });
});
