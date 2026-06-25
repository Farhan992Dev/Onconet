import type { Metadata } from 'next';
import Header from '@/components/shared/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'onconet | digital cancer ecosystem',
  description: 'اکوسیستم دیجیتال سرطان - آگاهی، پیشگیری و سلامت تخصصی پستان',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-slate-50 min-h-screen font-sans flex flex-col justify-between">
        <Header />
        {children}
        <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-semibold text-[11px] leading-relaxed">
            <div className="flex items-center gap-2 text-center sm:text-right">
              <img
                src="/site-logo.png"
                alt="لوگوی onconet"
                className="w-5 h-5 rounded-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <span>onconet - اکوسیستم دیجیتال سرطان | خرداد ۱۴۰۵</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
