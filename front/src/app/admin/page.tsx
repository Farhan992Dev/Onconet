"use client";

import { useState, useEffect } from 'react';
import AdminPanel from '@/components/AdminPanel';
import { Article, PageSEO, Message } from '@/lib/types';
import { apiRequest, ApiRequestResult } from '@/utils/api';

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [seoSettings, setSeoSettings] = useState<PageSEO[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const getAuthHeader = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('pink_logged_in_admin');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.token) {
          return { 'Authorization': `Bearer ${parsed.token}` };
        }
      } catch {}
    }
    return {};
  };

  const loadPanelData = async () => {
    const authHeader = getAuthHeader();
    if (!('Authorization' in authHeader)) return;

    const articlesResult = await apiRequest<Article[]>('/api/articles/panel', { headers: authHeader });
    if (articlesResult.ok && Array.isArray(articlesResult.data)) {
      setArticles(articlesResult.data);
    }

    const messagesResult = await apiRequest<Message[]>('/api/messages', {
      headers: { 'Content-Type': 'application/json', ...authHeader }
    });
    if (messagesResult.ok && Array.isArray(messagesResult.data)) {
      setMessages(messagesResult.data);
    }
  };

  useEffect(() => {
    loadPanelData();
    const seoResult = async () => {
      const result = await apiRequest<PageSEO[]>('/api/seo');
      if (result.ok && Array.isArray(result.data)) {
        setSeoSettings(result.data);
      }
    };
    seoResult();
  }, []);

  const toArticlePayload = (article: Article) => ({
    title: article.title,
    slug: article.slug,
    content: article.content,
    summary: article.summary,
    category: article.category,
    coverImage: article.coverImage,
    publishDate: article.publishDate,
    isPublished: article.isPublished,
    readingTime: article.readingTime,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    seoKeywords: article.seoKeywords,
    ogImage: article.ogImage ?? ''
  });

  const handleCreateArticle = async (article: Article): Promise<ApiRequestResult<Article>> => {
    const result = await apiRequest<Article>('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(toArticlePayload(article)),
    }, 'خطا در ایجاد مقاله.');
    if (result.ok) await loadPanelData();
    return result;
  };

  const handleUpdateArticle = async (article: Article): Promise<ApiRequestResult<Article>> => {
    const result = await apiRequest<Article>(`/api/articles/${article.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(toArticlePayload(article)),
    }, 'خطا در بروزرسانی مقاله.');
    if (result.ok) await loadPanelData();
    return result;
  };

  const handleDeleteArticle = async (id: number): Promise<ApiRequestResult> => {
    const result = await apiRequest(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }, 'خطا در حذف مقاله.');
    if (result.ok) await loadPanelData();
    return result;
  };

  const handleSeoSettingsChange = async (updated: PageSEO[]): Promise<ApiRequestResult> => {
    const result = await apiRequest('/api/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updated),
    }, 'خطا در همگام‌سازی تنظیمات سئو با سرور.');
    if (result.ok) setSeoSettings(updated);
    return result;
  };

  const handleMessagesChange = async (updated: Message[]): Promise<ApiRequestResult> => {
    const result = await apiRequest('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updated),
    }, 'خطا در همگام‌سازی پیام‌ها با سرور.');
    if (result.ok) setMessages(updated);
    return result;
  };

  return (
    <main className="flex-grow">
      <AdminPanel
        articles={articles}
        seoSettings={seoSettings}
        messages={messages}
        onCreateArticle={handleCreateArticle}
        onUpdateArticle={handleUpdateArticle}
        onDeleteArticle={handleDeleteArticle}
        onSeoSettingsChange={handleSeoSettingsChange}
        onMessagesChange={handleMessagesChange}
        onPanelAuthenticated={loadPanelData}
      />
    </main>
  );
}
