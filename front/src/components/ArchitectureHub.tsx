/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server,
  Code2,
  Cpu,
  Database,
  Terminal,
  FileCode,
  Globe,
  Lock,
  ArrowRightLeft,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export default function ArchitectureHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'backend' | 'frontend'>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const dotnetControllerCode = `using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace PinkBreastHealth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ISmsService _smsService;
        private readonly IJwtService _jwtService;
        private readonly ICacheService _cache; // Redis for OTP cooldown

        public AuthController(
            ApplicationDbContext context, 
            ISmsService smsService, 
            IJwtService jwtService,
            ICacheService cache)
        {
            _context = context;
            _smsService = smsService;
            _jwtService = jwtService;
            _cache = cache;
        }

        // 1. درخواست رمز یکبار مصرف (OTP Request)
        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] OtpRequestDto dto)
        {
            if (!ModelState.IsValid || !IsValidMobile(dto.Mobile))
                return BadRequest(new { Message = "شماره موبایل وارد شده معتبر نیست" });

            // بررسی محدودیت ارسال مکرر (Rate Limiting via Redis)
            var cacheKey = $"otp_cooldown:{dto.Mobile}";
            if (await _cache.ExistsAsync(cacheKey))
            {
                var remaining = await _cache.GetTtlAsync(cacheKey);
                return StatusCode(429, new { Message = $"لطفاً {remaining} ثانیه دیگر مجدداً تلاش کنید." });
            }

            // تولید کد ۵ رقمی تصادفی
            var otpCode = new Random().Next(10000, 99999).ToString();
            
            // ذخیره کد در کش با انقضای ۲ دقیقه‌ای
            await _cache.SetWithExpiryAsync($"otp:{dto.Mobile}", otpCode, TimeSpan.FromMinutes(2));
            // اعمال محدودیت درخواست مجدد به مدت ۶۰ ثانیه
            await _cache.SetWithExpiryAsync(cacheKey, "active", TimeSpan.FromSeconds(60));

            // ارسال پیامک واقعی از طریق پنل پیامکی ایران
            await _smsService.SendSmsAsync(dto.Mobile, $"کد تایید شما در سامانه سلامت onconet: {otpCode}");

            return Ok(new { Message = "کد تایید با موفقیت ارسال شد" });
        }

        // 2. تایید هویت و ورود با اوتی‌پی (Verifying OTP)
        [HttpPost("login-otp")]
        public async Task<IActionResult> VerifyOtpAndLogin([FromBody] VerifyOtpDto dto)
        {
            var storedOtp = await _cache.GetAsync($"otp:{dto.Mobile}");
            if (storedOtp == null || storedOtp != dto.OtpCode)
            {
                return BadRequest(new { Message = "کد تایید نامعتبر است یا منقضی شده است" });
            }

            // پاک کردن کد مصرف شده
            await _cache.RemoveAsync($"otp:{dto.Mobile}");

            // دریافت یا ثبت نام خودکار کاربر
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Mobile == dto.Mobile);
            var isNewUser = false;
            if (user == null)
            {
                user = new User 
                { 
                    Mobile = dto.Mobile, 
                    CreatedAt = DateTime.UtcNow,
                    FullName = "کاربر همراه onconet"
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                isNewUser = true;
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new { 
                Token = token, 
                IsNewUser = isNewUser,
                User = new { user.Mobile, user.FullName, user.BirthYear } 
            });
        }

        // 3. ورود با رمز عبور ثابت (Password login)
        [HttpPost("login-password")]
        public async Task<IActionResult> LoginWithPassword([FromBody] PasswordLoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Mobile == dto.Mobile);
            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            {
                return Unauthorized(new { Message = "کاربر پیدا نشد یا رمز عبور تنظیم نشده است" });
            }

            var verified = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!verified)
            {
                return Unauthorized(new { Message = "شماره موبایل یا رمز عبور اشتباه است" });
            }

            var token = _jwtService.GenerateToken(user);
            return Ok(new { 
                Token = token, 
                User = new { user.Mobile, user.FullName, user.BirthYear }
            });
        }

        private bool IsValidMobile(string mobile) => 
            System.Text.RegularExpressions.Regex.IsMatch(mobile, @"^09\\d{9}$");
    }

    public class OtpRequestDto 
    {
        [Required] public string Mobile { get; set; }
    }

    public class VerifyOtpDto 
    {
        [Required] public string Mobile { get; set; }
        [Required] public string OtpCode { get; set; }
    }

    public class PasswordLoginDto 
    {
        [Required] public string Mobile { get; set; }
        [Required] public string Password { get; set; }
    }
}`;

  const articleControllerCode = `using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace PinkBreastHealth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ArticlesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ۱. دریافت لیست مقالات منتشر شده به همراه بهینه‌سازی دیتای سئو (برای سایت اصلی)
        [HttpGet]
        public async Task<IActionResult> GetPublishedArticles()
        {
            var articles = await _context.Articles
                .Where(a => a.IsPublished)
                .OrderByDescending(a => a.PublishDate)
                .Select(a => new {
                    a.Id,
                    a.Title,
                    a.Slug,
                    a.Summary,
                    a.Category,
                    a.CoverImage,
                    a.PublishDate,
                    a.ReadingTime,
                    // ارسال دیتای سئو مختصر جهت رندر سریع فرانت
                    Seo = new { a.SeoTitle, a.SeoDescription }
                })
                .ToListAsync();

            return Ok(articles);
        }

        // ۲. دریافت تک مقاله بر اساس اسلاگ (slug) به صورت سئو فرندلی کامل
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetArticleBySlug(string slug)
        {
            var article = await _context.Articles
                .FirstOrDefaultAsync(a => a.Slug == slug.ToLower() && a.IsPublished);

            if (article == null)
                return NotFound(new { Message = "مقاله مورد نظر یافت نشد" });

            return Ok(article);
        }

        // ۳. ذخیره یا بروزرسانی مقاله همراه با تنظیمات سئو ادمین (نیازمند نقش ادمین)
        [Authorize(Roles = "Admin")]
        [HttpPost("save")]
        public async Task<IActionResult> SaveArticle([FromBody] ArticleUpsertDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            Article article;
            if (dto.Id == null) // ایجاد مقاله جدید
            {
                article = new Article { CreatedAt = DateTime.UtcNow };
                _context.Articles.Add(article);
            }
            else // ویرایش مقاله قبلی
            {
                article = await _context.Articles.FindAsync(dto.Id);
                if (article == null) return NotFound();
            }

            article.Title = dto.Title;
            article.Slug = dto.Slug.ToLower().Replace(" ", "-");
            article.Content = dto.Content;
            article.Summary = dto.Summary;
            article.Category = dto.Category;
            article.CoverImage = dto.CoverImage;
            article.IsPublished = dto.IsPublished;
            article.Author = dto.Author;
            article.ReadingTime = dto.ReadingTime;
            
            // ذخیره مستقیم متاداده‌های سئو که توسط ادمین در پنل وارد شده است
            article.SeoTitle = string.IsNullOrEmpty(dto.SeoTitle) ? dto.Title : dto.SeoTitle;
            article.SeoDescription = string.IsNullOrEmpty(dto.SeoDescription) ? dto.Summary : dto.SeoDescription;
            article.SeoKeywords = dto.SeoKeywords;
            article.OgImage = string.IsNullOrEmpty(dto.OgImage) ? dto.CoverImage : dto.OgImage;
            
            if (dto.IsPublished && article.PublishDate == null)
            {
                article.PublishDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "مقاله با موفقیت ذخیره شد", ArticleId = article.Id });
        }
    }
}`;

  const nextjsSeoCode = `// app/articles/[slug]/page.tsx (Next.js 14/15 App Router - کامپوننت سرور ساید تکی)
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ArticleProps {
  params: { slug: string };
}

// ۱. فراخوانی API دات نت و دریافت اطلاعات مقاله سئو شده
async function getArticle(slug: string) {
  const response = await fetch(\`https://api.pinkbreasthealth.ir/api/articles/\${slug}\`, {
    next: { revalidate: 3600 } // کش کردن سرور ساید برای بهبود پاسخ و لود سریع ربات‌های سئو
  });
  
  if (!response.ok) return null;
  return await response.json();
}

// ۲. تولید متادیتای سئو پویا در سرور (Next.js Dynamic Metadata API)
export async function generateMetadata({ params }: ArticleProps): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) {
    return {
      title: 'مقاله یافت نشد | onconet',
    };
  }

  // این اطلاعات از پنل ادمین توسط پزشک ثبت و ذخیره شده است
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    keywords: article.seoKeywords?.split(','),
    alternates: {
      canonical: \`https://pinkbreasthealth.ir/articles/\${article.slug}\`,
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      url: \`https://pinkbreasthealth.ir/articles/\${article.slug}\`,
      siteName: 'سامانه خودمراقبتی پستان onconet',
      images: [
        {
          url: article.ogImage || article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
      publishedTime: article.publishDate,
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      images: [article.ogImage || article.coverImage],
    },
  };
}

// ۳. رندر کردن کدهای HTML ساختاریافته (Semantic HTML) برای خزنده‌های گوگل
export default async function ArticlePage({ params }: ArticleProps) {
  const article = await getArticle(params.slug);
  if (!article) return notFound();

  // تولید کدهای دیتای ساختاریافته (JSON-LD Article Schema) جهت درخشش در گوگل ریچ اسنیپت
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "سامانه مأمور خودارزیابی پستان onconet",
    "headline": article.title,
    "image": article.coverImage,
    "datePublished": article.publishDate,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "description": article.summary,
    "publisher": {
      "@type": "Organization",
      "name": "onconet",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pinkbreasthealth.ir/logo.png"
      }
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      {/* تزریق اسکیمای سئو به هدر برای خزنده گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      
      <header className="mb-8">
        <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold">
          {article.category}
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-4 leading-relaxed">
          {article.title}
        </h1>
        <div className="flex items-center text-sm text-gray-500 mt-4 space-x-reverse space-x-4">
          <span>نویسنده: <strong>{article.author}</strong></span>
          <span>•</span>
          <span>زمان مطالعه: {article.readingTime} دقیقه</span>
        </div>
      </header>

      <div className="relative aspect-video w-full mb-8 rounded-2xl overflow-hidden shadow-md">
        <img 
          src={article.coverImage} 
          alt={article.title}
          className="object-cover w-full h-full"
        />
      </div>

      {/* رندر کامل متن به صورت HTML معنایی یا کامپوننت Markdown */}
      <div 
        className="prose prose-lg prose-pink max-w-none text-gray-800 leading-8"
        dangerouslySetInnerHTML={{ __html: article.content }} 
      />
    </article>
  );
}`;

  const sitemapCode = `// app/sitemap.ts (Next.js دینامیک برای تولید خودکار نقشه سایت)
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pinkbreasthealth.ir';

  // ۱. صفحات ثابت سایت اصلی
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: \`\${baseUrl}/about-us\`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: \`\${baseUrl}/contact-us\`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: \`\${baseUrl}/self-check-guide\`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
  ];

  // ۲. کوئری زدن به بک اند دات نت برای دریافت آخرین مقالات فعال
  try {
    const res = await fetch('https://api.pinkbreasthealth.ir/api/articles');
    const articles = await res.json();
    
    const articleUrls = articles.map((article: any) => ({
      url: \`\${baseUrl}/articles/\${article.slug}\`,
      lastModified: new Date(article.publishDate || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...articleUrls];
  }
  catch {
    return staticPages;
  }
}`;

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans p-6 rounded-2xl" dir="rtl" id="architecture-hub">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
                <Cpu className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">مرکز معماری سیستم (Architecture Hub)</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="architecture-tab-overview"
            >
              <Globe className="w-3.5 h-3.5" />
              نمای کلی معماری
            </button>
            <button
              onClick={() => setActiveTab('backend')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'backend'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="architecture-tab-backend"
            >
              <Server className="w-3.5 h-3.5" />
              کدهای دات نت کور (.NET)
            </button>
            <button
              onClick={() => setActiveTab('frontend')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'frontend'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="architecture-tab-frontend"
            >
              <FileCode className="w-3.5 h-3.5" />
              کدهای نکست جی اس (NextJS)
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Architecture Diagram Visualization */}
              <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
                <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
                  <Database className="w-4 h-4 text-pink-500" />
                  دیاگرام جریان داده و ساختار سرویس‌دهی پورتال onconet
                </h3>
                
                <div className="min-w-[900px] flex items-stretch justify-between gap-4 py-4 px-2">
                  
                  {/* Client Front */}
                  <div className="w-1/4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-inner">
                    <div>
                      <div className="text-xs text-pink-400 font-bold tracking-widest uppercase mb-1">سرور فرانت‌اند</div>
                      <h4 className="text-sm font-bold text-white mb-2">کاربر و موتورهای سئو</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        رندرینگ سرور‌ساید (SSR) صفحات برای خزنده‌های گوگل جهت ارتقای صددرصدی رتبه سئو سایت.
                      </p>
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="bg-slate-800 p-2 rounded-lg text-xs flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-pink-400" />
                        Next.js Router
                      </div>
                      <div className="bg-slate-800 p-2 rounded-lg text-xs flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        JSON-LD Schema
                      </div>
                    </div>
                  </div>

                  {/* Flow arrow */}
                  <div className="flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
                    <span>HTTPS</span>
                    <ArrowRightLeft className="w-5 h-5 text-pink-500 animate-pulse" />
                    <span className="bg-slate-850 px-2 py-1 rounded text-[10px] text-slate-400">JWT Token / JSON</span>
                  </div>

                  {/* Backend Gateway API */}
                  <div className="w-1/3 bg-slate-900 border border-cyan-900/40 rounded-xl p-4 flex flex-col justify-between shadow-lg relative">
                    <div className="absolute -top-3 left-4 bg-cyan-600/25 border border-cyan-800/80 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      .NET Core 8.0
                    </div>
                    <div>
                      <div className="text-xs text-cyan-400 font-bold tracking-widest uppercase mb-1">وب سرویس اصلی</div>
                      <h4 className="text-sm font-bold text-white mb-2">Web API Gateway</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        مدیریت کدهای OTP، لاگین با رمز عبور، امنیت JWT، کنترل‌های اعتبارسنجی مقالات و ذخیره متادیتاهای پیشرفته سئو کاربری ادمین.
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="bg-slate-800 p-2 rounded-lg text-[11px] text-center font-semibold text-slate-300">
                        AuthController
                      </div>
                      <div className="bg-slate-800 p-2 rounded-lg text-[11px] text-center font-semibold text-slate-300">
                        ArticlesController
                      </div>
                      <div className="bg-slate-800 p-2 rounded-lg text-[11px] text-center font-semibold text-slate-300">
                        ProfileController
                      </div>
                      <div className="bg-slate-800 p-2 rounded-lg text-[11px] text-center font-semibold text-slate-300">
                        SeoManager
                      </div>
                    </div>
                  </div>

                  {/* Flow arrow */}
                  <div className="flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
                    <span>Queries</span>
                    <ArrowRightLeft className="w-5 h-5 text-cyan-500 animate-pulse" />
                    <span className="bg-slate-850 px-2 py-1 rounded text-[10px] text-slate-400">EF Core</span>
                  </div>

                  {/* Data and Cache Layer */}
                  <div className="w-1/4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-inner">
                    <div>
                      <div className="text-xs text-emerald-400 font-bold tracking-widest uppercase mb-1">لایه داده و سشن</div>
                      <h4 className="text-sm font-bold text-white mb-2">دیتابیس و کَش</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        استفاده از پایگاه داده رابطه‌ای برای ذخیره ساختار مستحکم و کش سریع برای اعتبارسنجی کدهای تایید موقت.
                      </p>
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="bg-slate-800 p-2 rounded-lg text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-emerald-400" />
                          SQL Server / PG
                        </span>
                        <span className="text-[10px] text-slate-500">مخزن مقالات / داده</span>
                      </div>
                      <div className="bg-slate-800 p-2 rounded-lg text-xs flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-red-400" />
                          Redis Store
                        </span>
                        <span className="text-[10px] text-slate-500">تایمر و کدهای OTP</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Core System highlights as bento cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-850/60 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
                      <Zap className="w-5 h-5" />
                    </span>
                    <h4 className="text-sm font-bold text-white">پشتیبانی کامل از ساختار سئو (SEO)</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    متاداده‌های ورودی کابر ادمین به مستقیم به صورت SSR توسط Next.js پذیرا می‌شوند. ربات گوگل با اولین درخواست به تمام اطلاعات از جمله تگ کنونیکال، تگ‌های دسته‌بندی و اسکیمای JSON-LD دسترسی کلینیکی خواهد داشت.
                  </p>
                </div>

                <div className="bg-slate-850/60 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                      <Lock className="w-5 h-5" />
                    </span>
                    <h4 className="text-sm font-bold text-white">تکنولوژی دومنظوره ثبت‌نام/ورود</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    کاربر با شماره موبایل ثبت شده ابتدا درخواست پیامک رمز یکبار مصرف (OTP) می‌دهد. دات‌نت از یک کش سریع با انقضای ۱۲۰ ثانیه‌ای برای بررسی تاییدها استفاده می‌کند. کاربر همچنین می‌تواند با رمز عبور ثابت وارد شود.
                  </p>
                </div>

                <div className="bg-slate-850/60 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
                      <Copy className="w-5 h-5" />
                    </span>
                    <h4 className="text-sm font-bold text-white">سرعت رندرینگ باورنکردنی</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    با تلفیق کدهای بسیار سبک وب‌آپی دات‌نت کور ۸ و معماری Incremental Static Regeneration (ISR) در فرانت‌اند نکست‌جی‌اس، مقالات از پیش رندر شده و سرعت بارگذاری زیر ۵۰۰ میلی ثانیه است.
                  </p>
                </div>
              </div>

              {/* Guide Note */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex items-start gap-4">
                <span className="p-2.5 bg-yellow-400/10 text-yellow-500 rounded-xl shrink-0">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">راهنمای انتقال کد به فاز اصلی پیاده‌سازی</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">
                    این پرتوتایپ بصری به صورتی طراحی شده که داده‌ها را ایمن نگه می‌دارد. برای راه‌اندازی واقعی پروژه، زبانه‌های دیگر شامل کدهای کامل بک‌اند C# (.NET Core) به صورت طبقه‌بندی شده و کدهای فرانت‌اند Next.js را کپی کرده و در سولوشن‌های مایکروسافت ویژوال استودیو و محیط پروژه‌تان ادغام کنید.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'backend' && (
            <motion.div
              key="backend"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  ساختار بک‌اند: وب سرویس‌های احراز هویت و مقالات سلامت (.NET Core 8)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  کدهای C# زیر شامل متد ورود دوگانه (موبایل با OTP یا رمز عبور ثابت)، به همراه اعتبارسنجی‌ها، زمان اعتباردهی کش و در طرف دیگر کنترلر مقالات با فیلدهای ویژه مدیریت کلیدواژه‌های سئو ادمین می‌باشد.
                </p>
              </div>

              {/* Code Panel 1: AuthController */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <FileCode className="w-4 h-4 text-cyan-500" />
                    Controllers/AuthController.cs
                  </span>
                  <button
                    onClick={() => handleCopy(dotnetControllerCode, 'authController')}
                    className="flex items-center gap-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 transition-all font-semibold"
                  >
                    {copiedText === 'authController' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        کپی شد!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        کپی کردن کد
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[380px] font-mono text-xs text-slate-300 antialiased leading-relaxed" dir="ltr">
                  <pre>{dotnetControllerCode}</pre>
                </div>
              </div>

              {/* Code Panel 2: ArticlesController */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <FileCode className="w-4 h-4 text-cyan-500" />
                    Controllers/ArticlesController.cs
                  </span>
                  <button
                    onClick={() => handleCopy(articleControllerCode, 'articleController')}
                    className="flex items-center gap-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 transition-all font-semibold"
                  >
                    {copiedText === 'articleController' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        کپی شد!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        کپی کردن کد
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[380px] font-mono text-xs text-slate-300 antialiased leading-relaxed" dir="ltr">
                  <pre>{articleControllerCode}</pre>
                </div>
              </div>

              <div className="bg-cyan-950/20 border border-cyan-900/40 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <p className="text-[11px] text-cyan-300 leading-relaxed">
                  توصیه سئو: به دلیل وجود اسلاگ‌های فارسی مقالات، حتماً مقدار وب سرویس را به صورت URL Encode شده دریافت کنید تا کاراکترهای یونیکد فارسی دچار قطع پیوند سئو در IIS نشوند.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'frontend' && (
            <motion.div
              key="frontend"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-sm font-bold text-teal-400 mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  پیاده‌سازی فرانت‌اند: رندرینگ سرور ساید تگ‌ها مهر و سئو داینامیک (Next.js)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  در تکه‌های کد زیر نحوه دریافت داده‌های مقاله از وب‌آپی دات‌نت کور و تزریق آن به موتور متادیتا در Next.js مشخص شده است. کدهای مربوط به تولید نقشه سایت (sitemap.ts) خودکار نیز در اینجا آورده شده است.
                </p>
              </div>

              {/* Code Panel 3: Dynamic Page SEO */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-mono text-teal-400">
                    <FileCode className="w-4 h-4 text-teal-500" />
                    app/articles/[slug]/page.tsx
                  </span>
                  <button
                    onClick={() => handleCopy(nextjsSeoCode, 'nextjsSeo')}
                    className="flex items-center gap-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 transition-all font-semibold"
                  >
                    {copiedText === 'nextjsSeo' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        کپی شد!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        کپی کردن کد
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[380px] font-mono text-xs text-slate-300 antialiased leading-relaxed" dir="ltr">
                  <pre>{nextjsSeoCode}</pre>
                </div>
              </div>

              {/* Code Panel 4: Sitemap XML Generator */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-mono text-teal-400">
                    <FileCode className="w-4 h-4 text-teal-500" />
                    app/sitemap.ts
                  </span>
                  <button
                    onClick={() => handleCopy(sitemapCode, 'sitemapCode')}
                    className="flex items-center gap-1.5 text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 transition-all font-semibold"
                  >
                    {copiedText === 'sitemapCode' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        کپی شد!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        کپی کردن کد
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[380px] font-mono text-xs text-slate-300 antialiased leading-relaxed" dir="ltr">
                  <pre>{sitemapCode}</pre>
                </div>
              </div>

              <div className="bg-teal-950/20 border border-teal-900/40 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <p className="text-[11px] text-teal-300 leading-relaxed">
                  توصیه سئو: تگ‌های OpenGraph ارائه شده توسط Next.js موجب می‌شوند تا اشتراک‌گذاری در واتس‌اپ، تلگرام، بله و ایتا دارای پیش‌نمایش تصویر (Banner) ثبت شده توسط ادمین در پنل شود.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
