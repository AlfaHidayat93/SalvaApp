'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  MessageSquareQuote,
  ShieldCheck,
  Lock,
  LogOut,
  X,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  isLocalMode: boolean;
  toggleLocalMode: () => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  setIsOpenMobile,
  isAdmin,
  onOpenLogin,
  onLogout,
  isLocalMode,
  toggleLocalMode,
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Program', icon: LayoutDashboard },
    { id: 'warga', label: 'Daftar Warga & Blok', icon: Users },
    { id: 'iuran', label: 'Iuran Bulanan Warga', icon: Receipt },
    { id: 'pengeluaran', label: 'Buku Kas & Pengeluaran', icon: Wallet },
    { id: 'aduan', label: 'Pusat Aduan & Saran', icon: MessageSquareQuote },
  ];

  return (
    <>
      {/* Mobile Backdrop - Only rendered on mobile when drawer is open */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity cursor-pointer"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 md:z-30 w-72 md:w-64 bg-slate-900 text-white flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-600/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">SALVA RT/RW</h1>
              <p className="text-[11px] text-slate-400">Portal Warga & Pengurus</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Mode Switcher */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> Database:
            </span>
            <button
              type="button"
              onClick={toggleLocalMode}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer ${
                isLocalMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
              title="Klik untuk beralih antara Google Sheets (Cloud) dan Demo Lokal (LocalStorage)"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLocalMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              {isLocalMode ? 'Demo Lokal' : 'Google Sheets'}
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 md:p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-150 text-left cursor-pointer active:scale-98 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Login / Logout Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          {!isAdmin ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Mode Warga (Pengunjung)
              </span>
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-98"
              >
                <Lock className="w-3.5 h-3.5" /> Login Pengurus RT
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Pengurus RT Aktif
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="w-full bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 text-xs font-semibold py-2 px-3 rounded-xl border border-rose-800/80 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout Admin
              </button>
            </div>
          )}
        </div>

        {/* Copyright Footer */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 text-center shrink-0">
          <p className="text-[10px] text-slate-500 font-medium tracking-wide leading-relaxed">
            &copy; 2026 SALVA RT/RW.<br />
            Copyright by{' '}
            <a
              href="https://alfahidayat93.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition hover:underline font-semibold"
            >
              alfahidayat93.github.io
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}
