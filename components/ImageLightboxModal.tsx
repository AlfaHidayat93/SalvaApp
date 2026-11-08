'use client';

import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { formatDriveImageUrl } from '@/lib/api';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageLightboxModal({ imageUrl, onClose }: ImageLightboxModalProps) {
  if (!imageUrl) return null;
  const formattedUrl = formatDriveImageUrl(imageUrl);

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
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800/80 text-white hover:bg-slate-700 transition"
            title="Buka Foto di Tab Baru"
          >
            <ExternalLink className="w-4 h-4" />
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
            src={formattedUrl}
            alt="Foto Lampiran"
            className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
