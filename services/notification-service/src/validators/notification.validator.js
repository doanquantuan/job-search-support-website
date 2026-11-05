import { z } from 'zod';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const notificationTypeEnum = z.enum([
  'APPLICATION',
  'COMPANY',
  'SECURITY',
  'MESSAGE',
  'JOB',
  'SYSTEM',
], {
  message: 'Loại thông báo (type) không hợp lệ',
});

// Schema truy vấn danh sách thông báo
export const getNotificationsQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'Trang (page) phải là số nguyên dương' })
    .int('Trang (page) phải là số nguyên')
    .min(1, 'Trang (page) phải bắt đầu từ 1')
    .default(1),

  limit: z.coerce
    .number({ invalid_type_error: 'Số lượng (limit) phải là số nguyên dương' })
    .int('Số lượng (limit) phải là số nguyên')
    .min(1, 'Số lượng thông báo mỗi trang (limit) phải từ 1 đến 50')
    .max(50, 'Số lượng thông báo mỗi trang (limit) phải từ 1 đến 50')
    .default(10),

  isRead: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return val;
    }, z.boolean({ invalid_type_error: 'Trạng thái isRead phải là boolean (true/false)' }))
    .optional(),

  type: notificationTypeEnum.optional(),
});

// Schema kiểm tra UUID trong params (chấp nhận chuẩn 128-bit hex UUID của PostgreSQL)
export const notificationIdParamSchema = z.object({
  id: z.string().regex(uuidRegex, 'Mã thông báo (id) phải là định dạng UUID hợp lệ'),
});

// Schema tạo thông báo hệ thống (Admin / S2S)
export const createSystemNotificationSchema = z.object({
  recipientId: z.string({ required_error: 'Mã người nhận (recipientId) là bắt buộc' })
    .regex(uuidRegex, 'Mã người nhận (recipientId) phải là UUID hợp lệ'),

  title: z.string({ required_error: 'Tiêu đề thông báo là bắt buộc' })
    .trim()
    .min(1, 'Tiêu đề thông báo không được để trống')
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự'),

  content: z.string({ required_error: 'Nội dung thông báo là bắt buộc' })
    .trim()
    .min(1, 'Nội dung thông báo không được để trống'),

  type: notificationTypeEnum.default('SYSTEM'),

  targetUrl: z.string()
    .trim()
    .max(500, 'Đường dẫn targetUrl không được vượt quá 500 ký tự')
    .optional()
    .nullable(),

  metadata: z.record(z.any()).optional().nullable(),
});

export default {
  notificationTypeEnum,
  getNotificationsQuerySchema,
  notificationIdParamSchema,
  createSystemNotificationSchema,
};
