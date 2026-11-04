const test = require('node:test');
const assert = require('node:assert/strict');
const cvService = require('../../src/services/cv.service');
const cvRepository = require('../../src/repositories/cv.repository');

const SEEKER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_SEEKER_ID = '22222222-2222-2222-2222-222222222222';
const CV_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

test('CVService.createCV - throws BadRequestError when jobSeekerId is missing', async () => {
  await assert.rejects(
    async () => {
      await cvService.createCV(null, { title: 'My Resume' });
    },
    {
      statusCode: 400,
      message: /ID ứng viên không hợp lệ/i,
    }
  );
});

test('CVService.createCV - throws BadRequestError when title is missing', async () => {
  await assert.rejects(
    async () => {
      await cvService.createCV(SEEKER_ID, { title: '' });
    },
    {
      statusCode: 400,
      message: /Tiêu đề CV không được để trống/i,
    }
  );
});

test('CVService.createCV - creates UPLOADED CV successfully', async () => {
  const originalCreate = cvRepository.createCV;

  cvRepository.createCV = async (data) => ({
    cvId: CV_ID,
    ...data,
    createdAt: new Date(),
  });

  try {
    const res = await cvService.createCV(SEEKER_ID, {
      title: 'Backend Developer Resume',
      type: 'UPLOADED',
      fileUrl: 'https://storage.example.com/cv.pdf',
    });

    assert.equal(res.cvId, CV_ID);
    assert.equal(res.title, 'Backend Developer Resume');
    assert.equal(res.type, 'UPLOADED');
    assert.equal(res.fileUrl, 'https://storage.example.com/cv.pdf');
  } finally {
    cvRepository.createCV = originalCreate;
  }
});

test('CVService.deleteCV - throws ForbiddenError when trying to delete other user CV', async () => {
  const originalFindCV = cvRepository.findCVById;

  cvRepository.findCVById = async (id) => ({
    cvId: id,
    jobSeekerId: OTHER_SEEKER_ID,
  });

  try {
    await assert.rejects(
      async () => {
        await cvService.deleteCV(CV_ID, SEEKER_ID);
      },
      {
        statusCode: 403,
        message: /Bạn không có quyền xóa CV này/i,
      }
    );
  } finally {
    cvRepository.findCVById = originalFindCV;
  }
});

