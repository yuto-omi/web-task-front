'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createPhase } from '@/features/projects/api/projects';
import { PhaseCreateModal } from './PhaseCreateModal';

// web制作の標準フェーズテンプレート
const TEMPLATE_PHASES = [
  '要件定義',
  'ワイヤーフレーム',
  'デザイン',
  'コーディング',
  'テスト',
  '納品',
];

type Props = {
  projectId: number;
  hasPhases: boolean;
  members: { id: number; name: string }[];
};

export function PhaseScheduleActions({ projectId, hasPhases, members }: Props) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleApplyTemplate = async () => {
    setApplying(true);
    try {
      // フェーズを順番に作成
      for (let i = 0; i < TEMPLATE_PHASES.length; i++) {
        await createPhase(projectId, {
          name: TEMPLATE_PHASES[i],
          sort_order: i,
        });
      }
      setConfirmTemplate(false);
      router.refresh();
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <PhaseCreateModal
        projectId={projectId}
        members={members}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <div className="flex items-center gap-2">
        {/* テンプレート適用 */}
        {confirmTemplate ? (
          <span className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-500">
              {hasPhases ? '既存フェーズに追加して' : ''}6フェーズを作成しますか？
            </span>
            <button
              type="button"
              onClick={handleApplyTemplate}
              disabled={applying}
              className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {applying ? '作成中...' : 'はい'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmTemplate(false)}
              className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              いいえ
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmTemplate(true)}
            className="text-xs px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
          >
            テンプレート適用
          </button>
        )}

        {/* フェーズ追加 */}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="text-xs px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
        >
          + フェーズ追加
        </button>
      </div>
    </>
  );
}
