import { apiFetch, serverApiFetch } from '@/lib/api';

// ─── 型定義 ───────────────────────────────────────────────
export type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskAssignee = {
  id: number;
  name: string;
};

export type Task = {
  id: number;
  project_id: number | null;
  phase_id: number | null;
  parent_task_id: number | null;
  assignee_id: number;
  created_by: number;
  title: string;
  memo: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  type_tag: string | null;
  due_date: string | null;
  estimated_hours: string | null;
  sort_order: number | null;
  assignee?: TaskAssignee;
  created_at: string;
  updated_at: string;
};

export type TasksResponse = { data: Task[] };

export type TaskFilters = {
  project_id?: number | 'null';
  phase_id?: number;
  assignee_id?: number;
  status?: TaskStatus;
};

// ─── API関数 ──────────────────────────────────────────────

/** タスク一覧取得（サーバーサイド用） */
export const getTasksServer = async (filters: TaskFilters = {}): Promise<TasksResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined) params.set(key, String(val));
  });
  const query = params.size > 0 ? `?${params}` : '';
  return serverApiFetch<TasksResponse>(`/api/tasks${query}`);
};

/** タスク一覧取得（クライアントサイド用） */
export const getTasks = async (filters: TaskFilters = {}): Promise<TasksResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined) params.set(key, String(val));
  });
  const query = params.size > 0 ? `?${params}` : '';
  return apiFetch<TasksResponse>(`/api/tasks${query}`);
};

/** タスク詳細取得 */
export const getTask = async (id: number): Promise<{ data: Task }> => {
  return apiFetch<{ data: Task }>(`/api/tasks/${id}`);
};

/** タスク作成 */
export const createTask = async (data: Partial<Task>): Promise<{ data: Task }> => {
  return apiFetch<{ data: Task }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/** タスク更新 */
export const updateTask = async (id: number, data: Partial<Task>): Promise<{ data: Task }> => {
  return apiFetch<{ data: Task }>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/** タスク削除 */
export const deleteTask = async (id: number): Promise<void> => {
  return apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE' });
};

/** ステータス変更 */
export const updateTaskStatus = async (id: number, status: TaskStatus): Promise<{ data: Task }> => {
  return apiFetch<{ data: Task }>(`/api/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/** 並び替え */
export const sortTasks = async (ids: number[]): Promise<void> => {
  return apiFetch<void>('/api/tasks/sort', {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  });
};
