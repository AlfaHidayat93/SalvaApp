'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await onLogin(username, password);
      if (res.success) {
        setUsername('');
        setPassword('');
        onClose();
      } else {
        setError(res.message || 'Username atau Password salah!');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Login Pengurus RT / RW
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-600">Username</label>
            <input
              type="text"
              required
              placeholder="Contoh: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>

          {error && (
            <p className="text-rose-600 text-[11px] font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          <p className="text-[11px] text-slate-400">
            Default credentials: <code className="text-indigo-600 font-mono">admin</code> / <code className="text-indigo-600 font-mono">admin123</code>
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl transition shadow-sm mt-2 flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            {isLoading ? 'Memverifikasi...' : 'Masuk Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
}
