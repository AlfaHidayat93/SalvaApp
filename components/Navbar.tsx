'use client';

import React from 'react';
import { Menu, Calendar, Database, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  isLocalMode: boolean;
  toggleLocalMode: () => void;
  isAdmin: boolean;
}

const tabTitles: Record<string, string> = {
  dashboard: 'Dashboard RT/RW & Agenda Program',
  warga: 'Daftar Warga & Penghuni Blok',
  iuran: 'Rekap Iuran Bulanan Warga (Sampah, Keamanan, Kas)',
  pengeluaran: 'Buku Kas & Catatan Pengeluaran',
  aduan: 'Pusat Aduan, Saran & Aspirasi Warga',
};

export default function Navbar({
  currentTab,
  onOpenMobileSidebar,
  isLocalMode,
  toggleLocalMode,
  isAdmin,
}: NavbarProps) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 md:hidden transition focus:outline-hidden"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 truncate leading-tight">
            {tabTitles[currentTab] || 'Portal RT/RW'}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            SALVA Residence • Rukun Tetangga & Warga
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {isAdmin && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Mode Admin
          </span>
        )}

        <button
          onClick={toggleLocalMode}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-xs border transition cursor-pointer ${
            isLocalMode
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
          title="Klik untuk beralih mode database (Lokal vs Google Sheets)"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLocalMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <span className="hidden xs:inline">DB:</span> {isLocalMode ? 'Demo Lokal' : 'Google Sheets'}
        </button>

        <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>
      </div>
    </header>
  );
}
