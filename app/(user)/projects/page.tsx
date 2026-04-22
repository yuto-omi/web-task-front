import Link from 'next/link';
import type { Metadata } from 'next';

import { type Project, getProjectsServer } from '@/features/projects/api';
import { ProjectCreateModal } from '@/features/projects/components/ProjectCreateModal';
import { ProjectRowActions } from '@/features/projects/components/ProjectRowActions';

export const metadata: Metadata = { title: 'プロジェクト一覧 | WebTask' };

const STATUS_LABEL: Record<string, string> = {
  not_started: '受注',
  in_progress:  '進行中',
  completed:    '納品済',
};

const STATUS_STYLE: Record<string, string> = {
  not_started: 'bg-[#F1EFE8] text-[#444441]',
  in_progress:  'bg-[#FAEEDA] text-[#633806]',
  completed:    'bg-[#EAF3DE] text-[#27500A]',
};

const PROGRESS_COLOR: Record<string, string> = {
  not_started: '#9CA3AF',
  in_progress:  '#378ADD',
  completed:    '#1D9E75',
};

function memberInitials(name: string): string {
  return name.slice(0, 2);
}

function isDeadlineUrgent(deadline: string | null): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff < 1000 * 60 * 60 * 24 * 7; // 7日以内
}

export default async function ProjectsPage() {
  const res = await getProjectsServer().catch(() => ({ data: [] as Project[], links: null, meta: null }));
  const projects = res.data;

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2.5 flex-shrink-0">
        <h1 className="text-[15px] font-medium flex-1">プロジェクト一覧</h1>
        <button className="text-xs px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 mr-1.5">
          フィルタ
        </button>
        <ProjectCreateModal />
      </header>

      <div className="p-5 flex-1">
        {/* プロジェクトテーブル */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {['プロジェクト名', 'クライアント', 'ステータス', '納期', '進捗', '見積工数', '担当', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-2.5 py-2 text-[11px] text-gray-400 font-medium border-b border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2.5 py-6 text-center text-gray-400 text-[12px]">
                    プロジェクトがありません
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const urgent = isDeadlineUrgent(p.deadline);
                  const progress = Math.round(p.progress_rate);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                      <td className="px-2.5 py-2.5">
                        <Link href={`/projects/${p.id}`} className="font-medium text-gray-900 hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-2.5 py-2.5 text-gray-500">{p.client_name ?? '—'}</td>
                      <td className="px-2.5 py-2.5">
                        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLE[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-2.5 py-2.5 font-medium" style={{ color: urgent ? '#791F1F' : '#374151' }}>
                        {p.deadline ?? '—'}
                      </td>
                      <td className="px-2.5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-[60px] h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${progress}%`, backgroundColor: PROGRESS_COLOR[p.status] }}
                            />
                          </div>
                          <span className="text-gray-500">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 text-gray-600">
                        {p.estimated_hours ? `${p.estimated_hours}h` : '—'}
                      </td>
                      <td className="px-2.5 py-2.5">
                        <div className="flex gap-1">
                          {p.members?.map((m) => (
                            <div
                              key={m.id}
                              title={m.name}
                              className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[9px] font-medium text-blue-800"
                            >
                              {memberInitials(m.name)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5">
                        <ProjectRowActions project={p} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
