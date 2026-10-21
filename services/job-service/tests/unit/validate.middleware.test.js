import { jest } from '@jest/globals';
import {
  validateJobIdParam,
  validateCreateJobPost,
  validateUpdateJobPost,
  validateUpdateJobStatus,
} from '../../src/middlewares/validate.middleware.js';

describe('Validate Middleware Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {};
    next = jest.fn();
  });

  describe('validateJobIdParam', () => {
    it('should call next with error if jobId is missing', () => {
      validateJobIdParam(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('jobId không hợp lệ'),
        })
      );
    });

    it('should call next with error if jobId is not a valid UUID', () => {
      req.params.jobId = 'not-a-valid-uuid';
      validateJobIdParam(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('jobId không hợp lệ'),
        })
      );
    });

    it('should call next without error when jobId is valid UUID', () => {
      req.params.jobId = 'a1234567-b89c-4def-0123-456789abcdef';
      validateJobIdParam(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('validateCreateJobPost', () => {
    const validBody = {
      companyId: 'a1234567-b89c-4def-0123-456789abcdef',
      title: 'Senior Node.js Developer',
      province: 'Hồ Chí Minh',
      address: '123 Đường ABC, Quận 1',
      description: 'Mô tả công việc...',
      requirements: 'Yêu cầu ứng viên...',
      benefits: 'Chế độ đãi ngộ...',
      workingHours: 'Thứ 2 - Thứ 6 (8h30 - 17h30)',
      salaryType: 'RANGE',
      salaryMin: 20000000,
      salaryMax: 40000000,
      experienceMin: 2,
      experienceMax: 5,
      jobLevel: 'SENIOR',
      educationLevel: 'UNIVERSITY',
      workMode: 'HYBRID',
      employmentType: 'FULL_TIME',
      specializationIds: ['b1234567-b89c-4def-0123-456789abcdef'],
    };

    it('should call next without error when data is valid', () => {
      req.body = { ...validBody };
      validateCreateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject when companyId is missing or invalid', () => {
      req.body = { ...validBody, companyId: 'invalid-id' };
      validateCreateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('companyId là bắt buộc'),
        })
      );
    });

    it('should reject when a required field is empty', () => {
      req.body = { ...validBody, title: '   ' };
      validateCreateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Tiêu đề tin tuyển dụng (title) là bắt buộc'),
        })
      );
    });

    it('should reject when salaryType is invalid', () => {
      req.body = { ...validBody, salaryType: 'UNKNOWN' };
      validateCreateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('salaryType không hợp lệ'),
        })
      );
    });

    it('should reject when salaryType is RANGE and salaryMin > salaryMax', () => {
      req.body = { ...validBody, salaryMin: 50000000, salaryMax: 30000000 };
      validateCreateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('salaryMin không được lớn hơn salaryMax'),
        })
      );
    });

    it('should reject when experienceMin > experienceMax', () => {
      req.body = { ...validBody, experienceMin: 5, experienceMax: 2 };
      validateCreateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('experienceMin không được lớn hơn experienceMax'),
        })
      );
    });

    it('should reject invalid specializationId format', () => {
      req.body = { ...validBody, specializationIds: ['not-a-uuid'] };
      validateCreateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('specializationId không hợp lệ'),
        })
      );
    });
  });

  describe('validateUpdateJobPost', () => {
    it('should pass on valid partial update data', () => {
      req.body = {
        title: 'Lead Engineer',
        salaryType: 'NEGOTIABLE',
        jobLevel: 'LEAD',
      };
      validateUpdateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject if invalid enum is provided', () => {
      req.body = {
        jobLevel: 'CEO',
      };
      validateUpdateJobPost(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('jobLevel không hợp lệ'),
        })
      );
    });
  });

  describe('validateUpdateJobStatus', () => {
    it('should call next without error for valid status', () => {
      req.body = { status: 'PUBLISHED' };
      validateUpdateJobStatus(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should reject empty status', () => {
      req.body = {};
      validateUpdateJobStatus(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('Trường status là bắt buộc'),
        })
      );
    });

    it('should reject invalid status value', () => {
      req.body = { status: 'ARCHIVED' };
      validateUpdateJobStatus(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('status không hợp lệ'),
        })
      );
    });
  });
});

