import type { Metadata } from 'next';

import { getProjectsServer } from '@/features/projects/api';
import { GanttChart } from '@/features/schedule/components/GanttChart';

export const metadata: Metadata = { title: 'スケジュール | WebTask' };

export default async function SchedulePage() {
  const projectsRes = await getProjectsServer().catch(() => ({
    data: [],
    links: {},
    meta: {},
  } as any));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2.5 flex-shrink-0">
        <h1 className="text-[15px] font-medium flex-1">スケジュール</h1>
        <span className="text-[11px] text-gray-400">
          ▶ をクリックするとフェーズを表示
        </span>
      </header>

      <GanttChart projects={projectsRes.data} />
    </div>
  );
}
