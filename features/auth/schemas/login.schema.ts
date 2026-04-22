import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Laravel JWT レスポンス（ApiResponse::data はラッパーなしで返す）
export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
