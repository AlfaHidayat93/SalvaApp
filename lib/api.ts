import { Warga, IuranMatrixRow, IuranMonthDetail, Pengeluaran, Aduan, ProgramKerja, DashboardSummary } from './types';

export const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbwTpr9pUYiODf0udf3F6lxtoIvjeBxGLxCVNqA_avRIBmV1fm2Dr-CD2mvWqBG5fVQ_og/exec";
export const DRIVE_FOLDER_ID = "1gJaS_ZvzyFrE2gTOfEX6Y2Dd48OO4L8H";

export function formatRupiah(num: number): string {
  const val = Math.round(Number(num) || 0);
  return `Rp ${val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr || dateStr === "-") return "-";
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  } catch (e) {}
  return dateStr;
}

export function parseNumber(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = String(val).trim().replace(/[^\d,\.-]/g, '');
  if (str.indexOf('.') !== -1 && str.indexOf(',') !== -1) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.indexOf(',') !== -1) {
    str = str.replace(',', '.');
  } else if (str.indexOf('.') !== -1) {
    const parts = str.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/\./g, '');
    }
  }
  return Number(str) || 0;
}

// -------------------------------------------------------------------------
// LOCAL STORAGE MOCK DATABASE (DEMO MODE & OFFLINE RESILIENCE)
// -------------------------------------------------------------------------
export const localDB = {
  init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem('rtrw_warga')) {
      const initialWarga: Warga[] = [
        { id: "WRG-1", blok: "A", noRumah: "01", nama: "Ronanda Pradana", nik: "3275012304910001", noHp: "081234567801", statusTinggal: "Tetap", jumlahAnggota: 4, keterangan: "Kepala Keluarga / Blok A" },
        { id: "WRG-2", blok: "A", noRumah: "02", nama: "Tohri Junaidi", nik: "3275012304910002", noHp: "081234567802", statusTinggal: "Tetap", jumlahAnggota: 3, keterangan: "-" },
        { id: "WRG-3", blok: "A", noRumah: "05", nama: "Miq Prabu", nik: "3275012304910003", noHp: "081234567803", statusTinggal: "Tetap", jumlahAnggota: 5, keterangan: "Sie Keamanan" },
        { id: "WRG-4", blok: "A", noRumah: "09", nama: "Arif Setiawan", nik: "3275012304910004", noHp: "081234567804", statusTinggal: "Kontrak", jumlahAnggota: 2, keterangan: "Kontrak s/d Des 2026" },
        { id: "WRG-5", blok: "B", noRumah: "01", nama: "Ical Firmansyah", nik: "3275012304910005", noHp: "081234567805", statusTinggal: "Tetap", jumlahAnggota: 4, keterangan: "-" },
        { id: "WRG-6", blok: "B", noRumah: "02", nama: "Pak Surya", nik: "3275012304910006", noHp: "081234567806", statusTinggal: "Tetap", jumlahAnggota: 3, keterangan: "Penasehat Lingkungan" },
        { id: "WRG-7", blok: "B", noRumah: "06", nama: "Mas Fadil", nik: "3275012304910007", noHp: "081234567807", statusTinggal: "Tetap", jumlahAnggota: 2, keterangan: "-" },
        { id: "WRG-8", blok: "C", noRumah: "03", nama: "Ikrom Hidayat", nik: "3275012304910008", noHp: "081234567808", statusTinggal: "Tetap", jumlahAnggota: 4, keterangan: "-" },
        { id: "WRG-9", blok: "C", noRumah: "07", nama: "Bayu Pratama", nik: "3275012304910009", noHp: "081234567809", statusTinggal: "Kontrak", jumlahAnggota: 3, keterangan: "-" },
        { id: "WRG-10", blok: "D", noRumah: "04", nama: "Azril Hakim", nik: "3275012304910010", noHp: "081234567810", statusTinggal: "Tetap", jumlahAnggota: 4, keterangan: "-" },
        { id: "WRG-11", blok: "E", noRumah: "01", nama: "Sukma Wijaya", nik: "3275012304910011", noHp: "081234567811", statusTinggal: "Tetap", jumlahAnggota: 5, keterangan: "Sie Kebersihan" },
        { id: "WRG-12", blok: "H", noRumah: "07", nama: "Amiril Mukminin", nik: "3275012304910012", noHp: "081234567812", statusTinggal: "Tetap", jumlahAnggota: 4, keterangan: "-" }
      ];
      localStorage.setItem('rtrw_warga', JSON.stringify(initialWarga));
    }

    if (!localStorage.getItem('rtrw_iuran')) {
      const initialIuran: any[] = [];
      const currentYear = 2026;
      // Berikan data iuran bulan 1 s/d 8 untuk warga contoh
      const wargaList: Warga[] = JSON.parse(localStorage.getItem('rtrw_warga') || '[]');
      wargaList.forEach((w, wIdx) => {
        for (let m = 1; m <= 8; m++) {
          // Buat variasi lunas & belum lunas
          const isPaid = (wIdx + m) % 5 !== 0;
          if (isPaid) {
            initialIuran.push({
              id: `IUR-${w.id}-${currentYear}-${m}`,
              tahun: currentYear,
              bulan: m,
              wargaId: w.id,
              blok: w.blok,
              noRumah: w.noRumah,
              nama: w.nama,
              sampahNominal: 20000,
              sampahStatus: "Lunas",
              keamananNominal: 30000,
              keamananStatus: "Lunas",
              kasNominal: 25000,
              kasStatus: "Lunas",
              totalBayar: 75000,
              tanggalBayar: `${currentYear}-0${m}-05`,
              metode: m % 2 === 0 ? "Transfer Bank" : "Tunai",
              catatan: `Iuran Bulan ${m}/${currentYear}`
            });
          }
        }
      });
      localStorage.setItem('rtrw_iuran', JSON.stringify(initialIuran));
    }

    if (!localStorage.getItem('rtrw_pengeluaran')) {
      const initialPengeluaran: Pengeluaran[] = [
        { id: "OUT-1", tanggal: "2026-08-01", kategori: "Saldo Awal", deskripsi: "Saldo Awal Kas Batujai Salva Residence", debet: 2500000, kredit: 0 },
        { id: "OUT-2", tanggal: "2026-08-04", kategori: "Kebersihan & Sampah", deskripsi: "Honor Petugas Pengangkut Sampah Bulan Agustus", debet: 0, kredit: 800000 },
        { id: "OUT-3", tanggal: "2026-08-06", kategori: "Keamanan & Ronda", deskripsi: "Insentif Pos Jaga & Siskamling Malam", debet: 0, kredit: 600000 },
        { id: "OUT-4", tanggal: "2026-08-10", kategori: "Fasilitas & Lampu", deskripsi: "Pembelian 5 unit lampu LED & fitting jalan Gang Blok B", debet: 0, kredit: 320000 },
        { id: "OUT-5", tanggal: "2026-08-14", kategori: "Acara & Sosial", deskripsi: "Uang santunan duka cita warga Blok D", debet: 0, kredit: 300000 }
      ];
      localStorage.setItem('rtrw_pengeluaran', JSON.stringify(initialPengeluaran));
    }

    if (!localStorage.getItem('rtrw_aduan')) {
      const initialAduan: Aduan[] = [
        {
          id: "ADU-1",
          tanggal: "2026-08-10",
          kategori: "Fasilitas & Lampu",
          judul: "Lampu Penerangan Jalan Gang Blok B Mati",
          deskripsi: "Lampu penerangan di depan tiang nomor 3 Blok B mati sejak 2 hari lalu. Saat malam sangat gelap dan rawan tersandung.",
          namaPengirim: "Warga Anonim 🔒",
          isAnonim: true,
          blokRumah: "Dirahasiakan",
          kontak: "-",
          fotoUrl: "",
          status: "Selesai",
          tanggapanRT: "Sudah diganti dengan bohlam LED Philips 24W oleh Sie Fasilitas pada tgl 11 Agustus.",
          tanggalSelesai: "2026-08-11"
        },
        {
          id: "ADU-2",
          tanggal: "2026-08-13",
          kategori: "Kebersihan & Sampah",
          judul: "Jadwal Pengangkutan Sampah Terlambat",
          deskripsi: "Bak sampah di ujung Gang A belum diangkut sejak hari Selasa sehingga mulai menimbulkan bau tak sedap.",
          namaPengirim: "Pak Surya",
          isAnonim: false,
          blokRumah: "Blok B No. 02",
          kontak: "081234567806",
          fotoUrl: "",
          status: "Diproses",
          tanggapanRT: "Petugas pengangkut armada sedang servis kendaraan. Telah dikoordinasikan pengangkutan darurat sore ini."
        },
        {
          id: "ADU-3",
          tanggal: "2026-08-15",
          kategori: "Keamanan Lingkungan",
          judul: "Portal Masuk Utama Sering Tidak Ditutup Pukul 22.00",
          deskripsi: "Mohon diingatkan kembali kepada petugas ronda/jaga agar portal jalan utama dikunci tepat pukul 22.00 WIB demi keamanan bersama.",
          namaPengirim: "Warga Anonim 🔒",
          isAnonim: true,
          blokRumah: "Dirahasiakan",
          kontak: "-",
          fotoUrl: "",
          status: "Menunggu",
          tanggapanRT: ""
        }
      ];
      localStorage.setItem('rtrw_aduan', JSON.stringify(initialAduan));
    }

    if (!localStorage.getItem('rtrw_programs')) {
      const initialPrograms: ProgramKerja[] = [
        { id: "PROG-1", nama: "Semarak HUT RI ke-81", deskripsi: "Peringatan kemerdekaan dengan lomba anak-anak, jalan sehat keluarga, dan malam ramah tamah warga.", pelaksanaan: "17 Agustus 2026", panitia: "Pak Eko (Ketua Pelaksana)", anggaran: 4500000 },
        { id: "PROG-2", nama: "Fogging Massal & Kerja Bakti", deskripsi: "Pembersihan saluran air dan fogging nyamuk demam berdarah serentak seluruh blok perumahan.", pelaksanaan: "30 Agustus 2026", panitia: "Sie Kebersihan Lingkungan", anggaran: 1250000 },
        { id: "PROG-3", nama: "Pemasangan 4 Titik CCTV Baru", deskripsi: "Instalasi kamera CCTV resolusi tinggi di jalur masuk gerbang belakang dan perempatan blok C.", pelaksanaan: "September 2026", panitia: "Sie Keamanan", anggaran: 3800000 }
      ];
      localStorage.setItem('rtrw_programs', JSON.stringify(initialPrograms));
    }
  },

  getWarga(selectedBlok: string = "ALL") {
    this.init();
    const wargaList: Warga[] = JSON.parse(localStorage.getItem('rtrw_warga') || '[]');
    const optionsBlok = Array.from(new Set(wargaList.map(w => w.blok))).sort();

    const filtered = selectedBlok === "ALL"
      ? wargaList
      : wargaList.filter(w => w.blok.toUpperCase() === selectedBlok.toUpperCase());

    return {
      optionsBlok,
      list: filtered.sort((a, b) => {
        if (a.blok !== b.blok) return a.blok.localeCompare(b.blok);
        return parseInt(a.noRumah, 10) - parseInt(b.noRumah, 10);
      })
    };
  },

  saveWarga(data: Partial<Warga>) {
    this.init();
    const wargaList: Warga[] = JSON.parse(localStorage.getItem('rtrw_warga') || '[]');
    if (data.id) {
      const idx = wargaList.findIndex(w => w.id === data.id);
      if (idx !== -1) {
        wargaList[idx] = { ...wargaList[idx], ...data } as Warga;
        localStorage.setItem('rtrw_warga', JSON.stringify(wargaList));
        return { success: true, message: "Data warga berhasil diperbarui!" };
      }
    }
    const newWarga: Warga = {
      id: "WRG-" + Date.now(),
      blok: String(data.blok || "").trim().toUpperCase(),
      noRumah: String(data.noRumah || "").trim(),
      nama: String(data.nama || "").trim(),
      nik: data.nik || "-",
      noHp: data.noHp || "-",
      statusTinggal: data.statusTinggal || "Tetap",
      jumlahAnggota: Number(data.jumlahAnggota) || 1,
      keterangan: data.keterangan || "-"
    };
    wargaList.push(newWarga);
    localStorage.setItem('rtrw_warga', JSON.stringify(wargaList));
    return { success: true, message: "Data warga berhasil ditambahkan!" };
  },

  deleteWarga(id: string) {
    this.init();
    let wargaList: Warga[] = JSON.parse(localStorage.getItem('rtrw_warga') || '[]');
    wargaList = wargaList.filter(w => w.id !== id);
    localStorage.setItem('rtrw_warga', JSON.stringify(wargaList));
    return { success: true, message: "Data warga berhasil dihapus!" };
  },

  getIuranMatrix(tahun: number = 2026, selectedBlok: string = "ALL") {
    this.init();
    const { optionsBlok, list: wargaList } = this.getWarga(selectedBlok);
    const iuranList: any[] = JSON.parse(localStorage.getItem('rtrw_iuran') || '[]');

    const iuranMap: Record<string, IuranMonthDetail> = {};
    iuranList.forEach(r => {
      if (Number(r.tahun) === tahun) {
        const key = `${r.wargaId}_${r.bulan}`;
        iuranMap[key] = {
          id: r.id,
          sampahNominal: Number(r.sampahNominal) || 0,
          sampahStatus: r.sampahStatus || "Belum",
          keamananNominal: Number(r.keamananNominal) || 0,
          keamananStatus: r.keamananStatus || "Belum",
          kasNominal: Number(r.kasNominal) || 0,
          kasStatus: r.kasStatus || "Belum",
          totalBayar: Number(r.totalBayar) || 0,
          tanggalBayar: r.tanggalBayar || "",
          metode: r.metode || "Tunai",
          catatan: r.catatan || "-"
        };
      }
    });

    const matrix: IuranMatrixRow[] = wargaList.map(w => {
      const months: Record<number, IuranMonthDetail> = {};
      let totalTahunWarga = 0;

      for (let m = 1; m <= 12; m++) {
        const rec = iuranMap[`${w.id}_${m}`] || {
          sampahNominal: 0,
          sampahStatus: "Belum",
          keamananNominal: 0,
          keamananStatus: "Belum",
          kasNominal: 0,
          kasStatus: "Belum",
          totalBayar: 0
        };
        totalTahunWarga += rec.totalBayar;
        months[m] = rec;
      }

      return {
        warga: w,
        months,
        totalTahun: totalTahunWarga
      };
    });

    return {
      tahun,
      optionsBlok,
      matrix
    };
  },

  saveIuranBulanan(data: any) {
    this.init();
    const iuranList: any[] = JSON.parse(localStorage.getItem('rtrw_iuran') || '[]');
    const tahun = Number(data.tahun);
    const bulan = Number(data.bulan);
    const wargaId = String(data.wargaId);

    const sampahNominal = parseNumber(data.sampahNominal);
    const keamananNominal = parseNumber(data.keamananNominal);
    const kasNominal = parseNumber(data.kasNominal);
    const totalBayar = sampahNominal + keamananNominal + kasNominal;

    const newRecord = {
      id: data.id || `IUR-${wargaId}-${tahun}-${bulan}`,
      tahun,
      bulan,
      wargaId,
      blok: data.blok,
      noRumah: data.noRumah,
      nama: data.nama,
      sampahNominal,
      sampahStatus: data.sampahStatus || (sampahNominal > 0 ? "Lunas" : "Belum"),
      keamananNominal,
      keamananStatus: data.keamananStatus || (keamananNominal > 0 ? "Lunas" : "Belum"),
      kasNominal,
      kasStatus: data.kasStatus || (kasNominal > 0 ? "Lunas" : "Belum"),
      totalBayar,
      tanggalBayar: data.tanggalBayar || new Date().toISOString().split('T')[0],
      metode: data.metode || "Tunai",
      catatan: data.catatan || "-"
    };

    const idx = iuranList.findIndex(r => r.wargaId === wargaId && Number(r.tahun) === tahun && Number(r.bulan) === bulan);
    if (idx !== -1) {
      iuranList[idx] = newRecord;
    } else {
      iuranList.push(newRecord);
    }
    localStorage.setItem('rtrw_iuran', JSON.stringify(iuranList));

    // Tambahkan otomatis ke buku kas jika ada bayar
    if (totalBayar > 0 && !data.skipKasEntry) {
      this.savePengeluaran({
        tanggal: newRecord.tanggalBayar,
        kategori: "Iuran Warga",
        deskripsi: `Iuran ${data.nama} (Blok ${data.blok}/${data.noRumah}) - Bulan ${bulan}/${tahun}`,
        debet: totalBayar,
        kredit: 0
      });
    }

    return { success: true, message: `Iuran Bulan ${bulan}/${tahun} berhasil disimpan!` };
  },

  getPengeluaran(): Pengeluaran[] {
    this.init();
    const peng: Pengeluaran[] = JSON.parse(localStorage.getItem('rtrw_pengeluaran') || '[]');
    const iuran: any[] = JSON.parse(localStorage.getItem('rtrw_iuran') || '[]');
    const combined = [...peng];
    const existingIds = new Set(peng.map(p => p.id));
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    iuran.forEach(r => {
      const total = Number(r.totalBayar) || 0;
      if (total > 0 && !existingIds.has(r.id)) {
        const bName = monthNames[(Number(r.bulan) || 1) - 1] || `Bulan ${r.bulan}`;
        combined.push({
          id: r.id || `IUR-${r.wargaId}-${r.tahun}-${r.bulan}`,
          tanggal: r.tanggalBayar || `${r.tahun}-01-01`,
          kategori: "Iuran Warga",
          deskripsi: `Iuran ${r.nama || 'Warga'} (Blok ${r.blok}/${r.noRumah}) - ${bName} ${r.tahun}`,
          debet: total,
          kredit: 0,
          saldo: 0,
          bukti: ""
        });
      }
    });

    combined.sort((a, b) => {
      const d = (a.tanggal || '').localeCompare(b.tanggal || '');
      if (d !== 0) return d;
      return (Number(b.debet) - Number(b.kredit)) - (Number(a.debet) - Number(a.kredit));
    });

    let runningSaldo = 0;
    const list = combined.map(p => {
      runningSaldo += (Number(p.debet) || 0) - (Number(p.kredit) || 0);
      return {
        ...p,
        debet: Number(p.debet) || 0,
        kredit: Number(p.kredit) || 0,
        saldo: runningSaldo
      };
    });

    return list.reverse();
  },

  savePengeluaran(data: Partial<Pengeluaran>) {
    this.init();
    const peng: Pengeluaran[] = JSON.parse(localStorage.getItem('rtrw_pengeluaran') || '[]');
    if (data.id) {
      const idx = peng.findIndex(p => p.id === data.id);
      if (idx !== -1) {
        peng[idx] = { ...peng[idx], ...data } as Pengeluaran;
        localStorage.setItem('rtrw_pengeluaran', JSON.stringify(peng));
        return { success: true, message: "Transaksi kas berhasil diperbarui!" };
      }
    }
    const newEntry: Pengeluaran = {
      id: "OUT-" + Date.now(),
      tanggal: data.tanggal || new Date().toISOString().split('T')[0],
      kategori: data.kategori || "Operasional Lingkungan",
      deskripsi: data.deskripsi || "-",
      debet: parseNumber(data.debet),
      kredit: parseNumber(data.kredit),
      bukti: data.bukti || ""
    };
    peng.push(newEntry);
    localStorage.setItem('rtrw_pengeluaran', JSON.stringify(peng));
    return { success: true, message: "Transaksi kas berhasil disimpan!" };
  },

  deletePengeluaran(id: string) {
    this.init();
    let peng: Pengeluaran[] = JSON.parse(localStorage.getItem('rtrw_pengeluaran') || '[]');
    peng = peng.filter(p => p.id !== id);
    localStorage.setItem('rtrw_pengeluaran', JSON.stringify(peng));
    return { success: true, message: "Transaksi kas berhasil dihapus!" };
  },

  getAduan() {
    this.init();
    const aduan: Aduan[] = JSON.parse(localStorage.getItem('rtrw_aduan') || '[]');
    return aduan.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  },

  kirimAduan(data: Partial<Aduan>) {
    this.init();
    const aduan: Aduan[] = JSON.parse(localStorage.getItem('rtrw_aduan') || '[]');
    const isAnon = !!data.isAnonim;
    const newAduan: Aduan = {
      id: "ADU-" + Date.now(),
      tanggal: new Date().toISOString().split('T')[0],
      kategori: data.kategori || "Lainnya",
      judul: data.judul || "Aduan Warga",
      deskripsi: data.deskripsi || "",
      namaPengirim: isAnon ? "Warga Anonim 🔒" : (data.namaPengirim || "Warga"),
      isAnonim: isAnon,
      blokRumah: isAnon ? "Dirahasiakan" : (data.blokRumah || "-"),
      kontak: isAnon ? "-" : (data.kontak || "-"),
      fotoUrl: data.fotoUrl || "",
      status: "Menunggu",
      tanggapanRT: "",
      tanggalSelesai: ""
    };
    aduan.unshift(newAduan);
    localStorage.setItem('rtrw_aduan', JSON.stringify(aduan));
    return { success: true, message: "Aduan/Saran berhasil dikirimkan ke Pengurus!" };
  },

  tanggapiAduan(id: string, status: any, tanggapan: string) {
    this.init();
    const aduan: Aduan[] = JSON.parse(localStorage.getItem('rtrw_aduan') || '[]');
    const idx = aduan.findIndex(a => a.id === id);
    if (idx !== -1) {
      aduan[idx].status = status;
      aduan[idx].tanggapanRT = tanggapan;
      if (status === 'Selesai') {
        aduan[idx].tanggalSelesai = new Date().toISOString().split('T')[0];
      }
      localStorage.setItem('rtrw_aduan', JSON.stringify(aduan));
      return { success: true, message: "Tanggapan pengurus berhasil disimpan!" };
    }
    return { success: false, message: "Aduan tidak ditemukan!" };
  },

  deleteAduan(id: string) {
    this.init();
    let aduan: Aduan[] = JSON.parse(localStorage.getItem('rtrw_aduan') || '[]');
    aduan = aduan.filter(a => a.id !== id);
    localStorage.setItem('rtrw_aduan', JSON.stringify(aduan));
    return { success: true, message: "Aduan berhasil dihapus!" };
  },

  getPrograms() {
    this.init();
    const progs: ProgramKerja[] = JSON.parse(localStorage.getItem('rtrw_programs') || '[]');
    return progs;
  },

  saveProgram(data: Partial<ProgramKerja>) {
    this.init();
    const progs: ProgramKerja[] = JSON.parse(localStorage.getItem('rtrw_programs') || '[]');
    if (data.id) {
      const idx = progs.findIndex(p => p.id === data.id);
      if (idx !== -1) {
        progs[idx] = { ...progs[idx], ...data } as ProgramKerja;
        localStorage.setItem('rtrw_programs', JSON.stringify(progs));
        return { success: true, message: "Program berhasil diperbarui!" };
      }
    }
    const newProg: ProgramKerja = {
      id: "PROG-" + Date.now(),
      nama: data.nama || "-",
      deskripsi: data.deskripsi || "-",
      pelaksanaan: data.pelaksanaan || "-",
      panitia: data.panitia || "-",
      anggaran: parseNumber(data.anggaran)
    };
    progs.push(newProg);
    localStorage.setItem('rtrw_programs', JSON.stringify(progs));
    return { success: true, message: "Program berhasil disimpan!" };
  },

  deleteProgram(id: string) {
    this.init();
    let progs: ProgramKerja[] = JSON.parse(localStorage.getItem('rtrw_programs') || '[]');
    progs = progs.filter(p => p.id !== id);
    localStorage.setItem('rtrw_programs', JSON.stringify(progs));
    return { success: true, message: "Program berhasil dihapus!" };
  },

  getDashboardSummary(): DashboardSummary {
    this.init();
    const wargaList: Warga[] = JSON.parse(localStorage.getItem('rtrw_warga') || '[]');
    const iuranList: any[] = JSON.parse(localStorage.getItem('rtrw_iuran') || '[]');
    const pengList: Pengeluaran[] = JSON.parse(localStorage.getItem('rtrw_pengeluaran') || '[]');
    const aduanList: Aduan[] = JSON.parse(localStorage.getItem('rtrw_aduan') || '[]');

    let totalIuran = 0;
    iuranList.forEach(r => totalIuran += (Number(r.totalBayar) || 0));

    let totalDebet = 0;
    let totalKredit = 0;
    pengList.forEach(p => {
      totalDebet += (Number(p.debet) || 0);
      totalKredit += (Number(p.kredit) || 0);
    });

    const totalPemasukan = totalIuran + totalDebet;
    const saldoKas = totalPemasukan - totalKredit;

    let totalJiwa = 0;
    let tetapCount = 0;
    let kontrakCount = 0;
    wargaList.forEach(w => {
      totalJiwa += (Number(w.jumlahAnggota) || 1);
      if (w.statusTinggal === 'Tetap') tetapCount++;
      else kontrakCount++;
    });

    const aduanAktif = aduanList.filter(a => a.status === 'Menunggu' || a.status === 'Diproses').length;

    return {
      totalPemasukan,
      totalPengeluaran: totalKredit,
      saldoKas,
      totalWarga: wargaList.length,
      totalJiwa,
      tetapCount,
      kontrakCount,
      aduanAktif
    };
  }
};

// -------------------------------------------------------------------------
// REMOTE API CLIENT (GOOGLE APPS SCRIPT / GOOGLE SHEETS / DRIVE)
// -------------------------------------------------------------------------
export async function apiGet(action: string, params: Record<string, any> = {}, gasUrl: string = DEFAULT_GAS_URL, isLocal: boolean = false): Promise<any> {
  if (isLocal || typeof window === 'undefined') {
    return mockApiGet(action, params);
  }

  try {
    const url = new URL(gasUrl);
    url.searchParams.append('action', action);
    for (const k in params) {
      if (params[k] !== undefined && params[k] !== null) {
        url.searchParams.append(k, String(params[k]));
      }
    }
    const res = await fetch(url.toString(), { redirect: 'follow' });
    if (!res.ok) throw new Error("HTTP error " + res.status);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Google Apps Script error for ${action}, falling back to LocalStorage:`, err);
    return mockApiGet(action, params);
  }
}

export async function apiPost(action: string, data: Record<string, any> = {}, gasUrl: string = DEFAULT_GAS_URL, isLocal: boolean = false): Promise<any> {
  if (isLocal || typeof window === 'undefined') {
    return mockApiPost(action, data);
  }

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...data })
    });
    if (!res.ok) throw new Error("HTTP error " + res.status);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Google Apps Script POST error for ${action}, falling back to LocalStorage:`, err);
    return mockApiPost(action, data);
  }
}

function mockApiGet(action: string, params: Record<string, any>): any {
  if (action === "getDashboardData") {
    return {
      summary: localDB.getDashboardSummary(),
      programs: localDB.getPrograms()
    };
  }
  if (action === "getWargaData") {
    return localDB.getWarga(params.blok || "ALL");
  }
  if (action === "getIuranMatrixData") {
    return localDB.getIuranMatrix(Number(params.tahun) || 2026, params.blok || "ALL");
  }
  if (action === "getPengeluaranData") {
    return localDB.getPengeluaran();
  }
  if (action === "getAduanData") {
    return localDB.getAduan();
  }
  return { status: "error", message: "Action tidak dikenal" };
}

function mockApiPost(action: string, data: Record<string, any>): any {
  if (action === "checkLogin") {
    if (data.username === "admin" && data.password === "admin123") {
      return { success: true };
    }
    return { success: false, message: "Username atau Password salah!" };
  }
  if (action === "simpanWarga") return localDB.saveWarga(data.data);
  if (action === "hapusWarga") return localDB.deleteWarga(data.id);
  if (action === "simpanIuranBulanan") return localDB.saveIuranBulanan(data.data);
  if (action === "simpanPengeluaran") return localDB.savePengeluaran(data.data);
  if (action === "hapusPengeluaran") return localDB.deletePengeluaran(data.id);
  if (action === "kirimAduan") return localDB.kirimAduan(data.data);
  if (action === "tanggapiAduan") return localDB.tanggapiAduan(data.id, data.status, data.tanggapan);
  if (action === "hapusAduan") return localDB.deleteAduan(data.id);
  if (action === "simpanProgram") return localDB.saveProgram(data.data);
  if (action === "hapusProgram") return localDB.deleteProgram(data.id);

  return { status: "error", message: "Aksi POST tidak dikenal" };
}
