import type { Metadata } from 'next';

import { type Task, getTasksServer } from '@/features/tasks/api';
import { getProjectsServer } from '@/features/projects/api';

import { PersonalTaskAccordion } from '@/features/tasks/components/PersonalTaskAccordion';
import { PersonalTaskCreateModal } from '@/features/tasks/components/PersonalTaskCreateModal';
import { ProjectTaskList } from '@/features/tasks/components/ProjectTaskList';

export const metadata: Metadata = { title: 'マイページ | WebTask' };

const AI_SUGGESTIONS = [
  '優先度: 「LP実装 - ヒーローsection」は期日明日。先に着手してください。',
  '「ブラウザテスト」は30分で完了できます。午後の隙間に入れるのがおすすめです。',
];

const WORK_SUMMARY = {
  actual: '18.5h',
  estimated: '24h',
  breakdown: [
    { name: 'コーポレートサイト', hours: '10h' },
    { name: '□□クリニック LP', hours: '6h' },
    { name: '個人タスク', hours: '2.5h' },
  ],
};


export default async function MyPage() {
  const [personalRes, allRes, projectsRes] = await Promise.all([
    getTasksServer({ project_id: 'null' }).catch(() => ({ data: [] as Task[] })),
    getTasksServer().catch(() => ({ data: [] as Task[] })),
    getProjectsServer().catch(() => ({ data: [] })),
  ]);

  const personalTasks = personalRes.data;
  // ログインユーザーが所属する案件のIDセット
  const memberProjectIds = new Set(projectsRes.data.map((p: any) => p.id));
  const projectTasks = allRes.data.filter(
    (t: Task) => t.project_id !== null && memberProjectIds.has(t.project_id),
  );

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2.5 flex-shrink-0">
        <h1 className="text-[15px] font-medium flex-1">マイページ</h1>
        <PersonalTaskCreateModal />
      </header>

      <div className="p-5 flex-1">
        {/* AI提案パネル */}
        <div className="bg-[#EEEDFE] border border-[#AFA9EC] rounded-xl px-4 py-3.5 mb-4">
          <div className="text-xs font-medium text-[#3C3489] mb-2">✦ 今日のAI提案</div>
          {AI_SUGGESTIONS.map((text, i) => (
            <div
              key={i}
              className="text-xs text-[#534AB7] py-1 border-b border-[#CECBF6] last:border-b-0"
            >
              {text}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-3.5">
          {/* 今日のタスク */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-medium flex-1">今日のタスク</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              {/* ヘッダー行 */}
              <div className="flex items-center gap-2.5 pb-2 mb-1 border-b border-gray-200">
                <div className="w-3.5 flex-shrink-0" />
                <div className="flex-1 text-[10px] text-gray-400 font-medium">タスク名</div>
                <div className="text-[10px] text-gray-400 font-medium w-8 text-center whitespace-nowrap">優先度</div>
                <div className="text-[10px] text-gray-400 font-medium w-10 text-right">見積工数</div>
                <div className="text-[10px] text-gray-400 font-medium w-[72px] text-right">期日</div>
                <div className="w-[22px] flex-shrink-0" />
              </div>

              {/* 案件タスク */}
              <div className="text-[11px] text-gray-400 font-medium mb-2 mt-2">案件タスク</div>
              <ProjectTaskList tasks={projectTasks} />

              {/* 個人タスク */}
              <div className="border-t border-gray-200 mt-2.5 pt-2 mb-2">
                <div className="text-[11px] text-gray-400 font-medium mb-2">個人タスク</div>
              </div>
              <PersonalTaskAccordion tasks={personalTasks} />
            </div>
          </div>

          {/* 工数サマリー */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-medium flex-1">今週の工数サマリー</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <div className="text-[11px] text-gray-400 mb-1">実績</div>
                  <div className="text-[18px] font-medium text-gray-900">{WORK_SUMMARY.actual}</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <div className="text-[11px] text-gray-400 mb-1">見積合計</div>
                  <div className="text-[18px] font-medium text-gray-900">
                    {WORK_SUMMARY.estimated}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 font-medium mb-1.5">案件別内訳</div>
              {WORK_SUMMARY.breakdown.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-xs py-1.5 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900">{item.name}</span>
                  <span className="text-gray-500">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
