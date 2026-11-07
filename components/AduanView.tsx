'use client';

import React, { useState, useMemo } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  EyeOff,
  User,
  Image as ImageIcon,
  MessageSquare,
  Send,
  Trash2,
  X,
  Upload,
  Check
} from 'lucide-react';
import { Aduan, StatusAduan } from '@/lib/types';
import { formatDateIndo } from '@/lib/api';

interface AduanViewProps {
  aduanList: Aduan[];
  isAdmin: boolean;
  onKirimAduan: (data: Partial<Aduan>) => Promise<void>;
  onTanggapiAduan: (id: string, status: StatusAduan, tanggapan: string) => Promise<void>;
  onDeleteAduan: (id: string) => Promise<void>;
  onPreviewImage: (url: string) => void;
}

const KATEGORI_ADUAN = [
  'Fasilitas & Lampu',
  'Kebersihan & Sampah',
  'Keamanan Lingkungan',
  'Ketertiban & Kenyamanan',
  'Saran & Masukan Kreatif',
  'Lainnya'
];

export default function AduanView({
  aduanList,
  isAdmin,
  onKirimAduan,
  onTanggapiAduan,
  onDeleteAduan,
  onPreviewImage,
}: AduanViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [modalKirimOpen, setModalKirimOpen] = useState<boolean>(false);
  const [modalResponOpen, setModalResponOpen] = useState<boolean>(false);
  const [selectedAduan, setSelectedAduan] = useState<Aduan | null>(null);

  // Form Buat Aduan
  const [kategori, setKategori] = useState<string>('Fasilitas & Lampu');
  const [judul, setJudul] = useState<string>('');
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [isAnonim, setIsAnonim] = useState<boolean>(false);
  const [namaPengirim, setNamaPengirim] = useState<string>('');
  const [blokRumah, setBlokRumah] = useState<string>('');
  const [kontak, setKontak] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>('');

  // Form Tanggapan RT
  const [statusRespon, setStatusRespon] = useState<StatusAduan>('Diproses');
  const [tanggapanText, setTanggapanText] = useState<string>('');

  const filteredAduan = useMemo(() => {
    if (filterStatus === 'ALL') return aduanList;
    return aduanList.filter((a) => a.status === filterStatus);
  }, [aduanList, filterStatus]);

  const stats = useMemo(() => {
    let menunggu = 0;
    let diproses = 0;
    let selesai = 0;
    aduanList.forEach((a) => {
      if (a.status === 'Menunggu') menunggu++;
      else if (a.status === 'Diproses') diproses++;
      else if (a.status === 'Selesai') selesai++;
    });
    return { menunggu, diproses, selesai, total: aduanList.length };
  }, [aduanList]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKirimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onKirimAduan({
      kategori,
      judul,
      deskripsi,
      isAnonim,
      namaPengirim: isAnonim ? 'Warga Anonim' : namaPengirim,
      blokRumah: isAnonim ? 'Dirahasiakan' : blokRumah,
      kontak: isAnonim ? '-' : kontak,
      fotoUrl,
    });

    // Reset Form
    setJudul('');
    setDeskripsi('');
    setFotoUrl('');
    setNamaPengirim('');
    setBlokRumah('');
    setKontak('');
    setIsAnonim(false);
    setModalKirimOpen(false);
  };

  const openResponModal = (aduan: Aduan) => {
    setSelectedAduan(aduan);
    setStatusRespon(aduan.status === 'Menunggu' ? 'Diproses' : aduan.status);
    setTanggapanText(aduan.tanggapanRT || '');
    setModalResponOpen(true);
  };

  const handleResponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAduan) return;
    await onTanggapiAduan(selectedAduan.id, statusRespon, tanggapanText);
    setModalResponOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* HEADER & CALL TO ACTION */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/10 rounded-full border border-white/10">
            Aspirasi & Transparansi Lingkungan
          </span>
          <h3 className="text-base sm:text-lg font-bold mt-2 flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-indigo-300" />
            Pusat Aduan, Kritik & Saran Warga RT / RW
          </h3>
          <p className="text-xs text-indigo-200 max-w-xl mt-1">
            Sampaikan permasalahan fasilitas, kebersihan, keamanan, atau ide perbaikan lingkungan. Pengirim dapat memilih untuk <strong>anonim</strong> disertai foto bukti.
          </p>
        </div>

        <button
          onClick={() => setModalKirimOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2 shrink-0 border border-indigo-400/40"
        >
          <Plus className="w-4 h-4" /> Tulis Aduan / Saran
        </button>
      </div>

      {/* STATUS TABS & STATS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterStatus === 'ALL'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('Menunggu')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filterStatus === 'Menunggu'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Menunggu ({stats.menunggu})
          </button>
          <button
            onClick={() => setFilterStatus('Diproses')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filterStatus === 'Diproses'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" /> Diproses ({stats.diproses})
          </button>
          <button
            onClick={() => setFilterStatus('Selesai')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filterStatus === 'Selesai'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai ({stats.selesai})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden md:block">
          Aduan dipantau berkala oleh Pengurus RT / RW
        </span>
      </div>

      {/* LIST OF COMPLAINTS / CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAduan.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700">Tidak ada aduan / saran dalam kategori ini</h4>
            <p className="text-xs text-slate-400 mt-1">
              Warga dapat menyampaikan permasalahan fasilitas atau saran melalui tombol di atas.
            </p>
          </div>
        ) : (
          filteredAduan.map((aduan) => {
            const isAnon = aduan.isAnonim;
            return (
              <div
                key={aduan.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-indigo-200 transition"
              >
                <div className="space-y-3">
                  {/* Top Bar: Kategori & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-md">
                      {aduan.kategori || 'Umum'}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        aduan.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : aduan.status === 'Diproses'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {aduan.status === 'Selesai' && <CheckCircle2 className="w-3 h-3" />}
                      {aduan.status === 'Diproses' && <AlertCircle className="w-3 h-3" />}
                      {aduan.status === 'Menunggu' && <Clock className="w-3 h-3" />}
                      {aduan.status}
                    </span>
                  </div>

                  {/* Judul & Tanggal */}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                      {aduan.judul}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDateIndo(aduan.tanggal)}
                    </p>
                  </div>

                  {/* Isi Deskripsi */}
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    {aduan.deskripsi}
                  </p>

                  {/* Foto Lampiran (Jika Ada) */}
                  {aduan.fotoUrl && (
                    <div className="pt-1">
                      <p className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Foto Bukti / Kondisi:
                      </p>
                      <img
                        src={aduan.fotoUrl}
                        alt="Bukti Aduan"
                        onClick={() => onPreviewImage(aduan.fotoUrl!)}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition shadow-2xs"
                      />
                    </div>
                  )}

                  {/* Pengirim Info */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    {isAnon ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        Warga Anonim (Identitas Dirahasiakan)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        {aduan.namaPengirim}{' '}
                        {aduan.blokRumah && aduan.blokRumah !== '-' && (
                          <span className="text-slate-400 font-normal">({aduan.blokRumah})</span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Tanggapan Pengurus RT (Jika Ada) */}
                  {aduan.tanggapanRT && (
                    <div className="mt-3 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/80 text-xs">
                      <div className="flex items-center justify-between text-emerald-800 font-bold mb-1">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" /> Tanggapan Pengurus RT:
                        </span>
                        {aduan.tanggalSelesai && (
                          <span className="text-[10px] text-emerald-600 font-normal">
                            Selesai: {formatDateIndo(aduan.tanggalSelesai)}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {aduan.tanggapanRT}
                      </p>
                    </div>
                  )}
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => openResponModal(aduan)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold rounded-lg transition border border-indigo-200"
                    >
                      Tindak Lanjuti / Beri Respon
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Hapus aduan ini?')) {
                          onDeleteAduan(aduan.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Aduan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL TULIS ADUAN / SARAN WARGA */}
      {modalKirimOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  Form Aduan & Saran Warga
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aspirasi Anda akan langsung diterima oleh jajaran pengurus RT/RW
                </p>
              </div>
              <button
                onClick={() => setModalKirimOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleKirimSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Kategori Aduan / Saran</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium focus:bg-white focus:outline-hidden"
                >
                  {KATEGORI_ADUAN.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Judul Permasalahan / Usulan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lampu Gang B Padam / Usulan Tempat Sampah Terpilah"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Uraian / Deskripsi Lengkap</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan secara detail permasalahan, lokasi titik kejadian, atau usulan saran perbaikan..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Upload Foto Lampiran */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Foto Bukti / Kondisi (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-2 transition font-medium">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Unggah Foto Bukti
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {fotoUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={fotoUrl}
                        alt="Preview Foto"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setFotoUrl('')}
                        className="text-rose-500 hover:text-rose-700 text-[11px]"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Opsi Anonim Checkbox */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={isAnonim}
                    onChange={(e) => setIsAnonim(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Kirim secara Anonim (Rahasiakan identitas saya dari publik)</span>
                </label>

                {!isAnonim ? (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-semibold text-slate-600">Nama Anda</label>
                        <input
                          type="text"
                          required={!isAnonim}
                          placeholder="Nama Lengkap"
                          value={namaPengirim}
                          onChange={(e) => setNamaPengirim(e.target.value)}
                          className="w-full mt-1 p-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600">Blok & No Rumah</label>
                        <input
                          type="text"
                          required={!isAnonim}
                          placeholder="Contoh: Blok A No. 05"
                          value={blokRumah}
                          onChange={(e) => setBlokRumah(e.target.value)}
                          className="w-full mt-1 p-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600">No. WhatsApp (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Untuk dihubungi pengurus saat tindak lanjut"
                        value={kontak}
                        onChange={(e) => setKontak(e.target.value)}
                        className="w-full mt-1 p-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">
                    Nama dan nomor rumah Anda tidak akan ditampilkan di papan aduan umum warga.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm mt-3 flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Kirim Aduan / Saran Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TINDAK LANJUT & TANGGAPAN RT (ADMIN ONLY) */}
      {modalResponOpen && selectedAduan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Tindak Lanjut & Respon Pengurus
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedAduan.judul}</p>
              </div>
              <button
                onClick={() => setModalResponOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResponSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Update Status Penanganan</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setStatusRespon('Menunggu')}
                    className={`p-2 rounded-lg border font-bold text-center transition ${
                      statusRespon === 'Menunggu'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    Menunggu
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusRespon('Diproses')}
                    className={`p-2 rounded-lg border font-bold text-center transition ${
                      statusRespon === 'Diproses'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    Diproses
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusRespon('Selesai')}
                    className={`p-2 rounded-lg border font-bold text-center transition ${
                      statusRespon === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    Selesai
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Tanggapan / Catatan Tindak Lanjut RT</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan keterangan perbaikan, solusi, atau tindakan yang telah diambil oleh pengurus..."
                  value={tanggapanText}
                  onChange={(e) => setTanggapanText(e.target.value)}
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm mt-3"
              >
                Simpan Tanggapan Pengurus RT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
