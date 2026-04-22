'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { createTask, type TaskPriority } from '@/features/tasks/api';
import type { Phase } from '@/features/projects/api';

const schema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(255),
  phase_id: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.string().optional(),
  memo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  projectId: number;
  phases: Phase[];
  members: { id: number; name: string }[];
};

export function ProjectTaskCreateModal({ projectId, phases, members }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await createTask({
        project_id: projectId,
        phase_id: values.phase_id ? Number(values.phase_id) : null,
        assignee_id: values.assignee_id ? Number(values.assignee_id) : undefined,
        title: values.title,
        priority: (values.priority as TaskPriority) ?? null,
        due_date: values.due_date || null,
        estimated_hours: values.estimated_hours || null,
        memo: values.memo || null,
        status: 'pending',
      });
      reset();
      setOpen(false);
      // サーバーコンポーネントのデータを再取得
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setOpen(false);
  };

  return (
    <>
      <Button
        className="text-xs px-3 py-1 h-auto rounded-md"
        onClick={() => setOpen(true)}
      >
        + タスク追加
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-medium mb-4">タスクを追加</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* タイトル */}
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="タスク名を入力"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
                {errors.title && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* フェーズ */}
              {phases.length > 0 && (
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">フェーズ</label>
                  <select
                    {...register('phase_id')}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                  >
                    <option value="">未設定</option>
                    {phases.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 優先度・担当者（横並び） */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">優先度</label>
                  <select
                    {...register('priority')}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                  >
                    <option value="">未設定</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">担当者</label>
                  <select
                    {...register('assignee_id')}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
                  >
                    <option value="">未設定</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 期日・見積工数（横並び） */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">期日</label>
                  <input
                    {...register('due_date')}
                    type="date"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium block mb-1">
                    見積工数（h）
                  </label>
                  <input
                    {...register('estimated_hours')}
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="例: 2.5"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* メモ */}
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">メモ</label>
                <textarea
                  {...register('memo')}
                  rows={3}
                  placeholder="メモを入力（任意）"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                />
              </div>

              {/* ボタン */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 text-sm border border-gray-200 rounded-lg py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 text-sm py-2 h-auto"
                >
                  {submitting ? '登録中...' : '追加する'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
