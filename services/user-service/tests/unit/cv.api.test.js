const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const config = require('../../src/config/env.config');
const cvRepository = require('../../src/repositories/cv.repository');
const fileService = require('../../src/services/file.service');

const SEEKER_ID = '11111111-1111-1111-1111-111111111111';
const RECRUITER_ID = '33333333-3333-3333-3333-333333333333';

const seekerToken = jwt.sign(
  { id: SEEKER_ID, userId: SEEKER_ID, email: 'seeker@example.com', role: 'JOB_SEEKER' },
  config.JWT.ACCESS_SECRET
);

const recruiterToken = jwt.sign(
  { id: RECRUITER_ID, userId: RECRUITER_ID, email: 'recruiter@example.com', role: 'RECRUITER' },
  config.JWT.ACCESS_SECRET
);

test('CV APIs - 401 when no token is provided', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs`);
    const json = await res.json();

    assert.equal(res.status, 401);
    assert.equal(json.status, 'error');
  } finally {
    server.close();
  }
});

test('CV APIs - 403 when non-job-seeker accesses', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs`, {
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

test('POST /api/v1/job-seekers/me/cvs - 400 when no file is uploaded', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const formData = new FormData();
    formData.append('title', 'My Empty CV');

    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: formData,
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.status, 'error');
    assert.match(json.message, /Vui lòng chọn tập tin CV/i);
  } finally {
    server.close();
  }
});

test('POST /api/v1/job-seekers/me/cvs - 400 when file format is invalid', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const formData = new FormData();
    const fakeContent = Buffer.from('executable binary code');
    formData.append('cv', new Blob([fakeContent], { type: 'application/x-msdownload' }), 'malware.exe');

    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: formData,
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.status, 'error');
    assert.match(json.message, /Định dạng tài liệu CV không hợp lệ/i);
  } finally {
    server.close();
  }
});

test('POST /api/v1/job-seekers/me/cvs - 400 when CV limit of 5 is exceeded', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalCount = cvRepository.countByUserId;
  cvRepository.countByUserId = async () => 5;

  try {
    const formData = new FormData();
    const pdfContent = Buffer.from('%PDF-1.4 mock cv file');
    formData.append('cv', new Blob([pdfContent], { type: 'application/pdf' }), 'cv_6.pdf');

    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: formData,
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.status, 'error');
    assert.match(json.message, /tối đa 5 CV/i);
  } finally {
    cvRepository.countByUserId = originalCount;
    server.close();
  }
});

test('POST /api/v1/job-seekers/me/cvs - 201 successfully uploads CV and saves to R2 under documents/cvs/', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalCount = cvRepository.countByUserId;
  const originalCreate = cvRepository.create;
  const originalUploadDoc = fileService.uploadDocument;

  let uploadDocCalledWith = null;
  let repoCreateCalledWith = null;

  cvRepository.countByUserId = async () => 0;
  fileService.uploadDocument = async (params) => {
    uploadDocCalledWith = params;
    return {
      key: `documents/cvs/1729600000000_abc123456789.pdf`,
      url: `https://pub-5d933c4c40b54437a90a14c0ceb6b767.r2.dev/documents/cvs/1729600000000_abc123456789.pdf`,
      size: 1024,
    };
  };

  cvRepository.create = async (data) => {
    repoCreateCalledWith = data;
    return {
      cvId: 'mock-cv-uuid-1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  try {
    const formData = new FormData();
    const pdfContent = Buffer.from('%PDF-1.4 my real cv content');
    formData.append('cv', new Blob([pdfContent], { type: 'application/pdf' }), 'Nguyen_Van_A_CV.pdf');
    formData.append('title', 'CV Frontend Developer');

    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: formData,
    });
    const json = await res.json();

    assert.equal(res.status, 201);
    assert.equal(json.status, 'success');
    assert.equal(json.data.title, 'CV Frontend Developer');
    assert.equal(json.data.type, 'UPLOADED');
    assert.ok(json.data.fileUrl.includes('documents/cvs/'));

    assert.equal(uploadDocCalledWith.subfolder, 'cvs');
    assert.equal(uploadDocCalledWith.originalname, 'Nguyen_Van_A_CV.pdf');
    assert.equal(repoCreateCalledWith.userId, SEEKER_ID);
    assert.equal(repoCreateCalledWith.title, 'CV Frontend Developer');
  } finally {
    cvRepository.countByUserId = originalCount;
    cvRepository.create = originalCreate;
    fileService.uploadDocument = originalUploadDoc;
    server.close();
  }
});

test('GET /api/v1/job-seekers/me/cvs - 200 returns CV list', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindAll = cvRepository.findAllByUserId;
  cvRepository.findAllByUserId = async (userId) => {
    assert.equal(userId, SEEKER_ID);
    return [
      {
        cvId: 'cv-1',
        userId,
        title: 'CV Frontend',
        type: 'UPLOADED',
        fileUrl: 'https://cdn.example.com/documents/cvs/cv1.pdf',
      },
      {
        cvId: 'cv-2',
        userId,
        title: 'CV Backend',
        type: 'UPLOADED',
        fileUrl: 'https://cdn.example.com/documents/cvs/cv2.pdf',
      },
    ];
  };

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs`, {
      headers: { Authorization: `Bearer ${seekerToken}` },
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.length, 2);
    assert.equal(json.data[0].cvId, 'cv-1');
  } finally {
    cvRepository.findAllByUserId = originalFindAll;
    server.close();
  }
});

test('PUT /api/v1/job-seekers/me/cvs/:cvId - 404 if CV not found or belongs to another user', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindByIdAndUserId = cvRepository.findByIdAndUserId;
  cvRepository.findByIdAndUserId = async () => null;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs/non-existent-id`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${seekerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'New Name' }),
    });
    const json = await res.json();

    assert.equal(res.status, 404);
    assert.equal(json.status, 'error');
    assert.match(json.message, /CV không tồn tại/i);
  } finally {
    cvRepository.findByIdAndUserId = originalFindByIdAndUserId;
    server.close();
  }
});

test('PUT /api/v1/job-seekers/me/cvs/:cvId - 400 when title is empty', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindByIdAndUserId = cvRepository.findByIdAndUserId;
  cvRepository.findByIdAndUserId = async () => ({
    cvId: 'cv-1',
    userId: SEEKER_ID,
    title: 'Old Title',
  });

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs/cv-1`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${seekerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: '   ' }),
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.status, 'error');
    assert.match(json.message, /Tên CV không được để trống/i);
  } finally {
    cvRepository.findByIdAndUserId = originalFindByIdAndUserId;
    server.close();
  }
});

test('PUT /api/v1/job-seekers/me/cvs/:cvId - 200 updates title', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindByIdAndUserId = cvRepository.findByIdAndUserId;
  const originalUpdate = cvRepository.update;

  let updatedData = null;

  cvRepository.findByIdAndUserId = async (cvId, userId) => ({
    cvId,
    userId,
    title: 'Old Title',
  });

  cvRepository.update = async (cvId, data) => {
    updatedData = data;
    return {
      cvId,
      userId: SEEKER_ID,
      title: data.title,
    };
  };

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs/cv-2`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${seekerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'CV React Fullstack' }),
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(json.data.title, 'CV React Fullstack');
    assert.equal(updatedData.title, 'CV React Fullstack');
  } finally {
    cvRepository.findByIdAndUserId = originalFindByIdAndUserId;
    cvRepository.update = originalUpdate;
    server.close();
  }
});

test('DELETE /api/v1/job-seekers/me/cvs/:cvId - 200 deletes CV from DB and R2', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const originalFindByIdAndUserId = cvRepository.findByIdAndUserId;
  const originalDelete = cvRepository.delete;
  const originalDeleteFile = fileService.deleteFile;

  let r2DeletedKey = null;
  let dbDeletedId = null;

  cvRepository.findByIdAndUserId = async (cvId, userId) => ({
    cvId,
    userId,
    fileUrl: 'https://cdn.example.com/documents/cvs/1729600000000_abc.pdf',
    content: {
      fileKey: 'documents/cvs/1729600000000_abc.pdf',
    },
  });

  cvRepository.delete = async (cvId) => {
    dbDeletedId = cvId;
    return { cvId };
  };

  fileService.deleteFile = async (key) => {
    r2DeletedKey = key;
  };

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/job-seekers/me/cvs/cv-to-delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${seekerToken}` },
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'success');
    assert.equal(dbDeletedId, 'cv-to-delete');
    assert.equal(r2DeletedKey, 'documents/cvs/1729600000000_abc.pdf');
  } finally {
    cvRepository.findByIdAndUserId = originalFindByIdAndUserId;
    cvRepository.delete = originalDelete;
    fileService.deleteFile = originalDeleteFile;
    server.close();
  }
});
