import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getProjectsServer, getPhasesServer, type Phase } from '@/features/projects/api';
import { getTasksServer, type Task } from '@/features/tasks/api';
import { PhaseGanttChart } from '@/features/projects/components/PhaseGanttChart';
import { PhaseScheduleActions } from '@/features/projects/components/PhaseScheduleActions';
import { ProjectMemoEditor } from '@/features/projects/components/ProjectMemoEditor';
import { ProjectTaskCreateModal } from '@/features/tasks/components/ProjectTaskCreateModal';
import { ProjectTaskTable } from '@/features/tasks/components/ProjectTaskTable';

export const metadata: Metadata = { title: 'プロジェクト詳細 | WebTask' };

// APIステータス → 表示ラベル
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

type Props = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const projectId = Number(id);

  const [projectsRes, tasksRes, phasesRes] = await Promise.all([
    getProjectsServer().catch(() => ({ data: [], links: {}, meta: {} }) as any),
    getTasksServer({ project_id: projectId }).catch(() => ({ data: [] as Task[] })),
    getPhasesServer(projectId).catch(() => ({ data: [] as Phase[] })),
  ]);

  const project = projectsRes.data.find((p: any) => p.id === projectId);
  if (!project) notFound();

  const tasks: Task[] = tasksRes.data;
  const phases: Phase[] = phasesRes.data;

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 納期の残り日数
  const deadlineDate = project.deadline ? new Date(project.deadline) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const remainDays = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const deadlineUrgent = remainDays !== null && remainDays <= 3;

  const deadlineLabel = deadlineDate
    ? `${deadlineDate.getMonth() + 1}月${deadlineDate.getDate()}日`
    : '未設定';
  const remainLabel =
    remainDays === null
      ? ''
      : remainDays < 0
        ? `${Math.abs(remainDays)}日超過`
        : `残り${remainDays}日`;

  const members: { id: number; name: string }[] = project.members ?? [];

  const metrics = [
    {
      label: '納期',
      value: deadlineLabel,
      sub: remainLabel,
      valueColor: deadlineUrgent ? '#791F1F' : '#111827',
      valueFontSize: 'text-base',
    },
    {
      label: 'タスク進捗',
      value: `${progressPercent}%`,
      sub: `${completedTasks}/${totalTasks} 完了`,
    },
    {
      label: '見積工数',
      value: project.estimated_hours ? `${project.estimated_hours}h` : '—',
      sub: '',
    },
    {
      label: '担当メンバー',
      value: `${members.length}名`,
      sub: members.map((m) => m.name).join('・'),
      valueFontSize: 'text-[15px]',
    },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2.5 flex-shrink-0">
        <Link href="/projects" className="text-xs text-gray-400 hover:text-gray-600">
          プロジェクト一覧 /
        </Link>
        <h1 className="text-[15px] font-medium flex-1">
          {project.name} — {project.client_name}
        </h1>
        <span
          className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${PROJECT_STATUS_STYLE[project.status] ?? 'bg-gray-100 text-gray-500'}`}
        >
          {PROJECT_STATUS_LABEL[project.status] ?? project.status}
        </span>
        <Button
          className="ml-2 text-xs bg-[#EEEDFE] text-[#3C3489] border border-[#AFA9EC] hover:bg-[#e4e3fd] px-3 py-1 h-auto rounded-md"
          variant="ghost"
        >
          ✦ AIタスク分解
        </Button>
        <ProjectTaskCreateModal projectId={projectId} phases={phases} members={members} />
      </header>

      <div className="p-5 flex-1 space-y-4">
        {/* メトリクス */}
        <div className="grid grid-cols-4 gap-2.5">
          {metrics.map((m) => (
            <div key={m.label} className="bg-gray-50 rounded-lg px-3.5 py-3">
              <div className="text-[11px] text-gray-400 mb-1">{m.label}</div>
              <div
                className={`${m.valueFontSize ?? 'text-[22px]'} font-medium`}
                style={{ color: m.valueColor ?? '#111827' }}
              >
                {m.value}
              </div>
              {m.sub && <div className="text-[11px] text-gray-400 mt-0.5">{m.sub}</div>}
            </div>
          ))}
        </div>

        {/* フェーズ ガントチャート */}
        <div>
          <div className="flex items-center mb-2.5">
            <h2 className="text-sm font-medium flex-1">スケジュール</h2>
            <PhaseScheduleActions
              projectId={projectId}
              hasPhases={phases.length > 0}
              members={members}
            />
          </div>
          <PhaseGanttChart project={project} phases={phases} members={members} />
        </div>

        {/* タスク＆メモ */}
        <div className="grid grid-cols-[1fr_320px] gap-3.5">
          {/* タスクリスト */}
          <div>
            <h2 className="text-sm font-medium mb-2.5">タスク</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <ProjectTaskTable tasks={tasks} phases={phases} members={members} />
            </div>
          </div>

          {/* プロジェクトのメモ */}
          <div>
            <h2 className="text-sm font-medium mb-2.5">プロジェクトのメモ</h2>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
              <ProjectMemoEditor projectId={projectId} memo={project.memo ?? null} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
