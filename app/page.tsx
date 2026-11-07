'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DashboardView from '@/components/DashboardView';
import WargaView from '@/components/WargaView';
import IuranView from '@/components/IuranView';
import PengeluaranView from '@/components/PengeluaranView';
import AduanView from '@/components/AduanView';
import LoginModal from '@/components/LoginModal';
import ProgramModal from '@/components/ProgramModal';
import ImageLightboxModal from '@/components/ImageLightboxModal';

import {
  Warga,
  IuranMatrixRow,
  Pengeluaran,
  Aduan,
  ProgramKerja,
  DashboardSummary,
  StatusAduan
} from '@/lib/types';
import {
  apiGet,
  apiPost,
  DEFAULT_GAS_URL,
  localDB
} from '@/lib/api';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Core Data States
  const [summary, setSummary] = useState<DashboardSummary>({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldoKas: 0,
    totalWarga: 0,
    totalJiwa: 0,
    tetapCount: 0,
    kontrakCount: 0,
    aduanAktif: 0,
  });
  const [programs, setPrograms] = useState<ProgramKerja[]>([]);
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [optionsBlok, setOptionsBlok] = useState<string[]>([]);
  const [iuranMatrix, setIuranMatrix] = useState<IuranMatrixRow[]>([]);
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([]);
  const [aduanList, setAduanList] = useState<Aduan[]>([]);

  // Filter States
  const [selectedTahun, setSelectedTahun] = useState<number>(2026);
  const [selectedBlokIuran, setSelectedBlokIuran] = useState<string>('ALL');

  // Modals
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [programModalOpen, setProgramModalOpen] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<ProgramKerja | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check saved session & local mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Pre-initialize localDB so demo data is ready as fallback
      localDB.init();

      const savedAdmin = sessionStorage.getItem('rtrw_admin');
      if (savedAdmin === 'true') setIsAdmin(true);

      const savedMode = localStorage.getItem('rtrw_force_local');
      if (savedMode === 'true') setIsLocalMode(true);
    }
  }, []);

  const toggleLocalMode = () => {
    const next = !isLocalMode;
    setIsLocalMode(next);
    localStorage.setItem('rtrw_force_local', String(next));
    showToast(
      next
        ? 'Beralih ke Mode Demo Lokal (LocalStorage)'
        : 'Beralih ke Mode Google Sheets (Cloud API)',
      'success'
    );
  };

  // -------------------------------------------------------------
  // DATA LOADERS
  // -------------------------------------------------------------
  const loadDashboardData = useCallback(async () => {
    try {
      const res = await apiGet('getDashboardData', {}, DEFAULT_GAS_URL, isLocalMode);
      if (res.summary) setSummary(res.summary);
      if (res.programs) setPrograms(res.programs);
    } catch (e) {
      console.error(e);
    }
  }, [isLocalMode]);

  const loadWargaData = useCallback(async () => {
    try {
      const res = await apiGet('getWargaData', { blok: 'ALL' }, DEFAULT_GAS_URL, isLocalMode);
      if (res.list) setWargaList(res.list);
      if (res.optionsBlok) setOptionsBlok(res.optionsBlok);
    } catch (e) {
      console.error(e);
    }
  }, [isLocalMode]);

  const loadIuranMatrixData = useCallback(async () => {
    try {
      const res = await apiGet(
        'getIuranMatrixData',
        { tahun: selectedTahun, blok: selectedBlokIuran },
        DEFAULT_GAS_URL,
        isLocalMode
      );
      if (res.matrix) setIuranMatrix(res.matrix);
      if (res.optionsBlok) setOptionsBlok(res.optionsBlok);
    } catch (e) {
      console.error(e);
    }
  }, [selectedTahun, selectedBlokIuran, isLocalMode]);

  const loadPengeluaranData = useCallback(async () => {
    try {
      const res = await apiGet('getPengeluaranData', {}, DEFAULT_GAS_URL, isLocalMode);
      if (Array.isArray(res)) setPengeluaranList(res);
    } catch (e) {
      console.error(e);
    }
  }, [isLocalMode]);

  const loadAduanData = useCallback(async () => {
    try {
      const res = await apiGet('getAduanData', {}, DEFAULT_GAS_URL, isLocalMode);
      if (Array.isArray(res)) setAduanList(res);
    } catch (e) {
      console.error(e);
    }
  }, [isLocalMode]);

  // Load appropriate data when tab or mode changes
  useEffect(() => {
    loadDashboardData();
    if (currentTab === 'warga') loadWargaData();
    if (currentTab === 'iuran') loadIuranMatrixData();
    if (currentTab === 'pengeluaran') loadPengeluaranData();
    if (currentTab === 'aduan') loadAduanData();
  }, [currentTab, isLocalMode, loadDashboardData, loadWargaData, loadIuranMatrixData, loadPengeluaranData, loadAduanData]);

  // -------------------------------------------------------------
  // ACTIONS HANDLERS
  // -------------------------------------------------------------
  const handleLogin = async (username: string, pass: string) => {
    const res = await apiPost('checkLogin', { username, password: pass }, DEFAULT_GAS_URL, isLocalMode);
    if (res.success) {
      setIsAdmin(true);
      sessionStorage.setItem('rtrw_admin', 'true');
      showToast('Login berhasil sebagai Pengurus Batujai Salva Residence!');
      return { success: true };
    }
    return { success: false, message: res.message || 'Username atau password salah!' };
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('rtrw_admin');
    showToast('Berhasil logout dari mode admin.');
  };

  // Warga CRUD
  const handleSaveWarga = async (data: Partial<Warga>) => {
    setIsLoading(true);
    try {
      const res = await apiPost('simpanWarga', { data }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Data warga berhasil disimpan!');
        await loadWargaData();
        await loadDashboardData();
        await loadIuranMatrixData();
      } else {
        showToast(res.message || 'Gagal menyimpan warga.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWarga = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await apiPost('hapusWarga', { id }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Data warga berhasil dihapus!');
        await loadWargaData();
        await loadDashboardData();
        await loadIuranMatrixData();
      } else {
        showToast(res.message || 'Gagal menghapus warga.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Iuran CRUD
  const handleSaveIuran = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await apiPost('simpanIuranBulanan', { data }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Iuran berhasil disimpan!');
        await loadIuranMatrixData();
        await loadPengeluaranData();
        await loadDashboardData();
      } else {
        showToast(res.message || 'Gagal menyimpan iuran.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Pengeluaran CRUD
  const handleSavePengeluaran = async (data: Partial<Pengeluaran>) => {
    setIsLoading(true);
    try {
      const res = await apiPost('simpanPengeluaran', { data }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Transaksi kas berhasil disimpan!');
        await loadPengeluaranData();
        await loadDashboardData();
      } else {
        showToast(res.message || 'Gagal menyimpan transaksi.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePengeluaran = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await apiPost('hapusPengeluaran', { id }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Transaksi berhasil dihapus!');
        await loadPengeluaranData();
        await loadDashboardData();
      } else {
        showToast(res.message || 'Gagal menghapus transaksi.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Aduan CRUD
  const handleKirimAduan = async (data: Partial<Aduan>) => {
    setIsLoading(true);
    try {
      const res = await apiPost('kirimAduan', { data }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Aduan/saran berhasil dikirim!');
        await loadAduanData();
        await loadDashboardData();
      } else {
        showToast(res.message || 'Gagal mengirim aduan.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTanggapiAduan = async (id: string, status: StatusAduan, tanggapan: string) => {
    setIsLoading(true);
    try {
      const res = await apiPost('tanggapiAduan', { id, status, tanggapan }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Tanggapan pengurus berhasil disimpan!');
        await loadAduanData();
        await loadDashboardData();
      } else {
        showToast(res.message || 'Gagal menyimpan tanggapan.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAduan = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await apiPost('hapusAduan', { id }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Aduan berhasil dihapus!');
        await loadAduanData();
        await loadDashboardData();
      } else {
        showToast(res.message || 'Gagal menghapus aduan.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Program CRUD
  const handleSaveProgram = async (data: Partial<ProgramKerja>) => {
    setIsLoading(true);
    try {
      const res = await apiPost('simpanProgram', { data }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Program berhasil disimpan!');
        await loadDashboardData();
      } else {
        showToast(res.message || 'Gagal menyimpan program.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus program ini?')) return;
    setIsLoading(true);
    try {
      const res = await apiPost('hapusProgram', { id }, DEFAULT_GAS_URL, isLocalMode);
      if (res.success) {
        showToast(res.message || 'Program berhasil dihapus!');
        await loadDashboardData();
      } else {
        showToast(res.message || 'Gagal menghapus program.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-bounce transition-all ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        isAdmin={isAdmin}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        isLocalMode={isLocalMode}
        toggleLocalMode={toggleLocalMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          isLocalMode={isLocalMode}
          toggleLocalMode={toggleLocalMode}
          isAdmin={isAdmin}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {currentTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              programs={programs}
              isAdmin={isAdmin}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenAddProgram={() => {
                setEditingProgram(null);
                setProgramModalOpen(true);
              }}
              onOpenEditProgram={(prog) => {
                setEditingProgram(prog);
                setProgramModalOpen(true);
              }}
              onDeleteProgram={handleDeleteProgram}
            />
          )}

          {currentTab === 'warga' && (
            <WargaView
              wargaList={wargaList}
              optionsBlok={optionsBlok}
              isAdmin={isAdmin}
              onSaveWarga={handleSaveWarga}
              onDeleteWarga={handleDeleteWarga}
            />
          )}

          {currentTab === 'iuran' && (
            <IuranView
              matrixData={iuranMatrix}
              optionsBlok={optionsBlok}
              selectedTahun={selectedTahun}
              setSelectedTahun={setSelectedTahun}
              selectedBlok={selectedBlokIuran}
              setSelectedBlok={setSelectedBlokIuran}
              isAdmin={isAdmin}
              onSaveIuran={handleSaveIuran}
            />
          )}

          {currentTab === 'pengeluaran' && (
            <PengeluaranView
              pengeluaranList={pengeluaranList}
              isAdmin={isAdmin}
              onSavePengeluaran={handleSavePengeluaran}
              onDeletePengeluaran={handleDeletePengeluaran}
              onPreviewImage={(url) => setLightboxImageUrl(url)}
            />
          )}

          {currentTab === 'aduan' && (
            <AduanView
              aduanList={aduanList}
              isAdmin={isAdmin}
              onKirimAduan={handleKirimAduan}
              onTanggapiAduan={handleTanggapiAduan}
              onDeleteAduan={handleDeleteAduan}
              onPreviewImage={(url) => setLightboxImageUrl(url)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <ProgramModal
        isOpen={programModalOpen}
        onClose={() => setProgramModalOpen(false)}
        editingProgram={editingProgram}
        onSaveProgram={handleSaveProgram}
      />

      <ImageLightboxModal
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxImageUrl(null)}
      />
    </div>
  );
}
