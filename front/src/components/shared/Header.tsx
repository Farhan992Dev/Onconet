"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from 'lucide-react';

interface HeaderProps {
  isUserLoggedIn?: boolean;
}

export default function Header({ isUserLoggedIn = false }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activePortal = pathname.startsWith('/admin') ? 'admin'
    : pathname.startsWith('/user') ? 'user'
    : 'website';

  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 md:top-auto z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 md:py-4 gap-3 md:gap-4">

          {/* Logo area */}
          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-3 cursor-pointer select-none group w-full md:w-auto"
            title="بازگشت به سایت اصلی"
          >
            <img
              src="/site-logo.png"
              alt="لوگوی onconet"
              className="w-9 h-9 rounded-full object-cover shadow shadow-pink-200 group-hover:scale-105 transition-transform duration-200"
              loading="eager"
              decoding="async"
            />
            <div className="text-right">
              <h1 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5 group-hover:text-pink-600 transition-colors duration-200">
                onconet
              </h1>
              <p className="text-[10px] text-slate-400">همراه شما در مسیر آگاهی و درمان</p>
            </div>
          </div>

          {/* Portal Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-end">
            {activePortal !== 'website' && (
              <button
                onClick={() => router.push('/')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
              >
                بازگشت به سایت اصلی
              </button>
            )}

            <button
              onClick={() => router.push('/user')}
              className={`flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all active:scale-[0.98] ${
                activePortal === 'user'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
              id="portal-toggle-user"
            >
              <User className="w-3.5 h-3.5" />
              {isUserLoggedIn ? 'پنل کاربری من' : 'ورود کاربران'}
              {isUserLoggedIn && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block animate-pulse"></span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
