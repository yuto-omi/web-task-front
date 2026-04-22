import { apiFetch } from '@/lib/api';

export type User = {
  id: number;
  name: string;
  email: string;
};

export const getUsers = async (): Promise<{ data: User[] }> => {
  return apiFetch<{ data: User[] }>('/api/users');
};
