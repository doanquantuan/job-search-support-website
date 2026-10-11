const companyRepository = require('../repositories/company.repository');
const companyEvents = require('../events/company.events');
const { ConflictError, BadRequestError } = require('../utils/errors.util');

class CompanyService {
  /**
   * UC29 - Đăng ký xác thực doanh nghiệp
   * @param {string} recruiterId - ID của nhà tuyển dụng đang đăng nhập
   * @param {object} data - Dữ liệu đăng ký doanh nghiệp
   * @param {object} file - File giấy phép kinh doanh từ Multer
   */
  async registerVerification(recruiterId, data, file) {
    // 1. Kiểm tra file giấy phép kinh doanh bắt buộc
    if (!file) {
      throw new BadRequestError('Vui lòng tải lên tệp giấy phép kinh doanh hợp lệ (PDF, JPG, PNG)');
    }

    // 2. Kiểm tra xem Recruiter này đã đăng ký công ty nào chưa
    const existingCompany = await companyRepository.findByRecruiterId(recruiterId);
    if (existingCompany) {
      if (['PENDING', 'APPROVED', 'VERIFIED'].includes(existingCompany.verificationStatus)) {
        throw new ConflictError(
          `Bạn đã đăng ký doanh nghiệp '${existingCompany.companyName}' và hồ sơ đang ở trạng thái ${existingCompany.verificationStatus}. Không thể tạo thêm doanh nghiệp mới.`
        );
      }
    }

    // 3. Kiểm tra tính duy nhất của Mã số thuế (taxCode)
    const existingTax = await companyRepository.findByTaxCode(data.taxCode);
    if (existingTax) {
      throw new ConflictError(`Mã số thuế '${data.taxCode}' đã được đăng ký bởi doanh nghiệp '${existingTax.companyName}'.`);
    }

    // 4. Chuẩn bị đường dẫn file lưu trữ
    const licenseUrl = `/uploads/licenses/${file.filename}`;

    // 5. Chuẩn bị dữ liệu công ty và địa chỉ
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

    // 6. Tạo trong cơ sở dữ liệu
    const newCompany = await companyRepository.createCompanyWithLocation({
      companyData,
      locationData,
    });

    // 7. Bắn sự kiện verification.submitted
    companyEvents.emit('verification.submitted', {
      companyId: newCompany.companyId,
      recruiterId,
      companyName: newCompany.companyName,
      taxCode: newCompany.taxCode,
      submittedAt: newCompany.createdAt,
    });

    return newCompany;
  }
}

module.exports = new CompanyService();
