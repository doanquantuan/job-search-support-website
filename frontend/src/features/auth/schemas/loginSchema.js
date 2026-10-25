import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .trim()
    .email('Vui lòng nhập email đúng định dạng.'),
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc'),
});

