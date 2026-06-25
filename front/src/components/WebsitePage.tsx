"use client";

import { useState, useEffect } from 'react';
import MainWebsite from '@/components/MainWebsite';
import { Article, PageSEO, Message } from '@/lib/types';
import { apiRequest, ApiRequestResult } from '@/utils/api';

export default function WebsitePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [seoSettings, setSeoSettings] = useState<PageSEO[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const articlesResult = await apiRequest<Article[]>('/api/articles');
      if (articlesResult.ok && Array.isArray(articlesResult.data)) {
        setArticles(articlesResult.data);
      }

      const seoResult = await apiRequest<PageSEO[]>('/api/seo');
      if (seoResult.ok && Array.isArray(seoResult.data)) {
        setSeoSettings(seoResult.data);
      }
    };
    fetchData();
  }, []);

  const handleAddMessage = async (msg: Message): Promise<ApiRequestResult> => {
    return apiRequest<{ message?: Message; Message?: Message }>(
      '/api/messages/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: msg.name,
          mobile: msg.mobile,
          subject: msg.subject,
          content: msg.content,
        }),
      },
      'خطا در ارسال پیام تماس.'
    );
  };

  return (
    <main className="flex-grow">
      <MainWebsite articles={articles} seoSettings={seoSettings} onAddMessage={handleAddMessage} />
    </main>
  );
}
