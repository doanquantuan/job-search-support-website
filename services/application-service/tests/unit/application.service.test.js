const { closeRabbitMQ } = require('#shared/rabbitmq/connection.js');
const test = require('node:test');
const assert = require('node:assert/strict');
const applicationService = require('../../src/services/application.service');
const applicationRepository = require('../../src/repositories/application.repository');

const SEEKER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_SEEKER_ID = '22222222-2222-2222-2222-222222222222';
const RECRUITER_ID = '33333333-3333-3333-3333-333333333333';
const JOB_ID = 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj';
const CV_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const APP_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

test('ApplicationService.applyJob - throws ConflictError if already applied', async () => {
  const originalFind = applicationRepository.findApplicationBySeekerAndJob;

  applicationRepository.findApplicationBySeekerAndJob = async (seekerId, jobId) => ({
    applicationId: APP_ID,
    jobSeekerId: seekerId,
    jobId,
    applicationStatus: 'APPLIED',
  });

  try {
    await assert.rejects(
      async () => {
        await applicationService.applyJob(SEEKER_ID, { jobId: JOB_ID });
      },
      {
        statusCode: 409,
        message: /Bạn đã nộp đơn ứng tuyển cho công việc này rồi/i,
      }
    );
  } finally {
    applicationRepository.findApplicationBySeekerAndJob = originalFind;
  }
});

test('ApplicationService.applyJob - creates application successfully with CV snapshot', async () => {
  const originalFindApp = applicationRepository.findApplicationBySeekerAndJob;
  const originalCreateApp = applicationRepository.createApplication;

  applicationRepository.findApplicationBySeekerAndJob = async () => null;
  applicationRepository.createApplication = async (data) => ({
    applicationId: APP_ID,
    ...data,
    applicationStatus: 'APPLIED',
    appliedAt: new Date(),
  });

  try {
    const res = await applicationService.applyJob(SEEKER_ID, {
      jobId: JOB_ID,
      cvId: CV_ID,
      cvUrl: 'https://r2.example.com/cv.pdf',
      cvTitle: 'CV Backend Developer',
      coverLetter: 'Tôi rất quan tâm đến vị trí này',
      jobTitle: 'Backend Developer',
    });

    assert.equal(res.applicationId, APP_ID);
    assert.equal(res.jobSeekerId, SEEKER_ID);
    assert.equal(res.jobId, JOB_ID);
    assert.equal(res.cvUrl, 'https://r2.example.com/cv.pdf');
    assert.equal(res.cvTitle, 'CV Backend Developer');
    assert.equal(res.applicationStatus, 'APPLIED');
  } finally {
    applicationRepository.findApplicationBySeekerAndJob = originalFindApp;
    applicationRepository.createApplication = originalCreateApp;
  }
});

test('ApplicationService.withdrawApplication - throws ForbiddenError if not applicant', async () => {
  const originalFindApp = applicationRepository.findApplicationById;

  applicationRepository.findApplicationById = async (id) => ({
    applicationId: id,
    jobSeekerId: OTHER_SEEKER_ID,
    applicationStatus: 'APPLIED',
  });

  try {
    await assert.rejects(
      async () => {
        await applicationService.withdrawApplication(SEEKER_ID, APP_ID, 'Rút đơn');
      },
      {
        statusCode: 403,
        message: /Bạn không có quyền rút đơn ứng tuyển của người khác/i,
      }
    );
  } finally {
    applicationRepository.findApplicationById = originalFindApp;
  }
});

test('ApplicationService.withdrawApplication - throws BadRequestError if already HIRED', async () => {
  const originalFindApp = applicationRepository.findApplicationById;

  applicationRepository.findApplicationById = async (id) => ({
    applicationId: id,
    jobSeekerId: SEEKER_ID,
    applicationStatus: 'HIRED',
  });

  try {
    await assert.rejects(
      async () => {
        await applicationService.withdrawApplication(SEEKER_ID, APP_ID, 'Rút đơn');
      },
      {
        statusCode: 400,
        message: /Không thể rút đơn khi kết quả đã là/i,
      }
    );
  } finally {
    applicationRepository.findApplicationById = originalFindApp;
  }
});

test('ApplicationService.updateApplicationStatus - updates status and records history', async () => {
  const originalFindApp = applicationRepository.findApplicationById;
  const originalUpdate = applicationRepository.updateApplicationStatus;

  applicationRepository.findApplicationById = async (id) => ({
    applicationId: id,
    jobSeekerId: SEEKER_ID,
    applicationStatus: 'REVIEWING',
  });

  applicationRepository.updateApplicationStatus = async (id, { status, changedBy, note }) => ({
    applicationId: id,
    applicationStatus: status,
    updatedAt: new Date(),
  });

  try {
    const res = await applicationService.updateApplicationStatus(RECRUITER_ID, APP_ID, {
      status: 'INTERVIEW',
      note: 'Mời ứng viên tham gia phỏng vấn kỹ thuật vòng 1',
    });

    assert.equal(res.applicationId, APP_ID);
    assert.equal(res.applicationStatus, 'INTERVIEW');
  } finally {
    applicationRepository.findApplicationById = originalFindApp;
    applicationRepository.updateApplicationStatus = originalUpdate;
  }
});

test.after(async () => {
  await closeRabbitMQ();
});
