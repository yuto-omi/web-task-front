import { serverApiFetch, apiFetch } from '@/lib/api';

// ─── 型定義 ───────────────────────────────────────────────
export type ProjectStatus = 'not_started' | 'in_progress' | 'completed';
export type PhaseStatus = 'not_started' | 'in_progress' | 'completed';

export type Phase = {
  id: number;
  project_id: number;
  assignee_id: number | null;
  name: string;
  status: PhaseStatus;
  start_date: string | null;
  end_date: string | null;
  estimated_hours: string | null;
  sort_order: number | null;
  progress_rate: number | null;
  created_at: string;
};

export type ProjectMember = {
  id: number;
  name: string;
};

export type Project = {
  id: number;
  name: string;
  client_name: string | null;
  status: ProjectStatus;
  start_date: string | null;
  deadline: string | null;
  estimated_hours: string | null;
  memo: string | null;
  progress_rate: number;
  created_by: number;
  members: ProjectMember[];
  created_at: string;
  updated_at: string;
};

export type ProjectsResponse = {
  data: Project[];
  links: { first: string; last: string; prev: string | null; next: string | null };
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

// ─── API関数 ──────────────────────────────────────────────

/** プロジェクト一覧取得（サーバーサイド用） */
export const getProjectsServer = async (): Promise<ProjectsResponse> => {
  return serverApiFetch<ProjectsResponse>('/api/projects');
};

/** プロジェクト一覧取得（クライアントサイド用） */
export const getProjects = async (): Promise<ProjectsResponse> => {
  return apiFetch<ProjectsResponse>('/api/projects');
};

/** プロジェクト詳細取得 */
export const getProject = async (id: number): Promise<{ data: Project }> => {
  return apiFetch<{ data: Project }>(`/api/projects/${id}`);
};

/** プロジェクト作成 */
export const createProject = async (data: Partial<Project>): Promise<{ data: Project }> => {
  return apiFetch<{ data: Project }>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/** プロジェクト更新 */
export const updateProject = async (id: number, data: Partial<Project>): Promise<{ data: Project }> => {
  return apiFetch<{ data: Project }>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/** プロジェクト削除 */
export const deleteProject = async (id: number): Promise<void> => {
  return apiFetch<void>(`/api/projects/${id}`, { method: 'DELETE' });
};

/** ステータス変更 */
export const updateProjectStatus = async (id: number, status: ProjectStatus): Promise<{ data: Project }> => {
  return apiFetch<{ data: Project }>(`/api/projects/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/** フェーズ一覧取得（サーバーサイド用） */
export const getPhasesServer = async (projectId: number): Promise<{ data: Phase[] }> => {
  return serverApiFetch<{ data: Phase[] }>(`/api/projects/${projectId}/phases`);
};

/** フェーズ一覧取得（クライアントサイド用） */
export const getPhases = async (projectId: number): Promise<{ data: Phase[] }> => {
  return apiFetch<{ data: Phase[] }>(`/api/projects/${projectId}/phases`);
};

/** フェーズ作成 */
export const createPhase = async (
  projectId: number,
  data: Pick<Phase, 'name'> & Partial<Pick<Phase, 'assignee_id' | 'start_date' | 'end_date' | 'estimated_hours' | 'sort_order'>>,
): Promise<{ data: Phase }> => {
  return apiFetch<{ data: Phase }>(`/api/projects/${projectId}/phases`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/** フェーズ更新 */
export const updatePhase = async (
  projectId: number,
  id: number,
  data: Partial<Pick<Phase, 'name' | 'assignee_id' | 'start_date' | 'end_date' | 'estimated_hours' | 'sort_order' | 'progress_rate'>>,
): Promise<{ data: Phase }> => {
  return apiFetch<{ data: Phase }>(`/api/projects/${projectId}/phases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/** フェーズ削除 */
export const deletePhase = async (projectId: number, id: number): Promise<void> => {
  return apiFetch<void>(`/api/projects/${projectId}/phases/${id}`, { method: 'DELETE' });
};
