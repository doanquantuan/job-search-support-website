import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email là bắt buộc')
    .trim()
    .email('Vui lòng nhập email đúng định dạng.'),
});

