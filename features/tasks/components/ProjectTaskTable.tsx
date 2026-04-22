'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { type Task, deleteTask } from '@/features/tasks/api';
import type { Phase } from '@/features/projects/api';
import { ProjectTaskEditModal } from './ProjectTaskEditModal';

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

type Props = {
  tasks: Task[];
  phases: Phase[];
  members: { id: number; name: string }[];
};

export function ProjectTaskTable({ tasks, phases, members }: Props) {
  const router = useRouter();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (taskId: number) => {
    setDeletingId(taskId);
    try {
      await deleteTask(taskId);
      setConfirmDeleteId(null);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (tasks.length === 0) {
    return (
      <p className="text-[13px] text-gray-400 text-center py-8">タスクがありません</p>
    );
  }

  return (
    <>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {['タスク名', '種別', '担当', '期日', '見積', 'ステータス', ''].map((h, i) => (
              <th
                key={i}
                className="text-left px-2.5 py-2 text-[11px] text-gray-400 font-medium border-b border-gray-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const taskDue = task.due_date ? new Date(task.due_date) : null;
            const taskRemain = taskDue
              ? Math.ceil((taskDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              : null;
            const taskUrgent = taskRemain !== null && taskRemain <= 3 && task.status !== 'done';
            const dueDateLabel = taskDue
              ? `${taskDue.getMonth() + 1}/${taskDue.getDate()}`
              : '—';
            const assigneeName = task.assignee?.name ?? '—';
            const assigneeInitials = assigneeName !== '—' ? assigneeName.slice(0, 2) : '—';

            return (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-2.5 py-2.5 font-medium text-gray-900 w-[38%]">
                  <span className={task.status === 'done' ? 'line-through text-gray-400' : ''}>
                    {task.title}
                  </span>
                  {task.memo && (
                    <p className="text-[11px] text-gray-400 font-normal mt-0.5 line-clamp-1">
                      {task.memo}
                    </p>
                  )}
                </td>
                <td className="px-2.5 py-2.5">
                  {task.type_tag ? (
                    <span className="text-[11px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-500">
                      {task.type_tag}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-2.5 py-2.5">
                  {assigneeName !== '—' ? (
                    <div
                      className="w-[18px] h-[18px] rounded-full bg-blue-50 flex items-center justify-center text-[9px] font-medium text-blue-800"
                      title={assigneeName}
                    >
                      {assigneeInitials}
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td
                  className="px-2.5 py-2.5"
                  style={{ color: taskUrgent ? '#791F1F' : '#374151' }}
                >
                  {dueDateLabel}
                </td>
                <td className="px-2.5 py-2.5 text-gray-600">
                  {task.estimated_hours ? `${task.estimated_hours}h` : '—'}
                </td>
                <td className="px-2.5 py-2.5">
                  <span
                    className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${TASK_STATUS_STYLE[task.status] ?? 'bg-gray-100 text-gray-500'}`}
                  >
                    {TASK_STATUS_LABEL[task.status] ?? task.status}
                  </span>
                </td>
                <td className="px-2.5 py-2.5">
                  <div className="flex items-center gap-1 justify-end">
                    {/* 編集ボタン */}
                    <button
                      type="button"
                      onClick={() => setEditingTask(task)}
                      className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                      title="編集"
                    >
                      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                        <path
                          d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* 削除ボタン / インライン確認 */}
                    {confirmDeleteId === task.id ? (
                      <span className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-500">削除しますか？</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(task.id)}
                          disabled={deletingId === task.id}
                          className="text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deletingId === task.id ? '...' : 'はい'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          いいえ
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(task.id)}
                        className="p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                        title="削除"
                      >
                        <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                          <path
                            d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8h3l.5-8"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editingTask && (
        <ProjectTaskEditModal
          task={editingTask}
          phases={phases}
          members={members}
          open={true}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
