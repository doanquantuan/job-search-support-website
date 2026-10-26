import { BadRequestError } from '#shared/utils/errors.util.js';
const validateProfile = (req, res, next) => {
  const {
    fullName,
    avatar,
    contactEmail,
    phone,
    gender,
    address,
    githubUrl,
  } = req.body;
  let { dateOfBirth } = req.body;

  // Kiểm tra fullName
  if (
    fullName !== undefined &&
    (typeof fullName !== 'string' || fullName.trim().length === 0)
  ) {
    return next(new BadRequestError('Tên đầy đủ không hợp lệ'));
  }

  // Kiểm tra avatar
  if (
    avatar !== undefined &&
    avatar !== null &&
    typeof avatar !== 'string'
  ) {
    return next(new BadRequestError('Avatar không hợp lệ'));
  }

  // Kiểm tra contactEmail
  if (
    contactEmail !== undefined &&
    contactEmail !== null &&
    (typeof contactEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()))
  ) {
    return next(new BadRequestError('Email liên hệ không hợp lệ'));
  }

  // Kiểm tra phone
  if (
    phone !== undefined &&
    phone !== null &&
    (typeof phone !== 'string' || !/^\+?[0-9]{9,15}$/.test(phone.trim()))
  ) {
    return next(new BadRequestError('Số điện thoại không hợp lệ'));
  }

  // Kiểm tra dateOfBirth
  if (dateOfBirth !== undefined && dateOfBirth !== null) {
    if (
      typeof dateOfBirth !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      Number.isNaN(Date.parse(dateOfBirth)) ||
      new Date(dateOfBirth).toISOString().slice(0, 10) !== dateOfBirth ||
      dateOfBirth > new Date().toISOString().slice(0, 10)
    ) {
      return next(new BadRequestError('Ngày sinh không hợp lệ'));
    }

    dateOfBirth = new Date(`${dateOfBirth}T00:00:00.000Z`);
  }

  // Kiểm tra gender
  if (
    gender !== undefined &&
    gender !== null &&
    !['MALE', 'FEMALE', 'OTHER'].includes(gender)
  ) {
    return next(new BadRequestError('Giới tính không hợp lệ'));
  }

  // Kiểm tra address
  if (
    address !== undefined &&
    address !== null &&
    typeof address !== 'string'
  ) {
    return next(new BadRequestError('Địa chỉ không hợp lệ'));
  }

  // Kiểm tra githubUrl
  if (githubUrl !== undefined && githubUrl !== null) {
    try {
      const url = new URL(githubUrl);

      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.hostname.toLowerCase() !== 'github.com'
      ) {
        return next(new BadRequestError('Đường dẫn GitHub không hợp lệ'));
      }
    } catch {
      return next(new BadRequestError('Đường dẫn GitHub không hợp lệ'));
    }
  }

  req.body = {
    ...req.body,
    fullName: typeof fullName === 'string' ? fullName.trim() : fullName,
    avatar: avatar ?? null,
    contactEmail: typeof contactEmail === 'string' ? contactEmail.trim() : (contactEmail ?? null),
    phone: typeof phone === 'string' ? phone.trim() : (phone ?? null),
    dateOfBirth: dateOfBirth ?? null,
    gender: gender ?? null,
    address: typeof address === 'string' ? address.trim() : (address ?? null),
    githubUrl: githubUrl ?? null,
  };

  next();
};

const validateEducation = (req, res, next) => {
  const { institution, major, description } = req.body;

  let { startDate, endDate } = req.body;
  // Kiểm tra institution
  if (
    institution === undefined ||
    institution === null ||
    typeof institution !== 'string' ||
    institution.trim().length === 0
  ) {
    return next(new BadRequestError('Tên cơ sở giáo dục là bắt buộc và không được để trống'));
  }

  // Kiểm tra major
  if (
    major === undefined ||
    major === null ||
    typeof major !== 'string' ||
    major.trim().length === 0
  ) {
    return next(new BadRequestError('Chuyên ngành là bắt buộc và không được để trống'));
  }

  // Kiểm tra startDate
  if (
    startDate === undefined ||
    startDate === null ||
    typeof startDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    Number.isNaN(Date.parse(startDate)) ||
    new Date(startDate).toISOString().slice(0, 10) !== startDate
  ) {

    return next(new BadRequestError('Ngày bắt đầu không hợp lệ'));
  }

  startDate = new Date(`${startDate}T00:00:00.000Z`);

  // Kiểm tra endDate
  if (endDate !== undefined && endDate !== null) {
    if (
      typeof endDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
      Number.isNaN(Date.parse(endDate)) ||
      new Date(endDate).toISOString().slice(0, 10) !== endDate ||
      new Date(`${endDate}T00:00:00.000Z`) < startDate
    ) {

      return next(new BadRequestError('Ngày kết thúc không hợp lệ'));
    }

    endDate = new Date(`${endDate}T00:00:00.000Z`);
  } else {
    endDate = null;
  }

  // Kiểm tra description
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    return next(new BadRequestError('Mô tả không hợp lệ'));
  }


  req.body = {
    ...req.body,
    institution: institution.trim(),
    major: major.trim(),
    startDate,
    endDate,
    description,
  };

  next();
}


const validateExperience = (req, res, next) => {
  const { companyName, position, description } = req.body;

  let { startDate, endDate } = req.body;
  // Kiểm tra companyName
  if (
    companyName === undefined ||
    companyName === null ||
    typeof companyName !== 'string' ||
    companyName.trim().length === 0
  ) {
    return next(new BadRequestError('Tên công ty là bắt buộc và không được để trống'));
  }

  // Kiểm tra position
  if (
    position === undefined ||
    position === null ||
    typeof position !== 'string' ||
    position.trim().length === 0
  ) {
    return next(new BadRequestError('Chức vụ là bắt buộc và không được để trống'));
  }

  // Kiểm tra startDate
  if (
    startDate === undefined ||
    startDate === null ||
    typeof startDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    Number.isNaN(Date.parse(startDate)) ||
    new Date(startDate).toISOString().slice(0, 10) !== startDate
  ) {

    return next(new BadRequestError('Ngày bắt đầu không hợp lệ'));
  }

  startDate = new Date(`${startDate}T00:00:00.000Z`);

  // Kiểm tra endDate
  if (endDate !== undefined && endDate !== null) {
    if (
      typeof endDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
      Number.isNaN(Date.parse(endDate)) ||
      new Date(endDate).toISOString().slice(0, 10) !== endDate ||
      new Date(`${endDate}T00:00:00.000Z`) < startDate
    ) {

      return next(new BadRequestError('Ngày kết thúc không hợp lệ'));
    }

    endDate = new Date(`${endDate}T00:00:00.000Z`);
  } else {
    endDate = null;
  }

  // Kiểm tra description
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    return next(new BadRequestError('Mô tả không hợp lệ'));
  }


  req.body = {
    ...req.body,
    companyName: companyName.trim(),
    position: position.trim(),
    startDate,
    endDate,
    description,
  };

  next();
}

const validateProject = (req, res, next) => {
  const { projectName, position, description } = req.body;

  let { startDate, endDate } = req.body;
  // Kiểm tra projectName
  if (
    projectName === undefined ||
    projectName === null ||
    typeof projectName !== 'string' ||
    projectName.trim().length === 0
  ) {
    return next(new BadRequestError('Tên dự án là bắt buộc và không được để trống'));
  }

  // Kiểm tra position
  if (
    position === undefined ||
    position === null ||
    typeof position !== 'string' ||
    position.trim().length === 0
  ) {
    return next(new BadRequestError('Vị trí là bắt buộc và không được để trống'));
  }

  // Kiểm tra startDate
  if (
    startDate === undefined ||
    startDate === null ||
    typeof startDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    Number.isNaN(Date.parse(startDate)) ||
    new Date(startDate).toISOString().slice(0, 10) !== startDate
  ) {

    return next(new BadRequestError('Ngày bắt đầu không hợp lệ'));
  }

  startDate = new Date(`${startDate}T00:00:00.000Z`);

  // Kiểm tra endDate
  if (endDate !== undefined && endDate !== null) {
    if (
      typeof endDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
      Number.isNaN(Date.parse(endDate)) ||
      new Date(endDate).toISOString().slice(0, 10) !== endDate ||
      new Date(`${endDate}T00:00:00.000Z`) < startDate
    ) {

      return next(new BadRequestError('Ngày kết thúc không hợp lệ'));
    }

    endDate = new Date(`${endDate}T00:00:00.000Z`);
  } else {
    endDate = null;
  }

  // Kiểm tra description
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    return next(new BadRequestError('Mô tả không hợp lệ'));
  }


  req.body = {
    ...req.body,
    projectName: projectName.trim(),
    position: position.trim(),
    startDate,
    endDate,
    description,
  };

  next();
}

const validateCertificate = (req, res, next) => {
  const { certificateName, issuer, description } = req.body;

  let { issueDate, expiryDate } = req.body;
  // Kiểm tra certificateName
  if (
    certificateName === undefined ||
    certificateName === null ||
    typeof certificateName !== 'string' ||
    certificateName.trim().length === 0
  ) {
    return next(new BadRequestError('Tên chứng chỉ là bắt buộc và không được để trống'));
  }

  // Kiểm tra issuer
  if (
    issuer === undefined ||
    issuer === null ||
    typeof issuer !== 'string' ||
    issuer.trim().length === 0
  ) {
    return next(new BadRequestError('Tên cơ quan cấp chứng chỉ là bắt buộc và không được để trống'));
  }

  // Kiểm tra issueDate
  if (
    issueDate === undefined ||
    issueDate === null ||
    typeof issueDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(issueDate) ||
    Number.isNaN(Date.parse(issueDate)) ||
    new Date(issueDate).toISOString().slice(0, 10) !== issueDate
  ) {

    return next(new BadRequestError('Ngày cấp không hợp lệ'));
  }

  issueDate = new Date(`${issueDate}T00:00:00.000Z`);

  // Kiểm tra expiryDate
  if (expiryDate !== undefined && expiryDate !== null) {
    if (
      typeof expiryDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate) ||
      Number.isNaN(Date.parse(expiryDate)) ||
      new Date(expiryDate).toISOString().slice(0, 10) !== expiryDate ||
      new Date(`${expiryDate}T00:00:00.000Z`) < issueDate
    ) {

      return next(new BadRequestError('Ngày hết hạn không hợp lệ'));
    }

    expiryDate = new Date(`${expiryDate}T00:00:00.000Z`);
  } else {
    expiryDate = null;
  }

  // Kiểm tra description
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    return next(new BadRequestError('Mô tả không hợp lệ'));
  }


  req.body = {
    ...req.body,
    certificateName: certificateName.trim(),
    issuer: issuer.trim(),
    issueDate,
    expiryDate,
    description,
  };

  next();
}


const validateAward = (req, res, next) => {
  const { awardName, issuer, description } = req.body;

  let { issueDate } = req.body;
  // Kiểm tra awardName
  if (
    awardName === undefined ||
    awardName === null ||
    typeof awardName !== 'string' ||
    awardName.trim().length === 0
  ) {
    return next(new BadRequestError('Tên giải thưởng là bắt buộc và không được để trống'));
  }

  // Kiểm tra issuer
  if (
    issuer === undefined ||
    issuer === null ||
    typeof issuer !== 'string' ||
    issuer.trim().length === 0
  ) {
    return next(new BadRequestError('Tên cơ quan cấp giải thưởng là bắt buộc và không được để trống'));
  }

  // Kiểm tra issueDate
  if (
    issueDate === undefined ||
    issueDate === null ||
    typeof issueDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(issueDate) ||
    Number.isNaN(Date.parse(issueDate)) ||
    new Date(issueDate).toISOString().slice(0, 10) !== issueDate
  ) {

    return next(new BadRequestError('Ngày cấp không hợp lệ'));
  }

  issueDate = new Date(`${issueDate}T00:00:00.000Z`);

  // Kiểm tra description
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== 'string'
  ) {
    return next(new BadRequestError('Mô tả không hợp lệ'));
  }


  req.body = {
    ...req.body,
    awardName: awardName.trim(),
    issuer: issuer.trim(),
    issueDate,
    description,
  };

  next();
}

const validateCareerPreference = (req, res, next) => {
  const { expectedSalaryMin, expectedSalaryMax, preferredLocation, careerGoal } = req.body;

  // Kiểm tra expectedSalaryMin Decimal(12, 2)
  if (
    expectedSalaryMin === undefined ||
    expectedSalaryMin === null ||
    typeof expectedSalaryMin !== 'number' ||
    expectedSalaryMin <= 0
  ) {
    return next(new BadRequestError('Mức lương tối thiểu mong muốn là bắt buộc và phải là một số dương'));
  }

  // Kiểm tra expectedSalaryMax Decimal(12, 2)
  if (
    expectedSalaryMax === undefined ||
    expectedSalaryMax === null ||
    typeof expectedSalaryMax !== 'number' ||
    expectedSalaryMax <= 0 ||
    expectedSalaryMax < expectedSalaryMin
  ) {
    return next(new BadRequestError('Mức lương tối đa mong muốn là bắt buộc và phải là một số dương lớn hơn mức lương tối thiểu'));
  }

  // Kiểm tra preferredLocation
  if (
    preferredLocation === undefined ||
    preferredLocation === null ||
    typeof preferredLocation !== 'string' ||
    preferredLocation.trim().length === 0
  ) {
    return next(new BadRequestError('Vị trí ưa thích là bắt buộc và không được để trống'));
  }

  // Kiểm tra careerGoal
  if (
    careerGoal === undefined ||
    careerGoal === null ||
    typeof careerGoal !== 'string' ||
    careerGoal.trim().length === 0
  ) {
    return next(new BadRequestError('Mục tiêu nghề nghiệp là bắt buộc và không được để trống'));
  }


  req.body = {
    ...req.body,
    expectedSalaryMin,
    expectedSalaryMax,
    preferredLocation: preferredLocation.trim(),
    careerGoal: careerGoal.trim(),
  };

  next();
};

const validateSkills = (req, res, next) => {
  const { skills } = req.body;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return next(new BadRequestError('Danh sách skills phải là một mảng và không được để trống'));
  }

  for (let i = 0; i < skills.length; i++) {
    const item = skills[i];
    if (!item || typeof item !== 'object') {
      return next(new BadRequestError(`Phần tử thứ ${i + 1} trong skills không hợp lệ`));
    }

    if (!['ADD', 'REMOVE'].includes(item.action)) {
      return next(new BadRequestError(`Hành động action tại phần tử thứ ${i + 1} phải là ADD hoặc REMOVE`));
    }

    if (item.action === 'ADD') {
      if (!item.skillName || typeof item.skillName !== 'string' || item.skillName.trim().length === 0) {
        return next(new BadRequestError(`skillName là bắt buộc đối với action ADD tại phần tử thứ ${i + 1}`));
      }
      item.skillName = item.skillName.trim();
    }

    if (item.action === 'REMOVE') {
      if (!item.skillId && !item.skillName) {
        return next(new BadRequestError(`skillId hoặc skillName là bắt buộc đối với action REMOVE tại phần tử thứ ${i + 1}`));
      }
    }
  }

  next();
};

export {
  validateProfile,
  validateEducation,
  validateExperience,
  validateProject,
  validateCertificate,
  validateAward,
  validateCareerPreference,
  validateSkills,
};

export default {
  validateProfile,
  validateEducation,
  validateExperience,
  validateProject,
  validateCertificate,
  validateAward,
  validateCareerPreference,
  validateSkills,
};
