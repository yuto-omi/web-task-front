'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { updateProject } from '@/features/projects/api';

type Props = {
  projectId: number;
  memo: string | null;
};

export function ProjectMemoEditor({ projectId, memo }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(memo ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProject(projectId, { memo: value.trim() || null } as any);
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(memo ?? '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          autoFocus
          className="w-full text-[13px] text-gray-700 border border-blue-300 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-100 resize-none"
          placeholder="プロジェクトのメモを入力..."
        />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-[11px] px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-[11px] px-3 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative min-h-[60px]">
      {memo ? (
        <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed pr-6">
          {memo}
        </p>
      ) : (
        <p className="text-[12px] text-gray-300 italic">メモを追加...</p>
      )}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="absolute top-0 right-0 p-0.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
        title="編集"
      >
        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
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
  );
}
