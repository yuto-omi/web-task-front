'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Phase, Project } from '@/features/projects/api';
import { updatePhase } from '@/features/projects/api';
import { PhaseEditModal } from './PhaseEditModal';

// ─── グリップアイコン ─────────────────────────────────────
function GripIcon() {
  return (
    <svg
      viewBox="0 0 8 12"
      fill="currentColor"
      className="w-2.5 h-3 text-gray-300 flex-shrink-0"
    >
      <circle cx="2" cy="2" r="1" />
      <circle cx="6" cy="2" r="1" />
      <circle cx="2" cy="6" r="1" />
      <circle cx="6" cy="6" r="1" />
      <circle cx="2" cy="10" r="1" />
      <circle cx="6" cy="10" r="1" />
    </svg>
  );
}

// ─── レイアウト定数 ──────────────────────────────────────
const NAME_W = 160; // 名前列
const PERIOD_W = 90; // 期間列
const PCT_W = 52; // %列
const LEFT_W = NAME_W + PERIOD_W + PCT_W; // 302px
const ROW_H = 30;
const HEADER_MONTH_H = 22;
const HEADER_DAY_H = 26;
const HEADER_H = HEADER_MONTH_H + HEADER_DAY_H;
const DAY_W = 22; // 1日あたりの幅

// ─── バー色 ──────────────────────────────────────────────
const PROJECT_COLOR = '#F5B731'; // アンバー（親）
const PHASE_COLOR: Record<string, string> = {
  not_started: '#B8BEC8',
  in_progress: '#7B8CDE',
  completed: '#5BAD8F',
};

// フェーズ進捗%（ステータスから推定）
const PHASE_PCT: Record<string, number> = {
  not_started: 0,
  in_progress: 50,
  completed: 100,
};

const STATUS_LABEL: Record<string, string> = {
  not_started: '未着手',
  in_progress: '進行中',
  completed: '完了',
};

// ─── ユーティリティ ──────────────────────────────────────
function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function dateToX(date: Date, rangeStart: Date): number {
  return Math.round((date.getTime() - rangeStart.getTime()) / 86400000) * DAY_W;
}

function formatPeriod(start: string | null, end: string | null): string {
  const fmt = (s: string) => {
    const d = parseDate(s);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  if (start && end) return `${fmt(start)}-${fmt(end)}`;
  if (start) return fmt(start);
  if (end) return fmt(end);
  return '—';
}

function buildMonthGroups(rangeStart: Date, totalDays: number) {
  const groups: { label: string; startIdx: number; dayCount: number }[] = [];
  let i = 0;
  while (i < totalDays) {
    const d = new Date(rangeStart.getTime() + i * 86400000);
    const y = d.getFullYear();
    const m = d.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const remaining = daysInMonth - d.getDate() + 1;
    const dayCount = Math.min(remaining, totalDays - i);
    groups.push({ label: `${y}年${m + 1}月`, startIdx: i, dayCount });
    i += dayCount;
  }
  return groups;
}

// ─── Props ───────────────────────────────────────────────
type Props = {
  project: Project;
  phases: Phase[];
  members: { id: number; name: string }[];
};

// ─── コンポーネント ──────────────────────────────────────
export function PhaseGanttChart({ project, phases, members }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [editModalPhase, setEditModalPhase] = useState<Phase | null>(null);

  // ── ドラッグ＆ドロップ状態 ────────────────────────────
  const [localPhases, setLocalPhases] = useState<Phase[]>(phases);
  const draggingIdxRef = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  // phases prop が変わったらローカル状態を同期
  useEffect(() => {
    setLocalPhases(phases);
  }, [phases]);

  const handleDragStart = (idx: number) => {
    draggingIdxRef.current = idx;
    setDraggingIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggingIdxRef.current === null) return;
    setOverIdx(idx);
  };

  const handleDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    const fromIdx = draggingIdxRef.current;
    if (fromIdx === null || fromIdx === dropIdx) {
      setOverIdx(null);
      return;
    }

    // 楽観的UIアップデート
    const newPhases = [...localPhases];
    const [removed] = newPhases.splice(fromIdx, 1);
    newPhases.splice(dropIdx, 0, removed);
    setLocalPhases(newPhases);
    setOverIdx(null);
    setDraggingIdx(null);
    draggingIdxRef.current = null;

    // 全フェーズの sort_order を並列更新
    await Promise.all(
      newPhases.map((phase, i) =>
        updatePhase(phase.project_id, phase.id, { sort_order: i + 1 }),
      ),
    );
    router.refresh();
  };

  const handleDragEnd = () => {
    draggingIdxRef.current = null;
    setDraggingIdx(null);
    setOverIdx(null);
  };

  const handleProgressClick = (phase: Phase) => {
    const current = phase.progress_rate ?? PHASE_PCT[phase.status] ?? 0;
    setEditingValue(String(current));
    setEditingPhaseId(phase.id);
  };

  const handleProgressSave = async (phase: Phase) => {
    const val = Math.min(100, Math.max(0, Number(editingValue)));
    setEditingPhaseId(null);
    if (String(val) === String(phase.progress_rate ?? PHASE_PCT[phase.status] ?? 0)) return;
    await updatePhase(phase.project_id, phase.id, { progress_rate: val });
    router.refresh();
  };

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  // 表示範囲: プロジェクト開始月の1日〜納期月の末日
  const startAnchor = project.start_date
    ? parseDate(project.start_date)
    : phases.find((p) => p.start_date)
      ? parseDate(phases.find((p) => p.start_date)!.start_date!)
      : today;
  const endAnchor = project.deadline
    ? parseDate(project.deadline)
    : phases.findLast((p) => p.end_date)
      ? parseDate(phases.findLast((p) => p.end_date)!.end_date!)
      : today;

  const rangeStart = new Date(startAnchor.getFullYear(), startAnchor.getMonth(), 1, 12, 0, 0, 0);
  const endMonth = new Date(endAnchor.getFullYear(), endAnchor.getMonth() + 1, 0, 12, 0, 0, 0); // 月末日
  const rangeEnd = endMonth;
  const totalDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1;
  const todayX = dateToX(today, rangeStart);
  // 今日がプロジェクト期間内かどうか
  const todayInRange = today >= rangeStart && today <= rangeEnd;

  const monthGroups = buildMonthGroups(rangeStart, totalDays);

  // バー座標を計算
  function calcBar(startStr: string | null, endStr: string | null) {
    if (!startStr && !endStr) return null;
    const s = startStr ? parseDate(startStr) : null;
    const e = endStr ? parseDate(endStr) : null;
    const x = s ? dateToX(s, rangeStart) : (e ? dateToX(e, rangeStart) : 0);
    const endX = e ? dateToX(e, rangeStart) + DAY_W : (s ? dateToX(s, rangeStart) + DAY_W * 3 : DAY_W * 3);
    return { x, w: Math.max(DAY_W, endX - x) };
  }

  // 今日が範囲内なら中心に、範囲外なら先頭から表示
  useEffect(() => {
    if (scrollRef.current && todayInRange) {
      const visibleWidth = scrollRef.current.clientWidth - LEFT_W;
      scrollRef.current.scrollLeft = Math.max(0, todayX - visibleWidth / 2);
    }
  }, [todayX, todayInRange]);

  const projectBar = calcBar(project.start_date, project.deadline);

  // 今日列のインデックス
  const todayIdx = Math.round((today.getTime() - rangeStart.getTime()) / 86400000);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto bg-white rounded-xl border border-gray-200 text-[12px]"
    >
      <div style={{ minWidth: LEFT_W + totalDays * DAY_W }}>

        {/* ── ヘッダー ── */}
        <div className="sticky top-0 z-20 bg-white flex border-b border-gray-200">

          {/* 左3列ヘッダー */}
          <div
            className="sticky left-0 z-30 bg-white flex items-end border-r border-gray-200 flex-shrink-0"
            style={{ width: LEFT_W, height: HEADER_H }}
          >
            <div
              className="border-r border-gray-100 flex items-center px-3 pb-1"
              style={{ width: NAME_W, height: HEADER_DAY_H }}
            >
              <span className="text-[11px] text-gray-400 font-medium">名前</span>
            </div>
            <div
              className="border-r border-gray-100 flex items-center justify-center pb-1"
              style={{ width: PERIOD_W, height: HEADER_DAY_H }}
            >
              <span className="text-[11px] text-gray-400 font-medium">期間</span>
            </div>
            <div
              className="flex items-center justify-center pb-1"
              style={{ width: PCT_W, height: HEADER_DAY_H }}
            >
              <span className="text-[11px] text-gray-400 font-medium">%</span>
            </div>
          </div>

          {/* タイムラインヘッダー */}
          <div className="relative flex-shrink-0" style={{ width: totalDays * DAY_W, height: HEADER_H }}>
            {/* 今日列ハイライト */}
            {todayInRange && (
              <div
                className="absolute top-0 bottom-0 bg-red-50 pointer-events-none"
                style={{ left: todayIdx * DAY_W, width: DAY_W }}
              />
            )}

            {/* 月ラベル */}
            {monthGroups.map((mg, i) => (
              <div
                key={i}
                className="absolute top-0 flex items-center px-2 border-r border-gray-200"
                style={{
                  left: mg.startIdx * DAY_W,
                  width: mg.dayCount * DAY_W,
                  height: HEADER_MONTH_H,
                }}
              >
                <span className="text-[10px] text-gray-500 font-medium">{mg.label}</span>
              </div>
            ))}

            {/* 日ラベル */}
            {Array.from({ length: totalDays }, (_, i) => {
              const d = new Date(rangeStart.getTime() + i * 86400000);
              const dow = d.getDay();
              const isWeekend = dow === 0 || dow === 6;
              const isToday = i === todayIdx;
              return (
                <div
                  key={i}
                  className={`absolute bottom-0 flex items-center justify-center border-r border-gray-100 ${isWeekend ? 'bg-blue-50/60' : ''}`}
                  style={{
                    left: i * DAY_W,
                    width: DAY_W,
                    height: HEADER_DAY_H,
                  }}
                >
                  <span
                    className={`text-[10px] ${isToday ? 'text-red-500 font-bold' : isWeekend ? 'text-blue-400' : 'text-gray-400'}`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 行エリア ── */}
        <div className="relative">
          {/* 週末列の背景（全行にまたがる） */}
          {Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(rangeStart.getTime() + i * 86400000);
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6) return null;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 bg-blue-50/40 pointer-events-none"
                style={{ left: LEFT_W + i * DAY_W, width: DAY_W }}
              />
            );
          })}

          {/* 今日ハイライト列・縦線 */}
          {todayInRange && (
            <>
              <div
                className="absolute top-0 bottom-0 bg-red-50/50 pointer-events-none"
                style={{ left: LEFT_W + todayIdx * DAY_W, width: DAY_W }}
              />
              <div
                className="absolute top-0 bottom-0 w-px bg-red-400 opacity-60 z-10 pointer-events-none"
                style={{ left: LEFT_W + todayIdx * DAY_W + DAY_W / 2 }}
              />
            </>
          )}

          {/* 日グリッド縦線 */}
          {Array.from({ length: totalDays }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-r border-gray-100 pointer-events-none"
              style={{ left: LEFT_W + i * DAY_W, width: DAY_W }}
            />
          ))}

          {/* ── プロジェクト行（親） ── */}
          <div
            className="flex items-center border-b border-gray-200 bg-gray-50/50"
            style={{ height: ROW_H }}
          >
            {/* 名前 */}
            <div
              className="sticky left-0 z-10 flex items-center bg-gray-50/90 border-r border-gray-200 flex-shrink-0"
              style={{ width: LEFT_W, height: ROW_H }}
            >
              <div
                className="flex items-center gap-1.5 px-3 border-r border-gray-100"
                style={{ width: NAME_W }}
              >
                {/* フォルダアイコン */}
                <svg className="w-3 h-3 text-amber-500 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M1 3a1 1 0 011-1h2.5l1 1.5H10a1 1 0 011 1v5a1 1 0 01-1 1H2a1 1 0 01-1-1V3z" />
                </svg>
                <span className="text-[12px] font-semibold text-gray-800 truncate">{project.name}</span>
              </div>
              <div
                className="flex items-center justify-center border-r border-gray-100 text-[11px] text-gray-500"
                style={{ width: PERIOD_W }}
              >
                {formatPeriod(project.start_date, project.deadline)}
              </div>
              <div
                className="flex items-center justify-center text-[11px] font-medium text-amber-700"
                style={{ width: PCT_W }}
              >
                {project.progress_rate}%
              </div>
            </div>

            {/* バーエリア */}
            <div className="relative flex-shrink-0" style={{ width: totalDays * DAY_W, height: ROW_H }}>
              {projectBar && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 flex items-center px-2 overflow-hidden"
                  style={{
                    left: projectBar.x,
                    width: projectBar.w,
                    height: 18,
                    backgroundColor: PROJECT_COLOR,
                    borderRadius: 3,
                  }}
                  title={`${project.name}: ${project.start_date ?? '?'} 〜 ${project.deadline ?? '?'}`}
                >
                  <span className="text-[10px] text-white font-medium truncate whitespace-nowrap">
                    {project.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── フェーズ行 ── */}
          {localPhases.length === 0 ? (
            <div
              className="flex items-center text-[12px] text-gray-400 border-b border-gray-100"
              style={{ height: ROW_H }}
            >
              <div className="sticky left-0 pl-8 bg-white" style={{ width: LEFT_W }}>
                フェーズが登録されていません
              </div>
            </div>
          ) : (
            localPhases.map((phase, idx) => {
              const bar = calcBar(phase.start_date, phase.end_date);
              const color = PHASE_COLOR[phase.status] ?? '#B8BEC8';
              const pct = phase.progress_rate ?? PHASE_PCT[phase.status] ?? 0;
              const isLast = idx === localPhases.length - 1;
              const isEditing = editingPhaseId === phase.id;
              const isDragging = draggingIdx === idx;
              const isOver = overIdx === idx && draggingIdx !== idx;

              return (
                <div
                  key={phase.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={[
                    'flex items-center hover:bg-gray-50/40',
                    isLast ? '' : 'border-b border-gray-100',
                    isDragging ? 'opacity-40' : '',
                    isOver ? 'border-t-2 border-blue-400' : '',
                  ].join(' ')}
                  style={{ height: ROW_H }}
                >
                  {/* 左3列 */}
                  <div
                    className="sticky left-0 z-10 flex items-center bg-white flex-shrink-0 border-r border-gray-200"
                    style={{ width: LEFT_W, height: ROW_H }}
                  >
                    <div
                      className="flex items-center gap-1.5 pl-2 pr-1 border-r border-gray-100"
                      style={{ width: NAME_W }}
                    >
                      {/* グリップハンドル */}
                      <span className="cursor-grab active:cursor-grabbing flex-shrink-0">
                        <GripIcon />
                      </span>
                      {/* タスクアイコン */}
                      <svg className="w-3 h-3 text-gray-300 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                        <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
                        <path d="M3.5 4h5M3.5 6h3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                      <span className="text-[12px] text-gray-700 truncate flex-1">{phase.name}</span>
                      <button
                        type="button"
                        onClick={() => setEditModalPhase(phase)}
                        className="p-0.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
                        title="編集"
                      >
                        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                          <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                    <div
                      className="flex items-center justify-center border-r border-gray-100 text-[11px] text-gray-500 whitespace-nowrap"
                      style={{ width: PERIOD_W }}
                    >
                      {formatPeriod(phase.start_date, phase.end_date)}
                    </div>
                    <div
                      className="flex items-center justify-center"
                      style={{ width: PCT_W }}
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => handleProgressSave(phase)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleProgressSave(phase);
                            if (e.key === 'Escape') setEditingPhaseId(null);
                          }}
                          autoFocus
                          className="w-10 text-[11px] text-center border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-200 px-0.5"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleProgressClick(phase)}
                          className="text-[11px] font-medium hover:underline cursor-pointer"
                          style={{ color }}
                          title="クリックして編集"
                        >
                          {pct}%
                        </button>
                      )}
                    </div>
                  </div>

                  {/* バーエリア */}
                  <div className="relative flex-shrink-0" style={{ width: totalDays * DAY_W, height: ROW_H }}>
                    {bar && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 flex items-center px-1.5 overflow-hidden"
                        style={{
                          left: bar.x,
                          width: bar.w,
                          height: 16,
                          backgroundColor: color,
                          borderRadius: 3,
                        }}
                        title={`${phase.name}: ${phase.start_date ?? '?'} 〜 ${phase.end_date ?? '?'} (${STATUS_LABEL[phase.status]})`}
                      >
                        <span className="text-[10px] text-white truncate whitespace-nowrap">
                          {phase.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      {editModalPhase && (
        <PhaseEditModal
          phase={editModalPhase}
          members={members}
          open={true}
          onClose={() => setEditModalPhase(null)}
        />
      )}

        {/* ── フッター凡例 ── */}
        <div className="sticky left-0 flex items-center gap-4 px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: PROJECT_COLOR }} />
            <span className="text-[10px] text-gray-400">プロジェクト全体</span>
          </div>
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-3 h-2.5 rounded-sm" style={{ backgroundColor: PHASE_COLOR[key] }} />
              <span className="text-[10px] text-gray-400">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-1">
            <div className="w-px h-2.5 bg-red-400" />
            <span className="text-[10px] text-gray-400">今日</span>
          </div>
        </div>
      </div>
    </div>
  );
}
