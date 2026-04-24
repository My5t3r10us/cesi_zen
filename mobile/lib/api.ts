import { getStoredToken } from './auth';
import type {
  User,
  Emotion,
  EmotionCategory,
  Entry,
  Article,
  ArticleCategory,
  StatsData,
  DetailedStats,
} from './types';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(
  path: string,
  options: RequestInit & { authenticated?: boolean } = {}
): Promise<T> {
  const { authenticated = true, headers: extraHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  if (authenticated) {
    const token = await getStoredToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Erreur HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      authenticated: false,
    }),

  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    nom?: string;
    prenom?: string;
  }) =>
    request<{ success: boolean; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated: false,
    }),

  me: () => request<User | null>('/api/auth/me'),

  logout: () =>
    request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
};

// ── Emotions ──────────────────────────────────────────────────────────────

export const emotionsApi = {
  list: () => request<Emotion[]>('/api/emotions', { authenticated: false }),
  categories: () =>
    request<EmotionCategory[]>('/api/emotions/categories', { authenticated: false }),
};

// ── Entries ───────────────────────────────────────────────────────────────

export const entriesApi = {
  list: (params?: { startDate?: string; endDate?: string }) => {
    const qs = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return request<Entry[]>(`/api/entries${qs}`);
  },

  create: (data: {
    emotionId: number;
    intensity: number;
    note?: string;
    contextTags?: string[];
  }) =>
    request<Entry>('/api/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: { emotionId: number; intensity: number; note?: string; contextTags?: string[] }
  ) =>
    request<Entry>(`/api/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/api/entries/${id}`, { method: 'DELETE' }),

  stats: () => request<StatsData>('/api/entries/stats'),

  detailedStats: (startDate: string, endDate: string) =>
    request<DetailedStats>(
      `/api/entries/detailed-stats?startDate=${startDate}&endDate=${endDate}`
    ),
};

// ── Articles ──────────────────────────────────────────────────────────────

export const articlesApi = {
  list: () =>
    request<Article[]>('/api/articles?publishedOnly=true', { authenticated: false }),

  bySlug: (slug: string) =>
    request<Article>(`/api/articles/by-slug/${slug}`, { authenticated: false }),

  categories: () =>
    request<ArticleCategory[]>('/api/articles/categories', { authenticated: false }),
};
