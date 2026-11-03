import { z } from 'zod';

export const registerSchema = z
  .object({
    role: z.enum(['JOB_SEEKER', 'RECRUITER'], {
      required_error: 'Vui lòng chọn vai trò',
    }),
    fullName: z
      .string()
      .min(1, 'Họ và tên là bắt buộc')
      .min(2, 'Họ và tên phải có từ 2 đến 50 ký tự.')
      .max(50, 'Họ và tên phải có từ 2 đến 50 ký tự.'),
    email: z
      .string()
      .min(1, 'Email là bắt buộc')
      .trim()
      .email('Vui lòng nhập email đúng định dạng.'),
    password: z
      .string()
      .min(1, 'Mật khẩu là bắt buộc')
      .refine(
        (val) =>
          val.length >= 8 &&
          /[A-Z]/.test(val) &&
          /[a-z]/.test(val) &&
          /[0-9]/.test(val) &&
          /[^A-Za-z0-9]/.test(val),
        {
          message: 'Mật khẩu chưa đáp ứng các yêu cầu bên dưới.',
        }
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });

export const getPasswordStrength = (password = '') => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return { checks, score: passed };
};
