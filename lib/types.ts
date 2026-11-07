export type StatusHunian = 'Tetap' | 'Kontrak' | 'Kost' | 'Kosong';

export interface Warga {
  id: string;
  blok: string;
  noRumah: string;
  nama: string;
  nik?: string;
  noHp?: string;
  statusTinggal: StatusHunian;
  jumlahAnggota: number;
  keterangan?: string;
}

export type StatusIuran = 'Lunas' | 'Sebagian' | 'Belum';

export interface IuranMonthDetail {
  id?: string;
  sampahNominal: number;
  sampahStatus: 'Lunas' | 'Belum';
  keamananNominal: number;
  keamananStatus: 'Lunas' | 'Belum';
  kasNominal: number;
  kasStatus: 'Lunas' | 'Belum';
  totalBayar: number;
  tanggalBayar?: string;
  metode?: string;
  catatan?: string;
}

export interface IuranMatrixRow {
  warga: Warga;
  months: Record<number, IuranMonthDetail>; // 1 - 12
  totalTahun: number;
}

export interface Pengeluaran {
  id: string;
  rowIndex?: number;
  tanggal: string;
  kategori: string;
  deskripsi: string;
  debet: number; // Masuk
  kredit: number; // Keluar
  saldo?: number;
  bukti?: string; // base64 or link
}

export type StatusAduan = 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak';

export interface Aduan {
  id: string;
  tanggal: string;
  kategori: string;
  judul: string;
  deskripsi: string;
  namaPengirim: string;
  isAnonim: boolean;
  blokRumah: string;
  kontak?: string;
  fotoUrl?: string; // Base64 or image URL
  status: StatusAduan;
  tanggapanRT?: string;
  tanggalSelesai?: string;
}

export interface ProgramKerja {
  id: string;
  nama: string;
  deskripsi: string;
  pelaksanaan: string;
  panitia: string;
  anggaran: number;
}

export interface DashboardSummary {
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoKas: number;
  totalWarga: number;
  totalJiwa: number;
  tetapCount: number;
  kontrakCount: number;
  aduanAktif: number;
}
