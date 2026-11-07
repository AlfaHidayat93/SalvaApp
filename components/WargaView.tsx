'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  Home,
  UserCheck,
  Edit2,
  Trash2,
  Filter,
  X
} from 'lucide-react';
import { Warga, StatusHunian } from '@/lib/types';

interface WargaViewProps {
  wargaList: Warga[];
  optionsBlok: string[];
  isAdmin: boolean;
  onSaveWarga: (warga: Partial<Warga>) => Promise<void>;
  onDeleteWarga: (id: string) => Promise<void>;
}

export default function WargaView({
  wargaList,
  optionsBlok,
  isAdmin,
  onSaveWarga,
  onDeleteWarga,
}: WargaViewProps) {
  const [selectedBlok, setSelectedBlok] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    blok: string;
    noRumah: string;
    nama: string;
    nik: string;
    noHp: string;
    statusTinggal: StatusHunian;
    jumlahAnggota: number;
    keterangan: string;
  }>({
    blok: 'A',
    noRumah: '',
    nama: '',
    nik: '',
    noHp: '',
    statusTinggal: 'Tetap',
    jumlahAnggota: 1,
    keterangan: '',
  });

  const filteredWarga = useMemo(() => {
    return wargaList.filter((w) => {
      const matchBlok =
        selectedBlok === 'ALL' ||
        w.blok.toUpperCase() === selectedBlok.toUpperCase();
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        w.nama.toLowerCase().includes(q) ||
        w.noRumah.toLowerCase().includes(q) ||
        (w.noHp && w.noHp.includes(q)) ||
        (w.keterangan && w.keterangan.toLowerCase().includes(q));

      return matchBlok && matchSearch;
    });
  }, [wargaList, selectedBlok, searchQuery]);

  const stats = useMemo(() => {
    let tetap = 0;
    let kontrak = 0;
    let totalJiwa = 0;
    filteredWarga.forEach((w) => {
      totalJiwa += Number(w.jumlahAnggota) || 1;
      if (w.statusTinggal === 'Tetap') tetap++;
      else kontrak++;
    });
    return {
      totalKK: filteredWarga.length,
      totalJiwa,
      tetap,
      kontrak,
    };
  }, [filteredWarga]);

  const openAddModal = () => {
    setEditingWarga(null);
    setFormData({
      blok: selectedBlok !== 'ALL' ? selectedBlok : 'A',
      noRumah: '',
      nama: '',
      nik: '',
      noHp: '',
      statusTinggal: 'Tetap',
      jumlahAnggota: 3,
      keterangan: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (warga: Warga) => {
    setEditingWarga(warga);
    setFormData({
      blok: warga.blok,
      noRumah: warga.noRumah,
      nama: warga.nama,
      nik: warga.nik || '',
      noHp: warga.noHp || '',
      statusTinggal: warga.statusTinggal || 'Tetap',
      jumlahAnggota: warga.jumlahAnggota || 1,
      keterangan: warga.keterangan || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveWarga({
      id: editingWarga?.id,
      ...formData,
    });
    setModalOpen(false);
  };

  // Helper untuk format WhatsApp
  const getWhatsAppLink = (phone: string) => {
    if (!phone || phone === '-') return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="space-y-5">
      {/* HEADER & FILTER BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Daftar Warga & Penghuni per Blok
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendataan warga, status kependudukan, dan kontak kepala keluarga
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Warga
            </button>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Filter Blok */}
        <div className="sm:col-span-4 lg:col-span-3">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={selectedBlok}
              onChange={(e) => setSelectedBlok(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 shadow-xs appearance-none"
            >
              <option value="ALL">Semua Blok (Semua Wilayah)</option>
              {optionsBlok.map((b) => (
                <option key={b} value={b}>
                  Blok {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="sm:col-span-8 lg:col-span-9">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama warga, nomor rumah, atau nomor HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MINI STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-medium text-slate-400">Total KK (Rumah)</p>
          <h4 className="text-base font-bold text-slate-800 mt-0.5">{stats.totalKK} KK</h4>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-medium text-slate-400">Total Jiwa Terdata</p>
          <h4 className="text-base font-bold text-indigo-600 mt-0.5">{stats.totalJiwa} Jiwa</h4>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-medium text-slate-400">Warga Tetap</p>
          <h4 className="text-base font-bold text-emerald-600 mt-0.5">{stats.tetap} Rumah</h4>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
          <p className="text-[11px] font-medium text-slate-400">Warga Kontrak / Kost</p>
          <h4 className="text-base font-bold text-amber-600 mt-0.5">{stats.kontrak} Rumah</h4>
        </div>
      </div>

      {/* TABEL WARGA */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
            <thead className="bg-slate-800 text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Blok & Rumah</th>
                <th className="py-3 px-4">Nama Kepala Keluarga</th>
                <th className="py-3 px-4">Kontak / WhatsApp</th>
                <th className="py-3 px-4 text-center">Status Tinggal</th>
                <th className="py-3 px-4 text-center">Jumlah Jiwa</th>
                <th className="py-3 px-4">Keterangan</th>
                {isAdmin && <th className="py-3 px-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWarga.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada data warga yang cocok dengan pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredWarga.map((warga) => {
                  const waLink = getWhatsAppLink(warga.noHp || '');
                  return (
                    <tr key={warga.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs border border-indigo-200/60 inline-flex items-center gap-1">
                          <Home className="w-3 h-3 text-indigo-500" />
                          Blok {warga.blok} No. {warga.noRumah}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div>{warga.nama}</div>
                        {warga.nik && warga.nik !== '-' && (
                          <div className="text-[10px] text-slate-400 font-mono">NIK: {warga.nik}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 hover:bg-emerald-100 transition"
                            title="Chat via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            {warga.noHp}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            warga.statusTinggal === 'Tetap'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : warga.statusTinggal === 'Kontrak' || warga.statusTinggal === 'Kost'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {warga.statusTinggal}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {warga.jumlahAnggota || 1} Jiwa
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[180px] truncate">
                        {warga.keterangan || '-'}
                      </td>

                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(warga)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Data Warga"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus data warga ${warga.nama}?`)) {
                                  onDeleteWarga(warga.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Data Warga"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT WARGA */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                {editingWarga ? 'Edit Data Warga' : 'Tambah Warga Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Blok</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: A"
                    value={formData.blok}
                    onChange={(e) => setFormData({ ...formData, blok: e.target.value.toUpperCase() })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 uppercase font-bold focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Nomor Rumah</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 01"
                    value={formData.noRumah}
                    onChange={(e) => setFormData({ ...formData, noRumah: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Nama Kepala Keluarga / Penghuni</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600">Jumlah Jiwa / Anggota</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.jumlahAnggota}
                    onChange={(e) => setFormData({ ...formData, jumlahAnggota: parseInt(e.target.value, 10) || 1 })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600">Status Hunian</label>
                  <select
                    value={formData.statusTinggal}
                    onChange={(e) => setFormData({ ...formData, statusTinggal: e.target.value as StatusHunian })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Tetap">Warga Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Kost">Kost</option>
                    <option value="Kosong">Rumah Kosong</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-600">NIK (Opsional)</label>
                  <input
                    type="text"
                    placeholder="16 digit NIK"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600">Catatan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Sie Keamanan / Masa kontrak s.d 2026"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm mt-3"
              >
                {editingWarga ? 'Simpan Perubahan Warga' : 'Tambahkan Data Warga'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
