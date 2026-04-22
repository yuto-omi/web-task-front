'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/login.schema';
import { login } from '@/features/auth/api';

export type LoginActionState =
  | { success: true }
  | {
      success: false;
      errors: Partial<Record<keyof LoginInput, string[]>> & { _root?: string[] };
    };

export async function loginAction(
  _prevState: LoginActionState | null,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  let token: string;
  try {
    const data = await login(parsed.data.email, parsed.data.password);
    token = data.access_token;
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 401) {
      return {
        success: false,
        errors: { _root: ['メールアドレスまたはパスワードが正しくありません'] },
      };
    }
    return {
      success: false,
      errors: { _root: ['ログインに失敗しました。しばらくしてから再度お試しください'] },
    };
  }

  // JWT トークンを httpOnly Cookie に保存（アクセストークン有効期限: 60分）
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  redirect('/dashboard');
}
