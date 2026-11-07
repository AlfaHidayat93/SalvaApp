'use client';

import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageLightboxModal({ imageUrl, onClose }: ImageLightboxModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col items-center"
      >
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <a
            href={imageUrl}
            download="bukti-lampiran.jpg"
            className="p-2 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 transition"
            title="Download Foto"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 transition"
            title="Tutup Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex items-center justify-center max-h-[85vh] overflow-auto w-full">
          <img
            src={imageUrl}
            alt="Foto Lampiran"
            className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
