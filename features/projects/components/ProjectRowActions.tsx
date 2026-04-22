'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { deleteProject, type Project } from '@/features/projects/api/projects';
import { ProjectEditModal } from './ProjectEditModal';

type Props = {
  project: Project;
};

export function ProjectRowActions({ project }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(project.id);
      setConfirmDelete(false);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ProjectEditModal
        project={project}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <div className="flex items-center gap-1 justify-end">
        {/* 編集ボタン */}
        <button
          type="button"
          onClick={() => setEditOpen(true)}
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
        {confirmDelete ? (
          <span className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500">削除しますか？</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleting ? '...' : 'はい'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              いいえ
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
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
    </>
  );
}
