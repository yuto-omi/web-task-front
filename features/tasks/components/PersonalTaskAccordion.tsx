'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { type Task, deleteTask, updateTaskStatus } from '@/features/tasks/api';
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

export function PersonalTaskAccordion({ tasks }: Props) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(null);
  // 処理中のタスクIDを管理（多重クリック防止）
  const [loadingId, setLoadingId] = useState<number | null>(null);
  // 楽観的更新：チェックを外す操作中のタスクIDセット
  const [uncheckedIds, setUncheckedIds] = useState<Set<number>>(new Set());
  // 編集モーダルの対象タスクID
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // チェックボックストグル → done ↔ pending を切り替え
  const handleCheck = async (task: Task) => {
    if (loadingId !== null) return;
    setLoadingId(task.id);

    if (task.status === 'done') {
      // チェックを外す → 即座に未完了扱いにする（チラつき防止）
      setUncheckedIds(prev => new Set(prev).add(task.id));
    } else {
      // 再チェック → uncheckedIds から削除して完了扱いに戻す
      setUncheckedIds(prev => { const s = new Set(prev); s.delete(task.id); return s; });
    }

    try {
      const nextStatus = task.status === 'done' ? 'pending' : 'done';
      await updateTaskStatus(task.id, nextStatus);
      router.refresh();
    } catch {
      // エラー時は楽観的更新を戻す
      setUncheckedIds(prev => { const s = new Set(prev); s.delete(task.id); return s; });
    } finally {
      setLoadingId(null);
    }
  };

  // 削除ボタン → 物理削除（バックエンドでdoneタスクはforceDelete）
  const handleDelete = async (task: Task) => {
    if (loadingId !== null) return;
    setLoadingId(task.id);
    try {
      await deleteTask(task.id);
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  if (tasks.length === 0) {
    return <p className="text-[12px] text-gray-400 py-2">個人タスクはありません</p>;
  }

  return (
    <>
      {/* 編集モーダル */}
      {editingTask && (
        <PersonalTaskEditModal
          task={editingTask}
          open={true}
          onClose={() => setEditingTask(null)}
        />
      )}

      {tasks.map((task: Task) => {
        // 楽観的更新：チェックを外した直後はサーバー反映前でも未完了扱いにする
        const isDone = task.status === 'done' && !uncheckedIds.has(task.id);
        const isOpen = openId === task.id;
        const isLoading = loadingId === task.id;

        return (
          <div key={task.id} className="border-b border-gray-100 last:border-b-0">
            {/* タスク行 */}
            <div className="flex items-center gap-2.5 py-2.5">
              {/* チェックボックス */}
              <button
                type="button"
                onClick={() => handleCheck(task)}
                className="w-3.5 h-3.5 rounded-sm border flex-shrink-0 transition-colors cursor-pointer"
                style={
                  isDone
                    ? { background: '#1D9E75', borderColor: '#1D9E75', opacity: isLoading ? 0.5 : 1 }
                    : { borderColor: '#d1d5db', opacity: isLoading ? 0.5 : 1 }
                }
              >
                {isDone && (
                  <svg viewBox="0 0 10 10" fill="none" className="w-full h-full p-0.5">
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* タイトル・詳細展開ボタン */}
              <button
                type="button"
                className="flex-1 flex items-center gap-1 text-left hover:bg-gray-50 rounded-lg px-1 -mx-1 transition-colors min-w-0"
                onClick={() => setOpenId(isOpen ? null : task.id)}
              >
                <span
                  className={`flex-1 text-[13px] truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}
                >
                  {task.title}
                </span>
                <svg
                  className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* 優先度 */}
              {task.priority ? (
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 w-8 text-center ${PRIORITY_STYLE[task.priority] ?? ''}`}
                >
                  {PRIORITY_LABEL[task.priority] ?? task.priority}
                </span>
              ) : (
                <span className="w-8 flex-shrink-0" />
              )}

              {/* 見積工数 */}
              <span className="text-[11px] text-gray-400 flex-shrink-0 w-10 text-right">
                {task.estimated_hours ? `${task.estimated_hours}h` : '—'}
              </span>

              {/* 期日 */}
              <span className="text-[11px] text-gray-400 flex-shrink-0 w-[72px] text-right">
                {task.due_date ?? '—'}
              </span>

              {/* 編集ボタン（未完了のみ） */}
              {!isDone && !isLoading && (
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
              )}

              {/* 完了時のみ削除ボタンを表示（ローディング中は非表示） */}
              {isDone && !isLoading && (
                <button
                  type="button"
                  onClick={() => handleDelete(task)}
                  className="text-[11px] text-red-400 hover:text-red-600 flex-shrink-0 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors"
                  style={{ opacity: isLoading ? 0.5 : 1 }}
                >
                  {isLoading ? '...' : '削除'}
                </button>
              )}
            </div>

            {/* アコーディオン展開部分（メモのみ） */}
            {isOpen && (
              <div className="pb-2.5 pl-6 pr-1">
                {task.memo ? (
                  <p className="text-[12px] text-gray-500 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg px-3 py-2">
                    {task.memo}
                  </p>
                ) : (
                  <p className="text-[12px] text-gray-400 italic">メモなし</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
