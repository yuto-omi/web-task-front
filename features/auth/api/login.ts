import { publicFetch } from '@/lib/api';
import type { LoginResponse } from '@/features/auth/schemas/login.schema';

export async function login(email: string, password: string): Promise<LoginResponse> {
  return publicFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
