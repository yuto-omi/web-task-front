'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, CalendarRange, User, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';
import type { MeResponse } from '@/features/auth/api/me';

const NAV_ITEMS = [
  { label: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { label: 'プロジェクト一覧', href: '/projects', icon: FolderOpen },
  { label: 'スケジュール', href: '/schedule', icon: CalendarRange },
  { label: 'マイページ', href: '/mypage', icon: User },
  { label: '工数レポート', href: '/report', icon: BarChart2 },
] as const;

type Props = {
  user: MeResponse['user'];
};

export function Sidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav className="w-[200px] min-w-[200px] bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="px-3.5 py-4 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900">WebTask</div>
        <div className="text-[11px] text-gray-400 mt-0.5">チーム管理</div>
      </div>

      <div className="flex-1 py-2">
        <div className="px-3 pt-2 pb-1 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
          メイン
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 mx-1.5 px-2.5 py-1.5 rounded-md text-xs my-px border transition-colors',
                isActive
                  ? 'bg-gray-50 text-gray-900 border-gray-200'
                  : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon
                className={cn('w-3.5 h-3.5 flex-shrink-0', isActive ? 'opacity-100' : 'opacity-60')}
              />
              {item.label}
            </Link>
          );
        })}
      </div>

      <UserMenu user={user} />
    </nav>
  );
}
