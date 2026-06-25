"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  FilePlus,
  Eye,
  FileText,
  BadgeAlert,
  Save,
  Trash2,
  CheckCircle,
  HelpCircle,
  Search,
  Globe,
  Share2,
  ListFilter,
  RefreshCw,
  Mail,
  BookOpen,
  Sparkles,
  Bold,
  Heading,
  Quote,
  EyeOff,
  Clock,
  ExternalLink,
  Lock,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Key,
  Users,
  UserPlus,
  Shield
} from 'lucide-react';
import { Article, PageSEO, Message, AdminUser, AdminRole, AdminActionPermission } from '@/lib/types';
import { apiRequest, withLoading, ApiRequestResult } from '@/utils/api';

interface AdminPanelProps {
  articles: Article[];
  seoSettings: PageSEO[];
  messages: Message[];
  onCreateArticle: (article: Article) => Promise<ApiRequestResult<Article>>;
  onUpdateArticle: (article: Article) => Promise<ApiRequestResult<Article>>;
  onDeleteArticle: (id: number) => Promise<ApiRequestResult>;
  onSeoSettingsChange: (updated: PageSEO[]) => Promise<ApiRequestResult>;
  onMessagesChange: (updated: Message[]) => Promise<ApiRequestResult>;
  onPanelAuthenticated?: () => void | Promise<void>;
}

export default function AdminPanel({
  articles,
  seoSettings,
  messages,
  onCreateArticle,
  onUpdateArticle,
  onDeleteArticle,
  onSeoSettingsChange,
  onMessagesChange,
  onPanelAuthenticated
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'articles' | 'pages-seo' | 'inbox' | 'users' | 'roles'>('articles');

  // Admin Login and Role Authorization State
  const [loggedInAdmin, setLoggedInAdmin] = useState<{
    name: string;
    mobile: string;
    role: 'super_admin' | 'editor';
    roleLabel: string;
    token: string;
  } | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('pink_logged_in_admin');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return null;
  });

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [resetStep, setResetStep] = useState<'none' | 'request' | 'verify'>('none');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState(['', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isUserSaving, setIsUserSaving] = useState(false);
  const [isRoleSaving, setIsRoleSaving] = useState(false);
  const [isArticleSaving, setIsArticleSaving] = useState(false);
  const [isSeoSaving, setIsSeoSaving] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [actions, setActions] = useState<AdminActionPermission[]>([]);
  const [userForm, setUserForm] = useState({
    id: 0,
    mobile: '',
    fullName: '',
    role: 'editor',
    specialization: '',
    password: '',
    roleIds: [] as number[]
  });
  const [roleForm, setRoleForm] = useState({
    id: 0,
    name: '',
    displayName: '',
    actionIds: [] as number[]
  });

  // Sync logged in status
  useEffect(() => {
    if (loggedInAdmin) {
      localStorage.setItem('pink_logged_in_admin', JSON.stringify(loggedInAdmin));
    } else {
      localStorage.removeItem('pink_logged_in_admin');
    }
  }, [loggedInAdmin]);

  useEffect(() => {
    if (loggedInAdmin?.role === 'super_admin') {
      loadAdminUsers();
      loadRolesAndActions();
    }
  }, [loggedInAdmin?.role]);

  const adminHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(loggedInAdmin?.token ? { 'Authorization': `Bearer ${loggedInAdmin.token}` } : {}),
  });

  const loadAdminUsers = async (token?: string) => {
    const authToken = token ?? loggedInAdmin?.token;
    if (!authToken) {
      return;
    }

    try {
      const result = await apiRequest<AdminUser[]>('/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (result.ok && Array.isArray(result.data)) {
        setAdminUsers(result.data);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    }
  };

  const loadRolesAndActions = async (token?: string) => {
    const authToken = token ?? loggedInAdmin?.token;
    if (!authToken) {
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      };

      const [rolesResult, actionsResult] = await Promise.all([
        apiRequest<AdminRole[]>('/api/admin/roles', { headers }),
        apiRequest<AdminActionPermission[]>('/api/admin/roles/actions', { headers })
      ]);

      if (rolesResult.ok && Array.isArray(rolesResult.data)) {
        setRoles(rolesResult.data);
      }

      if (actionsResult.ok && Array.isArray(actionsResult.data)) {
        setActions(actionsResult.data);
      }
    } catch (err) {
      console.error('Failed to load roles/actions:', err);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await withLoading(setIsLoginLoading, async () => {
      const result = await apiRequest<{
        token?: string;
        user?: {
          fullName: string;
          mobile: string;
          role: 'super_admin' | 'editor';
          roleLabel: string;
        };
      }>(
        '/api/auth/panel/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: loginPhone, password: loginPass })
        },
        'شماره موبایل یا رمز عبور اشتباه است.'
      );

      if (result.ok && result.data?.token && result.data.user) {
        const userSession = {
          name: result.data.user.fullName,
          mobile: result.data.user.mobile,
          role: result.data.user.role,
          roleLabel: result.data.user.roleLabel,
          token: result.data.token
        };
        setLoggedInAdmin(userSession);
        setLoginError('');
        triggerNotification('success', `خوش آمدید. ورود با نقش ${result.data.user.roleLabel} تایید شد.`);

        await onPanelAuthenticated?.();

        if (result.data.user.role === 'super_admin') {
          await loadAdminUsers(result.data.token);
          await loadRolesAndActions(result.data.token);
        }
      } else {
        setLoginError(result.message || 'شماره موبایل یا رمز عبور اشتباه است.');
        triggerNotification('err', result.message || 'خطا در احراز هویت کادر مدیریت.');
      }
    });
  };

  const handleRequestResetOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^09\d{9}$/.test(resetPhone)) {
      setResetError('شماره موبایل وارد شده باید با ۰۹ شروع شده و ۱۱ رقم باشد.');
      return;
    }
    setResetError('');
    setResetSuccess('');
    setIsResetLoading(true);
    try {
      const result = await apiRequest(
        '/api/auth/panel/reset-password/request',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: resetPhone })
        },
        'خطا در ارسال کد تایید.'
      );
      if (result.ok) {
        setResetStep('verify');
        setResetSuccess('کد تایید با موفقیت به شماره موبایل شما فرستاده شد.');
      } else {
        setResetError(result.message || 'خطا در ارسال کد تایید.');
      }
    } catch (err) {
      console.error(err);
      setResetError('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetOtpInputChange = (val: string, index: number) => {
    if (/^[0-9]?$/.test(val)) {
      const updated = [...resetOtpCode];
      updated[index] = val;
      setResetOtpCode(updated);
      
      // Auto focus next input (left to right: index 0 -> 1 -> 2 -> 3 -> 4)
      if (val && index < 4) {
        const nextInput = document.getElementById(`reset-otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerifyResetOtp = async (e: FormEvent) => {
    e.preventDefault();
    const joinedCode = resetOtpCode.join('');
    if (joinedCode.length < 5) {
      setResetError('کد تایید ۵ رقمی را به طور کامل وارد کنید.');
      return;
    }
    if (newPassword.length < 4) {
      setResetError('کلمه عبور جدید باید حداقل ۴ کاراکتر باشد.');
      return;
    }
    setResetError('');
    setResetSuccess('');
    setIsResetLoading(true);
    try {
      const result = await apiRequest(
        '/api/auth/panel/reset-password/verify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: resetPhone, otpCode: joinedCode, newPassword })
        },
        'کد تایید نامعتبر است.'
      );
      if (result.ok) {
        setResetStep('none');
        setLoginPhone(resetPhone);
        setLoginError('');
        triggerNotification('success', 'رمز عبور شما با موفقیت تغییر یافت. اکنون وارد شوید.');
        setResetPhone('');
        setResetOtpCode(['', '', '', '', '']);
        setNewPassword('');
      } else {
        setResetError(result.message || 'کد تایید نامعتبر است.');
      }
    } catch (err) {
      console.error(err);
      setResetError('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInAdmin(null);
    setAdminUsers([]);
    setLoginPhone('');
    setLoginPass('');
    triggerNotification('success', 'خروج موفقیت‌آمیز از حساب کاربری پیشخوان پزشکان.');
  };

  const handleSaveAdminUser = async (e: FormEvent) => {
    e.preventDefault();

    if (loggedInAdmin?.role !== 'super_admin') {
      triggerNotification('err', 'این عملیات فقط برای مدیر ارشد مجاز است.');
      return;
    }

    if (!userForm.fullName || !userForm.mobile || !userForm.role) {
      triggerNotification('err', 'اطلاعات کاربر کامل نیست.');
      return;
    }

    if (userForm.roleIds.length === 0) {
      triggerNotification('err', 'حداقل یک نقش برای کاربر انتخاب کنید.');
      return;
    }

    if (!userForm.id && !userForm.password) {
      triggerNotification('err', 'برای کاربر جدید رمز عبور الزامی است.');
      return;
    }

    await withLoading(setIsUserSaving, async () => {
      const url = userForm.id ? `/api/admin/users/${userForm.id}` : '/api/admin/users';
      const method = userForm.id ? 'PUT' : 'POST';
      const result = await apiRequest(url, {
        method,
        headers: adminHeaders(),
        body: JSON.stringify(userForm)
      }, 'ذخیره کاربر ناموفق بود.');

      if (result.ok) {
        await loadAdminUsers();
        setUserForm({ id: 0, mobile: '', fullName: '', role: 'editor', specialization: '', password: '', roleIds: [] });
        triggerNotification('success', 'اطلاعات کاربر با موفقیت ذخیره شد.');
      } else {
        triggerNotification('err', result.message || 'ذخیره کاربر ناموفق بود.');
      }
    });
  };

  const handleEditAdminUser = (user: AdminUser) => {
    setUserForm({
      id: user.id,
      mobile: user.mobile,
      fullName: user.fullName,
      role: user.role,
      specialization: user.specialization ?? '',
      password: '',
      roleIds: user.roleIds ?? []
    });
  };

  const handleSaveRole = async (e: FormEvent) => {
    e.preventDefault();

    if (!roleForm.name || !roleForm.displayName) {
      triggerNotification('err', 'نام نقش و عنوان نمایشی الزامی است.');
      return;
    }

    await withLoading(setIsRoleSaving, async () => {
      const url = roleForm.id ? `/api/admin/roles/${roleForm.id}` : '/api/admin/roles';
      const method = roleForm.id ? 'PUT' : 'POST';

      const result = await apiRequest(url, {
        method,
        headers: adminHeaders(),
        body: JSON.stringify(roleForm)
      }, 'ذخیره نقش ناموفق بود.');

      if (result.ok) {
        await loadRolesAndActions();
        setRoleForm({ id: 0, name: '', displayName: '', actionIds: [] });
        triggerNotification('success', 'نقش با موفقیت ذخیره شد.');
      } else {
        triggerNotification('err', result.message || 'ذخیره نقش ناموفق بود.');
      }
    });
  };

  const handleEditRole = (role: AdminRole) => {
    setRoleForm({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      actionIds: role.actionIds ?? []
    });
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm('آیا از حذف این نقش اطمینان دارید؟')) {
      return;
    }

    const result = await apiRequest(`/api/admin/roles/${roleId}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }, 'حذف نقش ناموفق بود.');

    if (result.ok) {
      await loadRolesAndActions();
      triggerNotification('success', 'نقش حذف شد.');
    } else {
      triggerNotification('err', result.message || 'حذف نقش ناموفق بود.');
    }
  };

  const handleDeleteAdminUser = async (id: number) => {
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      return;
    }

    const result = await apiRequest(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: adminHeaders()
    }, 'حذف کاربر ناموفق بود.');

    if (result.ok) {
      await loadAdminUsers();
      triggerNotification('success', 'کاربر حذف شد.');
    } else {
      triggerNotification('err', result.message || 'حذف کاربر ناموفق بود.');
    }
  };

  // Articles manager state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [editorTab, setEditorTab] = useState<'content' | 'seo'>('content');

  // Page SEO manager state
  const [selectedSeoPage, setSelectedSeoPage] = useState<PageSEO>(seoSettings[0]);

  // Alert system
  const [notification, setNotification] = useState<{ type: 'success' | 'err'; message: string } | null>(null);

  // Simulated AI Generating
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const triggerNotification = (type: 'success' | 'err', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle({ ...article });
    setIsNewArticle(false);
    setEditorTab('content');
  };

  const handleCreateNewArticle = () => {
    const fresh: Article = {
      id: 0,
      title: '',
      slug: '',
      content: '',
      summary: '',
      category: 'خودارزیابی',
      coverImage: 'https://images.unsplash.com/photo-1579684389782-b12805b69321?auto=format&fit=crop&q=80&w=600',
      publishDate: new Date().toISOString().split('T')[0],
      isPublished: true,
      author: '', // به طور خودکار توسط بک‌اند تنظیم می‌شود
      readingTime: 5,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ''
    };
    setEditingArticle(fresh);
    setIsNewArticle(true);
    setEditorTab('content');
  };

  const handleDeleteArticle = async (id: number) => {
    if (loggedInAdmin?.role !== 'super_admin') {
      triggerNotification('err', 'خطای دسترسی: حذف مقالات علمی و بالینی تنها از حیطه اختیارات مدیر ارشد پیشخوان (Super Admin) می‌باشد.');
      return;
    }
    if (!confirm('آیا از حذف این مقاله علمی تخصصی اطمینان دارید؟')) {
      return;
    }

    const result = await onDeleteArticle(id);
    if (result.ok) {
      triggerNotification('success', 'مقاله با موفقیت از سرور حذف گردید.');
    } else {
      triggerNotification('err', result.message || 'حذف مقاله ناموفق بود.');
    }
  };

  const handleSaveArticle = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    if (!editingArticle.title.trim()) {
      triggerNotification('err', 'پر کردن عنوان مقاله اجباری است.');
      return;
    }

    let updated = { ...editingArticle };
    if (!updated.slug.trim()) {
      updated.slug = updated.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[?؟]/g, '');
    }
    if (!updated.seoTitle.trim()) {
      updated.seoTitle = `${updated.title} | onconet`;
    }
    if (!updated.seoDescription.trim()) {
      updated.seoDescription = updated.summary || updated.content.substring(0, 150);
    }

    await withLoading(setIsArticleSaving, async () => {
      const result = isNewArticle
        ? await onCreateArticle(updated)
        : await onUpdateArticle(updated);

      if (result.ok) {
        setEditingArticle(null);
        triggerNotification('success', isNewArticle
          ? 'مقاله جدید با موفقیت ایجاد و منتشر شد.'
          : 'تغییرات مقاله با حفظ یکپارچگی سئو آدرس و متاها ذخیره و منتشر شد.');
      } else {
        triggerNotification('err', result.message || 'ذخیره مقاله ناموفق بود.');
      }
    });
  };

  const handleSavePageSeo = async (e: FormEvent) => {
    e.preventDefault();
    if (loggedInAdmin?.role !== 'super_admin') {
      triggerNotification('err', 'خطای سطح دسترسی: تغییر متادیتای ساختاری سئو کل پورتال تنها تحت اختیار مدیر ارشد فرانت‌اند و سئو پورتال می‌باشد.');
      return;
    }
    const nextSeo = seoSettings.map(s => (s.pageId === selectedSeoPage.pageId ? selectedSeoPage : s));

    await withLoading(setIsSeoSaving, async () => {
      const result = await onSeoSettingsChange(nextSeo);
      if (result.ok) {
        triggerNotification('success', `تغییرات تگ‌های متا و سئو صفحه "${selectedSeoPage.pageName}" با موفقیت برای خزنده‌های گوگل بروزرسانی شد.`);
      } else {
        triggerNotification('err', result.message || 'ذخیره تنظیمات سئو ناموفق بود.');
      }
    });
  };

  // Simulated advanced editor formatting actions
  const formatText = (syntax: string) => {
    if (!editingArticle) return;
    const textarea = document.getElementById('article-content-txt') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (syntax === 'bold') replacement = `**${selected || 'متن برجسته'}**`;
    else if (syntax === 'h3') replacement = `\n### ${selected || 'عنوان زیباتر'}\n`;
    else if (syntax === 'quote') replacement = `\n> ${selected || 'نکته کلینیکی و پزشکی مهم'}\n`;
    else if (syntax === 'list') replacement = `\n* ${selected || 'آیتم معاینه'}\n`;

    const updatedContent = text.substring(0, start) + replacement + text.substring(end);
    setEditingArticle({ ...editingArticle, content: updatedContent });
  };

  // AI-powered SEO Metadata Writer - calls backend API
  const handleAiSeoGeneration = async () => {
    if (!editingArticle || !editingArticle.content) {
      triggerNotification('err', 'ابتدا باید مقداری محتوا در متن مقاله بنویسید.');
      return;
    }

    setIsAiGenerating(true);
    triggerNotification('success', 'هوش مصنوعی در حال تحلیل بافت متنی و استخراج کلیدواژه‌ها...');

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        triggerNotification('err', 'خطای احراز هویت. لطفاً دوباره وارد شوید.');
        setIsAiGenerating(false);
        return;
      }

      const response = await fetch('/api/articles/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingArticle.title,
          content: editingArticle.content,
          summary: editingArticle.summary,
          category: editingArticle.category
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          triggerNotification('err', 'نشست شما منقضی شده. لطفاً دوباره وارد شوید.');
        } else {
          triggerNotification('err', 'خطا در تولید متاداده‌های سئو.');
        }
        setIsAiGenerating(false);
        return;
      }

      const metadata = await response.json();

      setEditingArticle(prev => prev ? {
        ...prev,
        seoTitle: metadata.seoTitle,
        seoDescription: metadata.seoDescription,
        seoKeywords: metadata.seoKeywords
      } : null);

      triggerNotification('success', 'متاداده‌های فوق پیشرفته سئو (SEO Tags) توسط هوش مصنوعی تولید و جایگذاری شد!');
    } catch (error) {
      triggerNotification('err', 'خطای شبکه در ارتباط با سرور.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (loggedInAdmin?.role !== 'super_admin') {
      triggerNotification('err', 'خطای دسترسی: ویرایش و حذف پیام‌های مراجعین تنها توسط مدیر ارشد پورتال مقدور است.');
      return;
    }
    const filtered = messages.filter(m => m.id !== id);
    const result = await onMessagesChange(filtered);
    if (result.ok) {
      triggerNotification('success', 'پیام با موفقیت حذف شد.');
    } else {
      triggerNotification('err', result.message || 'حذف پیام ناموفق بود.');
    }
  };

  if (!loggedInAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex items-center justify-center font-sans rounded-3xl" dir="rtl" id="admin-auth-container">
        <div className="max-w-md w-full mx-auto space-y-6">

          {/* Form */}
          {resetStep === 'none' && (
            <form onSubmit={handleLoginSubmit} className="bg-slate-950 p-8 rounded-3xl border border-slate-850 flex flex-col justify-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="text-center space-y-2 relative">
                <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/15 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">ورود کادر درمانی پورتال onconet</h3>
                <p className="text-[10px] text-slate-400 font-semibold">شماره موبایل مستند و پین‌کد خود را وارد نمایید</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">شماره موبایل پزشک:</label>
                  <input
                    type="text"
                    placeholder="مثال: 09121112233"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">کلمه عبور امنیتی پورتال (Password):</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all font-mono text-left"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setResetStep('request'); setResetError(''); setResetSuccess(''); }}
                    className="text-[10px] text-pink-400 hover:text-pink-300 transition-colors font-semibold"
                  >
                    فراموشی رمز عبور؟
                  </button>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-[10px] text-red-400 font-semibold leading-relaxed">
                    ⚠️ {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-900/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  id="admin-form-submit"
                >
                  {isLoginLoading ? 'در حال ورود...' : 'تایید اطلاعات و ورود به پیشخوان کادر ➔'}
                </button>
              </div>
            </form>
          )}

          {resetStep === 'request' && (
            <form onSubmit={handleRequestResetOtp} className="bg-slate-950 p-8 rounded-3xl border border-slate-850 flex flex-col justify-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="text-center space-y-2 relative">
                <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/15 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">بازیابی رمز عبور کادر درمان</h3>
                <p className="text-[10px] text-slate-400 font-semibold">شماره تلفن همراه خود را وارد کنید تا کد تایید ارسال شود.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">شماره موبایل ثبت‌شده:</label>
                  <input
                    type="text"
                    placeholder="مثال: 09121112233"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all font-mono text-left"
                  />
                </div>

                {resetError && (
                  <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-[10px] text-red-400 font-semibold leading-relaxed">
                    ⚠️ {resetError}
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-[10px] text-emerald-400 font-semibold leading-relaxed">
                    ✓ {resetSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-900/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
                >
                  {isResetLoading ? 'در حال ارسال...' : 'درخواست کد تایید ➔'}
                </button>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('none')}
                    className="text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    بازگشت به صفحه ورود
                  </button>
                </div>
              </div>
            </form>
          )}

          {resetStep === 'verify' && (
            <form onSubmit={handleVerifyResetOtp} className="bg-slate-950 p-8 rounded-3xl border border-slate-850 flex flex-col justify-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="text-center space-y-2 relative">
                <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/15 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">تایید کد و تغییر رمز عبور</h3>
                <p className="text-[10px] text-slate-400 font-semibold">کد تایید پیامک‌شده و کلمه عبور جدید را وارد نمایید.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2.5 text-center">کد تایید ۵ رقمی:</label>
                  <div className="flex items-center justify-center gap-2.5" dir="ltr">
                    {resetOtpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`reset-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleResetOtpInputChange(e.target.value, idx)}
                        className="w-10 h-11 text-center font-bold text-lg bg-slate-900 border border-slate-800 focus:border-pink-500 focus:bg-slate-950 rounded-xl focus:outline-none text-white transition-all shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5">کلمه عبور جدید:</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all font-mono text-left"
                  />
                </div>

                {resetError && (
                  <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl text-[10px] text-red-400 font-semibold leading-relaxed">
                    ⚠️ {resetError}
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-[10px] text-emerald-400 font-semibold leading-relaxed">
                    ✓ {resetSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-900/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
                >
                  {isResetLoading ? 'در حال اعمال...' : 'تغییر رمز عبور و ورود ➔'}
                </button>

                <div className="text-center mt-2 flex justify-between px-1">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="text-[10px] text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    ارسال مجدد کد تایید
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetStep('none')}
                    className="text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 rounded-2xl animate-fade-in" dir="rtl" id="admin-panel-section">
      <div className="max-w-7xl mx-auto">

        {/* Navigation / Header */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-slate-800 pb-5 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
                <Settings className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-md md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>پنل مدیریت یکپارچه پورتال (Admin Console)</span>
                  {loggedInAdmin && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${loggedInAdmin.role === 'super_admin'
                      ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                      {loggedInAdmin.roleLabel}
                    </span>
                  )}
                </h1>
                <p className="text-slate-400 text-xs mt-1">
                  مدیریت هوشمند مقالات سرطان پستان، اصلاح متادیتاهای موتور جستجو (سئو داینامیک) و صندوق ورودی پیام‌ها
                </p>
              </div>
            </div>

            {/* Logged in admin controls indicator */}
            {loggedInAdmin && (
              <div className="mt-3.5 flex items-center gap-2 text-xs flex-wrap">
                <span className="text-slate-500 font-semibold">کاربر</span>
                <span className="text-white font-bold bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800">{loggedInAdmin.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
                  id="admin-logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  خروج از حساب مدیریت
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-850 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => { setActiveSubTab('articles'); setEditingArticle(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeSubTab === 'articles'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-900/15'
                : 'text-slate-400 hover:text-white'
                }`}
              id="admin-tab-articles"
            >
              <FileText className="w-3.5 h-3.5" />
              مدیریت مقالات علمی
            </button>
            <button
              onClick={() => { setActiveSubTab('pages-seo'); setEditingArticle(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeSubTab === 'pages-seo'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-900/15'
                : 'text-slate-400 hover:text-white'
                }`}
              id="admin-tab-seo"
            >
              <Globe className="w-3.5 h-3.5" />
              سئو صفحات ثابت
            </button>
            <button
              onClick={() => { setActiveSubTab('inbox'); setEditingArticle(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all relative ${activeSubTab === 'inbox'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-900/15'
                : 'text-slate-400 hover:text-white'
                }`}
              id="admin-tab-inbox"
            >
              <Mail className="w-3.5 h-3.5" />
              صندوق تماسها
              {messages.length > 0 && (
                <span className="absolute -top-1.5 -left-1 px-1.5 py-0.5 bg-pink-500 text-white text-[8px] rounded-full font-bold animate-bounce">
                  {messages.length}
                </span>
              )}
            </button>

            {loggedInAdmin?.role === 'super_admin' && (
              <button
                onClick={() => { setActiveSubTab('users'); setEditingArticle(null); }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeSubTab === 'users'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-900/15'
                  : 'text-slate-400 hover:text-white'
                  }`}
                id="admin-tab-users"
              >
                <Users className="w-3.5 h-3.5" />
                مدیریت کاربران
              </button>
            )}

            {loggedInAdmin?.role === 'super_admin' && (
              <button
                onClick={() => { setActiveSubTab('roles'); setEditingArticle(null); }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeSubTab === 'roles'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-900/15'
                  : 'text-slate-400 hover:text-white'
                  }`}
                id="admin-tab-roles"
              >
                <Shield className="w-3.5 h-3.5" />
                نقش ها و دسترسی
              </button>
            )}
          </div>
        </div>

        {/* Global Notifications Panel */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 left-4 z-50 p-4 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 max-w-sm ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              id="admin-global-notification"
            >
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <BadgeAlert className="w-4 h-4" />}
              <span>{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= EDITING / CREATING ARTICLE FULL SCREEN BLOWER ================= */}
        {editingArticle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-950 p-6 rounded-3xl border border-slate-850 space-y-6 shadow-2xl mb-8"
            id="admin-article-editor"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-pink-500 tracking-wider">
                  {isNewArticle ? 'پیش‌نویس جدید' : 'بروزرسانی محتوای علمی'}
                </span>
                <h3 className="text-md font-bold text-white mt-1">
                  {isNewArticle ? 'تالیف مقاله جدید درباره سلامت پستان' : `در حال ویرایش: ${editingArticle.title}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingArticle(null)}
                className="text-xs bg-slate-850 hover:bg-slate-800 text-slate-400 px-3.5 py-2 rounded-xl transition-all font-semibold"
              >
                بازگشت به لیست مقالات
              </button>
            </div>

            {/* Toggle editor modes */}
            <div className="flex bg-slate-900 border border-slate-805 p-1 rounded-xl max-w-xs">
              <button
                type="button"
                onClick={() => setEditorTab('content')}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${editorTab === 'content' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                محتوای اصلی مقاله
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('seo')}
                className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${editorTab === 'seo' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                متاها و تنظیمات سئو (SEO)
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 block"></span>
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-6">
              {editorTab === 'content' ? (
                /* 1. Content Tab */
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                    <div className="md:col-span-8">
                      <label className="block text-xs font-bold text-slate-400 mb-2">عنوان اصلی مقاله (سایر عنوان‌ها در سئو درج شوند)</label>
                      <input
                        type="text"
                        placeholder="مثال: روش‌های خودمراقبتی و پیشگیری از فیبروآدنوم مکرر"
                        value={editingArticle.title}
                        onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-pink-500 focus:bg-slate-950 rounded-xl text-sm font-semibold text-white focus:outline-none transition-all placeholder:text-slate-600"
                        id="admin-edit-title"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-bold text-slate-400 mb-2">دسته‌بندی موضوعی</label>
                      <select
                        value={editingArticle.category}
                        onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value as any })}
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold focus:outline-none text-white cursor-pointer"
                      >
                        <option value="خودارزیابی">خودارزیابی شخصی</option>
                        <option value="پیشگیری">پیشگیری و پزشکی</option>
                        <option value="درمان">روش‌های نوین درمان</option>
                        <option value="سبک_زندگی">سبک زندگی سالم</option>
                        <option value="عمومی">دانستنی‌های عمومی</option>
                      </select>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">آدرس اختصاصی مقاله (Slug / بدون فاصله)</label>
                      <input
                        type="text"
                        placeholder="how-to-examine-breast"
                        value={editingArticle.slug}
                        onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white font-mono text-left focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">مدت زمان حدودی مطالعه (دقیقه)</label>
                      <input
                        type="number"
                        value={editingArticle.readingTime}
                        onChange={(e) => setEditingArticle({ ...editingArticle, readingTime: parseInt(e.target.value) || 3 })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">چکیده کوتاه (برای پیش‌نمایش کارت‌ها)</label>
                    <textarea
                      placeholder="خلاصه‌ای از مهم‌ترین پیام این مقاله را برای نمایش بهتر در صفحه اصلی وارد کنید..."
                      value={editingArticle.summary}
                      onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-medium text-slate-300 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Advanced Formatting toolbar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-slate-400">بدنه اصلی مقاله (متن پیشرفته Markdown)</label>

                      {/* Formatting Helper Bar */}
                      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-[10px] font-semibold text-slate-400">
                        <button type="button" onClick={() => formatText('bold')} className="p-1 hover:bg-slate-800 hover:text-white rounded" title="برجسته کردن متن">
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => formatText('h3')} className="p-1 hover:bg-slate-800 hover:text-white rounded" title="سرتیتر H3">
                          <Heading className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => formatText('quote')} className="p-1 hover:bg-slate-800 hover:text-white rounded" title="ستون نقل قول">
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => formatText('list')} className="p-1 hover:bg-slate-800 hover:text-white rounded" title="لیست نقطه‌ای">
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      id="article-content-txt"
                      placeholder="نوشتن مقاله را با استفاده از ساختارهای استاندارد پاراگراف، تیترها و موارد علمی آغاز کنید..."
                      value={editingArticle.content}
                      onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-medium text-slate-300 focus:outline-none transition-all font-sans leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">آدرس اینترنتی کاور یا نقشه تصویر (Cover Image URL)</label>
                    <input
                      type="text"
                      value={editingArticle.coverImage}
                      onChange={(e) => setEditingArticle({ ...editingArticle, coverImage: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white font-mono text-left focus:outline-none transition-all"
                    />
                  </div>
                </div>
              ) : (
                /* 2. SEO Tab */
                <div className="space-y-6">

                  {/* AI helper box */}
                  <div className="bg-slate-900/50 border border-pink-700/20 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        بهینه‌ساز هوشمند متای سئو با هوش مصنوعی (Gemini-AI)
                      </h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed">
                        با فشردن کلید روبرو، بدنه مقاله نوشته شده فوق به طور کامل توسط هوش مصنوعی اسکن شده و تگ‌های تایتل، توضیحات فشرده موتورهای جستجو و کلمات فوکوس سئو به طور علمی جایگذاری می‌گردند.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isAiGenerating}
                      onClick={handleAiSeoGeneration}
                      className="shrink-0 flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-700 active:scale-[0.98] text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-pink-900/10 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isAiGenerating ? 'هوش مصنوعی زنده...' : 'تولید با هوش مصنوعی'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">متا تایتل سئو (Meta Title Tag)</label>
                      <input
                        type="text"
                        placeholder="باورهای غلط سرطان سینه | بررسی فکت‌های علمی onconet"
                        value={editingArticle.seoTitle}
                        onChange={(e) => setEditingArticle({ ...editingArticle, seoTitle: e.target.value })}
                        maxLength={70}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">حداکثر طول استاندارد: ۶۰ الی ۷۰ کاراکتر</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">کلمات کلیدی فوکوس (Keywords - جدا شده با کاما انگلیسی)</label>
                      <input
                        type="text"
                        placeholder="معاینه دستی پستان, سرطان پستان, درمان سینه"
                        value={editingArticle.seoKeywords}
                        onChange={(e) => setEditingArticle({ ...editingArticle, seoKeywords: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2">توضیحات کوتاه سئو (Meta Description / جذاب برای جذب کلیک کاربر از گوگل)</label>
                    <textarea
                      placeholder="متن توصیفی کوتاه ۱۵۰ تا ۱۶۰ کاراکتری که در صفحات نتایج موتورهای جستجو گوگل نمایش داده می‌شود..."
                      value={editingArticle.seoDescription}
                      onChange={(e) => setEditingArticle({ ...editingArticle, seoDescription: e.target.value })}
                      maxLength={160}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-medium text-slate-300 focus:outline-none transition-all resize-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>طول مناسب جهت نمایش بی نقص در موبایل و دسکتاپ: ۱۲۰ الی ۱۶۰ کاراکتر</span>
                      <span>{editingArticle.seoDescription.length} / ۱۶۰ کاراکتر</span>
                    </div>
                  </div>

                  {/* Google Snippet Simulator Live view in Admin Panel */}
                  <div className="bg-slate-900 p-4.5 rounded-2xl border border-slate-800 max-w-2xl">
                    <span className="text-[9px] font-bold text-pink-500 uppercase tracking-widest block mb-2.5">شبیه‌ساز گوگل ریچ اسنیپت (Google SERP Snippet Preview)</span>
                    <div className="bg-white p-4 rounded-xl shadow border border-slate-200 text-right font-sans" dir="rtl">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-sans mb-1">
                        <span>https://pinkbreasthealth.ir</span>
                        <span>›</span>
                        <span>articles</span>
                        <span>›</span>
                        <span className="font-mono text-[10px]">{editingArticle.slug || 'slug-placeholder'}</span>
                      </div>
                      <h4 className="text-lg text-blue-800 hover:underline font-medium leading-tight line-clamp-1 block cursor-pointer">
                        {editingArticle.seoTitle || editingArticle.title || 'عنوان سئو نشده - تایتل وارد نشده است'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                        {editingArticle.seoDescription || editingArticle.summary || 'توضیحات کوتاه برای نمایش قرار داده نشده است. متن مقاله به عنوان پیش‌فرض گوگل خوانده می‌شود.'}
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3.5 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  انصراف
                </button>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingArticle.isPublished}
                      onChange={(e) => setEditingArticle({ ...editingArticle, isPublished: e.target.checked })}
                      className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4 bg-slate-800 border-slate-700"
                    />
                    <span>وضعیت انتشار مستقیم فعال</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isArticleSaving}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-4.5 rounded-xl transition-all shadow-md shadow-pink-900/15 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isArticleSaving ? 'در حال ذخیره...' : 'ذخیره و هماهنگ‌سازی سئو'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        <AnimatePresence mode="wait">

          {/* TAB 1: ARTICLES MANAGER */}
          {activeSubTab === 'articles' && !editingArticle && (
            <motion.div
              key="articles-hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                <div className="text-right">
                  <h3 className="text-sm font-bold text-white">آرشیو مقالات تخصصی کادر پزشکی</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">آمار نویسندگان: {articles.length} مقاله علمی فعال و آماده ایندکس شدن گوگل</p>
                </div>
                <button
                  onClick={handleCreateNewArticle}
                  className="flex items-center justify-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-pink-900/10 cursor-pointer"
                  id="admin-btn-new-article"
                >
                  <FilePlus className="w-4 h-4" />
                  تحریر مقاله پزشکی جدید
                </button>
              </div>

              {/* Table / List */}
              <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-805 text-slate-400">
                        <th className="p-4 font-bold">عنوان و خلاصه مقاله علم سینه</th>
                        <th className="p-4 font-bold">موضوع</th>
                        <th className="p-4 font-bold">نویسنده</th>
                        <th className="p-4 font-bold">تاریخ انتشار</th>
                        <th className="p-4 font-bold text-center">وضعیت سئو</th>
                        <th className="p-4 font-bold text-center">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-350">
                      {articles.map((article) => (
                        <tr key={article.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white text-sm line-clamp-1">{article.title}</div>
                            <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{article.summary || article.content.substring(0, 100)}</div>
                          </td>
                          <td className="p-4 shrink-0">
                            <span className="p-1 px-2.5 bg-slate-850 text-[10px] rounded-lg text-pink-400 border border-slate-800 font-semibold">
                              {article.category}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 font-bold whitespace-nowrap">{article.author}</td>
                          <td className="p-4 whitespace-nowrap font-mono">{article.publishDate}</td>
                          <td className="p-4 text-center whitespace-nowrap">
                            {article.seoTitle && article.seoDescription ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded text-[9px] font-bold">
                                بهینه‌سازی عالی
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/15 rounded text-[9px] font-bold animate-pulse">
                                نیاز به تنظیم سئو
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditArticle(article)}
                                className="p-1 px-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 transition-all font-semibold hover:text-white cursor-pointer"
                              >
                                ویرایش
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(article.id)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all cursor-pointer"
                                title="حذف دائمی"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: SYSTEM PAGES SEO SETUP */}
          {activeSubTab === 'pages-seo' && (
            loggedInAdmin?.role !== 'super_admin' ? (
              <motion.div
                key="seo-restructured-lock"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-950 p-10 md:p-14 rounded-3xl border border-slate-855 text-center max-w-2xl mx-auto space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-md md:text-lg font-bold text-white">دسترسی محدود شده: مدیریت متاداده صفحات اصلی</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold font-sans">
                    همکار گرامی، <span className="font-bold text-pink-400">{loggedInAdmin?.name}</span>، نقش فعلی شما <span className="font-bold text-cyan-400">«همکار تحریریه و محتوا»</span> است.
                  </p>
                  <p className="text-xs text-slate-350 leading-relaxed px-4 text-center">
                    بر اساس پروتکل‌های فنی موتورهای جستجو و سیاست توسعه پورتال ملی onconet، بازنویسی مستقیم تگ‌های متادیتا سربرگ صفحات اصلی، تعیین اولویت ربات‌های خزنده کراولر و کارهای یکپارچه‌سازی فرانت پورتال تنها تحت اختیار <strong className="text-amber-400">مدیر ارشد پورتال</strong> مقدور است.
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-855 p-4 rounded-2xl text-right text-[11px] text-slate-400 leading-relaxed space-y-1">
                  <div className="text-slate-300 font-bold mb-1">💡 راهنمایی برای همکار تحریریه:</div>
                  <div>• نیاز کاربری: اصلاح عنوان سئو یا کلمات کلیدی مقالات تخصصی خودتان</div>
                  <div className="text-emerald-400 font-bold">• راه‌حل مجاز: در زبانه «مدیریت مقالات علمی» روی دکمه ویرایش مقاله خود کلیک کرده و از هوش مصنوعی سئو یا فرم انتهای ویرایشگر استفاده فرمایید.</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="seo-hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >

                {/* Static page list sidebar (4 columns) */}
                <div className="lg:col-span-4 bg-slate-950 p-5 rounded-3xl border border-slate-850 space-y-3.5">
                  <div className="border-b border-slate-800 pb-3 mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">صفحات استاتیک سایت اصلی</h4>
                    <p className="text-[10px] text-slate-500 mt-1">صفحه مورد نظر جهت اصلاح تگ‌های سارختاریافته سئو را برگزینید.</p>
                  </div>

                  <div className="space-y-1.5">
                    {seoSettings.map((page) => (
                      <button
                        key={page.pageId}
                        onClick={() => setSelectedSeoPage({ ...page })}
                        className={`w-full text-right p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs font-bold cursor-pointer ${selectedSeoPage.pageId === page.pageId
                          ? 'bg-slate-900 border-pink-500 text-white shadow-lg'
                          : 'bg-transparent border-slate-855 text-slate-455 hover:bg-slate-900'
                          }`}
                      >
                        <span>{page.pageName}</span>
                        <span className="font-mono text-[9px] p-0.5 px-2 bg-slate-850 rounded-md text-slate-500">
                          {`/${page.pageId === 'home' ? '' : page.pageId}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic editing form inputs (8 columns) */}
                <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-850">
                  <div className="border-b border-slate-800 pb-4 mb-5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-pink-500" />
                      اصلاح متادیتا: صفحه {selectedSeoPage.pageName}
                    </h3>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-1 rounded-md font-bold">نقشه سایت اولویت {selectedSeoPage.siteMapPriority}</span>
                  </div>

                  <form onSubmit={handleSavePageSeo} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-450 mb-2">تیتر سئو سربرگ (Meta Title Tag - نمای آیکون تب)</label>
                        <input
                          type="text"
                          value={selectedSeoPage.metaTitle}
                          onChange={(e) => setSelectedSeoPage({ ...selectedSeoPage, metaTitle: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-455 mb-2">کلمات کلیدی کانون سئو (Focus Keywords)</label>
                        <input
                          type="text"
                          value={selectedSeoPage.focusKeywords}
                          onChange={(e) => setSelectedSeoPage({ ...selectedSeoPage, focusKeywords: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-450 mb-2">توضیحات کوتاه متا (Meta Description) - حداکثر ۱۶۰ کاراکتر</label>
                      <textarea
                        value={selectedSeoPage.metaDescription}
                        onChange={(e) => setSelectedSeoPage({ ...selectedSeoPage, metaDescription: e.target.value })}
                        rows={3}
                        maxLength={160}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none transition-all resize-none"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>طول مناسب گوگل: ۱۳۰ الی ۱۶۰ کاراکتر</span>
                        <span>{selectedSeoPage.metaDescription.length} / ۱۶۰ کاراکتر</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-450 mb-2">آدرس اینترنتی کنونیکال (Canonical URL)</label>
                        <input
                          type="text"
                          value={selectedSeoPage.canonicalUrl}
                          onChange={(e) => setSelectedSeoPage({ ...selectedSeoPage, canonicalUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white font-mono text-left focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-455 mb-2">انتشار لینک‌های پیامرسان‌ها (Open Graph Title)</label>
                        <input
                          type="text"
                          value={selectedSeoPage.ogTitle}
                          onChange={(e) => setSelectedSeoPage({ ...selectedSeoPage, ogTitle: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl text-xs font-semibold text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Visual Snippet Preview for static pages */}
                    <div className="bg-slate-900 p-4.5 rounded-2xl border border-slate-805">
                      <span className="text-[9px] font-bold text-pink-500 uppercase tracking-widest block mb-2">شبیه‌ساز گوگل برای صفحه {selectedSeoPage.pageName}</span>
                      <div className="bg-white p-3.5 rounded-xl shadow border border-slate-200 text-right" dir="rtl">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-sans mb-1">
                          <span>{selectedSeoPage.canonicalUrl}</span>
                        </div>
                        <h4 className="text-md text-blue-800 hover:underline font-medium leading-tight block cursor-pointer">
                          {selectedSeoPage.metaTitle}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {selectedSeoPage.metaDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSeoSaving}
                        className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-pink-900/10 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        {isSeoSaving ? 'در حال ذخیره...' : 'ثبت سئو صفحات و ریلود نقشه‌سایت'}
                      </button>
                    </div>
                  </form>
                </div>

              </motion.div>
            )
          )}

          {/* TAB 3: CONTACT FORM INBOX MESSAGES */}
          {activeSubTab === 'inbox' && (
            loggedInAdmin?.role !== 'super_admin' ? (
              <motion.div
                key="inbox-restructured-lock"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-950 p-10 md:p-14 rounded-3xl border border-slate-855 text-center max-w-2xl mx-auto space-y-6 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-md md:text-lg font-bold text-white">دسترسی امنیتی ویژه: حفاظت از محرمانگی بیماران</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    همکار گرامی، <span className="font-bold text-pink-400">{loggedInAdmin?.name}</span>، نقش فعلی شما <span className="font-bold text-cyan-400">«همکار تحریریه و محتوا»</span> است.
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed px-4 text-center">
                    با توجه به اینکه مراجعین پورتال، مدارک خصوصی پزشکی، نتایج پاتولوژی و علائم حیاتی مگنتیک خود را جهت مشاوره اضطراری در این بخش ارسال می‌کنند، به علت رعایت خط‌مشی‌های بنیاد، صندوق پیام‌های دریافتی مراجعین صرفاً برای <strong className="text-pink-500">مدیر ارشد پورتال</strong> نمایش داده می‌شود.
                  </p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl text-[11px] text-red-400/90 border border-red-950/20">
                  نقش شما فاقد اعتبار کافی جهت خواندن پیام‌های بیماران است.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inbox-hub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-right">
                  <h3 className="text-sm font-bold text-white">صندوق ورودی پیام‌های پزشکان کشیک و پشتیبانی سایت</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">کاربران سایت اصلی می‌توانند از بخش تماس با ما سوالات خود را بفرستند.</p>
                </div>

                {messages.length === 0 ? (
                  <div className="bg-slate-950 p-10 rounded-2xl border border-slate-850 text-center text-xs text-slate-500">
                    هیچ پیامی در صندوق ورودی وجود ندارد.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-slate-950 p-5 rounded-2xl border border-slate-855 flex flex-col justify-between hover:border-slate-800 transition-all space-y-4 shadow-xl"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2.5 border-b border-slate-900">
                            <div>
                              <span className="text-white text-xs font-bold">{msg.name}</span>
                              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">موبایل: {msg.mobile}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                              {msg.date}
                            </span>
                          </div>
                          <div>
                            <span className="px-1.5 py-0.5 bg-pink-500/10 text-pink-400 text-[9px] rounded font-bold">
                              موضوع: {msg.subject}
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed mt-2.5 p-3 bg-slate-900/40 rounded-xl">
                              {msg.content}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف پیام خوانده‌شده
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </motion.div>
            )
          )}

          {activeSubTab === 'users' && loggedInAdmin?.role === 'super_admin' && (
            <motion.div
              key="users-hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-850">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-4 h-4 text-pink-500" />
                  <h3 className="text-sm font-bold text-white">ایجاد یا ویرایش کاربر</h3>
                </div>

                <form onSubmit={handleSaveAdminUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">نام کامل</label>
                    <input
                      type="text"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">موبایل</label>
                    <input
                      type="text"
                      value={userForm.mobile}
                      disabled={Boolean(userForm.id)}
                      onChange={(e) => setUserForm(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">نقش پایه</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">تخصیص نقش ها</label>
                    <div className="max-h-28 overflow-y-auto rounded-xl border border-slate-800 p-2 bg-slate-900 space-y-1.5">
                      {roles.map(role => (
                        <label key={role.id} className="flex items-center gap-2 text-xs text-slate-200">
                          <input
                            type="checkbox"
                            checked={userForm.roleIds.includes(role.id)}
                            onChange={(e) => {
                              setUserForm(prev => ({
                                ...prev,
                                roleIds: e.target.checked
                                  ? [...prev.roleIds, role.id]
                                  : prev.roleIds.filter(id => id !== role.id)
                              }));
                            }}
                          />
                          <span>{role.displayName} ({role.name})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">تخصص</label>
                    <input
                      type="text"
                      value={userForm.specialization}
                      onChange={(e) => setUserForm(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">رمز عبور {userForm.id ? '(اختیاری برای تغییر)' : ''}</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isUserSaving}
                      className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-xl"
                    >
                      {isUserSaving ? 'در حال ذخیره...' : 'ذخیره کاربر'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserForm({ id: 0, mobile: '', fullName: '', role: 'editor', specialization: '', password: '', roleIds: [] })}
                      className="px-3 py-2.5 bg-slate-850 text-slate-300 text-xs font-bold rounded-xl"
                    >
                      ریست
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-850">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">لیست کاربران</h3>
                  <button
                    onClick={() => loadAdminUsers()}
                    className="text-xs font-bold text-pink-400 hover:text-pink-300"
                  >
                    بروزرسانی
                  </button>
                </div>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="border border-slate-850 rounded-2xl p-4 bg-slate-900/40">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-white text-xs font-bold">{user.fullName}</div>
                          <div className="text-slate-400 text-[11px] font-mono mt-1">{user.mobile}</div>
                          <div className="text-pink-400 text-[10px] mt-1">نقش: {user.role}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditAdminUser(user)}
                            className="px-3 py-1.5 bg-slate-850 text-slate-200 text-[11px] rounded-lg"
                          >
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDeleteAdminUser(user.id)}
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[11px] rounded-lg"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {adminUsers.length === 0 && (
                    <div className="text-center text-slate-500 text-xs py-10">کاربری برای نمایش وجود ندارد.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'roles' && loggedInAdmin?.role === 'super_admin' && (
            <motion.div
              key="roles-hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-850">
                <h3 className="text-sm font-bold text-white mb-4">ایجاد/ویرایش نقش</h3>
                <form onSubmit={handleSaveRole} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">شناسه نقش (انگلیسی)</label>
                    <input
                      type="text"
                      value={roleForm.name}
                      disabled={Boolean(roleForm.id)}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">عنوان نمایشی</label>
                    <input
                      type="text"
                      value={roleForm.displayName}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">اکشن های مجاز</label>
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 p-2 bg-slate-900 space-y-1.5">
                      {actions.map(action => (
                        <label key={action.id} className="flex items-start gap-2 text-xs text-slate-200">
                          <input
                            type="checkbox"
                            checked={roleForm.actionIds.includes(action.id)}
                            onChange={(e) => {
                              setRoleForm(prev => ({
                                ...prev,
                                actionIds: e.target.checked
                                  ? [...prev.actionIds, action.id]
                                  : prev.actionIds.filter(id => id !== action.id)
                              }));
                            }}
                          />
                          <span>
                            <span className="font-mono">{action.actionKey}</span>
                            <span className="text-slate-500"> - {action.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="submit" disabled={isRoleSaving} className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-xl">
                      {isRoleSaving ? 'در حال ذخیره...' : 'ذخیره نقش'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleForm({ id: 0, name: '', displayName: '', actionIds: [] })}
                      className="px-3 py-2.5 bg-slate-850 text-slate-300 text-xs font-bold rounded-xl"
                    >
                      ریست
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-850">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">لیست نقش ها</h3>
                  <button onClick={() => loadRolesAndActions()} className="text-xs font-bold text-pink-400 hover:text-pink-300">بروزرسانی</button>
                </div>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {roles.map(role => (
                    <div key={role.id} className="border border-slate-850 rounded-2xl p-4 bg-slate-900/40">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-white text-xs font-bold">{role.displayName}</div>
                          <div className="text-slate-400 text-[11px] font-mono mt-1">{role.name}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{role.isSystem ? 'سیستمی' : 'سفارشی'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditRole(role)} className="px-3 py-1.5 bg-slate-850 text-slate-200 text-[11px] rounded-lg">ویرایش</button>
                          {!role.isSystem && (
                            <button onClick={() => handleDeleteRole(role.id)} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[11px] rounded-lg">حذف</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {roles.length === 0 && (
                    <div className="text-center text-slate-500 text-xs py-10">نقشی برای نمایش وجود ندارد.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
