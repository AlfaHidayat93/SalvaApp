'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { ProgramKerja } from '@/lib/types';

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProgram: ProgramKerja | null;
  onSaveProgram: (prog: Partial<ProgramKerja>) => Promise<void>;
}

export default function ProgramModal({
  isOpen,
  onClose,
  editingProgram,
  onSaveProgram,
}: ProgramModalProps) {
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [pelaksanaan, setPelaksanaan] = useState('');
  const [panitia, setPanitia] = useState('');
  const [anggaran, setAnggaran] = useState<number>(0);

  useEffect(() => {
    if (editingProgram) {
      setNama(editingProgram.nama || '');
      setDeskripsi(editingProgram.deskripsi || '');
      setPelaksanaan(editingProgram.pelaksanaan || '');
      setPanitia(editingProgram.panitia || '');
      setAnggaran(editingProgram.anggaran || 0);
    } else {
      setNama('');
      setDeskripsi('');
      setPelaksanaan('');
      setPanitia('');
      setAnggaran(0);
    }
  }, [editingProgram, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveProgram({
      id: editingProgram?.id,
      nama,
      deskripsi,
      pelaksanaan,
      panitia,
      anggaran,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            {editingProgram ? 'Edit Program Kerja' : 'Tambah Program Kerja RT'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-600">Nama Program Kerja</label>
            <input
              type="text"
              required
              placeholder="Contoh: Semarak HUT RI ke-81"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600">Deskripsi Kegiatan</label>
            <textarea
              rows={3}
              placeholder="Jelaskan tujuan dan rangkaian kegiatan..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600">Waktu Pelaksanaan</label>
            <input
              type="text"
              placeholder="Contoh: 17 Agustus 2026 / Setiap Minggu Pagi"
              value={pelaksanaan}
              onChange={(e) => setPelaksanaan(e.target.value)}
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600">Panitia / Penanggung Jawab</label>
            <input
              type="text"
              placeholder="Contoh: Pak Eko (Ketua), Sie Sosial"
              value={panitia}
              onChange={(e) => setPanitia(e.target.value)}
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600">Estimasi Anggaran (Rp)</label>
            <input
              type="number"
              min="0"
              value={anggaran || ''}
              placeholder="Contoh: 2500000"
              onChange={(e) => setAnggaran(parseInt(e.target.value, 10) || 0)}
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold focus:bg-white focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition shadow-sm mt-3"
          >
            {editingProgram ? 'Simpan Perubahan' : 'Simpan Program Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}
