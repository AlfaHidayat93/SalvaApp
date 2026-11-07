# Batujai Salva Residence - Portal Informasi Perumahan Terpadu

Aplikasi web modern berbasis **Next.js (App Router)**, **Tailwind CSS**, dan **TypeScript**, yang terintegrasi langsung dengan **Google Sheets & Google Drive** sebagai database cloud realtime, serta dilengkapi dengan mode **Demo Lokal (LocalStorage)** untuk kemudahan uji coba offline.

---

## 🚀 Fitur Utama

### 1. 👥 Daftar Warga & Penghuni per Blok
- **Filter Wilayah per Blok**: Dropdown dinamis untuk memfilter warga per Blok (Blok A, B, C, D, E, dst.) atau semua blok.
- **Pencarian Cepat**: Cari nama warga, nomor rumah, atau nomor WhatsApp secara instan.
- **Statistik Demografi**: Total Kepala Keluarga (KK), Total Jiwa/Penduduk, rasio Warga Tetap vs Warga Kontrak/Kost.
- **Integrasi WhatsApp**: Tombol direct chat WhatsApp (`wa.me`) untuk menghubungi warga secara langsung dalam 1 klik.
- **Kelola Data (Admin)**: Tambah, edit, dan hapus data warga secara aman.

### 2. 🧾 Matriks Iuran Bulanan Warga (Sampah, Keamanan & Kas)
- **Matriks 12 Bulan**: Tampilan tabel komprehensif Januari hingga Desember per rumah.
- **Rincian Status 3 Komponen Iuran**:
  1. 🗑️ **Iuran Sampah** (Standar Rp 20.000)
  2. 🛡️ **Iuran Keamanan & Ronda** (Standar Rp 30.000)
  3. 🪙 **Iuran Kas Warga** (Standar Rp 25.000)
  - Total Standar: **Rp 75.000 / Rumah / Bulan**
- **Indikator Visual**:
  - 🟢 **Lunas** (Lengkap Rp 75k)
  - 🟡 **Sebagian** (jika ada komponen yang belum terbayar)
  - ⚪ **Belum Bayar**
- **Pencatatan Cepat**: Klik pada kotak bulan di tabel untuk membuka form pembayaran, memilih metode (Tunai, Transfer BCA/Mandiri/BRI, QRIS), dan **otomatis mencatat kas masuk di modul Buku Kas**.

### 3. 💼 Buku Kas & Pengeluaran Lingkungan
- **Pencatatan Transparan**: Mencatat arus kas masuk (Debet) dan kas keluar (Kredit).
- **Saldo Berjalan Otomatis**: Saldo terhitung secara real-time setiap kali ada transaksi baru.
- **Kategori Transaksi**: Kebersihan & Sampah, Keamanan & Ronda, Fasilitas & Lampu Jalan, Acara & Sosial, Operasional Lingkungan, dll.
- **Upload Bukti Nota / Kwitansi**: Mendukung unggah foto bukti nota/struk belanja dengan fitur popup preview (lightbox zoom) & unduh foto.

### 4. 📢 Pusat Aduan, Saran & Aspirasi Warga
- **Dapat Diakses Semua Warga Tanpa Login**: Warga dapat langsung menyampaikan keluhan fasilitas rusak, masalah kebersihan, keamanan, atau usulan perbaikan lingkungan.
- **Opsi Kirim secara Anonim 🔒**: Pelapor dapat memilih mencentang opsi anonim agar nama dan nomor rumahnya dirahasiakan dari publik.
- **Lampiran Foto Bukti**: Warga dapat melampirkan foto kondisi/kerusakan langsung dari kamera HP atau galeri.
- **Status Tindak Lanjut Transparan**:
  - 🟡 *Menunggu Tindak Lanjut*
  - 🔵 *Sedang Diproses*
  - 🟢 *Selesai Ditindaklanjuti*
- **Respon & Solusi Pengurus**: Pengurus RT dapat menuliskan tanggapan dan progress penyelesaian yang tampil di bawah kartu aduan.

### 5. 📊 Dashboard Ringkasan & Agenda Program RT
- Ringkasan total kas masuk, total pengeluaran, dan saldo kas bersih.
- Ringkasan status kepatuhan iuran bulan berjalan dan jumlah aduan aktif.
- Daftar Agenda Kegiatan & Program Kerja RT (Deskripsi, Tanggal Pelaksanaan, Panitia PJ, dan Estimasi Anggaran).

### 6. 🔐 Akses & Keamanan Pengurus (Admin Mode)
- Login aman bagi Pengurus RT (Default username: `admin`, password: `admin123`).
- Warga umum hanya dapat melihat data transparansi dan mengirim aduan, sementara tombol tambah/edit/hapus hanya aktif saat pengurus login.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript
- **Database & Cloud Storage**:
  - **Google Sheets & Google Drive** via **Google Apps Script** (`Code.gs`)
  - **LocalStorage** untuk mode demo & offline fallback

---

## 💻 Cara Menjalankan Aplikasi Secara Lokal

### 1. Pastikan Node.js Terpasang
Buka terminal dan pastikan Node.js versi 18+ atau 20+ sudah terpasang:
```bash
node -v
npm -v
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 4. Build untuk Production
```bash
npm run build
npm start
```

---

## ☁️ Menghubungkan ke Google Sheets & Google Drive

Aplikasi ini menggunakan backend **Google Apps Script** yang tersimpan di file [`Code.gs`](./Code.gs).

### Langkah Konfigurasi:
1. Buka spreadsheet Google Sheets Anda (misal: *Salinan Salva App*).
2. Klik menu **Ekstensi** → **Apps Script**.
3. Hapus seluruh isi kode lama, lalu **salin (copy) seluruh isi file `Code.gs`** dari proyek ini dan **tempel (paste)** ke editor Apps Script.
4. Klik tombol **Simpan (Ctrl+S / Cmd+S)**.
5. Klik tombol **Deploy** (Terapkan) di pojok kanan atas → **New deployment** (Penerapan baru) atau **Manage deployments**.
   - Pilih jenis: **Web app**
   - Execute as: **Me** (Email Anda)
   - Who has access: **Anyone** (Siapa saja)
6. Salin **URL Web App** yang dihasilkan (berakhiran `/exec`).
7. Buka file [`lib/api.ts`](./lib/api.ts), lalu perbarui nilai konstanta:
   ```typescript
   export const DEFAULT_GAS_URL = "URL_APPS_SCRIPT_ANDA_DI_SINI";
   ```
8. Selesai! Aplikasi Anda sekarang tersinkronisasi dua arah secara realtime dengan Google Sheets dan Google Drive Anda.

---

## 📄 Lisensi & Hak Cipta
&copy; 2026 SALVA Residence • Created by [alfahidayat93.github.io](https://alfahidayat93.github.io)
