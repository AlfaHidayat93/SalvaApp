'use client';

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  Edit2,
  Trash2,
  X,
  Upload
} from 'lucide-react';
import { Pengeluaran } from '@/lib/types';
import { formatRupiah, formatDateIndo, parseNumber } from '@/lib/api';

interface PengeluaranViewProps {
  pengeluaranList: Pengeluaran[];
  isAdmin: boolean;
  onSavePengeluaran: (data: Partial<Pengeluaran>) => Promise<void>;
  onDeletePengeluaran: (id: string) => Promise<void>;
  onPreviewImage: (url: string) => void;
}

const KATEGORI_OPTIONS = [
  'Kebersihan & Sampah',
  'Keamanan & Ronda',
  'Fasilitas & Lampu',
  'Acara & Sosial',
  'Operasional Lingkungan',
  'Iuran Warga',
  'Lainnya'
];

export default function PengeluaranView({
  pengeluaranList,
  isAdmin,
  onSavePengeluaran,
  onDeletePengeluaran,
  onPreviewImage,
}: PengeluaranViewProps) {
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Pengeluaran | null>(null);

  // Form states
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori] = useState<string>('Operasional Lingkungan');
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [jenisTransaksi, setJenisTransaksi] = useState<'kredit' | 'debet'>('kredit'); // Default pengeluaran
  const [nominal, setNominal] = useState<number>(0);
  const [bukti, setBukti] = useState<string>('');

  const filteredList = useMemo(() => {
    return pengeluaranList.filter((item) => {
      const matchKategori =
        selectedKategori === 'ALL' || item.kategori === selectedKategori;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.deskripsi.toLowerCase().includes(q) ||
        (item.kategori && item.kategori.toLowerCase().includes(q));

      return matchKategori && matchSearch;
    });
  }, [pengeluaranList, selectedKategori, searchQuery]);

  // Statistik Kas
  const stats = useMemo(() => {
    let debet = 0;
    let kredit = 0;
    pengeluaranList.forEach((p) => {
      debet += Number(p.debet) || 0;
      kredit += Number(p.kredit) || 0;
    });
    return {
      totalDebet: debet,
      totalKredit: kredit,
      saldoKas: debet - kredit,
    };
  }, [pengeluaranList]);

  const openAddModal = () => {
    setEditingItem(null);
    setTanggal(new Date().toISOString().split('T')[0]);
    setKategori('Operasional Lingkungan');
    setDeskripsi('');
    setJenisTransaksi('kredit');
    setNominal(0);
    setBukti('');
    setModalOpen(true);
  };

  const openEditModal = (item: Pengeluaran) => {
    setEditingItem(item);
    setTanggal(item.tanggal || new Date().toISOString().split('T')[0]);
    setKategori(item.kategori || 'Operasional Lingkungan');
    setDeskripsi(item.deskripsi || '');
    if (item.debet > 0) {
      setJenisTransaksi('debet');
      setNominal(item.debet);
    } else {
      setJenisTransaksi('kredit');
      setNominal(item.kredit);
    }
    setBukti(item.bukti || '');
    setModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const raw = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setBukti(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            setBukti(raw);
          }
        };
        img.src = raw;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSavePengeluaran({
      id: editingItem?.id,
      tanggal,
      kategori,
      deskripsi,
      debet: jenisTransaksi === 'debet' ? nominal : 0,
      kredit: jenisTransaksi === 'kredit' ? nominal : 0,
      bukti,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* HEADER & ACTIONS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Buku Kas Umum & Pengeluaran Lingkungan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan kas masuk dan kas keluar dengan saldo berjalan secara transparan
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Catat Transaksi Kas
          </button>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Kas Masuk (Debet)</p>
          <h4 className="text-lg font-black text-emerald-600 mt-1">
            {formatRupiah(stats.totalDebet)}
          </h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Kas Keluar (Kredit)</p>
          <h4 className="text-lg font-black text-rose-600 mt-1">
            {formatRupiah(stats.totalKredit)}
          </h4>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Saldo Kas Saat Ini</p>
          <h4 className="text-lg font-black text-indigo-600 mt-1">
            {formatRupiah(stats.saldoKas)}
          </h4>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Kategori */}
        <div className="sm:col-span-5 lg:col-span-4">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 shadow-xs appearance-none"
            >
              <option value="ALL">Semua Kategori Transaksi</option>
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="sm:col-span-7 lg:col-span-8">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari keterangan transaksi atau pengeluaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* TABEL BUKU KAS */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[750px]">
            <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3.5 w-28">Tanggal</th>
                <th className="py-3 px-3 w-32">Kategori</th>
                <th className="py-3 px-4">Keterangan Transaksi</th>
                <th className="py-3 px-3 text-right text-emerald-300">Masuk (Debet)</th>
                <th className="py-3 px-3 text-right text-rose-300">Keluar (Kredit)</th>
                <th className="py-3 px-3.5 text-right">Saldo Kas</th>
                <th className="py-3 px-3 text-center w-16">Bukti</th>
                {isAdmin && <th className="py-3 px-3 text-center w-20">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada transaksi kas yang tercatat.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3.5 font-mono text-slate-600 font-medium">
                      {formatDateIndo(item.tanggal)}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {item.kategori || 'Umum'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.deskripsi}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                      {item.debet > 0 ? formatRupiah(item.debet) : '-'}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                      {item.kredit > 0 ? formatRupiah(item.kredit) : '-'}
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-indigo-700">
                      {item.saldo !== undefined ? formatRupiah(item.saldo) : '-'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {item.bukti ? (
                        <button
                          onClick={() => onPreviewImage(item.bukti!)}
                          className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                          title="Lihat Bukti Kwitansi / Struk"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus transaksi "${item.deskripsi}"?`)) {
                                onDeletePengeluaran(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CATAT / EDIT TRANSAKSI KAS */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Wallet className="w-4 h-4 text-rose-600" />
                {editingItem ? 'Edit Transaksi Kas' : 'Catat Transaksi Kas'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Jenis Transaksi (Masuk / Keluar) */}
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenisTransaksi('kredit')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      jenisTransaksi === 'kredit'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-600" />
                    Kas Keluar (Kredit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisTransaksi('debet')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      jenisTransaksi === 'debet'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    Kas Masuk (Debet)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                  >
                    {KATEGORI_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Honor Petugas Pengangkut Sampah"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={nominal || ''}
                  placeholder="Contoh: 500000"
                  onChange={(e) => setNominal(parseInt(e.target.value, 10) || 0)}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-sm focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Upload Foto Bukti / Kwitansi */}
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Foto Nota / Kwitansi (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 transition font-medium">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    Pilih File Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {bukti && (
                    <div className="flex items-center gap-2">
                      <img
                        src={bukti}
                        alt="Preview Bukti"
                        className="w-9 h-9 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setBukti('')}
                        className="text-rose-500 hover:text-rose-700 text-[11px]"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full font-semibold py-2.5 rounded-xl transition shadow-sm mt-3 text-white ${
                  jenisTransaksi === 'debet'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {editingItem ? 'Simpan Perubahan Transaksi' : 'Simpan Transaksi Kas'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
