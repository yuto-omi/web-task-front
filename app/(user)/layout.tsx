import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { serverMe } from '@/features/auth/api';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const data = await serverMe().catch(() => null);
  if (!data) redirect('/login');

  return (
    <div className="flex h-screen min-h-[700px] bg-gray-100 overflow-hidden">
      <Sidebar user={data.user} />
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">{children}</main>
    </div>
  );
}
