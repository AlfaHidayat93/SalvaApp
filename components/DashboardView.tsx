'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  Coins,
  Users,
  MessageSquareWarning,
  Plus,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DashboardSummary, ProgramKerja } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface DashboardViewProps {
  summary: DashboardSummary;
  programs: ProgramKerja[];
  isAdmin: boolean;
  onNavigateTab: (tab: string) => void;
  onOpenAddProgram: () => void;
  onOpenEditProgram: (prog: ProgramKerja) => void;
  onDeleteProgram: (id: string) => void;
}

export default function DashboardView({
  summary,
  programs,
  isAdmin,
  onNavigateTab,
  onOpenAddProgram,
  onOpenEditProgram,
  onDeleteProgram,
}: DashboardViewProps) {
  const [selectedProgId, setSelectedProgId] = useState<string>('');

  React.useEffect(() => {
    if (programs.length > 0 && (!selectedProgId || !programs.some(p => p.id === selectedProgId))) {
      setSelectedProgId(programs[0].id);
    }
  }, [programs, selectedProgId]);

  const selectedProgram =
    programs.find((p) => p.id === selectedProgId) || programs[0];

  return (
    <div className="space-y-6">
      {/* STAT CARDS: KAS UTAMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Pemasukan Kas
            </p>
            <h3 className="text-xl md:text-2xl font-black text-emerald-600 mt-1">
              {formatRupiah(summary.totalPemasukan)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Iuran Warga & Kas Masuk</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Pengeluaran Kas
            </p>
            <h3 className="text-xl md:text-2xl font-black text-rose-600 mt-1">
              {formatRupiah(summary.totalPengeluaran)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sampah, Keamanan & Operasional</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Saldo Kas Saat Ini
            </p>
            <h3 className="text-xl md:text-2xl font-black text-indigo-600 mt-1">
              {formatRupiah(summary.saldoKas)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Kas Bersih Siap Pakai</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* STAT CARDS: DEMOGRAFI & ADUAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Total Warga (KK)</p>
            <h4 className="text-lg font-bold text-slate-800">{summary.totalWarga} Rumah</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Total Jiwa / Penduduk</p>
            <h4 className="text-lg font-bold text-slate-800">{summary.totalJiwa} Orang</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Status Warga</p>
            <h4 className="text-xs font-bold text-slate-800">
              <span className="text-teal-600">{summary.tetapCount} Tetap</span> •{' '}
              <span className="text-amber-600">{summary.kontrakCount} Kontrak</span>
            </h4>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('aduan')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between cursor-pointer hover:border-indigo-300 transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Aduan Aktif</p>
              <h4 className="text-lg font-bold text-amber-600">
                {summary.aduanAktif} Masukan
              </h4>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
        </div>
      </div>

      {/* QUICK SHORTCUT BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src="/logo.png"
            alt="Logo Batujai Salva Residence"
            className="w-14 h-14 rounded-2xl object-contain bg-white p-1 shadow-md shrink-0 border border-indigo-400/30"
          />
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-white/10 rounded-full border border-white/10">
              Batujai Salva Residence
            </span>
            <h3 className="text-base sm:text-lg font-bold mt-2">
              Transparansi Keuangan, Administrasi Warga & Aspirasi Lingkungan
            </h3>
            <p className="text-xs text-indigo-200 max-w-2xl mt-1">
              Data kas dan administrasi tersimpan rapi dan aman. Warga dapat memantau status iuran bulanan dan menyampaikan aduan fasilitas secara langsung.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('iuran')}
            className="px-3.5 py-2 rounded-xl bg-white text-indigo-950 font-semibold text-xs hover:bg-indigo-50 transition shadow-sm"
          >
            Cek Iuran Bulanan
          </button>
          <button
            onClick={() => onNavigateTab('aduan')}
            className="px-3.5 py-2 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500/40 transition"
          >
            Kirim Aduan / Saran
          </button>
        </div>
      </div>

      {/* PROGRAM KERJA PERUMAHAN */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Agenda & Program Kerja Perumahan
            </h3>
            <p className="text-[11px] text-slate-500">
              Kegiatan sosial, pemeliharaan lingkungan, dan program kerja berkala
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={onOpenAddProgram}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Program
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
          {/* Left list of programs */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/30 p-3 space-y-2 max-h-[400px] overflow-y-auto">
            {programs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Belum ada program kerja yang ditambahkan.
              </p>
            ) : (
              programs.map((prog) => {
                const isSelected = prog.id === (selectedProgram?.id || '');
                return (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => setSelectedProgId(prog.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs cursor-pointer active:scale-98 select-none ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="truncate">{prog.nama}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2 font-mono ${
                          isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {formatRupiah(prog.anggaran)}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-1 line-clamp-1 ${
                        isSelected ? 'text-indigo-200' : 'text-slate-500'
                      }`}
                    >
                      {prog.deskripsi}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right program detail */}
          <div className="md:col-span-8 p-6 flex flex-col justify-between">
            {selectedProgram ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      Detail Program
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-2">
                      {selectedProgram.nama}
                    </h2>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Estimasi Anggaran</p>
                    <span className="text-base sm:text-lg font-black text-emerald-600">
                      {formatRupiah(selectedProgram.anggaran)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Deskripsi Kegiatan
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    {selectedProgram.deskripsi || 'Tidak ada deskripsi'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> Waktu Pelaksanaan
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {selectedProgram.pelaksanaan || '-'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Panitia / Penanggung Jawab
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {selectedProgram.panitia || '-'}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onOpenEditProgram(selectedProgram)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition border border-indigo-200"
                    >
                      Edit Program
                    </button>
                    <button
                      onClick={() => onDeleteProgram(selectedProgram.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition border border-rose-200"
                    >
                      Hapus Program
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 py-12">
                <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium">Pilih program untuk melihat rincian.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
