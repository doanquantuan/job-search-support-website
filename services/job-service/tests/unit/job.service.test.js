import { jest } from '@jest/globals';

const mockJobPostRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
};

jest.unstable_mockModule('../../src/repositories/jobPost.repository.js', () => ({
  default: mockJobPostRepository,
}));

const { default: jobService } = await import('../../src/services/jobPost.service.js');

describe('JobPostService Unit Tests', () => {
  const userId = 'user-123-uuid';
  const otherUserId = 'other-user-uuid';
  const jobId = 'job-123-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createJobPost', () => {
    it('should create job post successfully', async () => {
      const inputData = {
        title: 'Backend Engineer',
        companyId: 'company-uuid',
        deadline: '2026-12-31',
        specializationIds: ['spec-1'],
      };

      const expectedSaved = { jobId, ...inputData, userId };
      mockJobPostRepository.create.mockResolvedValue(expectedSaved);

      const result = await jobService.createJobPost(userId, inputData);

      expect(mockJobPostRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Backend Engineer',
          userId,
          deadline: expect.any(Date),
        }),
        ['spec-1']
      );
      expect(result).toEqual(expectedSaved);
    });
  });

  describe('getJobPosts', () => {
    it('should retrieve job list with pagination', async () => {
      mockJobPostRepository.findMany.mockResolvedValue({
        total: 1,
        jobs: [{ jobId, title: 'Backend Engineer' }],
      });

      const result = await jobService.getJobPosts({ page: 1, limit: 10, keyword: 'Backend' });

      expect(result.pagination.total).toBe(1);
      expect(result.jobs).toHaveLength(1);
      expect(mockJobPostRepository.findMany).toHaveBeenCalled();
    });
  });

  describe('getJobPostById', () => {
    it('should return job detail when job exists', async () => {
      const mockJob = { jobId, title: 'Job 1' };
      mockJobPostRepository.findById.mockResolvedValue(mockJob);

      const result = await jobService.getJobPostById(jobId);
      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundError when job not found', async () => {
      mockJobPostRepository.findById.mockResolvedValue(null);

      await expect(jobService.getJobPostById(jobId)).rejects.toThrow('Không tìm thấy tin tuyển dụng');
    });
  });

  describe('updateJobPost', () => {
    it('should throw NotFoundError if job does not exist', async () => {
      mockJobPostRepository.findById.mockResolvedValue(null);

      await expect(jobService.updateJobPost(jobId, userId, {})).rejects.toThrow('Không tìm thấy tin tuyển dụng');
    });

    it('should throw ForbiddenError if user is not the owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId: otherUserId });

      await expect(jobService.updateJobPost(jobId, userId, {})).rejects.toThrow('Bạn không có quyền chỉnh sửa');
    });

    it('should update job if user is the owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId });
      mockJobPostRepository.update.mockResolvedValue({ jobId, title: 'Updated' });

      const result = await jobService.updateJobPost(jobId, userId, { title: 'Updated', specializationIds: ['spec-1'] });
      expect(mockJobPostRepository.update).toHaveBeenCalledWith(
        jobId,
        { title: 'Updated' },
        ['spec-1']
      );
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteJobPost', () => {
    it('should throw ForbiddenError if user is not owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId: otherUserId });

      await expect(jobService.deleteJobPost(jobId, userId)).rejects.toThrow('Bạn không có quyền xóa');
    });

    it('should delete job when user is owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId });
      mockJobPostRepository.delete.mockResolvedValue({ jobId });

      await jobService.deleteJobPost(jobId, userId);
      expect(mockJobPostRepository.delete).toHaveBeenCalledWith(jobId);
    });
  });

  describe('updateJobPostStatus', () => {
    it('should throw ForbiddenError if not owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId: otherUserId });

      await expect(jobService.updateJobPostStatus(jobId, userId, 'PUBLISHED')).rejects.toThrow('Bạn không có quyền thay đổi trạng thái');
    });

    it('should update status when owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId });
      mockJobPostRepository.updateStatus.mockResolvedValue({ jobId, status: 'PUBLISHED' });

      const result = await jobService.updateJobPostStatus(jobId, userId, 'PUBLISHED');
      expect(result.status).toBe('PUBLISHED');
      expect(mockJobPostRepository.updateStatus).toHaveBeenCalledWith(jobId, 'PUBLISHED');
    });
  });
});

