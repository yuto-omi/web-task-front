// Server Actions はコンテナ内から呼ぶため API_URL (Docker内部名) を優先する
// ブラウザからの呼び出しは NEXT_PUBLIC_API_URL (localhost:8000) を使用する
const API_URL =
  (typeof window === 'undefined' ? process.env.API_URL : undefined) ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000';

const TIMEOUT_MS = 10_000;
const MAX_RETRY = 3;
const RETRY_STATUS_CODES = new Set([500, 502, 503, 504]);

export type ApiError = {
  status: number;
  message: string;
  code?: string;
};

function isRetryable(status: number): boolean {
  return RETRY_STATUS_CODES.has(status);
}

function backoff(attempt: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
}

// 共通処理
async function baseFetch<T>(
  path: string,
  options: RequestInit,
  attempt = 0
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const error: ApiError = {
        status: res.status,
        message: body.message ?? `API error: ${res.status}`,
        code: body.code,
      };
      // 5xx のみリトライ。4xx はリトライしない
      if (isRetryable(res.status) && attempt < MAX_RETRY) {
        await backoff(attempt);
        return baseFetch<T>(path, options, attempt + 1);
      }
      throw error;
    }

    return res.json() as Promise<T>;

  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      if (attempt < MAX_RETRY) {
        await backoff(attempt);
        return baseFetch<T>(path, options, attempt + 1);
      }
      throw { status: 408, message: 'Request Timeout' } satisfies ApiError;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

// 認証あり（Cookie を送信）
export function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  return baseFetch<T>(path, { ...options, credentials: 'include' });
}

// 認証なし（Cookie を送信しない）
export function publicFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  return baseFetch<T>(path, { ...options, credentials: 'omit' });
}

// サーバーサイド用認証あり（CookieからトークンをAuthorizationヘッダーに設定）
export async function serverApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  return baseFetch<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}