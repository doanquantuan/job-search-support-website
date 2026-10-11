const { z } = require('zod');

const companySizeEnum = z.enum([
  'SIZE_1_10',
  'SIZE_11_50',
  'SIZE_51_200',
  'SIZE_201_500',
  'SIZE_501_1000',
  'SIZE_1001_5000',
], {
  errorMap: () => ({ message: 'Quy mô công ty không hợp lệ' }),
});

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

  // Hỗ trợ location dạng object hoặc các trường lẻ từ multipart/form-data
  province: z.string({ required_error: 'Tỉnh/Thành phố là bắt buộc' }).trim().min(2, 'Tên tỉnh/thành phố không hợp lệ'),
  district: z.string().optional(),
  ward: z.string().optional(),
  address: z.string().optional(),
});

module.exports = {
  registerVerificationSchema,
};
