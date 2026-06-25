import type { Article, PageSEO } from '@/lib/types';
import { INITIAL_ARTICLES, INITIAL_SEO_SETTINGS } from '@/data/initialData';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api-core.chbkn.run';

async function serverFetch<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const body = await res.json();
    if (body?.success && Array.isArray(body.data)) return body.data;
    if (Array.isArray(body)) return body;
    return [];
  } catch {
    return [];
  }
}

export async function fetchArticles(): Promise<Article[]> {
  const data = await serverFetch<Article>('/api/articles');
  return data.length ? data : INITIAL_ARTICLES;
}

export async function fetchSeoSettings(): Promise<PageSEO[]> {
  const data = await serverFetch<PageSEO>('/api/seo');
  return data.length ? data : INITIAL_SEO_SETTINGS;
}
