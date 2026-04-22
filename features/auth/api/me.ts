import { apiFetch, serverApiFetch } from '@/lib/api';

export type MeResponse = {
  user: {
    id: number;
    name: string;
    email: string;
  };
};

// クライアント用（TanStack Query で使用）
export async function me(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/auth/me');
}

// サーバー用（Server Component で使用）
export async function serverMe(): Promise<MeResponse> {
  return serverApiFetch<MeResponse>('/api/auth/me');
}
