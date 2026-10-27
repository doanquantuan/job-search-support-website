import companyRepository from '../repositories/company.repository.js';
import companyEvents from '../events/company.events.js';
import { ConflictError, BadRequestError, NotFoundError } from '../utils/errors.util.js';
import * as r2 from './r2.service.js';
import { validateAndExtractFileType, ALLOWED_LICENSE_MIMES, ALLOWED_IMAGE_MIMES } from '../utils/file-validator.util.js';
import Company from '../domain/entities/Company.js';

class CompanyService {
  // Đăng ký xác thực doanh nghiệp

  /**
   * @param {string} recruiterId
   * @param {object} data 
   * @param {object} file 
   */
  async registerVerification(recruiterId, data, file) {
    if (!file) {
      throw new BadRequestError('Vui lòng tải lên tệp giấy phép kinh doanh hợp lệ (PDF, JPG, PNG)');
    }

    // Kiểm tra Recruiter đã đăng ký công ty chưa
    const existingCompany = await companyRepository.findByRecruiterId(recruiterId);
    if (existingCompany) {
      if (['PENDING', 'APPROVED', 'VERIFIED'].includes(existingCompany.verificationStatus)) {
        throw new ConflictError(
          `Bạn đã đăng ký doanh nghiệp '${existingCompany.companyName}' và hồ sơ đang ở trạng thái ${existingCompany.verificationStatus}. Không thể tạo thêm doanh nghiệp mới.`
        );
      }
    }

    // Kiểm tra taxCode không trùng
    const existingTax = await companyRepository.findByTaxCode(data.taxCode);
    if (existingTax) {
      throw new ConflictError(`Mã số thuế '${data.taxCode}' đã được đăng ký bởi doanh nghiệp '${existingTax.companyName}'.`);
    }

    // Validate mime/magic bytes của file giấy phép
    const { ext, mime } = await validateAndExtractFileType(file.buffer, ALLOWED_LICENSE_MIMES);

    // Upload lên R2 Private Bucket
    const licenseKey = await r2.uploadPrivateLicense({ buffer: file.buffer, ext, mime });

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
      businessLicenseUrl: licenseKey,
      verificationStatus: 'PENDING',
    };

    const locationData = {
      province: data.province,
      district: data.district || null,
      ward: data.ward || null,
      address: data.address || null,
    };

    // Lưu vào database
    const newCompany = await companyRepository.createCompanyWithLocation({ companyData, locationData });

    companyEvents.emit('verification.submitted', {
      companyId: newCompany.companyId,
      recruiterId,
      companyName: newCompany.companyName,
      taxCode: newCompany.taxCode,
      submittedAt: newCompany.createdAt,
    });

    return newCompany;
  }

  // Xem trạng thái xác thực doanh nghiệp

  async getVerificationStatus(recruiterId) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào. Vui lòng đăng ký xác thực trước.');
    }

    const companyEntity = new Company(company);
    return companyEntity.toVerificationStatusResponse();
  }

  // Cập nhật hồ sơ xác thực doanh nghiệp
  /**
   * @param {string} recruiterId
   * @param {object} data
   * @param {object|null} file 
   */
  async updateVerificationProfile(recruiterId, data, file) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào. Vui lòng đăng ký xác thực trước.');
    }

    const companyEntity = new Company(company);
    if (!companyEntity.canUpdateVerification()) {
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

    // Nếu có giấy phép mới: upload R2 Private -> lưu key -> xóa key cũ SAU KHI DB cập nhật xong
    const oldLicenseKey = company.businessLicenseUrl;
    if (file) {
      const { ext, mime } = await validateAndExtractFileType(file.buffer, ALLOWED_LICENSE_MIMES);
      const newLicenseKey = await r2.uploadPrivateLicense({ buffer: file.buffer, ext, mime });
      companyUpdateData.businessLicenseUrl = newLicenseKey;
    }

    const locationUpdateData = {};
    if (data.province !== undefined) locationUpdateData.province = data.province;
    if (data.district !== undefined) locationUpdateData.district = data.district || null;
    if (data.ward !== undefined) locationUpdateData.ward = data.ward || null;
    if (data.address !== undefined) locationUpdateData.address = data.address || null;

    // Cập nhật DB
    const updatedCompany = await companyRepository.updateCompanyVerification({
      companyId: company.companyId,
      locationId: company.locationId,
      companyData: companyUpdateData,
      locationData: locationUpdateData,
    });

    // Xóa giấy phép cũ SAU KHI DB đã cập nhật thành công
    if (file && oldLicenseKey) {
      await r2.deletePrivateLicense(oldLicenseKey);
    }

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

  // Xem thông tin nội bộ (Recruiter)
  async getMyCompany(recruiterId) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào.');
    }

    const companyEntity = new Company(company);
    const profile = companyEntity.toInternalProfile();

    // Tạo presigned URL nếu có license key
    if (company.businessLicenseUrl) {
      try {
        profile.businessLicensePresignedUrl = await r2.getLicensePresignedUrl(company.businessLicenseUrl);
      } catch (e) {
        // Nếu key cũ local (chưa migrate) -> bỏ qua, không crash
        profile.businessLicensePresignedUrl = null;
      }
    }

    return profile;
  }

  // Xem hồ sơ công khai
  async getPublicCompanyProfile(companyId) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Không tìm thấy thông tin doanh nghiệp này.');
    }

    const companyEntity = new Company(company);
    return companyEntity.toPublicProfile();
  }

  // Cập nhật thông tin doanh nghiệp (Profile hiển thị)

  /**
   * @param {string} recruiterId
   * @param {object} data 
   * @param {object} files 
   */
  async updateMyCompany(recruiterId, data, files = {}) {
    const company = await companyRepository.findByRecruiterId(recruiterId);
    if (!company) {
      throw new NotFoundError('Bạn chưa đăng ký hồ sơ doanh nghiệp nào.');
    }

    const companyUpdateData = {};
    if (data.companyName !== undefined) companyUpdateData.companyName = data.companyName;
    if (data.companySize !== undefined) companyUpdateData.companySize = data.companySize;
    if (data.industry !== undefined) companyUpdateData.industry = data.industry;
    if (data.description !== undefined) companyUpdateData.description = data.description || null;
    if (data.website !== undefined) companyUpdateData.website = data.website || null;
    if (data.email !== undefined) companyUpdateData.email = data.email || null;
    if (data.phone !== undefined) companyUpdateData.phone = data.phone || null;

    const oldLogoUrl = company.logo;
    if (files.logo && files.logo.length > 0) {
      const logoFile = files.logo[0];
      const { ext, mime } = await validateAndExtractFileType(logoFile.buffer, ALLOWED_IMAGE_MIMES);
      companyUpdateData.logo = await r2.uploadPublicFile({
        buffer: logoFile.buffer,
        folder: 'logos',
        prefix: 'logo',
        ext,
        mime,
      });
    }

    // Ảnh môi trường làm việc
    let newEnvUrls = [];
    if (files.environmentPhotos && files.environmentPhotos.length > 0) {
      const validatedPhotos = await Promise.all(
        files.environmentPhotos.map(async (f) => {
          const { ext, mime } = await validateAndExtractFileType(f.buffer, ALLOWED_IMAGE_MIMES);
          return { buffer: f.buffer, ext, mime };
        })
      );

      // Upload với rollback tự động nếu có lỗi 
      newEnvUrls = await r2.uploadPublicMultipleFiles(validatedPhotos, {
        folder: 'environments',
        prefix: 'env',
      });
    }

    // Kết hợp ảnh cũ giữ lại + ảnh mới
    if (data.keepEnvironmentPhotos !== undefined) {
      let keptPhotos = [];
      if (typeof data.keepEnvironmentPhotos === 'string') {
        try {
          keptPhotos = JSON.parse(data.keepEnvironmentPhotos);
        } catch {
          keptPhotos = data.keepEnvironmentPhotos.split(',').map((s) => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(data.keepEnvironmentPhotos)) {
        keptPhotos = data.keepEnvironmentPhotos;
      }
      companyUpdateData.environmentPhotos = [...keptPhotos, ...newEnvUrls];
    } else if (newEnvUrls.length > 0) {
      companyUpdateData.environmentPhotos = [...(company.environmentPhotos || []), ...newEnvUrls];
    }

    // Địa chỉ 
    const locationUpdateData = {};
    if (data.province !== undefined) locationUpdateData.province = data.province;
    if (data.district !== undefined) locationUpdateData.district = data.district || null;
    if (data.ward !== undefined) locationUpdateData.ward = data.ward || null;
    if (data.address !== undefined) locationUpdateData.address = data.address || null;

    // Cập nhật DB
    const updatedCompany = await companyRepository.updateCompanyProfile({
      companyId: company.companyId,
      locationId: company.locationId,
      companyData: companyUpdateData,
      locationData: locationUpdateData,
    });
    // Xóa logo cũ
    if (files.logo && files.logo.length > 0 && oldLogoUrl) {
      await r2.deletePublicFile(oldLogoUrl);
    }

    const companyEntity = new Company(updatedCompany);
    return companyEntity.toInternalProfile();
  }
}

export default new CompanyService();
export { CompanyService };
