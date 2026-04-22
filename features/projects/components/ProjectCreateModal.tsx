'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { createProject } from '@/features/projects/api/projects';
import { getUsers, type User } from '@/features/users/api';

const schema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です').max(255),
  client_name: z.string().optional(),
  start_date: z.string().optional(),
  deadline: z.string().optional(),
  estimated_hours: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProjectCreateModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open && users.length === 0) {
      getUsers().then((res) => setUsers(res.data)).catch(() => {});
    }
  }, [open]);

  const toggleMember = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await createProject({
        name: values.name,
        client_name: values.client_name || null,
        start_date: values.start_date || null,
        deadline: values.deadline || null,
        estimated_hours: values.estimated_hours || null,
        status: 'not_started',
        member_ids: selectedIds,
      } as any);
      reset();
      setSelectedIds([]);
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedIds([]);
    setOpen(false);
  };

  return (
    <>
      <Button
        className="text-xs px-3 py-1.5 h-auto rounded-md"
        onClick={() => setOpen(true)}
      >
        + 新規プロジェクト
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-medium mb-4">新規プロジェクトを作成</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* プロジェクト名 */}
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">
                  プロジェクト名 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="例: コーポレートサイトリニューアル"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* クライアント名 */}
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">クライアント名</label>
                <input
                  {...register('client_name')}
                  type="text"
                  placeholder="例: 株式会社〇〇"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* 開始日・納期（横並び） */}
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
                  <label className="text-xs text-gray-600 font-medium block mb-1">納期</label>
                  <input
                    {...register('deadline')}
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
                  placeholder="例: 80"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* 担当メンバー */}
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">担当メンバー</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-xs text-gray-400 px-3 py-2">読み込み中...</p>
                  ) : (
                    users.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => toggleMember(user.id)}
                          className="w-3.5 h-3.5 rounded accent-blue-500"
                        />
                        <span className="text-sm text-gray-700">{user.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{user.email}</span>
                      </label>
                    ))
                  )}
                </div>
                {selectedIds.length > 0 && (
                  <p className="text-[11px] text-gray-400 mt-1">{selectedIds.length}名選択中</p>
                )}
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
                  {submitting ? '作成中...' : '作成する'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
