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

    return {
      companyId: company.companyId,
      companyName: company.companyName,
      taxCode: company.taxCode,
      verificationStatus: company.verificationStatus,
      rejectionReason: company.rejectionReason || null,
      adminNote: company.adminNote || null,
      verifiedAt: company.verifiedAt || null,
      submittedAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}

module.exports = new CompanyService();
