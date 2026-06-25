"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Lock,
  KeyRound,
  Calendar,
  Layers,
  CheckCircle,
  AlertTriangle,
  History,
  Clock,
  LogOut,
  Save,
  Plus,
  Compass,
  ArrowRight
} from 'lucide-react';
import { UserProfile, SelfCheckLog } from '@/lib/types';
import { apiRequest, withLoading } from '@/utils/api';

interface UserPanelProps {
  onLoginStatusChange: (isLoggedIn: boolean) => void;
}

export default function UserPanel({ onLoginStatusChange }: UserPanelProps) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pink_user_logged') === 'true';
  });
  const [mobile, setMobile] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('otp');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isLogSaving, setIsLogSaving] = useState(false);

  // Profile status
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'کاربر همراه onconet',
    mobile: '',
    birthYear: '1370',
    lastPeriodDate: '1405/02/10',
    hasRiskFactors: false,
    familyHistory: 'هیچکدام',
    selfCheckReminderActive: true,
    reminderDayOfMonth: 15
  });

  // History check log
  const [logs, setLogs] = useState<SelfCheckLog[]>([]);

  // Form states for adding log
  const [newLogStatus, setNewLogStatus] = useState<'normal' | 'noticeable_change'>('normal');
  const [newLogNotes, setNewLogNotes] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // Backend Sync effect for logged-in user
  const loadUserDataFromBackend = async () => {
    const token = localStorage.getItem('pink_user_token');
    if (!token) return;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const profileResult = await apiRequest<UserProfile>('/api/user/profile', { headers });
    if (profileResult.ok && profileResult.data) {
      setProfile(profileResult.data);
    }

    const logsResult = await apiRequest<SelfCheckLog[]>('/api/user/logs', { headers });
    if (logsResult.ok && Array.isArray(logsResult.data)) {
      setLogs(logsResult.data);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadUserDataFromBackend();
    }
  }, [isLoggedIn]);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('pink_user_logged', isLoggedIn ? 'true' : 'false');
    onLoginStatusChange(isLoggedIn);
  }, [isLoggedIn]);

  // Cooldown dynamic timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!/^09\d{9}$/.test(mobile)) {
      setErrorMsg('شماره موبایل وارد شده باید با ۰۹ شروع شده و ۱۱ رقم باشد.');
      return;
    }
    setErrorMsg('');
    await withLoading(setIsOtpLoading, async () => {
      const result = await apiRequest<{ otpCode?: string }>(
        '/api/auth/site/request-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile })
        },
        'بروز خطا در برقراری ارتباط با پورتال پیامکی.'
      );

      if (result.ok) {
        setOtpSent(true);
        setCooldown(60);
        setSuccessMsg(`کد تایید برای شماره ${mobile} ارسال شد.${result.data?.otpCode ? ` (کد توسعه: ${result.data.otpCode})` : ''}`);
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setErrorMsg(result.message || 'بروز خطا در برقراری ارتباط با پورتال پیامکی.');
      }
    });
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    const joinedCode = otpCode.join('');
    await withLoading(setIsLoginLoading, async () => {
      const result = await apiRequest<{ token?: string; user?: Partial<UserProfile> }>(
        '/api/auth/site/login-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, otpCode: joinedCode })
        },
        'کد تایید وارد شده معتبر نیست.'
      );

      if (result.ok && result.data?.token) {
        localStorage.setItem('pink_user_token', result.data.token);
        if (result.data.user) {
          setProfile(prev => ({ ...prev, ...result.data!.user! }));
        }
        setIsLoggedIn(true);
        setErrorMsg('');
        setSuccessMsg('ورود با رمز یکبار مصرف با موفقیت انجام شد.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(result.message || 'کد تایید وارد شده معتبر نیست.');
      }
    });
  };

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^09\d{9}$/.test(mobile)) {
      setErrorMsg('شماره موبایل وارد شده معتبر نیست.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('کلمه عبور باید دست‌کم ۴ کاراکتر باشد.');
      return;
    }
    await withLoading(setIsLoginLoading, async () => {
      const result = await apiRequest<{ token?: string; user?: Partial<UserProfile> }>(
        '/api/auth/site/login-pwd',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, password })
        },
        'رمز عبور وارد شده صحیح نمی‌باشد.'
      );

      if (result.ok && result.data?.token) {
        localStorage.setItem('pink_user_token', result.data.token);
        if (result.data.user) {
          setProfile(prev => ({ ...prev, ...result.data!.user! }));
        }
        setIsLoggedIn(true);
        setErrorMsg('');
        setSuccessMsg('با رمز عبور ثابت با موفقیت وارد شدید!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(result.message || 'رمز عبور وارد شده صحیح نمی‌باشد.');
      }
    });
  };

  const handleOtpInputChange = (val: string, index: number) => {
    if (/^[0-9]?$/.test(val)) {
      const updated = [...otpCode];
      updated[index] = val;
      setOtpCode(updated);
      
      // Auto focus next input
      if (val && index > 0) {
        const nextInput = document.getElementById(`otp-${index - 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('pink_user_token');
    if (!token) {
      setErrorMsg('برای ذخیره پروفایل ابتدا وارد حساب کاربری شوید.');
      return;
    }

    await withLoading(setIsProfileSaving, async () => {
      const result = await apiRequest(
        '/api/user/profile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profile)
        },
        'بروز خطا در همگام‌سازی پروفایل ابری.'
      );

      if (result.ok) {
        setSuccessMsg('تغییرات شناسنامه سلامت با موفقیت در دیتابیس مرکزی onconet ذخیره و همگام گردید.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(result.message || 'بروز خطا در همگام‌سازی پروفایل ابری.');
      }
    });
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddLog = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('pink_user_token');
    const symptoms = newLogStatus === 'noticeable_change' ? selectedSymptoms : [];
    
    const today = new Date();
    const jalaliDate = `1405/03/${today.getDate()}`;
    const newLogLocal: SelfCheckLog = {
      id: Date.now(),
      date: jalaliDate,
      status: newLogStatus,
      notes: newLogNotes || (newLogStatus === 'normal' ? 'معاینه با موفقیت انجام شد و وضعیت کاملا سالم است.' : 'مواردی مشاهده شد که مایل به مشاوره هستم.'),
      symptoms
    };

    if (!token) {
      setErrorMsg('برای ثبت گزارش ابتدا وارد حساب کاربری شوید.');
      return;
    }

    await withLoading(setIsLogSaving, async () => {
      const result = await apiRequest<{ log?: SelfCheckLog }>(
        '/api/user/logs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: newLogStatus,
            notes: newLogNotes || (newLogStatus === 'normal' ? 'معاینه با موفقیت انجام شد و وضعیت کاملا سالم است.' : 'مواردی مشاهده شد که مایل به مشاوره هستم.'),
            symptoms
          })
        },
        'ثبت گزارش با خطا مواجه شد.'
      );

      if (result.ok) {
        if (result.data?.log) {
          setLogs(prev => [result.data!.log!, ...prev]);
        } else {
          setLogs(prev => [newLogLocal, ...prev]);
        }
        setSuccessMsg('گزارش خودارزیابی جدید با موفقیت در نسخه ابری پرونده شما ثبت گردید.');
      } else {
        setErrorMsg(result.message || 'ثبت گزارش با خطا مواجه شد.');
      }
    });

    setNewLogNotes('');
    setSelectedSymptoms([]);
    setNewLogStatus('normal');
    setShowAddLogModal(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setOtpSent(false);
    setMobile('');
    setPassword('');
    setOtpCode(['', '', '', '', '']);
    localStorage.removeItem('pink_user_token');
    localStorage.removeItem('pink_user_logged');
  };

  const symptomList = [
    'لمس توده یا سفتی',
    'تغییر شکل نوک پستان (فرورفتگی)',
    'ترشح یک‌طرفه مایع خونی یا شفاف',
    'پوست پرتقالی شدن یا تغییر ضخامت پوست',
    'بزرگی بدون قرینه غدد لنفاوی زیر بغل',
    'تورم غیرعادی یا داغی بخشی از سینه'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/70 via-white to-slate-50 py-6 sm:py-10 px-4" dir="rtl" id="user-panel-section">
      <div className="max-w-4xl mx-auto">
        
        {/* Alerts / Error Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 bg-red-100 border-r-4 border-red-500 text-red-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2"
              id="user-alert-error"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 bg-emerald-100 border-r-4 border-emerald-500 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2"
              id="user-alert-success"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            /* ================= GUEST / AUTH SCREEN ================= */
            <motion.div 
              key="auth-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-200/70 border border-slate-100 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                
                {/* Visual Banner */}
                <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 text-white p-5 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.35),transparent_55%)]"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-300/15 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-52 h-52 bg-white/10 rounded-full blur-2xl -ml-14 -mb-14"></div>
                  <div className="relative z-10">
                    <span className="inline-block bg-white/15 text-white border border-white/30 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase mb-4 backdrop-blur-sm">
                      پورتال سلامت onconet
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black leading-relaxed tracking-tight">سامانه خودمراقبتی و پایش سلامت پستان</h3>
                    <p className="text-xs sm:text-sm text-white/90 mt-2.5 sm:mt-3 leading-6 sm:leading-7">
                      با ثبت‌نام و ورود به پنل، پرونده ارزیابی خود را تشکیل دهید، یادآور خودارزیابی ماهیانه را فعال کنید و نگران سلامتی خود نباشید.
                    </p>
                  </div>

                  <div className="relative z-10 mt-10 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-white/95 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                      <span className="p-1 px-1.5 bg-white/25 rounded-md font-bold">۱</span>
                      <span>نام کاربری شما همان شماره موبایل شماست.</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/95 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                      <span className="p-1 px-1.5 bg-white/25 rounded-md font-bold">۲</span>
                      <span>ورود امن دو مرحله‌ای از طریق رمز یکبار مصرف (OTP).</span>
                    </div>
                  </div>

                  <div className="mt-8 text-[11px] text-white/90 border border-white/20 bg-white/10 rounded-xl px-3 py-2.5 relative z-10 flex items-center gap-1.5 justify-center backdrop-blur-sm">
                    <Compass className="w-3.5 h-3.5" />
                    پشتیبانی شده توسط جامعه متخصصین غدد و پستان ایران
                  </div>
                </div>

                {/* Forms Area */}
                <div className="md:col-span-7 p-5 sm:p-6 md:p-10 flex flex-col justify-center">
                  <div className="text-right pb-6">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">ورود به پنل کاربری اختصاصی</h2>
                    <p className="text-xs text-slate-500 mt-1.5">جهت تشکیل پرونده یا مدیریت اطلاعات، لطفاً وارد شوید.</p>
                  </div>

                  {/* Login Methods Toggles */}
                  <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/70 mb-6">
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('otp'); setErrorMsg(''); }}
                      className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                        loginMethod === 'otp' 
                          ? 'bg-white text-pink-600 shadow-sm border border-pink-100'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      id="user-toggle-otp"
                    >
                      <KeyRound className="w-3.5 h-3.5 inline-block ml-1.5 shrink-0" />
                      رمز یکبار مصرف (OTP)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('password'); setErrorMsg(''); }}
                      className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                        loginMethod === 'password' 
                          ? 'bg-white text-pink-600 shadow-sm border border-pink-100'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      id="user-toggle-password"
                    >
                      <Lock className="w-3.5 h-3.5 inline-block ml-1.5 shrink-0" />
                      رمز عبور ثابت
                    </button>
                  </div>

                  {/* OTP LOG IN FORM */}
                  {loginMethod === 'otp' ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">شماره تلفن همراه</label>
                        <div className="relative">
                          <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="tel"
                            placeholder="مثال: 09123456789"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            disabled={otpSent}
                            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-250 focus:border-pink-500 focus:bg-white rounded-xl text-left text-sm font-semibold tracking-wider transition-all placeholder:text-slate-400 focus:outline-none shadow-sm"
                            id="user-input-mobile"
                          />
                        </div>
                      </div>

                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isOtpLoading}
                          className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-100"
                          id="user-btn-request-otp"
                        >
                          {isOtpLoading ? 'در حال ارسال...' : 'درخواست رمز یکبار مصرف (SMS)'}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 text-[11px] text-pink-700 leading-relaxed text-center">
                            کد تأیید ۵ رقمی شبیه‌سازی‌شده به شماره <strong className="font-sans">{mobile}</strong> فرستاده شد.
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2.5 text-center">کد تأیید ۵ رقمی را وارد کنید</label>
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2" dir="ltr">
                              {otpCode.map((digit, idx) => (
                                <input
                                  key={idx}
                                  id={`otp-${idx}`}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpInputChange(e.target.value, idx)}
                                  className="w-9 h-10 sm:w-11 sm:h-11 text-center font-bold text-lg bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white rounded-lg focus:outline-none"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                            {cooldown > 0 ? (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                ارسال مجدد کد تا {cooldown} ثانیه دیگر
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isOtpLoading}
                                className="text-pink-600 font-bold hover:underline disabled:opacity-60"
                              >
                                {isOtpLoading ? 'در حال ارسال...' : 'ارسال مجدد کد تایید'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => { setOtpSent(false); setOtpCode(['', '', '', '', '']); }}
                              className="text-slate-500 hover:underline"
                            >
                              تغییر شماره همراه
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={isLoginLoading}
                            className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-100"
                            id="user-btn-verify-otp"
                          >
                            {isLoginLoading ? 'در حال ورود...' : 'تأیید کد و ورود به سامانه'}
                          </button>
                        </div>
                      )}
                    </form>
                  ) : (
                    /* PASSWORD LOG IN FORM */
                    <form onSubmit={handlePasswordLogin} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">شماره تلفن همراه</label>
                        <div className="relative">
                          <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="tel"
                            placeholder="مثال: 09123456789"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-250 focus:border-pink-500 focus:bg-white rounded-xl text-left text-sm font-semibold tracking-wider transition-all placeholder:text-slate-400 focus:outline-none shadow-sm"
                            id="user-input-mobile-pwd"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">رمز عبور عبور ثابت</label>
                        <div className="relative">
                          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="password"
                            placeholder="رمز عبور خود را وارد کنید"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-250 focus:border-pink-500 focus:bg-white rounded-xl text-slate-800 text-sm transition-all focus:outline-none shadow-sm"
                            id="user-input-password"
                          />
                        </div>
                        <div className="text-left mt-1.5">
                          <span className="text-[10px] text-slate-400">اگر حساب ندارید، با همین رمز عبور حساب شما ساخته می‌شود.</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoginLoading}
                        className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-100"
                        id="user-btn-login-pwd"
                      >
                        {isLoginLoading ? 'در حال ورود...' : 'ورود با پسورد ثابت'}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </motion.div>
          ) : (
            /* ================= LOGGED IN DASHBOARD ================= */
            <motion.div 
              key="logged-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              
              {/* Profile Bar / Summary */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 w-full md:w-auto">
                  <div className="w-12 h-12 bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-full flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{profile.fullName || 'کاربر گرامی onconet'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">پرونده فعال سلامت همراه با شماره موبایل: <span className="font-sans">{profile.mobile}</span></p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                  <div className="bg-pink-50/70 border border-pink-100/50 px-3 py-1.5 rounded-xl text-[11px] text-pink-700 flex items-center gap-1 whitespace-nowrap">
                    <History className="w-3.5 h-3.5" />
                    تعداد معاینات ثبت‌شده: {logs.length} بار
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 border border-slate-200/50 px-3 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 active:scale-[0.96] transition-all font-semibold"
                    id="user-btn-logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    خروج از پنل
                  </button>
                </div>
              </div>

              {/* Bento Content: Details Form (Right) & Checklogs / Schedulers (Left) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                
                {/* 1. Profile Health Metrics Info (7 columns on medium+) */}
                <div className="md:col-span-12 lg:col-span-7 space-y-8">
                  
                  {/* Health Profile Edit Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40">
                    <div className="border-b border-slate-100 pb-4 mb-5 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <User className="w-4 h-4 text-pink-500" />
                        شناسنامه سلامت پستان (اطلاعات ارزیابی ریسک)
                      </h4>
                      <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-1 rounded-md">برزورسانی خودکار</span>
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">نام و نام خانوادگی</label>
                          <input
                            type="text"
                            value={profile.fullName}
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all text-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">سال متولد شدن (خورشیدی)</label>
                          <select
                            value={profile.birthYear}
                            onChange={(e) => setProfile({ ...profile, birthYear: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all text-slate-700"
                          >
                            <option value="1380">۱۳۸۰ به بالا</option>
                            <option value="1370">۱۳۷۰ تا ۱۳۸۰</option>
                            <option value="1360">۱۳۶۰ تا ۱۳۷۰</option>
                            <option value="1350">۱۳۵۰ تا ۱۳۶۰</option>
                            <option value="1340">۱۳۴۰ تا ۱۳۵۰</option>
                            <option value="1330">قبل از ۱۳۴۰</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">تاریخ شروع آخرین قاعدگی</label>
                          <input
                            type="text"
                            placeholder="مثال: 1405/02/10"
                            value={profile.lastPeriodDate}
                            onChange={(e) => setProfile({ ...profile, lastPeriodDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all text-slate-700 text-left font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">سابقه ابتلا در بستگان درجه ۱ و ۲</label>
                          <select
                            value={profile.familyHistory}
                            onChange={(e) => setProfile({ ...profile, familyHistory: e.target.value as any })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all text-slate-700"
                          >
                            <option value="هیچکدام">بدون هیچگونه سابقه خانوادگی</option>
                            <option value="مادر">مادر (بستگان درجه اول)</option>
                            <option value="خواهر">خواهر/دختر (بستگان درجه اول)</option>
                            <option value="خاله_عمه">خاله/عمه/مادربزرگ (بستگان درجه دوم)</option>
                            <option value="بستگان_درجه_دو">فامیل‌های درجه سه و دورتر</option>
                          </select>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 mt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-slate-700">ارسال یادآور هوشمند خودارزیابی پستان</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">برنامه پیامکی ماهانه بر اساس کمترین میزان حساسیت هورمونی سینه شما به تاریخ آخرین قاعدگی.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProfile({ ...profile, selfCheckReminderActive: !profile.selfCheckReminderActive })}
                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                              profile.selfCheckReminderActive ? 'bg-pink-600 justify-end' : 'bg-slate-300 justify-start'
                            }`}
                          >
                            <span className="w-4 h-4 bg-white rounded-full shadow"></span>
                          </button>
                        </div>

                        {profile.selfCheckReminderActive && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-150"
                          >
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">روز ارسال پیامک یادآور</label>
                              <select
                                value={profile.reminderDayOfMonth}
                                onChange={(e) => setProfile({ ...profile, reminderDayOfMonth: parseInt(e.target.value) })}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 focus:border-pink-500 rounded-lg text-xs font-semibold"
                              >
                                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                                  <option key={day} value={day}>{day} هر ماه خورشیدی</option>
                                ))}
                              </select>
                            </div>
                            <div className="text-[10px] text-pink-700 flex flex-col justify-center leading-relaxed font-semibold">
                              * فرمول انتخابی: ۷ روز پس از تاریخ شروع قاعدگی جهت کاهش لمس توده‌های کاذب هورمونی پستان به عنوان بهترین زمان معاینه.
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          type="submit"
                          disabled={isProfileSaving}
                          className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-pink-100/50"
                        >
                          <Save className="w-4 h-4" />
                          {isProfileSaving ? 'در حال ذخیره...' : 'ذخیره موقت پرونده سلامت'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Monthly Check Calendar Guide */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50/50 p-5 rounded-3xl border border-pink-100/30 flex items-start gap-3.5">
                    <span className="p-2 bg-pink-500/15 text-pink-700 rounded-xl shrink-0 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-pink-900 leading-relaxed">چطور یک تقویم سلامت برای خودارزیابی داشته باشیم؟</h4>
                      <p className="text-[11px] text-pink-700 mt-1 leading-relaxed">
                        بهترین تقویم، تکرار دوره‌ای در یک روز ثابت است. ترجیحاً بلافاصله بعد از هر حمام رفتن در نیمه اول ماه، ۳ مرحله اصلی (آینه، ایستاده، درازکش) را انجام داده و لاگ چکاپ زیر را ثبت کنید. نتایج به صورت آفلاین برای مقایسه مراجعات دوره‌ای پزشک نگهداری می‌شود.
                      </p>
                    </div>
                  </div>

                </div>

                {/* 2. Self-Check Log History (5 columns on medium+) */}
                <div className="md:col-span-12 lg:col-span-5 space-y-6">
                  
                  {/* Register New Exam Log Trigger */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <History className="w-4 h-4 text-pink-500" />
                        سوابق معاینه شخصی شما
                      </h4>
                      <button
                        onClick={() => setShowAddLogModal(true)}
                        className="flex items-center gap-1 bg-pink-50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-pink-150 transition-all cursor-pointer"
                        id="user-btn-add-log-trigger"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        ثبت معاینه جدید
                      </button>
                    </div>

                    {/* Historical logs list */}
                    <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                      {logs.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">
                          هیچ معاینه‌ای ثبت نشده است. همین حالا اولین معاینه خود را ثبت کنید.
                        </div>
                      ) : (
                        logs.map(log => (
                          <div 
                            key={log.id} 
                            className={`p-3.5 rounded-xl border text-right transition-all hover:bg-slate-50 ${
                              log.status === 'normal' 
                                ? 'bg-emerald-50/20 border-emerald-100/70' 
                                : 'bg-rose-50/25 border-rose-100/70'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-1.5">
                              <span className="text-[11px] font-bold text-slate-500 font-mono">{log.date}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                log.status === 'normal' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status === 'normal' ? 'بدون مورد مشکوک / سالم' : 'تغییر غیرعادی / نیازمند پیگیری'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed mt-1 line-clamp-3">{log.notes}</p>
                            
                            {log.symptoms && log.symptoms.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-100">
                                {log.symptoms.map((sym, i) => (
                                  <span key={i} className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                    {sym}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* AI Quick Health Disclaimer */}
                  <div className="bg-slate-900 text-slate-300 p-4.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-white text-xs font-bold leading-none">
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                      پیشگیری هوشمند - یادآوری طلایی
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      سامانه خودمراقبتی و ثبت سوابق onconet تحت تعهد حفظ حریم خصوصی کار می‌کند. هیچکدام از اطلاعات تاریخچه شما از این مرورگر خارج نمی‌گردد. در هر رویداد، در صورت لمس توده‌ای سفت و فاقد جابجایی در سینه به ویژه بدون احساس درد، جهت بی‌وپسی و پزشک مجرب جراحی عمومی اقدام فرمایید.
                    </p>
                  </div>

                </div>

              </div>

              {/* Add Log Modal Backdrop with animation */}
              <AnimatePresence>
                {showAddLogModal && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 15 }}
                      className="bg-white rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl text-right max-h-[90vh] overflow-y-auto"
                      id="user-add-log-modal"
                    >
                      <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-800">ثبت گزارش جدید خودارزیابی پستان</h4>
                        <button 
                          onClick={() => setShowAddLogModal(false)}
                          className="text-slate-400 hover:text-slate-650 text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>

                      <form onSubmit={handleAddLog} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">وضعیت ارزیابی لمسی و بصری</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setNewLogStatus('normal')}
                              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                                newLogStatus === 'normal'
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              بدون توده یا تغییر (سالم)
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewLogStatus('noticeable_change')}
                              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                                newLogStatus === 'noticeable_change'
                                  ? 'bg-red-50 border-red-400 text-red-800 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              مشاهده تغییرات غیرعادی
                            </button>
                          </div>
                        </div>

                        {newLogStatus === 'noticeable_change' && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="space-y-2 bg-rose-50/30 p-3 rounded-xl border border-rose-100/50"
                          >
                            <label className="block text-[11px] font-bold text-red-700">کدام‌یک از نشانه‌های زیر را مشاهده کردید؟</label>
                            <div className="space-y-1.5">
                              {symptomList.map((symptom) => (
                                <label key={symptom} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={selectedSymptoms.includes(symptom)}
                                    onChange={() => toggleSymptom(symptom)}
                                    className="rounded text-pink-600 focus:ring-pink-500 w-3.5 h-3.5"
                                  />
                                  <span>{symptom}</span>
                                </label>
                              ))}
                            </div>
                            <p className="text-[9px] text-red-800 mt-2 font-semibold">
                              * تذکر: بروز هر یک از این علائم لزوماً به معني ابتلا به بدخیمی نبوده، اما مراجعه دوره‌ای به جراح عمومی را اجباری می‌سازد.
                            </p>
                          </motion.div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">یادداشت‌ها و جزئیات معاینه</label>
                          <textarea
                            placeholder="جزئیات لمس، تفاوت با معاینه ماه پیش، عوارض جانبی یا هر یادداشت دیگری را بنویسید..."
                            value={newLogNotes}
                            onChange={(e) => setNewLogNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-pink-500 focus:bg-white rounded-xl text-xs font-medium focus:outline-none transition-all resize-none text-slate-700"
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-3">
                          <button
                            type="button"
                            onClick={() => setShowAddLogModal(false)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            انصراف
                          </button>
                          <button
                            type="submit"
                            disabled={isLogSaving}
                            className="bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-100"
                          >
                            {isLogSaving ? 'در حال ثبت...' : 'ثبت آزمایش و معاینه'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
