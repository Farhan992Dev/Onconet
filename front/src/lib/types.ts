/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: 'پیشگیری' | 'خودارزیابی' | 'درمان' | 'سبک_زندگی' | 'عمومی';
  coverImage: string;
  publishDate: string;
  isPublished: boolean;
  author: string;
  readingTime: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage?: string;
}

export interface SelfCheckLog {
  id: number;
  date: string;
  status: 'normal' | 'noticeable_change';
  notes: string;
  symptoms: string[];
}

export interface UserProfile {
  fullName: string;
  mobile: string;
  birthYear: string;
  lastPeriodDate: string;
  hasRiskFactors: boolean;
  familyHistory: 'هیچکدام' | 'مادر' | 'خواهر' | 'خاله_عمه' | 'بستگان_درجه_دو';
  selfCheckReminderActive: boolean;
  reminderDayOfMonth: number;
}

export interface PageSEO {
  pageId: 'home' | 'articles' | 'self-check' | 'about' | 'contact';
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  siteMapPriority: number;
}

export interface Message {
  id: number;
  name: string;
  mobile: string;
  subject: string;
  content: string;
  date: string;
}

export interface AdminUser {
  id: number;
  mobile: string;
  fullName: string;
  role: string;
  userType?: 'site' | 'panel';
  specialization?: string;
  createdAt: string;
  roleIds?: number[];
}

export interface AdminActionPermission {
  id: number;
  actionKey: string;
  description: string;
}

export interface AdminRole {
  id: number;
  name: string;
  displayName: string;
  isSystem: boolean;
  actionIds: number[];
}
