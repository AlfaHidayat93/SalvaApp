'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  Plus,
  Home,
  Check,
  X,
  Search
} from 'lucide-react';
import { IuranMatrixRow, IuranMonthDetail } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/api';

interface IuranViewProps {
  matrixData: IuranMatrixRow[];
  optionsBlok: string[];
  selectedTahun: number;
  setSelectedTahun: (th: number) => void;
  selectedBlok: string;
  setSelectedBlok: (bl: string) => void;
  isAdmin: boolean;
  onSaveIuran: (data: any) => Promise<void>;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export default function IuranView({
  matrixData,
  optionsBlok,
  selectedTahun,
  setSelectedTahun,
  selectedBlok,
  setSelectedBlok,
  isAdmin,
  onSaveIuran,
}: IuranViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{
    warga: any;
    month: number;
    data: IuranMonthDetail;
  } | null>(null);

  // Form states for Modal Bayar Iuran
  const [paySampah, setPaySampah] = useState<boolean>(true);
  const [nominalSampah, setNominalSampah] = useState<number>(20000);

  const [payKeamanan, setPayKeamanan] = useState<boolean>(true);
  const [nominalKeamanan, setNominalKeamanan] = useState<number>(30000);

  const [payKas, setPayKas] = useState<boolean>(true);
  const [nominalKas, setNominalKas] = useState<number>(25000);

  const [tanggalBayar, setTanggalBayar] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [metode, setMetode] = useState<string>('Tunai');
  const [catatan, setCatatan] = useState<string>('');

  const filteredMatrix = useMemo(() => {
    return matrixData.filter((row) => {
      const w = row.warga;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        w.nama.toLowerCase().includes(q) ||
        w.noRumah.toLowerCase().includes(q) ||
        w.blok.toLowerCase().includes(q);
      return matchSearch;
    });
  }, [matrixData, searchQuery]);

  // Statistik Kepatuhan Iuran
  const stats = useMemo(() => {
    let totalTerkumpul = 0;
    const currentMonth = new Date().getMonth() + 1; // 1 - 12
    let lunasBulanIni = 0;

    filteredMatrix.forEach((r) => {
      totalTerkumpul += r.totalTahun;
      const mData = r.months[currentMonth];
      if (
        mData &&
        mData.sampahStatus === 'Lunas' &&
        mData.keamananStatus === 'Lunas' &&
        mData.kasStatus === 'Lunas'
      ) {
        lunasBulanIni++;
      }
    });

    return {
      totalTerkumpul,
      totalRumah: filteredMatrix.length,
      lunasBulanIni,
      persenBulanIni:
        filteredMatrix.length > 0
          ? Math.round((lunasBulanIni / filteredMatrix.length) * 100)
          : 0,
    };
  }, [filteredMatrix]);

  const openPaymentModal = (warga: any, month: number, data: IuranMonthDetail) => {
    if (!isAdmin) return; // Only admin can edit or record payment

    setSelectedCell({ warga, month, data });

    const hasSampah = data.sampahStatus === 'Lunas';
    setPaySampah(hasSampah || data.totalBayar === 0);
    setNominalSampah(data.sampahNominal || 20000);

    const hasKeamanan = data.keamananStatus === 'Lunas';
    setPayKeamanan(hasKeamanan || data.totalBayar === 0);
    setNominalKeamanan(data.keamananNominal || 30000);

    const hasKas = data.kasStatus === 'Lunas';
    setPayKas(hasKas || data.totalBayar === 0);
    setNominalKas(data.kasNominal || 25000);

    setTanggalBayar(data.tanggalBayar || new Date().toISOString().split('T')[0]);
    setMetode(data.metode || 'Tunai');
    setCatatan(data.catatan && data.catatan !== '-' ? data.catatan : '');
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    const payload = {
      id: selectedCell.data.id || '',
      tahun: selectedTahun,
      bulan: selectedCell.month,
      wargaId: selectedCell.warga.id,
      blok: selectedCell.warga.blok,
      noRumah: selectedCell.warga.noRumah,
      nama: selectedCell.warga.nama,
      sampahNominal: paySampah ? nominalSampah : 0,
      sampahStatus: paySampah ? 'Lunas' : 'Belum',
      keamananNominal: payKeamanan ? nominalKeamanan : 0,
      keamananStatus: payKeamanan ? 'Lunas' : 'Belum',
      kasNominal: payKas ? nominalKas : 0,
      kasStatus: payKas ? 'Lunas' : 'Belum',
      tanggalBayar,
      metode,
      catatan,
    };

    await onSaveIuran(payload);
    setSelectedCell(null);
  };

  const totalModalBayar =
    (paySampah ? nominalSampah : 0) +
    (payKeamanan ? nominalKeamanan : 0) +
    (payKas ? nominalKas : 0);

  return (
    <div className="space-y-5">
      {/* HEADER & FILTER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            Matriks Iuran Bulanan Warga
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring pembayaran iuran Sampah, Keamanan, dan Kas RT setiap bulan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Blok */}
          <div className="relative">
            <select
              value={selectedBlok}
              onChange={(e) => setSelectedBlok(e.target.value)}
              className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 shadow-xs appearance-none"
            >
              <option value="ALL">Semua Blok</option>
              {optionsBlok.map((b) => (
                <option key={b} value={b}>
                  Blok {b}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tahun */}
          <div className="relative">
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(parseInt(e.target.value, 10))}
              className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 shadow-xs appearance-none"
            >
              <option value={2026}>Tahun 2026</option>
              <option value={2025}>Tahun 2025</option>
              <option value={2024}>Tahun 2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* TARIF REFERENSI & KEPATUHAN STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Tarif Rincian */}
        <div className="lg:col-span-8 bg-gradient-to-r from-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl text-white shadow-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Standar Tarif Iuran Bulanan RT / RW
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Total Rp 75.000 / Rumah
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">1. Sampah</p>
              <h4 className="text-sm sm:text-base font-bold text-emerald-300 mt-0.5">Rp 20.000</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Pengangkutan mingguan</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">2. Keamanan</p>
              <h4 className="text-sm sm:text-base font-bold text-blue-300 mt-0.5">Rp 30.000</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Petugas ronda & CCTV</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">3. Kas RT</p>
              <h4 className="text-sm sm:text-base font-bold text-indigo-300 mt-0.5">Rp 25.000</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Lampu, sosial & kas umum</p>
            </div>
          </div>
        </div>

        {/* Kepatuhan Bulan Ini */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Total Iuran Terkumpul ({selectedTahun})
            </p>
            <h3 className="text-lg sm:text-xl font-black text-indigo-600 mt-1">
              {formatRupiah(stats.totalTerkumpul)}
            </h3>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Lunas Bulan Berjalan:</span>
              <span className="text-indigo-600 font-bold">
                {stats.lunasBulanIni} / {stats.totalRumah} Rumah ({stats.persenBulanIni}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.persenBulanIni}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama warga atau nomor rumah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-xs"
        />
      </div>

      {/* TABLE MATRIX BULANAN */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Lunas Lengkap (Rp 75k)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sebagian
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Belum Bayar
            </span>
          </div>
          {isAdmin && (
            <span className="text-[11px] text-indigo-600 font-medium">
              💡 Klik pada kotak bulan untuk mencatat pembayaran warga.
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[950px]">
            <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3.5 sticky left-0 bg-slate-800 z-10 w-28">Blok / Rumah</th>
                <th className="py-3 px-3.5 sticky left-28 bg-slate-800 z-10 w-40">Nama Warga</th>
                {MONTH_NAMES.map((m, idx) => (
                  <th key={m} className="py-3 px-2 text-center w-14">
                    {m}
                  </th>
                ))}
                <th className="py-3 px-3 text-right w-28">Total {selectedTahun}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada data iuran yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((row) => {
                  const w = row.warga;
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition">
                      {/* Fixed Blok/No */}
                      <td className="py-2.5 px-3.5 font-bold font-mono text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-100">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs inline-block">
                          {w.blok}-{w.noRumah}
                        </span>
                      </td>

                      {/* Fixed Nama */}
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800 sticky left-28 bg-white z-10 border-r border-slate-100 truncate max-w-[160px]">
                        {w.nama}
                      </td>

                      {/* 12 Bulan */}
                      {MONTH_NAMES.map((_, mIdx) => {
                        const mNum = mIdx + 1;
                        const cell: IuranMonthDetail = row.months[mNum] || {
                          sampahNominal: 0,
                          sampahStatus: 'Belum',
                          keamananNominal: 0,
                          keamananStatus: 'Belum',
                          kasNominal: 0,
                          kasStatus: 'Belum',
                          totalBayar: 0,
                        };

                        const isLunasAll =
                          cell.sampahStatus === 'Lunas' &&
                          cell.keamananStatus === 'Lunas' &&
                          cell.kasStatus === 'Lunas';
                        const isSebagian =
                          !isLunasAll &&
                          (cell.sampahStatus === 'Lunas' ||
                            cell.keamananStatus === 'Lunas' ||
                            cell.kasStatus === 'Lunas');

                        return (
                          <td
                            key={mNum}
                            onClick={() => openPaymentModal(w, mNum, cell)}
                            className={`py-2 px-1 text-center transition ${
                              isAdmin ? 'cursor-pointer hover:bg-indigo-50/60' : ''
                            }`}
                            title={`Bulan ${MONTH_NAMES[mIdx]}: Sampah (${cell.sampahStatus}), Keamanan (${cell.keamananStatus}), Kas (${cell.kasStatus}). Total: Rp ${cell.totalBayar.toLocaleString('id-ID')}`}
                          >
                            {isLunasAll ? (
                              <div className="inline-flex flex-col items-center justify-center p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80 w-11 h-10 shadow-2xs">
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                <span className="text-[9px] font-bold leading-tight">
                                  {cell.totalBayar >= 1000 ? `${Math.round(cell.totalBayar / 1000)}k` : 'Lunas'}
                                </span>
                              </div>
                            ) : isSebagian ? (
                              <div className="inline-flex flex-col items-center justify-center p-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 w-11 h-10 shadow-2xs">
                                <span className="text-[9px] font-bold">Sebagian</span>
                                <span className="text-[9px] font-mono leading-tight">
                                  {Math.round(cell.totalBayar / 1000)}k
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center p-1 rounded-lg bg-slate-50 text-slate-300 border border-slate-200/60 w-11 h-10">
                                <span className="text-[10px] text-slate-400 font-medium">-</span>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Tahunan Warga */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700 bg-slate-50/50">
                        {formatRupiah(row.totalTahun)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT / EDIT IURAN BULANAN */}
      {selectedCell && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  Catat Iuran Bulanan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bulan {MONTH_NAMES[selectedCell.month - 1]} {selectedTahun}
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resident Info Box */}
            <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-indigo-500 font-bold uppercase">Warga / Rumah</p>
                <h4 className="text-xs font-bold text-indigo-950 mt-0.5">
                  {selectedCell.warga.nama}
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-white text-indigo-700 font-mono font-bold text-xs shadow-2xs border border-indigo-200">
                Blok {selectedCell.warga.blok}-{selectedCell.warga.noRumah}
              </span>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              {/* Checklist 3 Komponen Iuran */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wide">
                  Komponen Pembayaran Iuran:
                </p>

                {/* 1. Sampah */}
                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={paySampah}
                      onChange={(e) => setPaySampah(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>1. Iuran Sampah</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Rp</span>
                    <input
                      type="number"
                      disabled={!paySampah}
                      value={nominalSampah}
                      onChange={(e) => setNominalSampah(parseInt(e.target.value, 10) || 0)}
                      className={`w-20 p-1 text-right font-mono font-bold rounded-md border ${
                        paySampah ? 'bg-white border-slate-300' : 'bg-slate-100 text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Keamanan */}
                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={payKeamanan}
                      onChange={(e) => setPayKeamanan(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>2. Iuran Keamanan</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Rp</span>
                    <input
                      type="number"
                      disabled={!payKeamanan}
                      value={nominalKeamanan}
                      onChange={(e) => setNominalKeamanan(parseInt(e.target.value, 10) || 0)}
                      className={`w-20 p-1 text-right font-mono font-bold rounded-md border ${
                        payKeamanan ? 'bg-white border-slate-300' : 'bg-slate-100 text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* 3. Kas RT */}
                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={payKas}
                      onChange={(e) => setPayKas(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>3. Iuran Kas RT</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Rp</span>
                    <input
                      type="number"
                      disabled={!payKas}
                      value={nominalKas}
                      onChange={(e) => setNominalKas(parseInt(e.target.value, 10) || 0)}
                      className={`w-20 p-1 text-right font-mono font-bold rounded-md border ${
                        payKas ? 'bg-white border-slate-300' : 'bg-slate-100 text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Total Bayar Highlight */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-bold">
                  <span className="text-slate-700">Total Nominal Diterima:</span>
                  <span className="text-emerald-600 font-mono text-sm">
                    {formatRupiah(totalModalBayar)}
                  </span>
                </div>
              </div>

              {/* Detail Transaksi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Tanggal Bayar</label>
                  <input
                    type="date"
                    required
                    value={tanggalBayar}
                    onChange={(e) => setTanggalBayar(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Metode Bayar</label>
                  <select
                    value={metode}
                    onChange={(e) => setMetode(e.target.value)}
                    className="w-full mt-1 p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                  >
                    <option value="Tunai">Tunai / Cash</option>
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="Transfer Mandiri">Transfer Mandiri</option>
                    <option value="Transfer BRI">Transfer BRI</option>
                    <option value="QRIS RT">QRIS RT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Catatan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Diterima oleh Bendahara / Diberikan kwitansi"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Menyimpan pembayaran ini otomatis mencatat kas masuk di modul <strong>Buku Kas / Pengeluaran</strong>.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm mt-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan Pembayaran Iuran
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
