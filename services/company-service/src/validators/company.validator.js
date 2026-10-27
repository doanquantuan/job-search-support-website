import { z } from 'zod';

const companySizeEnum = z.enum([
  'SIZE_1_10',
  'SIZE_11_50',
  'SIZE_51_200',
  'SIZE_201_500',
  'SIZE_501_1000',
  'SIZE_1001_5000',
], {
  message: 'Quy mô công ty không hợp lệ',
});

// Đăng ký xác thực doanh nghiệp
const registerVerificationSchema = z.object({
  companyName: z.string({ required_error: 'Tên công ty là bắt buộc' })
    .trim()
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự'),

  taxCode: z.string({ required_error: 'Mã số thuế là bắt buộc' })
    .trim()
    .regex(/^[0-9]{10}(-[0-9]{3})?$/, 'Mã số thuế không đúng định dạng (10 số hoặc 10 số kèm 3 số chi nhánh, vd: 0101234567 hoặc 0101234567-001)'),

  companySize: companySizeEnum.default('SIZE_1_10'),

  industry: z.string({ required_error: 'Lĩnh vực hoạt động là bắt buộc' })
    .trim()
    .min(2, 'Lĩnh vực hoạt động phải có ít nhất 2 ký tự'),

  description: z.string().optional(),
  website: z.string().url('Địa chỉ website không hợp lệ').optional().or(z.literal('')),
  email: z.string().email('Email liên hệ không hợp lệ').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9+() -]{9,15}$/, 'Số điện thoại liên hệ không hợp lệ').optional().or(z.literal('')),

  // Hỗ trợ location dạng các trường lẻ từ multipart/form-data
  province: z.string({ required_error: 'Tỉnh/Thành phố là bắt buộc' }).trim().min(2, 'Tên tỉnh/thành phố không hợp lệ'),
  district: z.string().optional(),
  ward: z.string().optional(),
  address: z.string().optional(),
});

// Cập nhật hồ sơ xác thực (optional)
const updateVerificationSchema = z.object({
  companyName: z.string()
    .trim()
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự')
    .optional(),

  taxCode: z.string()
    .trim()
    .regex(/^[0-9]{10}(-[0-9]{3})?$/, 'Mã số thuế không đúng định dạng')
    .optional(),

  companySize: companySizeEnum.optional(),

  industry: z.string()
    .trim()
    .min(2, 'Lĩnh vực hoạt động phải có ít nhất 2 ký tự')
    .optional(),

  description: z.string().optional(),
  website: z.string().url('Địa chỉ website không hợp lệ').optional().or(z.literal('')),
  email: z.string().email('Email liên hệ không hợp lệ').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9+() -]{9,15}$/, 'Số điện thoại liên hệ không hợp lệ').optional().or(z.literal('')),

  province: z.string().trim().min(2, 'Tên tỉnh/thành phố không hợp lệ').optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  address: z.string().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Vui lòng cung cấp ít nhất một trường cần cập nhật' }
);

// Cập nhật thông tin doanh nghiệp (Profile hiển thị)
const updateCompanyProfileSchema = z.object({
  companyName: z.string()
    .trim()
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự')
    .optional(),

  companySize: companySizeEnum.optional(),

  industry: z.string()
    .trim()
    .min(2, 'Lĩnh vực hoạt động phải có ít nhất 2 ký tự')
    .optional(),

  description: z.string().optional(),
  website: z.string().url('Địa chỉ website không hợp lệ').optional().or(z.literal('')),
  email: z.string().email('Email liên hệ không hợp lệ').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9+() -]{9,15}$/, 'Số điện thoại liên hệ không hợp lệ').optional().or(z.literal('')),

  province: z.string().trim().min(2, 'Tên tỉnh/thành phố không hợp lệ').optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  address: z.string().optional(),

  // Giữ lại hoặc thay thế ảnh môi trường cũ
  keepEnvironmentPhotos: z.union([z.string(), z.array(z.string())]).optional(),
});

export {
  companySizeEnum,
  registerVerificationSchema,
  updateVerificationSchema,
  updateCompanyProfileSchema,
};
