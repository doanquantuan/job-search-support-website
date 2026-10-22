import { BadRequestError } from '#shares/utils/errors.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_SALARY_TYPES = ['RANGE', 'NEGOTIABLE'];
const VALID_JOB_LEVELS = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER'];
const VALID_EDUCATION_LEVELS = ['NO_REQUIREMENT', 'HIGH_SCHOOL', 'COLLEGE', 'UNIVERSITY', 'POSTGRADUATE'];
const VALID_WORK_MODES = ['REMOTE', 'HYBRID', 'ONSITE'];
const VALID_EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY'];
const VALID_JOB_STATUSES = ['DRAFT', 'PUBLISHED', 'CLOSED', 'EXPIRED'];
const VALID_SORT_FIELDS = ['createdAt', 'publishedAt', 'salaryMax', 'deadline'];
const VALID_SORT_ORDERS = ['asc', 'desc'];

export const validateJobIdParam = (req, res, next) => {
  const { jobId } = req.params;
  if (!jobId || !UUID_REGEX.test(jobId)) {
    return next(new BadRequestError('jobId không hợp lệ (phải là UUID)'));
  }
  next();
};

export const validateOccupationIdParam = (req, res, next) => {
  const { occupationId } = req.params;
  if (!occupationId || !UUID_REGEX.test(occupationId)) {
    return next(new BadRequestError('occupationId không hợp lệ (phải là UUID)'));
  }
  next();
};

export const validateSpecializationIdParam = (req, res, next) => {
  const { specializationId } = req.params;
  if (!specializationId || !UUID_REGEX.test(specializationId)) {
    return next(new BadRequestError('specializationId không hợp lệ (phải là UUID)'));
  }
  next();
};

export const validateOccupationBody = (req, res, next) => {
  const { occupationName } = req.body;
  if (!occupationName || typeof occupationName !== 'string' || !occupationName.trim()) {
    return next(new BadRequestError('Tên ngành nghề (occupationName) là bắt buộc'));
  }
  next();
};

export const validateCreateSpecialization = (req, res, next) => {
  const { occupationId, specializationName } = req.body;
  if (!occupationId || !UUID_REGEX.test(occupationId)) {
    return next(new BadRequestError('occupationId là bắt buộc và phải là UUID hợp lệ'));
  }
  if (!specializationName || typeof specializationName !== 'string' || !specializationName.trim()) {
    return next(new BadRequestError('Tên chuyên ngành (specializationName) là bắt buộc'));
  }
  next();
};

export const validateUpdateSpecialization = (req, res, next) => {
  const { occupationId, specializationName } = req.body;
  if (!occupationId && !specializationName) {
    return next(new BadRequestError('Vui lòng cung cấp ít nhất một trường cần cập nhật (occupationId hoặc specializationName)'));
  }
  if (occupationId && !UUID_REGEX.test(occupationId)) {
    return next(new BadRequestError('occupationId phải là UUID hợp lệ'));
  }
  if (specializationName !== undefined && (typeof specializationName !== 'string' || !specializationName.trim())) {
    return next(new BadRequestError('specializationName không được để trống'));
  }
  next();
};

export const validateSearchJobsQuery = (req, res, next) => {
  const {
    page,
    limit,
    salaryType,
    minSalary,
    maxSalary,
    experienceMin,
    experienceMax,
    jobLevel,
    educationLevel,
    workMode,
    employmentType,
    occupationId,
    specializationId,
    sortBy,
    sortOrder,
  } = req.query;

  if (page !== undefined && (isNaN(Number(page)) || Number(page) < 1)) {
    return next(new BadRequestError('page phải là số nguyên dương >= 1'));
  }

  if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 1)) {
    return next(new BadRequestError('limit phải là số nguyên dương >= 1'));
  }

  if (salaryType && !VALID_SALARY_TYPES.includes(salaryType)) {
    return next(new BadRequestError(`salaryType không hợp lệ. Phải là một trong: ${VALID_SALARY_TYPES.join(', ')}`));
  }

  if (minSalary !== undefined && isNaN(Number(minSalary))) {
    return next(new BadRequestError('minSalary phải là số'));
  }

  if (maxSalary !== undefined && isNaN(Number(maxSalary))) {
    return next(new BadRequestError('maxSalary phải là số'));
  }

  if (minSalary !== undefined && maxSalary !== undefined && Number(minSalary) > Number(maxSalary)) {
    return next(new BadRequestError('minSalary không được lớn hơn maxSalary'));
  }

  if (experienceMin !== undefined && (isNaN(Number(experienceMin)) || Number(experienceMin) < 0)) {
    return next(new BadRequestError('experienceMin phải là số không âm'));
  }

  if (experienceMax !== undefined && (isNaN(Number(experienceMax)) || Number(experienceMax) < 0)) {
    return next(new BadRequestError('experienceMax phải là số không âm'));
  }

  if (
    experienceMin !== undefined &&
    experienceMax !== undefined &&
    Number(experienceMin) > Number(experienceMax)
  ) {
    return next(new BadRequestError('experienceMin không được lớn hơn experienceMax'));
  }

  if (jobLevel && !VALID_JOB_LEVELS.includes(jobLevel)) {
    return next(new BadRequestError(`jobLevel không hợp lệ. Phải là một trong: ${VALID_JOB_LEVELS.join(', ')}`));
  }

  if (educationLevel && !VALID_EDUCATION_LEVELS.includes(educationLevel)) {
    return next(new BadRequestError(`educationLevel không hợp lệ. Phải là một trong: ${VALID_EDUCATION_LEVELS.join(', ')}`));
  }

  if (workMode && !VALID_WORK_MODES.includes(workMode)) {
    return next(new BadRequestError(`workMode không hợp lệ. Phải là một trong: ${VALID_WORK_MODES.join(', ')}`));
  }

  if (employmentType && !VALID_EMPLOYMENT_TYPES.includes(employmentType)) {
    return next(new BadRequestError(`employmentType không hợp lệ. Phải là một trong: ${VALID_EMPLOYMENT_TYPES.join(', ')}`));
  }

  if (occupationId && !UUID_REGEX.test(occupationId)) {
    return next(new BadRequestError('occupationId không hợp lệ (phải là UUID)'));
  }

  if (specializationId && !UUID_REGEX.test(specializationId)) {
    return next(new BadRequestError('specializationId không hợp lệ (phải là UUID)'));
  }

  if (sortBy && !VALID_SORT_FIELDS.includes(sortBy)) {
    return next(new BadRequestError(`sortBy không hợp lệ. Phải là một trong: ${VALID_SORT_FIELDS.join(', ')}`));
  }

  if (sortOrder && !VALID_SORT_ORDERS.includes(sortOrder.toLowerCase())) {
    return next(new BadRequestError(`sortOrder không hợp lệ. Phải là một trong: ${VALID_SORT_ORDERS.join(', ')}`));
  }

  next();
};

export const validateCreateJobPost = (req, res, next) => {
  const {
    companyId,
    salaryType,
    salaryMin,
    salaryMax,
    experienceMin,
    experienceMax,
    jobLevel,
    educationLevel,
    workMode,
    employmentType,
    specializationIds,
    deadline,
  } = req.body;

  if (!companyId || !UUID_REGEX.test(companyId)) {
    return next(new BadRequestError('companyId là bắt buộc và phải là UUID hợp lệ'));
  }

  const requiredFields = {
    title: 'Tiêu đề tin tuyển dụng (title)',
    province: 'Tỉnh/Thành phố (province)',
    address: 'Địa chỉ cụ thể (address)',
    description: 'Mô tả công việc (description)',
    requirements: 'Yêu cầu ứng viên (requirements)',
    benefits: 'Quyền lợi ứng viên (benefits)',
    workingHours: 'Thời gian làm việc (workingHours)',
    salaryType: 'Hình thức lương (salaryType)',
    jobLevel: 'Cấp bậc (jobLevel)',
    educationLevel: 'Trình độ học vấn (educationLevel)',
    workMode: 'Hình thức làm việc (workMode)',
    employmentType: 'Loại hình làm việc (employmentType)',
  };

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim())) {
      return next(new BadRequestError(`${label} là bắt buộc`));
    }
  }

  if (!VALID_SALARY_TYPES.includes(salaryType)) {
    return next(new BadRequestError(`salaryType không hợp lệ. Phải là một trong: ${VALID_SALARY_TYPES.join(', ')}`));
  }

  if (salaryType === 'RANGE') {
    if (salaryMin === undefined || salaryMin === null || isNaN(Number(salaryMin))) {
      return next(new BadRequestError('salaryMin là bắt buộc và phải là số khi salaryType là RANGE'));
    }
    if (salaryMax === undefined || salaryMax === null || isNaN(Number(salaryMax))) {
      return next(new BadRequestError('salaryMax là bắt buộc và phải là số khi salaryType là RANGE'));
    }
    if (Number(salaryMin) > Number(salaryMax)) {
      return next(new BadRequestError('salaryMin không được lớn hơn salaryMax'));
    }
  }

  if (experienceMin !== undefined && experienceMin !== null) {
    if (isNaN(Number(experienceMin)) || Number(experienceMin) < 0) {
      return next(new BadRequestError('experienceMin phải là số không âm'));
    }
  }

  if (experienceMax !== undefined && experienceMax !== null) {
    if (isNaN(Number(experienceMax)) || Number(experienceMax) < 0) {
      return next(new BadRequestError('experienceMax phải là số không âm'));
    }
  }

  if (
    experienceMin !== undefined &&
    experienceMin !== null &&
    experienceMax !== undefined &&
    experienceMax !== null &&
    Number(experienceMin) > Number(experienceMax)
  ) {
    return next(new BadRequestError('experienceMin không được lớn hơn experienceMax'));
  }

  if (!VALID_JOB_LEVELS.includes(jobLevel)) {
    return next(new BadRequestError(`jobLevel không hợp lệ. Phải là một trong: ${VALID_JOB_LEVELS.join(', ')}`));
  }

  if (!VALID_EDUCATION_LEVELS.includes(educationLevel)) {
    return next(new BadRequestError(`educationLevel không hợp lệ. Phải là một trong: ${VALID_EDUCATION_LEVELS.join(', ')}`));
  }

  if (!VALID_WORK_MODES.includes(workMode)) {
    return next(new BadRequestError(`workMode không hợp lệ. Phải là một trong: ${VALID_WORK_MODES.join(', ')}`));
  }

  if (!VALID_EMPLOYMENT_TYPES.includes(employmentType)) {
    return next(new BadRequestError(`employmentType không hợp lệ. Phải là một trong: ${VALID_EMPLOYMENT_TYPES.join(', ')}`));
  }

  if (deadline) {
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return next(new BadRequestError('deadline không đúng định dạng ngày tháng'));
    }
  }

  if (specializationIds !== undefined) {
    if (!Array.isArray(specializationIds)) {
      return next(new BadRequestError('specializationIds phải là một mảng'));
    }
    for (const specId of specializationIds) {
      if (!UUID_REGEX.test(specId)) {
        return next(new BadRequestError(`specializationId không hợp lệ: ${specId}`));
      }
    }
  }

  next();
};

export const validateUpdateJobPost = (req, res, next) => {
  const {
    salaryType,
    salaryMin,
    salaryMax,
    experienceMin,
    experienceMax,
    jobLevel,
    educationLevel,
    workMode,
    employmentType,
    specializationIds,
    deadline,
  } = req.body;

  if (salaryType !== undefined && !VALID_SALARY_TYPES.includes(salaryType)) {
    return next(new BadRequestError(`salaryType không hợp lệ. Phải là một trong: ${VALID_SALARY_TYPES.join(', ')}`));
  }

  if (salaryMin !== undefined && salaryMin !== null && isNaN(Number(salaryMin))) {
    return next(new BadRequestError('salaryMin phải là số'));
  }

  if (salaryMax !== undefined && salaryMax !== null && isNaN(Number(salaryMax))) {
    return next(new BadRequestError('salaryMax phải là số'));
  }

  if (
    salaryMin !== undefined &&
    salaryMin !== null &&
    salaryMax !== undefined &&
    salaryMax !== null &&
    Number(salaryMin) > Number(salaryMax)
  ) {
    return next(new BadRequestError('salaryMin không được lớn hơn salaryMax'));
  }

  if (experienceMin !== undefined && experienceMin !== null) {
    if (isNaN(Number(experienceMin)) || Number(experienceMin) < 0) {
      return next(new BadRequestError('experienceMin phải là số không âm'));
    }
  }

  if (experienceMax !== undefined && experienceMax !== null) {
    if (isNaN(Number(experienceMax)) || Number(experienceMax) < 0) {
      return next(new BadRequestError('experienceMax phải là số không âm'));
    }
  }

  if (
    experienceMin !== undefined &&
    experienceMin !== null &&
    experienceMax !== undefined &&
    experienceMax !== null &&
    Number(experienceMin) > Number(experienceMax)
  ) {
    return next(new BadRequestError('experienceMin không được lớn hơn experienceMax'));
  }

  if (jobLevel !== undefined && !VALID_JOB_LEVELS.includes(jobLevel)) {
    return next(new BadRequestError(`jobLevel không hợp lệ. Phải là một trong: ${VALID_JOB_LEVELS.join(', ')}`));
  }

  if (educationLevel !== undefined && !VALID_EDUCATION_LEVELS.includes(educationLevel)) {
    return next(new BadRequestError(`educationLevel không hợp lệ. Phải là một trong: ${VALID_EDUCATION_LEVELS.join(', ')}`));
  }

  if (workMode !== undefined && !VALID_WORK_MODES.includes(workMode)) {
    return next(new BadRequestError(`workMode không hợp lệ. Phải là một trong: ${VALID_WORK_MODES.join(', ')}`));
  }

  if (employmentType !== undefined && !VALID_EMPLOYMENT_TYPES.includes(employmentType)) {
    return next(new BadRequestError(`employmentType không hợp lệ. Phải là một trong: ${VALID_EMPLOYMENT_TYPES.join(', ')}`));
  }

  if (deadline !== undefined && deadline !== null) {
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return next(new BadRequestError('deadline không đúng định dạng ngày tháng'));
    }
  }

  if (specializationIds !== undefined) {
    if (!Array.isArray(specializationIds)) {
      return next(new BadRequestError('specializationIds phải là một mảng'));
    }
    for (const specId of specializationIds) {
      if (!UUID_REGEX.test(specId)) {
        return next(new BadRequestError(`specializationId không hợp lệ: ${specId}`));
      }
    }
  }

  next();
};

export const validateUpdateJobStatus = (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    return next(new BadRequestError('Trường status là bắt buộc'));
  }

  if (!VALID_JOB_STATUSES.includes(status)) {
    return next(new BadRequestError(`status không hợp lệ. Phải là một trong: ${VALID_JOB_STATUSES.join(', ')}`));
  }

  next();
};
