"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Calendar,
  BookOpen,
  Info,
  PhoneCall,
  Activity,
  Award,
  ShieldCheck,
  Search,
  ArrowLeft,
  ChevronLeft,
  Clock,
  User,
  Check,
  Send,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Article, PageSEO, Message } from '@/lib/types';
import { ApiRequestResult } from '@/utils/api';
import { formatJalaliDate } from '@/utils/jalaliDate';

interface MainWebsiteProps {
  articles: Article[];
  seoSettings: PageSEO[];
  onAddMessage: (msg: Message) => Promise<ApiRequestResult>;
}

export default function MainWebsite({ articles, seoSettings, onAddMessage }: MainWebsiteProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab2] = useState<'home' | 'articles' | 'about' | 'contact' | 'self-check'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const normalizedPath = (pathname || '/').replace(/\/+$/, '').toLowerCase() || '/';

  const navigateToTab = (tab: 'home' | 'articles' | 'about' | 'contact' | 'self-check') => {
    setSelectedArticle(null);
    setActiveTab2(tab);
    const path = tab === 'home' ? '/' : `/${tab}`;
    router.push(path);
  };

  const openArticleBySlug = (article: Article) => {
    router.push(`/articles/${encodeURIComponent(article.slug)}`);
  };

  const backToArticles = () => {
    setSelectedArticle(null);
    setActiveTab2('articles');
    router.push('/articles');
  };

  useEffect(() => {
    if (normalizedPath === '/' || normalizedPath === '') {
      setActiveTab2('home');
      setSelectedArticle(null);
      return;
    }

    if (normalizedPath === '/articles') {
      setActiveTab2('articles');
      setSelectedArticle(null);
      return;
    }

    if (normalizedPath.startsWith('/articles/')) {
      const rawSlug = normalizedPath.replace('/articles/', '').split('/')[0] || '';
      const slug = decodeURIComponent(rawSlug).toLowerCase();
      const matched = articles.find((a) => a.slug.toLowerCase() === slug);

      setActiveTab2('articles');
      setSelectedArticle(matched ?? null);
      return;
    }

    if (normalizedPath === '/self-check') {
      setActiveTab2('self-check');
      setSelectedArticle(null);
      return;
    }

    if (normalizedPath === '/about') {
      setActiveTab2('about');
      setSelectedArticle(null);
      return;
    }

    if (normalizedPath === '/contact') {
      setActiveTab2('contact');
      setSelectedArticle(null);
      return;
    }

    setActiveTab2('home');
    setSelectedArticle(null);
  }, [normalizedPath, articles]);

  // Dynamic SEO and Meta Tags generator for Article pages and static pages
  useEffect(() => {
    // 1. Article Page SEO
    if (selectedArticle) {
      document.title = selectedArticle.seoTitle || selectedArticle.title;

      // Update or create meta description
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', selectedArticle.seoDescription || selectedArticle.summary || '');

      // Update or create meta keywords
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute('content', selectedArticle.seoKeywords || '');

      // Update Charset if not exists
      let charsetMeta = document.querySelector('meta[charset]');
      if (!charsetMeta) {
        charsetMeta = document.createElement('meta');
        charsetMeta.setAttribute('charset', 'utf-8');
        document.head.appendChild(charsetMeta);
      }

      // Update or create og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', selectedArticle.seoTitle || selectedArticle.title);

      // Update or create og:description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', selectedArticle.seoDescription || selectedArticle.summary || '');

      // Update or create og:image
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', selectedArticle.coverImage || '');

      // Update or create og:type
      let ogType = document.querySelector('meta[property="og:type"]');
      if (!ogType) {
        ogType = document.createElement('meta');
        ogType.setAttribute('property', 'og:type');
        document.head.appendChild(ogType);
      }
      ogType.setAttribute('content', 'article');

      // Update or create Robots meta tag
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'index, follow');

      // Update or create Canonical link
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', window.location.href);
    }
    // 2. Static Pages SEO
    else {
      const activePageSeo = seoSettings.find((s) => s.pageId === activeTab);
      if (activePageSeo) {
        document.title = activePageSeo.metaTitle || 'پورتال سلامت onconet';

        let descMeta = document.querySelector('meta[name="description"]');
        if (!descMeta) {
          descMeta = document.createElement('meta');
          descMeta.setAttribute('name', 'description');
          document.head.appendChild(descMeta);
        }
        descMeta.setAttribute('content', activePageSeo.metaDescription || '');

        let keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (!keywordsMeta) {
          keywordsMeta = document.createElement('meta');
          keywordsMeta.setAttribute('name', 'keywords');
          document.head.appendChild(keywordsMeta);
        }
        keywordsMeta.setAttribute('content', activePageSeo.focusKeywords || '');

        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
          ogTitle = document.createElement('meta');
          ogTitle.setAttribute('property', 'og:title');
          document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', activePageSeo.ogTitle || '');

        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) {
          ogDesc = document.createElement('meta');
          ogDesc.setAttribute('property', 'og:description');
          document.head.appendChild(ogDesc);
        }
        ogDesc.setAttribute('content', activePageSeo.ogDescription || '');

        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.setAttribute('href', activePageSeo.canonicalUrl || window.location.href);
      }
    }
  }, [selectedArticle, activeTab, seoSettings]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');

  // Gail Model Risk Risk Calculator state
  const [calcStep, setCalcStep] = useState(1);
  const [calcAge, setCalcAge] = useState<number | ''>(35);
  const [calcMenarcheAge, setCalcMenarcheAge] = useState<string>('12to14'); // 'under12' | '12to14' | '14over'
  const [calcFirstBirthAge, setCalcFirstBirthAge] = useState<string>('under20'); // 'under20' | '20to24' | '25to29' | '30over' | 'nullipara'
  const [calcRelativesCount, setCalcRelativesCount] = useState<number>(0); // 0 | 1 | 2
  const [calcPreviousBiopsies, setCalcPreviousBiopsies] = useState<string>('0'); // '0' | '1' | '2_or_more'
  const [gailResult, setGailResult] = useState<{ score: number; riskLevel: 'low' | 'moderate' | 'high'; recommendation: string } | null>(null);

  // Contact Form states
  const [contactName, setContactName] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactContent, setContactContent] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [formErr, setFormErr] = useState('');

  const handleCalculateRisk = (e: FormEvent) => {
    e.preventDefault();

    const ageValue = calcAge === '' ? 35 : calcAge;
    
    // Gail-model inspired risk assessment matrix logic
    let score = 1.1; // Base relative risk
    
    // Age factor
    if (ageValue >= 45) score += 0.4;
    else if (ageValue >= 35) score += 0.2;

    // Menarche factor (early menstruation increases risk)
    if (calcMenarcheAge === 'under12') score += 0.2;
    else if (calcMenarcheAge === '14over') score -= 0.1;

    // First live birth factor (later pregnancy increases risk)
    if (calcFirstBirthAge === '30over') score += 0.3;
    else if (calcFirstBirthAge === 'nullipara') score += 0.25;
    else if (calcFirstBirthAge === 'under20') score -= 0.15;

    // Relatives count (Strongest risk factor)
    if (calcRelativesCount === 1) score += 1.5;
    else if (calcRelativesCount >= 2) score += 3.2;

    // Previous biopsies (Atypical hyperplasia indicator)
    if (calcPreviousBiopsies === '1') score += 0.5;
    else if (calcPreviousBiopsies === '2_or_more') score += 1.1;

    // Risk level classification
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    let recommendation = '';

    if (score >= 4.0) {
      riskLevel = 'high';
      recommendation = 'با توجه به پارامترهای وارد شده، سطح ریسک نسبی شما بالا ارزیابی می‌گردد. توصیه می‌شود جهت تنظیم یک برنامه غربالگری منسجم (شامل ام‌آر‌آی پستان و ماموگرافی سالیانه) ترجیحاً همراه با تست مشاوره‌ای ژنتیک به پزشک جراح متخصص پستان مراجعه فرمایید.';
    } else if (score >= 2.0) {
      riskLevel = 'moderate';
      recommendation = 'میزان حساسیت بافتی و ریسک نسبی شما در سطح متوسط رو به بالا قرار دارد. خودارزیابی ماهانه پستان را جدی بگیرید و پس از ۴۰ سالگی حتماً ماموگرافی‌های دوره‌ای سالیانه یا دو سال یک‌بار را تحت نظر پزشک معتمد انجام دهید.';
    } else {
      riskLevel = 'low';
      recommendation = 'ریسک آماری شما در محدوده طبیعی و عمومی جامعه قرار دارد. به خودمراقبتی و آموزش خودارزیابی پستان ادامه دهید. غربالگری‌های روتین ماموگرافی از سن ۴۰ سالگی به صورت عمومی توصیه می‌شود.';
    }

    setGailResult({
      score: parseFloat(score.toFixed(1)),
      riskLevel,
      recommendation
    });
    setCalcStep(2);
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMobile.trim() || !contactSubject.trim() || !contactContent.trim()) {
      setFormErr('تکمیل تمام فیبرهای اطلاعاتی فرم تماس الزامی است.');
      return;
    }
    if (!/^09\d{9}$/.test(contactMobile)) {
      setFormErr('شماره همراه باید معتبر و دارای ۱۱ رقم باشد.');
      return;
    }

    const today = new Date();
    const formattedDate = `1405/03/${today.getDate()}`;
    const newMsg: Message = {
      id: Date.now(),
      name: contactName,
      mobile: contactMobile,
      subject: contactSubject,
      content: contactContent,
      date: formattedDate
    };

    setIsContactSubmitting(true);
    setFormErr('');
    const result = await onAddMessage(newMsg);
    setIsContactSubmitting(false);

    if (result.ok) {
      setFormSuccess(true);
      setContactName('');
      setContactMobile('');
      setContactSubject('');
      setContactContent('');
      setTimeout(() => setFormSuccess(false), 5000);
    } else {
      setFormErr(result.message || 'خطا در ارسال پیام تماس.');
    }
  };

  const handleResetCalculator = () => {
    setCalcStep(1);
    setCalcAge(35);
    setCalcMenarcheAge('12to14');
    setCalcFirstBirthAge('under20');
    setCalcRelativesCount(0);
    setCalcPreviousBiopsies('0');
    setGailResult(null);
  };

  // Extract categories dynamically
  const categories = ['همه', 'خودارزیابی', 'پیشگیری', 'درمان', 'سبک_زندگی', 'عمومی'];
  
  // Filter and search articles
  const filteredArticles = articles.filter(art => {
    if (!art.isPublished) return false;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'همه' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans" dir="rtl" id="main-website-portal">
      
      {/* Sub page site-wide top navbar */}
      <div className="sticky top-0 z-40 border-b border-cyan-100/50 bg-[linear-gradient(90deg,rgba(247,249,251,0.92),rgba(240,249,255,0.92))] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          
          <div className="flex items-center gap-2.5 cursor-pointer w-full md:w-auto" onClick={() => navigateToTab('home')}>
           
            <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">اکوسیستم دیجیتال سرطان</span>
          </div>

          <div className="w-full md:w-auto grid grid-cols-2 md:flex items-stretch md:items-center gap-2 bg-white/75 p-1.5 rounded-2xl border border-white/70 shadow-[0_12px_30px_rgba(0,45,91,0.14)]">
            <button
              onClick={() => navigateToTab('home')}
              className={`w-full md:w-auto justify-center shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'home' && !selectedArticle
                  ? 'bg-[linear-gradient(135deg,#001836,#006971)] text-white shadow-md shadow-cyan-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              صفحه اصلی
            </button>
            <button
              onClick={() => navigateToTab('articles')}
              className={`w-full md:w-auto justify-center shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'articles' || selectedArticle
                  ? 'bg-[linear-gradient(135deg,#001836,#006971)] text-white shadow-md shadow-cyan-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              نشریه و مقالات
            </button>
            <button
              onClick={() => navigateToTab('self-check')}
              className={`w-full md:w-auto justify-center shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'self-check'
                  ? 'bg-[linear-gradient(135deg,#001836,#006971)] text-white shadow-md shadow-cyan-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              آموزش خودارزیابی
            </button>
            <button
              onClick={() => navigateToTab('about')}
              className={`w-full md:w-auto justify-center shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-[linear-gradient(135deg,#001836,#006971)] text-white shadow-md shadow-cyan-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              درباره ما
            </button>
            <button
              onClick={() => navigateToTab('contact')}
              className={`col-span-2 md:col-span-1 w-full md:w-auto justify-center shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'contact'
                  ? 'bg-[linear-gradient(135deg,#001836,#006971)] text-white shadow-md shadow-cyan-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              تماس با ما
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Areas with subtle layout padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        <AnimatePresence mode="wait">
          
          {/* ================= ARTICLE VIEW DETAIL DETOUR ================= */}
          {selectedArticle ? (
            <motion.div
              key="article-detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto space-y-4 md:space-y-6"
            >
              <button
                onClick={backToArticles}
                className="flex items-center gap-2 text-slate-500 hover:text-pink-600 text-[11px] sm:text-xs font-bold pb-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
                بازگشت به نشریه علمی onconet
              </button>

              <div className="relative aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-md">
                <img
                  src={selectedArticle.coverImage}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-pink-600 text-white text-[10px] font-bold px-2.5 md:px-3 py-1 rounded-full uppercase">
                  {selectedArticle.category}
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-relaxed">
                  {selectedArticle.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center text-xs text-slate-450 gap-2.5 sm:gap-4 border-b border-slate-100 pb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 text-pink-500" />
                    <strong>{selectedArticle.author}</strong> 
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-pink-500" />
                    زمان مطالعه: {selectedArticle.readingTime} دقیقه
                  </span>
                  <span>انتشار: {formatJalaliDate(selectedArticle.publishDate)}</span>
                </div>
              </div>

              {/* Body Text: Fully styled semantic typography */}
              <div className="text-slate-700 leading-relaxed text-sm md:text-base space-y-5 whitespace-pre-line antialiased">
                {selectedArticle.content}
              </div>

              {/* Scientific Disclaimer box */}
              <div className="bg-slate-50 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-200/60 flex flex-col sm:flex-row items-start gap-3 mt-8 md:mt-10">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">بررسی و تایید علمی محتوا</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    این مقاله پژوهشی بر اساس معتبرترین هندبوک‌های پزشکی روز دنیا نظیر نلسون، هاریسون و کتب پایه‌ای جراحی لانگ تنظیم شده و توسط کمیته داوران داوطلب onconet متشکل از جراحان طراز اول کشور مورد ارزیابی قرار گرفته است. محتوا صرفاً جنبه آموزشی و آگاهی دارد.
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            
            /* ================= REGULAR TABS ================= */
            <>
              
              {/* TAB 1: HOME LANDING PAGE */}
              {activeTab === 'home' && (
                <motion.div
                  key="home-route"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-10 md:space-y-16"
                >
                  
                  {/* Hero Jumbotron Title Banner */}
                  <div className="bg-[linear-gradient(135deg,#001836_0%,#002D5B_55%,#006971_100%)] rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-12 text-white relative overflow-hidden shadow-xl shadow-pink-100">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    
                    <div className="relative z-10 max-w-2xl space-y-4">
                      <span className="bg-white/20 border border-white/30 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase inline-block">
                       اکوسیستم دیجیتال سرطان
                      </span>
                      <h2 className="text-xl sm:text-2xl md:text-4xl font-black leading-tight">همراه شما در مسیر آگاهی و درمان</h2>
                      <p className="text-xs md:text-sm text-white/90 leading-relaxed">
                        ماموریت onconet ایجاد بزرگترین اکوسیستم دیجیتال برای افزایش سطح آگاهی، تشخیص دقیق و هدایت اصولی بیماران مبتلا به سرطان است. این پلتفرم با رویکرد داده‌محور و محتوای علمی معتبر طراحی شده تا دسترسی به اطلاعات سلامت را ساده، دقیق و کاربردی کند.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3.5 pt-3 md:pt-4">
                        <button
                          onClick={() => navigateToTab('self-check')}
                          className="w-full sm:w-auto bg-white hover:bg-pink-50 text-pink-600 text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          آموزش مراحل خودارزیابی پستان
                        </button>
                        <button
                          onClick={() => {
                            const section = document.getElementById('risk-calc-box');
                            section?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto bg-pink-700/50 hover:bg-pink-700 hover:text-white border border-pink-400/30 text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer"
                        >
                          محاسبه‌گر هوشمند ریسک سرطان پستان
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning Symptoms Bento Grid checklist */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-black text-slate-800">۶ نشانه کلیدی هشداردهنده که نیاز به ویزیت پزشک دارند:</h3>
                      <p className="text-xs text-slate-400 mt-1">تغییرات بافتی که در خودارزیابی دستی پستان یا جلوی آینه مشاهده می‌شوند</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      
                      <div className="bg-slate-50/50 p-4 md:p-5 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all flex items-start gap-3 md:gap-4">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 shrink-0 font-bold flex items-center justify-center">۱</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">لمس هرگونه توده سفت</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">توده‌های سفت، سنگ‌مانند، متصل به بافت و فاقد جابجایی که با لمس دردناک نیستند.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-4 md:p-5 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all flex items-start gap-3 md:gap-4">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 shrink-0 font-bold flex items-center justify-center">۲</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">تغییر شکل نوک پستان</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">فرورفتگی تکی، مایل شدن جدید سینه یا به درون کشیده شدن تدریجی زوایای نوک سینه.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-4 md:p-5 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all flex items-start gap-3 md:gap-4">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 shrink-0 font-bold flex items-center justify-center">۳</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">پوست پرتقالی شدن ضریح</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">ضخیم شدن موضعی با پوست به شکل منافذ عمیق و لایه ضخیم پر شبیه پوست پرتقال.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-4 md:p-5 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all flex items-start gap-3 md:gap-4">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 shrink-0 font-bold flex items-center justify-center">۴</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">ترشحات مایع آبکی یا خونی</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">خروج ترشحات چرکی، صورتی یا خونی از سینه به ویژه به طور خودبخود و بدون فشار.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-4 md:p-5 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all flex items-start gap-3 md:gap-4">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 shrink-0 font-bold flex items-center justify-center">۵</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">بزرگی غدد لنفاوی سینه</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">احساس غده یا تورم سفت زیر بغل در یک طرف بدن که اخیراً شکل گرفته است.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-4 md:p-5 rounded-2xl border border-slate-100 hover:border-pink-200 transition-all flex items-start gap-3 md:gap-4">
                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 shrink-0 font-bold flex items-center justify-center">۶</span>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">کبودی یا تورم موضعی داغ</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">قرمزی مداوم و شبیه سلولیت با احساس داغی که با مصرف چرک‌خشک‌کن و مسکن رفع نمی‌شود.</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Dynamic GAIL Cancer Risk Assessment Calculator (MASTER TOUCH FEATURE) */}
                  <div 
                    className="bg-slate-50 border border-slate-200/60 p-4 sm:p-6 md:p-10 rounded-2xl md:rounded-3xl"
                    id="risk-calc-box"
                  >
                    <div className="text-center pb-8 border-b border-slate-200/50">
                      <span className="p-2 bg-pink-100 text-pink-600 rounded-xl inline-block mb-3.5">
                        <Activity className="w-5 h-5" />
                      </span>
                      <h3 className="text-base font-black text-slate-800">تست محاسبه خطر ابتلا به سرطان پستان (Gail Risk Algorithm Mock)</h3>
                      <p className="text-xs text-slate-400 mt-1">محاسبه علمی متغیرهای فیزیولوژیک و ترجیحات فامیلی بر اساس فرمول‌های جهانی گیل</p>
                    </div>

                    <div className="mt-8 max-w-2xl mx-auto">
                      <AnimatePresence mode="wait">
                        {calcStep === 1 ? (
                          <motion.form 
                            key="calc-form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleCalculateRisk} 
                            className="space-y-6 text-right"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">سن فعلی شما (سال)</label>
                                <input
                                  type="number"
                                  min={20}
                                  max={90}
                                  value={calcAge}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                      setCalcAge('');
                                      return;
                                    }

                                    const parsed = Number(value);
                                    if (!Number.isNaN(parsed)) {
                                      setCalcAge(parsed);
                                    }
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">سن اولین شروع دوران قاعدگی</label>
                                <select 
                                  value={calcMenarcheAge} 
                                  onChange={(e) => setCalcMenarcheAge(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold"
                                >
                                  <option value="under12">کمتر از ۱۲ سالگی (بلوغ زودرس)</option>
                                  <option value="12to14">بین ۱۲ تا ۱۴ سالگی (طبیعی)</option>
                                  <option value="14over">۱۴ سالگی و بالاتر</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">سن اولین زایمان زنده و بارداری کامل</label>
                                <select 
                                  value={calcFirstBirthAge} 
                                  onChange={(e) => setCalcFirstBirthAge(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold"
                                >
                                  <option value="under20">کمتر از ۲۰ سالگی</option>
                                  <option value="20to24">بین ۲۰ تا ۲۴ سالگی</option>
                                  <option value="25to29">بین ۲۵ تا ۲۹ سالگی</option>
                                  <option value="30over">۳۰ سالگی و بالاتر (زایمان دیررس)</option>
                                  <option value="nullipara">بدون سابقه بارداری یا زایمان زنده (فرزنددار نشدن)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">تعداد بستگان درجه اول مبتلا به سرطان پستان</label>
                                <select 
                                  value={calcRelativesCount} 
                                  onChange={(e) => setCalcRelativesCount(parseInt(e.target.value))}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold"
                                >
                                  <option value={0}>هیچ‌کدام (سابقه فامیلی ندارم)</option>
                                  <option value={1}>یک نفر (مادر، خواهر یا دختر)</option>
                                  <option value={2}>دو نفر و بیشتر</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">تعداد بیوپسی‌ها (نمونه‌برداری سوزنی) قبلی پستان</label>
                                <select 
                                  value={calcPreviousBiopsies} 
                                  onChange={(e) => setCalcPreviousBiopsies(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold"
                                >
                                  <option value="0">تاکنون نمونه‌برداری نداشته‌ام</option>
                                  <option value="1">یک‌مرتبه انجام داده‌ام</option>
                                  <option value="2_or_more">دو مرتبه و بیشتر انجام شده است</option>
                                </select>
                              </div>
                              <div className="flex items-center text-[10px] text-slate-400 leading-relaxed font-semibold">
                                * نکته: انجام بیوپسی نشان‌دهنده حساسیت گذشته بافت سینه شما به ترشحات و کیست‌ها بوده و در تعیین سریشن بافت مهم است.
                              </div>
                            </div>

                            <div className="flex justify-center pt-4">
                              <button
                                type="submit"
                                className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 active:scale-[0.98] text-white text-xs font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-pink-100"
                              >
                                محاسبه آنلاین ضریب سلامت نسبی پستان
                              </button>
                            </div>
                          </motion.form>
                        ) : (
                          <motion.div 
                            key="calc-results"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="text-center space-y-5"
                          >
                            <div className="inline-block p-6 rounded-3xl bg-white border border-pink-100 shadow-lg">
                              <span className="text-xs text-slate-400 block font-bold mb-1">ضریب ریسک بافتی نسبی (Relative Gail Score)</span>
                              <div className="text-3xl sm:text-4xl font-sans font-black text-pink-600 p-2">{gailResult?.score}</div>
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                gailResult?.riskLevel === 'high' 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : gailResult?.riskLevel === 'moderate' 
                                    ? 'bg-yellow-105 text-yellow-800' 
                                    : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {gailResult?.riskLevel === 'high' ? 'پتانسیل ریسک: بالا' : gailResult?.riskLevel === 'moderate' ? 'پتانسیل ریسک: متوسط رو به بالا' : 'پتانسیل ریسک: طبیعی و کم'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-650 leading-relaxed max-w-lg mx-auto bg-white p-4 rounded-xl border border-slate-200">
                              {gailResult?.recommendation}
                            </p>

                            <div className="flex justify-center gap-3">
                              <button
                                type="button"
                                onClick={handleResetCalculator}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                              >
                                شروع مجدد محاسبه
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* TAB 2: ARTICLES REPOSITORY / SCIENTIFIC BLOG */}
              {activeTab === 'articles' && (
                <motion.div
                  key="articles-route"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 md:space-y-8"
                >
                  
                  {/* Search and Category Filters */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5 md:pb-6">
                    <div>
                      <h3 className="text-sm md:text-md font-black text-slate-800">نشریه کلینیکی و مقالات آگاهی‌بخشی سرطان پستان</h3>
                      <p className="text-xs text-slate-400 mt-0.5">جدیدترین مقالات پژوهشی جراحی و انکولوژی کشور به انضمام کلمات بهینه سازی شده سئو</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="عناوین، نشانه‌ها یا کلیدواژه..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full md:w-60 pr-9 pl-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-pink-500 transition-all text-slate-700 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Badges Categories */}
                  <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedCategory === cat
                            ? 'bg-pink-600 border-pink-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {cat === 'همه' ? 'همه مقالات' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Grid of articles */}
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                      هیچ مقاله‌ای مطابق جستجوی شما یافت نشد.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                      {filteredArticles.map(article => (
                        <div
                          key={article.id}
                          className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col justify-between hover:scale-[1.01]"
                        >
                          <div>
                            <div className="relative aspect-video w-full overflow-hidden">
                              <img
                                src={article.coverImage}
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 md:p-5 space-y-3 text-right">
                              <span className="p-1 px-2.5 bg-pink-50 text-pink-600 text-[9px] rounded-md font-bold uppercase">
                                {article.category}
                              </span>
                              <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-relaxed h-11">
                                {article.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                                {article.summary || article.content.substring(0, 150)}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 md:p-5 pt-0 border-t border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold">{article.author}</span>
                              <span>{formatJalaliDate(article.publishDate)}</span>
                            </div>
                            <button
                              onClick={() => openArticleBySlug(article)}
                              className="flex items-center gap-1.5 text-pink-600 hover:text-pink-700 font-bold"
                            >
                              مطالعه مقاله علمی
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </motion.div>
              )}

              {/* TAB 3: BREAST SELF-CHECK DETAILED GUIDE */}
              {activeTab === 'self-check' && (
                <motion.div
                  key="self-check-route"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  
                  {/* Visual Guide Header */}
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-[10px] font-bold">معایندگی هوشمند ملی</span>
                    <h3 className="text-lg font-black text-slate-800">آموزش ۴ مرحله‌ای خودارزیابی ماهیانه پستان</h3>
                    <p className="text-xs text-slate-400">یک بار در ماه، ۵ دقیقه خودمراقبتی و پس گرفتن شانس زندگی تایید شده دوره‌ای</p>
                  </div>

                  {/* Steps container */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-3xl space-y-3.5 relative">
                      <span className="absolute -top-3 right-5 w-8 h-8 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center shadow">۱</span>
                      <div className="text-center pb-2 pt-2 text-rose-600 font-black text-xs border-b border-slate-100">بررسی بصری جلوی آینه</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        جلو آینه بایستید. دست‌ها را به نوبت آویزان، بالای سر برده و سپس محکم روی باسن تکیه دهید. به دنبال عدم قرینگی جدید، هر گونه تغییر اندازه در ترقوه، برآمدگی یا کشیدگی بافت پوست باشید.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-3xl space-y-3.5 relative">
                      <span className="absolute -top-3 right-5 w-8 h-8 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center shadow">۲</span>
                      <div className="text-center pb-2 pt-2 text-rose-600 font-black text-xs border-b border-slate-100">لمس در دوش گرفتن / ایستاده</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        یک دست را پشت سر خود بگذارید. با سه انگشت دست مخالف و لمس ملایم، متوسط و قوی به صورت دایره‌ای یا موازی، کل بافت پستان را تا انتهای زیربغل و کانون عضلانی لمس کنید.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-3xl space-y-3.5 relative">
                      <span className="absolute -top-3 right-5 w-8 h-8 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center shadow">۳</span>
                      <div className="text-center pb-2 pt-2 text-rose-600 font-black text-xs border-b border-slate-100">بررسی لمسی در حالت خوابیده</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        دراز بکشید و بالش کوچکی زیر شانه راست خود بگذارید. این امر بافت سینه را باز و پهن کرده و لمس ریزترین ندول‌ها و سفتی‌ها (توده‌های فایبر) را فوق العاده ساده می‌سازد.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-3xl space-y-3.5 relative">
                      <span className="absolute -top-3 right-5 w-8 h-8 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center shadow">۴</span>
                      <div className="text-center pb-2 pt-2 text-rose-600 font-black text-xs border-b border-slate-100">فشار نوک پستان و ترشحات</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        به آرامی نوک پستان خود را مابین انگشتان شست و سبابه بگیرید و فشار اندکی بدهید. به دنبال ترشح خون‌آبه، مایع لیمویی یا شفاف زلال بگردید و موارد مشکوک را یادداشت کنید.
                      </p>
                    </div>

                  </div>

                </motion.div>
              )}

              {/* TAB 4: ABOUT US EDITORIAL */}
              {activeTab === 'about' && (
                <motion.div
                  key="about-route"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  
                  {/* Grid layout panel */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    
                    <div className="md:col-span-7 space-y-5 text-right">
                      <h4 className="text-lg font-black text-slate-800">داستان برند onconet</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        onconet به عنوان یک اکوسیستم دیجیتال سلامت، با تمرکز بر آگاهی، تشخیص دقیق و هدایت بیماران مبتلا به سرطان شکل گرفته است. چشم‌انداز این برند تبدیل شدن به معتبرترین مرجع دیجیتال در حوزه سلامت و بیماری‌های سرطان است.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                          <Check className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-600 font-bold leading-relaxed">غربالگری و ماموگرافی دوره‌ای رایگان مناطق حاشیه</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                          <Check className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-600 font-bold leading-relaxed">امکان مشاوره و تشکیل پرونده غدد زیر بغل برای تمام بانوان</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-3xl border border-pink-100/35 relative overflow-hidden">
                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3.5">
                          <span className="p-1 px-2.5 bg-pink-100 rounded-lg text-pink-700 font-sans font-bold text-sm">95%</span>
                          <span className="text-[11px] text-slate-700 font-black leading-relaxed">شانس درمان کامل در فرآیند غربالگری زودهنگام</span>
                        </div>
                        <p className="text-[10px] text-slate-550 leading-relaxed">
                          ارزش‌های کلیدی onconet شامل اعتبار علمی، شفافیت، همدلی با بیمار، نوآوری دیجیتال و دسترسی آسان به اطلاعات است.
                        </p>
                      </div>
                    </div>

                  </div>

                </motion.div>
              )}

              {/* TAB 5: CONTACT US & APPOINTMENT FORM */}
              {activeTab === 'contact' && (
                <motion.div
                  key="contact-route"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  
                  {/* Form (8 columns) */}
                  <div className="lg:col-span-8 bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-200/50 text-right">
                    <h3 className="text-md font-black text-slate-800">ارسال پیام یا طرح پرسش تخصصی در onconet</h3>
                    <p className="text-xs text-slate-400 mt-1">پیام شما مستقیماً در پنل مدیریت ادمین ثبت شده و توسط جراحان بررسی می‌گردد.</p>

                    {formErr && (
                      <div className="mt-4 bg-red-50 text-red-700 border-r-4 border-red-500 p-3 rounded-lg text-xs font-bold leading-none">
                        {formErr}
                      </div>
                    )}

                    {formSuccess && (
                      <div className="mt-4 bg-emerald-50 text-emerald-800 border-r-4 border-emerald-500 p-3 rounded-lg text-xs font-bold leading-none">
                        پیام با موفقیت در سیستم مرکزی دیسپچ شد. کادر پزشکی به زودی پاسخگوی شما خواهند بود.
                      </div>
                    )}

                    <form onSubmit={handleContactSubmit} className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">نام و نام خانوادگی فرستنده</label>
                          <input
                            type="text"
                            placeholder="مثال: زهرا اکبری"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">شماره تلفن همراه (جهت پیامک پاسخ)</label>
                          <input
                            type="tel"
                            placeholder="09112223344"
                            value={contactMobile}
                            onChange={(e) => setContactMobile(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold text-left font-mono focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">موضوع پیام یا طرح سوال</label>
                        <input
                          type="text"
                          placeholder="مثال: لمس توده کوچک بدون درد در قسمت خارجی سینه راست"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">متن پیام و جزئیات بالینی</label>
                        <textarea
                          placeholder="لطفاً سن، وضعیت قاعدگی، شرح نشانه‌ها و زمان به وجود آمدن عوارض را برای معاینه بهتر تشریح فرمایید..."
                          value={contactContent}
                          onChange={(e) => setContactContent(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-pink-500 rounded-xl text-xs font-semibold focus:outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isContactSubmitting}
                          className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow shadow-pink-100"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isContactSubmitting ? 'در حال ارسال...' : 'ارسال فرم پیام جهت بررسی تکی پزشکان'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Sidebar Address/FAQ Info (4 columns) */}
                  <div className="lg:col-span-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/50 text-right space-y-5">
                    <div className="border-b border-slate-200 pb-3 mb-2">
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-pink-500" />
                        راه‌های ارتباطی رسمی onconet
                      </h4>
                    </div>

                    <div className="space-y-3 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">تلفن مشاوره رایگان مامولوژی:</span>
                        <span className="text-xs font-black font-sans text-pink-700">۰۲۱-۸۸۹۹۲۲۱۱ (تهران)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold mb-1">آدرس ساختمان انجمن:</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">تهران، خیابان ولیعصر، بالاتر از توانیر، کوچه مریم، پلاک ۱۰، طبقه سوم</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 text-[10px] text-slate-500 leading-relaxed">
                      * onconet با رویکرد علمی و داده‌محور در حوزه سرطان فعالیت می‌کند. تمامی پیام‌های ثبت‌شده پس از بررسی تیم تخصصی، پاسخ‌دهی می‌شوند.
                    </div>
                  </div>

                </motion.div>
              )}

            </>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
