'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { logoutAction } from '@/features/auth/api/logout-action';
import type { MeResponse } from '@/features/auth/api/me';

type Props = {
  user: MeResponse['user'];
};

export function UserMenu({ user }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user.name.charAt(0);

  return (
    <div
      className="mt-auto pt-2 pb-2.5 px-2 border-t border-gray-200 relative"
      onMouseEnter={() => setMenuOpen(true)}
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* ホバーメニュー */}
      {menuOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <Link
            href="/settings/profile"
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 opacity-60" />
            プロフィール設定
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 opacity-60" />
              ログアウト
            </button>
          </form>
        </div>
      )}

      {/* ユーザー情報 */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-medium text-blue-800 flex-shrink-0">
          {initials}
        </div>
        <span>{user.name}</span>
      </div>
    </div>
  );
}
