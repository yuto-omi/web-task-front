'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginInput } from '@/features/auth/schemas/login.schema';
import { loginAction, type LoginActionState } from '@/features/auth/api/login-action';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginActionState | null, FormData>(
    loginAction,
    null,
  );

  const {
    register,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  // サーバー側の汎用エラーはトーストで通知
  useEffect(() => {
    if (state && !state.success && state.errors._root) {
      toast.error(state.errors._root[0]);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-xl w-full max-w-sm overflow-hidden shadow-sm">
        {/* ブランドヘッダー */}
        <div className="px-7 pt-6 pb-5 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-900">WebTask</div>
          <div className="text-[11px] text-gray-400 mt-0.5">チーム管理ツール</div>
        </div>

        <div className="px-7 py-6">
          <h1 className="text-[15px] font-medium text-gray-900 mb-5">ログイン</h1>

          <form action={formAction} noValidate>
            {/* メールアドレス */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-xs text-gray-500 mb-1.5">
                メールアドレス
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="user@example.com"
                suppressHydrationWarning
                className={cn(
                  'w-full px-3 py-2 text-sm text-gray-900 border rounded-lg outline-none transition-colors placeholder:text-gray-300',
                  errors.email
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-gray-400',
                )}
              />
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-red-500">{errors.email.message}</p>
              )}
              {state && !state.success && state.errors.email && (
                <p className="mt-1.5 text-[11px] text-red-500">{state.errors.email[0]}</p>
              )}
            </div>

            {/* パスワード */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-xs text-gray-500 mb-1.5">
                パスワード
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                suppressHydrationWarning
                className={cn(
                  'w-full px-3 py-2 text-sm text-gray-900 border rounded-lg outline-none transition-colors placeholder:text-gray-300',
                  errors.password
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-gray-400',
                )}
              />
              {errors.password && (
                <p className="mt-1.5 text-[11px] text-red-500">{errors.password.message}</p>
              )}
              {state && !state.success && state.errors.password && (
                <p className="mt-1.5 text-[11px] text-red-500">{state.errors.password[0]}</p>
              )}
            </div>

            {/* 送信ボタン */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full justify-center h-9 text-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )}
            </Button>
          </form>

          {/* 仮実装の案内 */}
          <p className="mt-4 text-[11px] text-gray-400 text-center">
            テスト用: test@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
