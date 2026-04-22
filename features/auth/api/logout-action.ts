'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export async function logoutAction(): Promise<void> {
  // Laravel側でトークンをブラックリストに追加
  await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {
    // ログアウトAPIが失敗してもCookieは削除する
  });

  const cookieStore = await cookies();
  cookieStore.delete('auth_token');

  redirect('/login');
}
