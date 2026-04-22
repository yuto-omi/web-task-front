import Link from 'next/link';
import type { Metadata } from 'next';

import { serverMe } from '@/features/auth/api';
import { getProjectsServer, type Project } from '@/features/projects/api';
import { getTasksServer, type Task } from '@/features/tasks/api';

export const metadata: Metadata = { title: 'ダッシュボード | WebTask' };

const PROJECT_STATUS_LABEL: Record<string, string> = {
  not_started: '受注',
  in_progress: '進行中',
  completed: '納品済',
};

const PROJECT_STATUS_STYLE: Record<string, string> = {
  not_started: 'bg-[#F1EFE8] text-[#444441]',
  in_progress: 'bg-[#FAEEDA] text-[#633806]',
  completed: 'bg-[#EAF3DE] text-[#27500A]',
};

const TASK_STATUS_LABEL: Record<string, string> = {
  pending: '未着手',
  in_progress: '進行中',
  in_review: 'レビュー待ち',
  done: '完了',
};

const TASK_STATUS_STYLE: Record<string, string> = {
  pending: 'bg-[#F1EFE8] text-[#444441]',
  in_progress: 'bg-[#FAEEDA] text-[#633806]',
  in_review: 'bg-[#EEEDFE] text-[#3C3489]',
  done: 'bg-[#EAF3DE] text-[#27500A]',
};

const PRIORITY_STYLE: Record<string, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-gray-400',
};

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export default async function DashboardPage() {
  const [meRes, projectsRes, allTasksRes] = await Promise.all([
    serverMe().catch(() => null),
    getProjectsServer().catch(() => ({ data: [] as Project[], links: {} as any, meta: {} as any })),
    getTasksServer().catch(() => ({ data: [] as Task[] })),
  ]);

  const me = meRes?.user;
  const projects: Project[] = projectsRes.data ?? [];
  const allTasks: Task[] = allTasksRes.data ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ユーザーが所属する案件のタスクのみ絞り込む
  const memberProjectIds = new Set(projects.map((p) => p.id));
  const projectTasks = allTasks.filter(
    (t) => t.project_id !== null && memberProjectIds.has(t.project_id as number),
  );

  // 自分の担当タスク（未完了・期日順）
  const myTasks = (
    me ? projectTasks.filter((t) => t.assignee_id === me.id && t.status !== 'done') : []
  ).sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  // メトリクス
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const urgentCount = projects.filter((p) => {
    if (!p.deadline || p.status === 'completed') return false;
    const diff = Math.ceil((new Date(p.deadline).getTime() - today.getTime()) / 86400000);
    return diff >= 0 && diff <= 7;
  }).length;
  const totalNotDone = projectTasks.filter((t) => t.status !== 'done').length;
  const totalDone = projectTasks.filter((t) => t.status === 'done').length;

  const metrics = [
    {
      label: '進行中の案件',
      value: String(inProgressCount),
      sub: urgentCount > 0 ? `${urgentCount}件が納期7日以内` : '納期迫り案件なし',
      urgency: urgentCount > 0,
    },
    {
      label: '自分の担当タスク',
      value: String(myTasks.length),
      sub: `チーム全体: 未完了 ${totalNotDone}件`,
      urgency: false,
    },
    {
      label: '参加案件数',
      value: String(projects.length),
      sub: `完了済 ${projects.filter((p) => p.status === 'completed').length}件`,
      urgency: false,
    },
    {
      label: '完了タスク',
      value: String(totalDone),
      sub: `全タスク ${projectTasks.length}件中`,
      urgency: false,
    },
  ];

  // 期日順にソートした案件
  const projectsSorted = [...projects].sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2.5 flex-shrink-0">
        <h1 className="text-[15px] font-medium flex-1">ダッシュボード</h1>
        {me && (
          <span className="text-[12px] text-gray-400">
            こんにちは、{me.name}さん
          </span>
        )}
      </header>

      <div className="p-5 flex-1 space-y-4">
        {/* メトリクス */}
        <div className="grid grid-cols-4 gap-2.5">
          {metrics.map((m) => (
            <div key={m.label} className="bg-gray-50 rounded-lg px-3.5 py-3">
              <div className="text-[11px] text-gray-400 mb-1">{m.label}</div>
              <div
                className="text-[22px] font-medium"
                style={{ color: m.urgency ? '#791F1F' : '#111827' }}
              >
                {m.value}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* 2カラム */}
        <div className="grid grid-cols-[1fr_300px] gap-3.5">
          {/* 案件一覧 */}
          <div>
            <div className="flex items-center mb-2.5">
              <h2 className="text-sm font-medium flex-1">参加中の案件</h2>
              <Link
                href="/projects"
                className="text-[11px] px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              >
                すべて見る
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {projectsSorted.length === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-8">案件がありません</p>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      {['案件名', '状態', '納期', '進捗', 'メンバー'].map((h) => (
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
                    {projectsSorted.map((project) => {
                      const deadlineDate = project.deadline ? new Date(project.deadline) : null;
                      const remainDays = deadlineDate
                        ? Math.ceil((deadlineDate.getTime() - today.getTime()) / 86400000)
                        : null;
                      const urgent =
                        remainDays !== null &&
                        remainDays <= 3 &&
                        project.status !== 'completed';
                      const deadlineLabel = deadlineDate
                        ? `${deadlineDate.getMonth() + 1}/${deadlineDate.getDate()}`
                        : '—';

                      return (
                        <tr
                          key={project.id}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="px-2.5 py-2.5">
                            <Link
                              href={`/projects/${project.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {project.name}
                            </Link>
                            {project.client_name && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {project.client_name}
                              </div>
                            )}
                          </td>
                          <td className="px-2.5 py-2.5">
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PROJECT_STATUS_STYLE[project.status] ?? 'bg-gray-100 text-gray-500'}`}
                            >
                              {PROJECT_STATUS_LABEL[project.status] ?? project.status}
                            </span>
                          </td>
                          <td
                            className="px-2.5 py-2.5 whitespace-nowrap text-[12px]"
                            style={{ color: urgent ? '#791F1F' : '#6b7280' }}
                          >
                            {deadlineLabel}
                            {urgent && (
                              <span className="ml-1 text-[10px] font-medium">!</span>
                            )}
                          </td>
                          <td className="px-2.5 py-2.5 w-[150px]">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${project.progress_rate}%`,
                                    backgroundColor:
                                      project.progress_rate >= 80 ? '#1D9E75' : '#7B8CDE',
                                  }}
                                />
                              </div>
                              <span className="text-[11px] text-gray-500 w-8 text-right flex-shrink-0">
                                {project.progress_rate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-2.5 py-2.5">
                            <div className="flex items-center gap-0.5">
                              {project.members.slice(0, 4).map((m) => (
                                <div
                                  key={m.id}
                                  className="w-5 h-5 rounded-full bg-blue-50 border border-white flex items-center justify-center text-[8px] font-medium text-blue-800 -ml-1 first:ml-0"
                                  title={m.name}
                                >
                                  {m.name.slice(0, 1)}
                                </div>
                              ))}
                              {project.members.length > 4 && (
                                <span className="text-[10px] text-gray-400 ml-1">
                                  +{project.members.length - 4}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 自分の担当タスク */}
          <div>
            <div className="flex items-center mb-2.5">
              <h2 className="text-sm font-medium flex-1">自分の担当タスク</h2>
              <Link
                href="/mypage"
                className="text-[11px] px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
              >
                マイページ
              </Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              {myTasks.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-6">
                  担当タスクはありません
                </p>
              ) : (
                <>
                  {myTasks.slice(0, 8).map((task) => {
                    const taskDue = task.due_date ? new Date(task.due_date) : null;
                    const taskRemain = taskDue
                      ? Math.ceil((taskDue.getTime() - today.getTime()) / 86400000)
                      : null;
                    const taskUrgent = taskRemain !== null && taskRemain <= 3;
                    const dueDateLabel = taskDue
                      ? `${taskDue.getMonth() + 1}/${taskDue.getDate()}`
                      : null;

                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-2 py-2.5 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-gray-900 truncate leading-snug">
                            {task.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[10px] font-medium px-1 py-0.5 rounded-full ${TASK_STATUS_STYLE[task.status] ?? ''}`}
                            >
                              {TASK_STATUS_LABEL[task.status]}
                            </span>
                            {task.priority && (
                              <span
                                className={`text-[10px] font-medium ${PRIORITY_STYLE[task.priority] ?? 'text-gray-400'}`}
                              >
                                {PRIORITY_LABEL[task.priority]}
                              </span>
                            )}
                          </div>
                        </div>
                        {dueDateLabel && (
                          <span
                            className="text-[11px] flex-shrink-0 mt-0.5"
                            style={{ color: taskUrgent ? '#791F1F' : '#9ca3af' }}
                          >
                            {dueDateLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {myTasks.length > 8 && (
                    <div className="pt-2 text-center">
                      <Link href="/mypage" className="text-[11px] text-blue-500 hover:underline">
                        他 {myTasks.length - 8} 件を見る
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
