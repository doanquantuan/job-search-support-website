import { jest } from '@jest/globals';

// ─── 1. MOCK CÁC DEPENDENCIES ───────────────────────────────────────────────

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

jest.unstable_mockModule('../../src/rabbitmq/jobPublisher.js', () => ({
  publishJobCreated: jest.fn().mockResolvedValue(true),
  publishJobUpdated: jest.fn().mockResolvedValue(true),
  publishJobStatusChanged: jest.fn().mockResolvedValue(true),
}));

const mockCompanyConsumer = {
  getCompanyIdByUserId: jest.fn(),
  getCompanyById: jest.fn().mockResolvedValue(null),
  getCompaniesBatch: jest.fn().mockResolvedValue([]),
};

jest.unstable_mockModule('../../src/rabbitmq/companyConsumer.js', () => ({
  default: mockCompanyConsumer,
}));

// Mock Elasticsearch Search Module
const mockSearchJobsInES = jest.fn();
const mockAutocompleteJobsInES = jest.fn();
const mockIndexJob = jest.fn().mockResolvedValue(true);
const mockUpdateJobInES = jest.fn().mockResolvedValue(true);
const mockDeleteJobFromES = jest.fn().mockResolvedValue(true);

jest.unstable_mockModule('../../src/search/jobIndex.js', () => ({
  searchJobsInES: mockSearchJobsInES,
  autocompleteJobsInES: mockAutocompleteJobsInES,
  indexJob: mockIndexJob,
  updateJobInES: mockUpdateJobInES,
  deleteJobFromES: mockDeleteJobFromES,
}));

// Dynamic import sau khi unstable_mockModule đã đăng ký
const { default: jobService } = await import('../../src/services/jobPost.service.js');

// ─── 2. TEST SUITES ──────────────────────────────────────────────────────────

describe('JobPostService Unit Tests', () => {
  const userId = 'user-123-uuid';
  const otherUserId = 'other-user-uuid';
  const jobId = 'job-123-uuid';
  const companyId = 'company-123-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── CREATE JOB POST ──────────────────────────────────────────────────────
  describe('createJobPost', () => {
    it('should create job post successfully when companyId is provided', async () => {
      const inputData = {
        title: 'Backend Engineer',
        companyId,
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
          companyId,
          deadline: expect.any(Date),
        }),
        ['spec-1']
      );
      expect(mockIndexJob).toHaveBeenCalledWith(expectedSaved);
      expect(result).toEqual(expectedSaved);
    });

    it('should fetch companyId from message broker if not provided in input', async () => {
      const inputData = {
        title: 'Frontend Engineer',
        specializationIds: [],
      };

      mockCompanyConsumer.getCompanyIdByUserId.mockResolvedValue(companyId);
      mockJobPostRepository.create.mockResolvedValue({ jobId, ...inputData, userId, companyId });

      const result = await jobService.createJobPost(userId, inputData);

      expect(mockCompanyConsumer.getCompanyIdByUserId).toHaveBeenCalledWith(userId);
      expect(result.companyId).toBe(companyId);
    });

    it('should throw BadRequestError if user is not associated with any company', async () => {
      mockCompanyConsumer.getCompanyIdByUserId.mockResolvedValue(null);

      await expect(
        jobService.createJobPost(userId, { title: 'Tester' })
      ).rejects.toThrow('Tài khoản nhà tuyển dụng chưa được liên kết với bất kỳ công ty nào');
    });
  });

  // ─── SEARCH & GET JOB POSTS ───────────────────────────────────────────────
  describe('searchJobs (Elasticsearch & NLP)', () => {
    it('should search jobs via Elasticsearch and return structured results with scores', async () => {
      const mockHits = [
        {
          jobId,
          title: 'ReactJS Developer',
          companyId,
          companyName: 'Tech Corp',
          salaryType: 'RANGE',
          salaryMin: 15000000,
          salaryMax: 25000000,
          experienceMin: 1,
          experienceMax: 3,
          jobLevel: 'JUNIOR',
          province: 'Hà Nội',
          _score: 3.5,
        },
      ];

      mockSearchJobsInES.mockResolvedValue({
        hits: mockHits,
        total: 1,
      });

      mockCompanyConsumer.getCompaniesBatch.mockResolvedValue([
        { companyId, companyName: 'Tech Corp', logo: 'https://logo.png' },
      ]);

      const result = await jobService.searchJobs({
        keyword: 'ReactJS',
        page: 1,
        limit: 10,
      });

      expect(mockSearchJobsInES).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'ReactJS',
          page: 1,
          limit: 10,
        })
      );
      expect(result.source).toBe('elasticsearch');
      expect(result.pagination.total).toBe(1);
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].salary).toBe('15 - 25 triệu');
      expect(result.jobs[0].experience).toBe('1 - 3 năm');
      expect(result.jobs[0]._score).toBe(3.5);
    });

    it('should extract NLP entities from natural query and pass clean keyword to ES', async () => {
      mockSearchJobsInES.mockResolvedValue({ hits: [], total: 0 });

      const result = await jobService.searchJobs({
        keyword: 'tuyển intern reactjs hà nội lương trên 10 triệu',
      });

      expect(mockSearchJobsInES).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: 'reactjs',
          province: 'Hà Nội',
          jobLevel: 'INTERN',
          salaryType: 'RANGE',
          minSalary: 10000000,
        })
      );
      expect(result.filters.cleanKeyword).toBe('reactjs');
      expect(result.filters.parsedEntities).toMatchObject({
        province: 'Hà Nội',
        jobLevel: 'INTERN',
        salary: { min: 10000000 },
      });
    });

    it('should fallback to PostgreSQL if Elasticsearch fails', async () => {
      mockSearchJobsInES.mockRejectedValue(new Error('ES Connection Refused'));

      mockJobPostRepository.findMany.mockResolvedValue({
        total: 1,
        jobs: [
          {
            jobId,
            title: 'NodeJS Developer',
            companyId,
            salaryType: 'NEGOTIABLE',
            experienceMin: null,
            experienceMax: null,
          },
        ],
      });

      const result = await jobService.searchJobs({ keyword: 'NodeJS' });

      expect(result.source).toBe('postgresql');
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].salary).toBe('Thỏa thuận');
      expect(mockJobPostRepository.findMany).toHaveBeenCalled();
    });
  });

  // ─── AUTOCOMPLETE ─────────────────────────────────────────────────────────
  describe('autocompleteJobs', () => {
    it('should return empty array if prefix is empty or whitespace', async () => {
      const res1 = await jobService.autocompleteJobs('');
      const res2 = await jobService.autocompleteJobs('   ');
      expect(res1).toEqual([]);
      expect(res2).toEqual([]);
      expect(mockAutocompleteJobsInES).not.toHaveBeenCalled();
    });

    it('should call autocompleteJobsInES with trimmed prefix and limit', async () => {
      const mockSuggestions = [
        { text: 'ReactJS Developer', type: 'job_title' },
        { text: 'React Native', type: 'completion' },
      ];
      mockAutocompleteJobsInES.mockResolvedValue(mockSuggestions);

      const result = await jobService.autocompleteJobs(' reac ', 5);

      expect(mockAutocompleteJobsInES).toHaveBeenCalledWith('reac', 5);
      expect(result).toEqual(mockSuggestions);
    });
  });

  // ─── GET JOB POST BY ID ───────────────────────────────────────────────────
  describe('getJobPostById', () => {
    it('should return job detail when job exists and merge company info', async () => {
      const mockJob = { jobId, title: 'Job 1', companyId };
      mockJobPostRepository.findById.mockResolvedValue(mockJob);
      mockCompanyConsumer.getCompanyById.mockResolvedValue({
        companyId,
        companyName: 'FPT Software',
        logo: 'https://logo.png',
      });

      const result = await jobService.getJobPostById(jobId);
      expect(result).toMatchObject({
        ...mockJob,
        companyName: 'FPT Software',
        companyLogo: 'https://logo.png',
      });
    });

    it('should throw NotFoundError when job does not exist', async () => {
      mockJobPostRepository.findById.mockResolvedValue(null);

      await expect(jobService.getJobPostById(jobId)).rejects.toThrow('Không tìm thấy tin tuyển dụng');
    });
  });

  // ─── UPDATE JOB POST ──────────────────────────────────────────────────────
  describe('updateJobPost', () => {
    it('should throw NotFoundError if job does not exist', async () => {
      mockJobPostRepository.findById.mockResolvedValue(null);

      await expect(jobService.updateJobPost(jobId, userId, {})).rejects.toThrow('Không tìm thấy tin tuyển dụng');
    });

    it('should throw ForbiddenError if user is not the owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId: otherUserId });

      await expect(jobService.updateJobPost(jobId, userId, {})).rejects.toThrow('Bạn không có quyền chỉnh sửa');
    });

    it('should update job and sync to Elasticsearch if user is the owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId });
      mockJobPostRepository.update.mockResolvedValue({ jobId, title: 'Updated Title' });

      const result = await jobService.updateJobPost(jobId, userId, {
        title: 'Updated Title',
        specializationIds: ['spec-1'],
        deadline: '2026-12-31',
      });

      expect(mockJobPostRepository.update).toHaveBeenCalledWith(
        jobId,
        expect.objectContaining({
          title: 'Updated Title',
          deadline: expect.any(Date),
        }),
        ['spec-1']
      );
      expect(mockIndexJob).toHaveBeenCalledWith(result);
      expect(result.title).toBe('Updated Title');
    });
  });

  // ─── DELETE JOB POST ──────────────────────────────────────────────────────
  describe('deleteJobPost', () => {
    it('should throw ForbiddenError if user is not owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId: otherUserId });

      await expect(jobService.deleteJobPost(jobId, userId)).rejects.toThrow('Bạn không có quyền xóa');
    });

    it('should delete job and remove from Elasticsearch when user is owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId });
      mockJobPostRepository.delete.mockResolvedValue({ jobId });

      await jobService.deleteJobPost(jobId, userId);

      expect(mockJobPostRepository.delete).toHaveBeenCalledWith(jobId);
      expect(mockDeleteJobFromES).toHaveBeenCalledWith(jobId);
    });
  });

  // ─── UPDATE JOB POST STATUS ───────────────────────────────────────────────
  describe('updateJobPostStatus', () => {
    it('should throw ForbiddenError if user is not owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId: otherUserId });

      await expect(
        jobService.updateJobPostStatus(jobId, userId, 'PUBLISHED')
      ).rejects.toThrow('Bạn không có quyền thay đổi trạng thái');
    });

    it('should update status and sync to Elasticsearch when user is owner', async () => {
      mockJobPostRepository.findById.mockResolvedValue({ jobId, userId });
      mockJobPostRepository.updateStatus.mockResolvedValue({ jobId, status: 'PUBLISHED' });

      const result = await jobService.updateJobPostStatus(jobId, userId, 'PUBLISHED');

      expect(result.status).toBe('PUBLISHED');
      expect(mockJobPostRepository.updateStatus).toHaveBeenCalledWith(jobId, 'PUBLISHED');
      expect(mockUpdateJobInES).toHaveBeenCalledWith(
        jobId,
        expect.objectContaining({ status: 'PUBLISHED' })
      );
    });
  });
});
