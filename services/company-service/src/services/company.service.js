import companyRepository from '../repositories/company.repository.js';
import companyEvents from '../events/company.events.js';
import { ConflictError, BadRequestError, NotFoundError } from '#shared/utils/errors.util.js';
import fileService from './file.service.js';

class CompanyService {
  /**
   * Helper format dữ liệu company trả về
   */
  _formatCompanyResponse(company) {
    if (!company) return null;

    const latestVerification = company.verifications && company.verifications.length > 0
      ? company.verifications[0]
      : null;

    const latestLicense = company.documents && company.documents.length > 0
      ? company.documents.find((d) => d.documentType === 'BUSINESS_LICENSE') || company.documents[0]
      : null;

    return {
      companyId: company.companyId,
      recruiterId: company.recruiterId,
      companyName: company.companyName,
      taxCode: company.taxCode,
      companySize: company.companySize,
      industry: company.industry,
      description: company.description,
      logo: company.logo,
      website: company.website,
      email: company.email,
      phone: company.phone,
      province: company.province,
      address: company.address,
      verificationStatus: company.verificationStatus,
      documents: company.documents || [],
      latestDocument: latestLicense || null,
      verificationHistory: company.verifications || [],
      latestVerification: latestVerification || null,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  // Đăng ký xác thực doanh nghiệp
  async registerVerification(recruiterId, data, file) {
    if (!file) {
      throw new BadRequestError('Vui lòng tải lên tệp giấy phép kinh doanh hợp lệ (PDF, JPG, PNG, WEBP)');
    }

    try {
      // 1. Kiểm tra Recruiter đã đăng ký công ty chưa
      const existingCompany = await companyRepository.findByRecruiterId(recruiterId);
      if (existingCompany) {
        if (['PENDING', 'APPROVED'].includes(existingCompany.verificationStatus)) {
          throw new ConflictError(
            `Bạn đã đăng ký doanh nghiệp '${existingCompany.companyName}' và hồ sơ đang ở trạng thái ${existingCompany.verificationStatus}. Không thể tạo thêm doanh nghiệp mới.`
          );
        }
      }

      // 2. Kiểm tra taxCode không trùng
      const existingTax = await companyRepository.findByTaxCode(data.taxCode);
      if (existingTax) {
        throw new ConflictError(`Mã số thuế '${data.taxCode}' đã được đăng ký bởi doanh nghiệp '${existingTax.companyName}'.`);
      }

      // 3. Upload tài liệu giấy phép lên R2
      const uploadResult = await fileService.uploadDocument({
        filePath: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
        subfolder: 'licenses',
      });

      const companyData = {
        recruiterId,
        companyName: data.companyName,
        taxCode: data.taxCode,
        companySize: data.companySize,
        industry: data.industry,
        description: data.description || null,
        website: data.website || null,
        email: data.email,
        phone: data.phone,
        province: data.province,
        address: data.address,
        verificationStatus: 'PENDING',
      };

      const documentData = {
        fileName: file.originalname,
        fileUrl: uploadResult.url,
        fileType: file.mimetype,
        fileSize: uploadResult.size || file.size,
        documentType: 'BUSINESS_LICENSE',
      };

      // 4. Lưu vào cơ sở dữ liệu
      const newCompany = await companyRepository.createCompany({ companyData, documentData });

      companyEvents.emit('verification.submitted', {
        companyId: newCompany.companyId,
        recruiterId,
        companyName: newCompany.companyName,
        taxCode: newCompany.taxCode,
        submittedAt: newCompany.createdAt,
      });

      return this._formatCompanyResponse(newCompany);
    } finally {
      // Xóa file tạm
      if (file?.path) {
        fileService.cleanupTempFile(file.path);
      }
    }
  }

  // Xem trạng thái xác thực doanh nghiệp
  async getVerificationStatus(recruiterId) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào. Vui lòng đăng ký xác thực trước.');
    }

    const latestVerification = company.verifications && company.verifications.length > 0
      ? company.verifications[0]
      : null;

    return {
      companyId: company.companyId,
      companyName: company.companyName,
      taxCode: company.taxCode,
      verificationStatus: company.verificationStatus,
      rejectionReason: latestVerification?.rejectionReason || null,
      adminNote: latestVerification?.adminNote || null,
      verifiedAt: latestVerification?.verifiedAt || null,
      submittedAt: company.createdAt,
      updatedAt: company.updatedAt,
      canUpdate: ['REJECTED', 'ADDITIONAL_INFO_REQUIRED'].includes(company.verificationStatus),
    };
  }

  // Cập nhật hồ sơ xác thực doanh nghiệp
  async updateVerificationProfile(recruiterId, data, file) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào. Vui lòng đăng ký xác thực trước.');
    }

    if (!['REJECTED', 'ADDITIONAL_INFO_REQUIRED'].includes(company.verificationStatus)) {
      throw new BadRequestError(
        `Không thể cập nhật hồ sơ khi trạng thái là '${company.verificationStatus}'. Chỉ cho phép khi hồ sơ bị từ chối (REJECTED) hoặc yêu cầu bổ sung (ADDITIONAL_INFO_REQUIRED).`
      );
    }

    if (data.taxCode && data.taxCode !== company.taxCode) {
      const existingTax = await companyRepository.findByTaxCode(data.taxCode);
      if (existingTax) {
        throw new ConflictError(`Mã số thuế '${data.taxCode}' đã được đăng ký bởi doanh nghiệp '${existingTax.companyName}'.`);
      }
    }

    try {
      const companyUpdateData = {};
      if (data.companyName !== undefined) companyUpdateData.companyName = data.companyName;
      if (data.taxCode !== undefined) companyUpdateData.taxCode = data.taxCode;
      if (data.companySize !== undefined) companyUpdateData.companySize = data.companySize;
      if (data.industry !== undefined) companyUpdateData.industry = data.industry;
      if (data.description !== undefined) companyUpdateData.description = data.description || null;
      if (data.website !== undefined) companyUpdateData.website = data.website || null;
      if (data.email !== undefined) companyUpdateData.email = data.email;
      if (data.phone !== undefined) companyUpdateData.phone = data.phone;
      if (data.province !== undefined) companyUpdateData.province = data.province;
      if (data.address !== undefined) companyUpdateData.address = data.address;

      let documentData = null;
      if (file) {
        const uploadResult = await fileService.uploadDocument({
          filePath: file.path,
          originalname: file.originalname,
          mimetype: file.mimetype,
          subfolder: 'licenses',
        });

        documentData = {
          fileName: file.originalname,
          fileUrl: uploadResult.url,
          fileType: file.mimetype,
          fileSize: uploadResult.size || file.size,
          documentType: 'BUSINESS_LICENSE',
        };
      }

      const updatedCompany = await companyRepository.updateCompanyVerification({
        companyId: company.companyId,
        companyData: companyUpdateData,
        documentData,
      });

      companyEvents.emit('verification.submitted', {
        companyId: updatedCompany.companyId,
        recruiterId,
        companyName: updatedCompany.companyName,
        taxCode: updatedCompany.taxCode,
        submittedAt: updatedCompany.updatedAt,
        isResubmission: true,
      });

      return this._formatCompanyResponse(updatedCompany);
    } finally {
      if (file?.path) {
        fileService.cleanupTempFile(file.path);
      }
    }
  }

  // Xem thông tin nội bộ (Recruiter)
  async getMyCompany(recruiterId) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào.');
    }

    return this._formatCompanyResponse(company);
  }

  // Lấy danh sách công ty hỗ trợ tìm kiếm, lọc và phân trang
  async getCompanies({
    page = 1,
    limit = 10,
    search,
    province,
    location,
    industry,
    size,
    companySize,
    verificationStatus,
    sortBy = 'default',
    order = 'desc',
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // Mặc định công khai: chỉ lấy các công ty đã được phê duyệt xác thực (APPROVED)
    // Nếu truyền ALL hoặc status cụ thể thì áp dụng filter tương ứng
    if (verificationStatus && verificationStatus !== 'ALL') {
      where.verificationStatus = verificationStatus;
    } else if (!verificationStatus) {
      where.verificationStatus = 'APPROVED';
    }

    // Tìm kiếm theo từ khóa (tên công ty, mô tả, lĩnh vực)
    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { companyName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { industry: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Lọc theo tỉnh / thành phố (province hoặc location)
    const effectiveProvince = province || location;
    if (effectiveProvince && effectiveProvince.trim() && effectiveProvince !== 'all') {
      where.province = { contains: effectiveProvince.trim(), mode: 'insensitive' };
    }

    // Lọc theo ngành nghề
    if (industry && industry.trim()) {
      where.industry = { contains: industry.trim(), mode: 'insensitive' };
    }

    // Lọc theo quy mô
    const effectiveSize = size || companySize;
    if (effectiveSize) {
      where.companySize = effectiveSize;
    }

    // Sắp xếp
    let orderBy = { createdAt: order };
    if (sortBy === 'companyName' || sortBy === 'name') {
      orderBy = { companyName: order };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: order };
    }

    const { companies, total } = await companyRepository.findAndCountAll({
      where,
      skip,
      take: limitNum,
      orderBy,
    });

    const totalPages = Math.ceil(total / limitNum) || 1;

    const formattedCompanies = companies.map((c) => ({
      id: c.companyId,
      companyId: c.companyId,
      name: c.companyName,
      companyName: c.companyName,
      logo: c.logo,
      industry: c.industry,
      size: c.companySize,
      companySize: c.companySize,
      description: c.description,
      website: c.website,
      email: c.email,
      phone: c.phone,
      province: c.province,
      location: c.province,
      address: c.address,
      verificationStatus: c.verificationStatus,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return {
      companies: formattedCompanies,
      data: formattedCompanies,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };
  }

  // Xem hồ sơ công khai
  async getPublicCompanyProfile(companyId) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Không tìm thấy thông tin doanh nghiệp này.');
    }

    return {
      id: company.companyId,
      companyId: company.companyId,
      name: company.companyName,
      companyName: company.companyName,
      companySize: company.companySize,
      size: company.companySize,
      industry: company.industry,
      description: company.description,
      logo: company.logo,
      website: company.website,
      email: company.email,
      phone: company.phone,
      province: company.province,
      location: company.province,
      address: company.address,
      verificationStatus: company.verificationStatus,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  // Cập nhật thông tin doanh nghiệp (Profile)
  async updateMyCompany(recruiterId, data, file) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào.');
    }

    try {
      const companyUpdateData = {};
      if (data.companyName !== undefined) companyUpdateData.companyName = data.companyName;
      if (data.companySize !== undefined) companyUpdateData.companySize = data.companySize;
      if (data.industry !== undefined) companyUpdateData.industry = data.industry;
      if (data.description !== undefined) companyUpdateData.description = data.description || null;
      if (data.website !== undefined) companyUpdateData.website = data.website || null;
      if (data.email !== undefined) companyUpdateData.email = data.email;
      if (data.phone !== undefined) companyUpdateData.phone = data.phone;
      if (data.province !== undefined) companyUpdateData.province = data.province;
      if (data.address !== undefined) companyUpdateData.address = data.address;

      const oldLogoUrl = company.logo;

      // Xử lý upload Logo mới nếu có
      if (file) {
        const processed = await fileService.processLogoImage(file.path);
        const uploaded = await fileService.uploadProcessedImage(
          processed.buffer,
          processed.extension,
          processed.mimetype,
          'logos'
        );
        companyUpdateData.logo = uploaded.url;
      }

      const updatedCompany = await companyRepository.updateCompany(company.companyId, companyUpdateData);

      // Xóa logo cũ trên R2 nếu upload logo mới thành công
      if (file && oldLogoUrl) {
        await fileService.deleteFile(oldLogoUrl);
      }

      return this._formatCompanyResponse(updatedCompany);
    } finally {
      if (file?.path) {
        fileService.cleanupTempFile(file.path);
      }
    }
  }

  // Lấy Presigned URL xem giấy phép kinh doanh
  async getLicensePresignedUrl(recruiterId) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào.');
    }

    const licenseDoc = company.documents?.find((d) => d.documentType === 'BUSINESS_LICENSE') || company.documents?.[0];
    if (!licenseDoc || !licenseDoc.fileUrl) {
      throw new NotFoundError('Công ty chưa có tài liệu giấy phép kinh doanh nào.');
    }

    const presignedUrl = await fileService.getPresignedUrl(licenseDoc.fileUrl, 600);

    return {
      presignedUrl,
      expiresInSeconds: 600,
      fileName: licenseDoc.fileName,
      fileType: licenseDoc.fileType,
    };
  }

  // Admin thẩm duyệt doanh nghiệp (Cấp tick xanh APPROVED hoặc Từ chối REJECTED)
  async verifyCompanyByAdmin(companyId, adminId, { status, rejectionReason, adminNote }) {
    if (!['APPROVED', 'REJECTED', 'ADDITIONAL_INFO_REQUIRED'].includes(status)) {
      throw new BadRequestError('Trạng thái xác thực không hợp lệ (APPROVED, REJECTED, ADDITIONAL_INFO_REQUIRED)');
    }

    if (status === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
      throw new BadRequestError('Vui lòng nêu rõ lý do khi từ chối hồ sơ doanh nghiệp');
    }

    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Không tìm thấy thông tin doanh nghiệp');
    }

    const updated = await companyRepository.updateVerificationStatus(companyId, status, {
      rejectionReason: rejectionReason?.trim(),
      adminNote: adminNote?.trim(),
      verifiedBy: adminId,
    });

    return {
      message: status === 'APPROVED' ? 'Đã phê duyệt và cấp chứng nhận xác thực cho doanh nghiệp' : 'Đã từ chối hồ sơ doanh nghiệp',
      company: {
        companyId: updated.companyId,
        companyName: updated.companyName,
        verificationStatus: updated.verificationStatus,
      },
    };
  }

  // Admin lấy Presigned URL xem GPKD của bất kỳ công ty nào
  async getCompanyLicenseByAdmin(companyId) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Không tìm thấy thông tin doanh nghiệp.');
    }

    const licenseDoc = company.documents?.find((d) => d.documentType === 'BUSINESS_LICENSE') || company.documents?.[0];
    if (!licenseDoc || !licenseDoc.fileUrl) {
      throw new NotFoundError('Công ty này chưa tải lên tài liệu giấy phép kinh doanh.');
    }

    const presignedUrl = await fileService.getPresignedUrl(licenseDoc.fileUrl, 600);

    return {
      presignedUrl,
      expiresInSeconds: 600,
      fileName: licenseDoc.fileName,
      fileType: licenseDoc.fileType,
    };
  }
}

export default new CompanyService();
export { CompanyService };
