const companyRepository = require('../repositories/company.repository');
const companyEvents = require('../events/company.events');
const { ConflictError, BadRequestError } = require('../utils/errors.util');

class CompanyService {
  /**
   * Đăng ký xác thực doanh nghiệp
   * @param {string} recruiterId 
   * @param {object} data 
   * @param {object} file 
   */
  async registerVerification(recruiterId, data, file) {
    // Kiểm tra file giấy phép kinh doanh
    if (!file) {
      throw new BadRequestError('Vui lòng tải lên tệp giấy phép kinh doanh hợp lệ (PDF, JPG, PNG)');
    }

    // Kiểm tra Recruiter đã đăng ký công ty nào chưa
    const existingCompany = await companyRepository.findByRecruiterId(recruiterId);
    if (existingCompany) {
      if (['PENDING', 'APPROVED', 'VERIFIED'].includes(existingCompany.verificationStatus)) {
        throw new ConflictError(
          `Bạn đã đăng ký doanh nghiệp '${existingCompany.companyName}' và hồ sơ đang ở trạng thái ${existingCompany.verificationStatus}. Không thể tạo thêm doanh nghiệp mới.`
        );
      }
    }

    // Kiểm tra tính duy nhất của taxCode
    const existingTax = await companyRepository.findByTaxCode(data.taxCode);
    if (existingTax) {
      throw new ConflictError(`Mã số thuế '${data.taxCode}' đã được đăng ký bởi doanh nghiệp '${existingTax.companyName}'.`);
    }

    // file lưu trữ
    const licenseUrl = `/uploads/licenses/${file.filename}`;

    // Dữ liệu công ty và địa chỉ
    const companyData = {
      recruiterId,
      companyName: data.companyName,
      taxCode: data.taxCode,
      companySize: data.companySize,
      industry: data.industry,
      description: data.description || null,
      website: data.website || null,
      email: data.email || null,
      phone: data.phone || null,
      businessLicenseUrl: licenseUrl,
      verificationStatus: 'PENDING',
    };

    const locationData = {
      province: data.province,
      district: data.district || null,
      ward: data.ward || null,
      address: data.address || null,
    };

    // Tạo trong csdl
    const newCompany = await companyRepository.createCompanyWithLocation({
      companyData,
      locationData,
    });


    companyEvents.emit('verification.submitted', {
      companyId: newCompany.companyId,
      recruiterId,
      companyName: newCompany.companyName,
      taxCode: newCompany.taxCode,
      submittedAt: newCompany.createdAt,
    });

    return newCompany;
  }

  /**
   * Xem trạng thái xác thực doanh nghiệp
   * @param {string} recruiterId 
   */
  async getVerificationStatus(recruiterId) {
    const company = await companyRepository.findByRecruiterId(recruiterId);

    if (!company) {
      const { NotFoundError } = require('../utils/errors.util');
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào. Vui lòng đăng ký xác thực trước.');
    }

    const Company = require('../domain/entities/Company');
    const companyEntity = new Company(company);
    return companyEntity.toVerificationStatusResponse();
  }

  /**
   * Cập nhật hồ sơ xác thực doanh nghiệp
   * Chỉ cho phép khi trạng thái là REJECTED hoặc ADDITIONAL_INFO_REQUIRED
   * @param {string} recruiterId
   * @param {object} data 
   * @param {object|null} file 
   */
  async updateVerificationProfile(recruiterId, data, file) {
    const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors.util');
    const Company = require('../domain/entities/Company');

    // Lấy công ty của Recruiter này
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào. Vui lòng đăng ký xác thực trước.');
    }

    // Kiểm tra quyền nghiệp vụ
    const companyEntity = new Company(company);
    if (!companyEntity.canUpdateVerification()) {
      throw new BadRequestError(
        `Không thể cập nhật hồ sơ khi trạng thái là '${company.verificationStatus}'. Chỉ cho phép cập nhật khi hồ sơ bị từ chối (REJECTED) hoặc yêu cầu bổ sung (ADDITIONAL_INFO_REQUIRED).`
      );
    }

    // Nếu thay đổi taxCode, kiểm tra không trùng
    if (data.taxCode && data.taxCode !== company.taxCode) {
      const existingTax = await companyRepository.findByTaxCode(data.taxCode);
      if (existingTax) {
        throw new ConflictError(`Mã số thuế '${data.taxCode}' đã được đăng ký bởi doanh nghiệp '${existingTax.companyName}'.`);
      }
    }

    // Chuẩn bị dữ liệu cập nhật Company
    const companyUpdateData = {
      verificationStatus: 'PENDING',
      rejectionReason: null,
      adminNote: null,
    };

    if (data.companyName !== undefined) companyUpdateData.companyName = data.companyName;
    if (data.taxCode !== undefined) companyUpdateData.taxCode = data.taxCode;
    if (data.companySize !== undefined) companyUpdateData.companySize = data.companySize;
    if (data.industry !== undefined) companyUpdateData.industry = data.industry;
    if (data.description !== undefined) companyUpdateData.description = data.description || null;
    if (data.website !== undefined) companyUpdateData.website = data.website || null;
    if (data.email !== undefined) companyUpdateData.email = data.email || null;
    if (data.phone !== undefined) companyUpdateData.phone = data.phone || null;

    // Nếu có file giấy phép mới thì cập nhật đường dẫn
    if (file) {
      companyUpdateData.businessLicenseUrl = `/uploads/licenses/${file.filename}`;
    }

    // Chuẩn bị dữ liệu cập nhật Location
    const locationUpdateData = {};
    if (data.province !== undefined) locationUpdateData.province = data.province;
    if (data.district !== undefined) locationUpdateData.district = data.district || null;
    if (data.ward !== undefined) locationUpdateData.ward = data.ward || null;
    if (data.address !== undefined) locationUpdateData.address = data.address || null;

    // 6. Thực hiện cập nhật trong DB
    const updatedCompany = await companyRepository.updateCompanyVerification({
      companyId: company.companyId,
      locationId: company.locationId,
      companyData: companyUpdateData,
      locationData: locationUpdateData,
    });

    // Bắn sự kiện
    companyEvents.emit('verification.submitted', {
      companyId: updatedCompany.companyId,
      recruiterId,
      companyName: updatedCompany.companyName,
      taxCode: updatedCompany.taxCode,
      submittedAt: updatedCompany.updatedAt,
      isResubmission: true,
    });

    return updatedCompany;
  }
}

module.exports = new CompanyService();
