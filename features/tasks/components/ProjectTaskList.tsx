'use client';

import { useState } from 'react';

import { type Task } from '@/features/tasks/api';
import { PersonalTaskEditModal } from './PersonalTaskEditModal';

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_STYLE: Record<string, string> = {
  high: 'bg-[#FCEBEB] text-[#791F1F]',
  medium: 'bg-[#FAEEDA] text-[#633806]',
  low: 'bg-[#F1EFE8] text-[#444441]',
};

type Props = {
  tasks: Task[];
};

export function ProjectTaskList({ tasks }: Props) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return <p className="text-[12px] text-gray-400 py-2">案件タスクはありません</p>;
  }

  return (
    <>
      {editingTask && (
        <PersonalTaskEditModal
          task={editingTask}
          open={true}
          onClose={() => setEditingTask(null)}
        />
      )}

      {tasks.map((task: Task) => (
        <div
          key={task.id}
          className="flex items-center gap-2.5 py-2.5 border-b border-gray-100 last:border-b-0"
        >
          <div className="w-3.5 h-3.5 rounded-sm border border-gray-300 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-gray-900 truncate">{task.title}</div>
          </div>
          {task.priority ? (
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full w-8 text-center flex-shrink-0 ${PRIORITY_STYLE[task.priority] ?? ''}`}
            >
              {PRIORITY_LABEL[task.priority] ?? task.priority}
            </span>
          ) : (
            <span className="w-8 flex-shrink-0" />
          )}
          <span className="text-[11px] text-gray-400 flex-shrink-0 w-10 text-right">
            {task.estimated_hours ? `${task.estimated_hours}h` : '—'}
          </span>
          <span className="text-[11px] text-gray-400 flex-shrink-0 w-[72px] text-right">
            {task.due_date ?? '—'}
          </span>
          {/* 編集ボタン */}
          <button
            type="button"
            onClick={() => setEditingTask(task)}
            className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
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
        </div>
      ))}
    </>
  );
}
