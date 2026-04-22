'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { type Phase, updatePhase } from '@/features/projects/api';

const schema = z.object({
  name: z.string().min(1, 'フェーズ名は必須です').max(255),
  assignee_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  estimated_hours: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  phase: Phase;
  members: { id: number; name: string }[];
  open: boolean;
  onClose: () => void;
};

export function PhaseEditModal({ phase, members, open, onClose }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: phase.name,
        assignee_id: phase.assignee_id ? String(phase.assignee_id) : '',
        start_date: phase.start_date ?? undefined,
        end_date: phase.end_date ?? undefined,
        estimated_hours: phase.estimated_hours ?? undefined,
      });
    }
  }, [open, phase, reset]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await updatePhase(phase.project_id, phase.id, {
        name: values.name,
        assignee_id: values.assignee_id ? Number(values.assignee_id) : null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        estimated_hours: values.estimated_hours || null,
      });
      onClose();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-medium mb-4">フェーズを編集</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* フェーズ名 */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">
              フェーズ名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="例: デザイン"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* 担当者 */}
          {members.length > 0 && (
            <div>
              <label className="text-xs text-gray-600 font-medium block mb-1">担当者</label>
              <select
                {...register('assignee_id')}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white"
              >
                <option value="">未設定</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 開始日・終了日（横並び） */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 font-medium block mb-1">開始日</label>
              <input
                {...register('start_date')}
                type="date"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium block mb-1">終了日</label>
              <input
                {...register('end_date')}
                type="date"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* 見積工数 */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">見積工数（h）</label>
            <input
              {...register('estimated_hours')}
              type="number"
              step="0.5"
              min="0"
              placeholder="例: 20"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm border border-gray-200 rounded-lg py-2 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <Button type="submit" disabled={submitting} className="flex-1 text-sm py-2 h-auto">
              {submitting ? '更新中...' : '保存する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
