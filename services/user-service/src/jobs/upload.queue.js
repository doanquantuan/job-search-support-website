const { Queue } = require('bullmq');
const redis = require('../config/redis');

const UPLOAD_QUEUE_NAME = 'upload';

const uploadQueue = new Queue(UPLOAD_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    // Giữ lại kết quả job trong 1 giờ (3600s) hoặc 1000 jobs gần nhất để client có thể polling kiểm tra
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // Lưu job lỗi trong 24h để debug
    },
  },
});

/**
 * Thêm job upload avatar vào queue
 */
const addAvatarUploadJob = async (payload) => {
  return uploadQueue.add('UPLOAD_AVATAR', payload);
};

/**
 * Thêm job xóa file trên R2 vào queue
 */
const addFileDeleteJob = async (fileUrlOrKey) => {
  return uploadQueue.add('DELETE_FILE', { fileUrlOrKey });
};

/**
 * Lấy trạng thái và kết quả của Job theo jobId
 * @param {string} jobId
 */
const getJobStatus = async (jobId) => {
  const job = await uploadQueue.getJob(jobId);
  if (!job) {
    return null;
  }

  const state = await job.getState(); // 'completed', 'failed', 'active', 'waiting', 'delayed'
  const progress = job.progress;
  const failedReason = job.failedReason;
  const returnvalue = job.returnvalue;

  return {
    jobId: job.id,
    name: job.name,
    state, // trạng thái của bullmq
    progress,
    result: returnvalue || null,
    failedReason: failedReason || null,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
};

module.exports = {
  uploadQueue,
  UPLOAD_QUEUE_NAME,
  addAvatarUploadJob,
  addFileDeleteJob,
  getJobStatus,
};
