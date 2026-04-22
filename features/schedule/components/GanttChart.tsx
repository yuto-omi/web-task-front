'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

import { getPhases, type Phase, type Project } from '@/features/projects/api';

// ─── レイアウト定数 ──────────────────────────────────────
const LEFT_W = 220; // 左列幅 (px)
const ROW_H = 38; // 行高 (px)
const HEADER_H = 52; // ヘッダー高 (px) = 月行20px + 日行32px
const DAY_W = 28; // 1日あたりの幅 (px)

// ─── ステータス色 ────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  not_started: '#9CA3AF',
  in_progress: '#378ADD',
  completed: '#1D9E75',
};

// ─── ユーティリティ ──────────────────────────────────────

/** 日付文字列 → Date (正午固定でDSTを回避) */
function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** date の rangeStart からのX座標 */
function dateToX(date: Date, rangeStart: Date): number {
  return Math.round((date.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) * DAY_W;
}

/** 表示範囲の開始日を計算（月初に合わせる） */
function calcRangeStart(projects: Project[], today: Date): Date {
  const candidates = [new Date(today.getTime() - 30 * 86400000)];
  projects.forEach((p) => {
    if (p.start_date) candidates.push(parseDate(p.start_date));
  });
  const min = new Date(Math.min(...candidates.map((d) => d.getTime())));
  return new Date(min.getFullYear(), min.getMonth(), 1, 12, 0, 0, 0);
}

/** 表示範囲の終了日を計算 */
function calcRangeEnd(projects: Project[], today: Date): Date {
  const candidates = [new Date(today.getTime() + 90 * 86400000)];
  projects.forEach((p) => {
    if (p.deadline) candidates.push(parseDate(p.deadline));
  });
  return new Date(Math.max(...candidates.map((d) => d.getTime())));
}

// ─── 月グループ ──────────────────────────────────────────
type MonthGroup = { label: string; startIdx: number; dayCount: number };

function buildMonthGroups(rangeStart: Date, totalDays: number): MonthGroup[] {
  const groups: MonthGroup[] = [];
  let i = 0;
  while (i < totalDays) {
    const d = new Date(rangeStart.getTime() + i * 86400000);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const remaining = daysInMonth - d.getDate() + 1;
    const dayCount = Math.min(remaining, totalDays - i);
    groups.push({ label: `${year}年${month + 1}月`, startIdx: i, dayCount });
    i += dayCount;
  }
  return groups;
}

// ─── Props ───────────────────────────────────────────────
type Props = {
  projects: Project[];
};

// ─── メインコンポーネント ────────────────────────────────
export function GanttChart({ projects }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [phasesMap, setPhasesMap] = useState<Record<number, Phase[]>>({});
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const rangeStart = calcRangeStart(projects, today);
  const rangeEnd = calcRangeEnd(projects, today);
  const totalDays =
    Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1;
  const totalWidth = totalDays * DAY_W;
  const todayX = dateToX(today, rangeStart);

  const monthGroups = buildMonthGroups(rangeStart, totalDays);

  // 起動時: 今日の位置を中心にスクロール
  useEffect(() => {
    if (scrollRef.current) {
      const center = todayX - scrollRef.current.clientWidth / 2 + LEFT_W;
      scrollRef.current.scrollLeft = Math.max(0, center);
    }
  }, []);

  // フェーズ取得 & 展開トグル
  const toggleExpand = useCallback(
    async (projectId: number) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(projectId)) {
          next.delete(projectId);
          return next;
        }
        next.add(projectId);
        return next;
      });

      if (!phasesMap[projectId] && !loadingIds.has(projectId)) {
        setLoadingIds((prev) => new Set([...prev, projectId]));
        try {
          const res = await getPhases(projectId);
          setPhasesMap((prev) => ({ ...prev, [projectId]: res.data }));
        } catch {
          // フェーズ取得失敗時はスキップ
        } finally {
          setLoadingIds((prev) => {
            const s = new Set(prev);
            s.delete(projectId);
            return s;
          });
        }
      }
    },
    [phasesMap, loadingIds],
  );

  // バー情報を計算するヘルパー
  function calcBar(startDateStr: string | null, endDateStr: string | null) {
    if (!startDateStr && !endDateStr) return null;
    const s = startDateStr ? parseDate(startDateStr) : null;
    const e = endDateStr ? parseDate(endDateStr) : null;
    if (!s && !e) return null;
    const x = s ? dateToX(s, rangeStart) : (e ? dateToX(e, rangeStart) - DAY_W : 0);
    const w = s && e ? Math.max(DAY_W, dateToX(e, rangeStart) - x + DAY_W) : DAY_W * 3;
    return { x, w };
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto bg-white select-none">
      <div style={{ minWidth: LEFT_W + totalWidth }}>

        {/* ── ヘッダー (sticky top) ────────────────────── */}
        <div
          className="sticky top-0 z-20 bg-white border-b border-gray-200 flex"
          style={{ height: HEADER_H }}
        >
          {/* 左列ヘッダー */}
          <div
            className="sticky left-0 z-30 bg-white border-r border-gray-200 flex items-end px-3 pb-2 flex-shrink-0"
            style={{ width: LEFT_W }}
          >
            <span className="text-[11px] text-gray-400 font-medium">プロジェクト</span>
          </div>

          {/* タイムラインヘッダー */}
          <div className="relative flex-1 overflow-hidden" style={{ width: totalWidth }}>
            {/* 今日マーカー（ヘッダー） */}
            <div
              className="absolute top-0 bottom-0 w-px bg-red-400 z-10 pointer-events-none"
              style={{ left: todayX }}
            />

            {/* 月ラベル行（上段） */}
            {monthGroups.map((mg, i) => (
              <div
                key={i}
                className="absolute top-0 flex items-center px-2 border-r border-gray-100"
                style={{ left: mg.startIdx * DAY_W, width: mg.dayCount * DAY_W, height: 20 }}
              >
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                  {mg.label}
                </span>
              </div>
            ))}

            {/* 日ラベル行（下段）：月曜だけ表示 */}
            {Array.from({ length: totalDays }, (_, i) => {
              const d = new Date(rangeStart.getTime() + i * 86400000);
              if (d.getDay() !== 1) return null; // 月曜のみ
              return (
                <div
                  key={i}
                  className="absolute bottom-0 flex items-center justify-start pl-1 border-l border-gray-100"
                  style={{ left: i * DAY_W, width: DAY_W * 7, height: 32 }}
                >
                  <span className="text-[10px] text-gray-500">
                    {d.getMonth() + 1}/{d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 行コンテナ ───────────────────────────────── */}
        <div className="relative">
          {/* 今日縦線（全行にまたがる） */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-400 opacity-40 z-10 pointer-events-none"
            style={{ left: LEFT_W + todayX }}
          />

          {/* 週ごとの縦グリッド線 */}
          {Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(rangeStart.getTime() + i * 86400000);
            if (d.getDay() !== 1) return null;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-gray-100 pointer-events-none"
                style={{ left: LEFT_W + i * DAY_W }}
              />
            );
          })}

          {/* 週末背景 */}
          {Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(rangeStart.getTime() + i * 86400000);
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6) return null;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 bg-gray-50 pointer-events-none"
                style={{ left: LEFT_W + i * DAY_W, width: DAY_W }}
              />
            );
          })}

          {/* プロジェクト行 */}
          {projects.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-[13px] text-gray-400">
              プロジェクトがありません
            </div>
          ) : (
            projects.map((project) => {
              const isExpanded = expandedIds.has(project.id);
              const isLoading = loadingIds.has(project.id);
              const projectPhases = phasesMap[project.id] ?? [];
              const bar = calcBar(project.start_date, project.deadline);
              const barColor = STATUS_COLOR[project.status] ?? '#9CA3AF';

              return (
                <div key={project.id}>
                  {/* ── プロジェクト行 ── */}
                  <div
                    className="flex border-b border-gray-100"
                    style={{ height: ROW_H }}
                  >
                    {/* 左: プロジェクト名 */}
                    <button
                      type="button"
                      className="sticky left-0 z-10 bg-white border-r border-gray-100 flex items-center gap-1.5 px-3 hover:bg-gray-50 transition-colors text-left flex-shrink-0"
                      style={{ width: LEFT_W }}
                      onClick={() => toggleExpand(project.id)}
                    >
                      <svg
                        className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M4 2l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[12px] font-medium text-gray-900 truncate flex-1">
                        {project.name}
                      </span>
                      {isLoading && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">…</span>
                      )}
                    </button>

                    {/* 右: プロジェクトバー */}
                    <div className="relative flex-1" style={{ width: totalWidth }}>
                      {bar && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 cursor-pointer"
                          style={{
                            left: bar.x,
                            width: bar.w,
                            height: 22,
                            backgroundColor: barColor,
                          }}
                          title={`${project.name}: ${project.start_date ?? '?'} 〜 ${project.deadline ?? '?'}`}
                        >
                          <span className="text-[10px] text-white font-medium truncate">
                            {project.progress_rate}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── フェーズ行（展開時） ── */}
                  {isExpanded &&
                    projectPhases.map((phase) => {
                      const phaseBar = calcBar(phase.start_date, phase.end_date);
                      const phaseColor = STATUS_COLOR[phase.status] ?? '#9CA3AF';

                      return (
                        <div
                          key={phase.id}
                          className="flex border-b border-gray-100 bg-gray-50/40"
                          style={{ height: ROW_H }}
                        >
                          {/* 左: フェーズ名（インデント） */}
                          <div
                            className="sticky left-0 z-10 bg-gray-50/80 border-r border-gray-100 flex items-center pl-8 pr-3 flex-shrink-0"
                            style={{ width: LEFT_W }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0"
                              style={{ backgroundColor: phaseColor }}
                            />
                            <span className="text-[11px] text-gray-600 truncate">
                              {phase.name}
                            </span>
                          </div>

                          {/* 右: フェーズバー */}
                          <div className="relative flex-1" style={{ width: totalWidth }}>
                            {phaseBar && (
                              <div
                                className="absolute top-1/2 -translate-y-1/2 rounded flex items-center px-1.5"
                                style={{
                                  left: phaseBar.x,
                                  width: phaseBar.w,
                                  height: 14,
                                  backgroundColor: phaseColor,
                                  opacity: 0.75,
                                }}
                                title={`${phase.name}: ${phase.start_date ?? '?'} 〜 ${phase.end_date ?? '?'}`}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {/* フェーズなし表示 */}
                  {isExpanded && !isLoading && projectPhases.length === 0 && (
                    <div
                      className="flex items-center pl-8 border-b border-gray-100 bg-gray-50/40 text-[11px] text-gray-400"
                      style={{ height: ROW_H }}
                    >
                      フェーズが登録されていません
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── 凡例 ─────────────────────────────────────── */}
        <div className="sticky left-0 flex items-center gap-4 px-4 py-3 border-t border-gray-100 bg-white">
          {[
            { label: '未着手', color: '#9CA3AF' },
            { label: '進行中', color: '#378ADD' },
            { label: '完了', color: '#1D9E75' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-gray-500">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-px h-3 bg-red-400" />
            <span className="text-[11px] text-gray-500">今日</span>
          </div>
        </div>
      </div>
    </div>
  );
}
