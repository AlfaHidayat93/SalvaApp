// ============================================================
//  Batujai Salva Residence – Google Apps Script Backend
//  Spreadsheet ID : otomatis dari spreadsheet file ini sendiri
//  Drive Folder ID: Folder penyimpanan foto aduan & bukti kas
// ============================================================

const DRIVE_FOLDER_ID = "1gJaS_ZvzyFrE2gTOfEX6Y2Dd48OO4L8H";
const ADMIN_USERNAME   = "admin";
const ADMIN_PASSWORD   = "admin123";   // ← ganti sesuai keinginan

// ---- Nama sheet ----
const SH = {
  WARGA       : "Warga",
  IURAN       : "Iuran",
  PENGELUARAN : "Pengeluaran",
  ADUAN       : "Aduan",
  PROGRAM     : "ProgramKerja",
  CONFIG      : "Config"
};

// ============================================================
//  ENTRY POINTS
// ============================================================
function doGet(e) {
  return handleRequest(e, false);
}

function doPost(e) {
  return handleRequest(e, true);
}

function handleRequest(e, isPost) {
  try {
    let action, params;

    if (isPost) {
      const body = JSON.parse(e.postData.contents);
      action = body.action;
      params = body;
    } else {
      action = e.parameter.action;
      params = e.parameter;
    }

    let result;
    switch (action) {
      // ── GET ──
      case "getDashboardData"    : result = getDashboardData();              break;
      case "getWargaData"        : result = getWargaData(params.blok);       break;
      case "getIuranMatrixData"  : result = getIuranMatrixData(params.tahun, params.blok); break;
      case "getPengeluaranData"  : result = getPengeluaranData();            break;
      case "getAduanData"        : result = getAduanData();                  break;
      case "getProgramData"      : result = getProgramData();                break;
      // ── POST ──
      case "checkLogin"          : result = checkLogin(params);              break;
      case "simpanWarga"         : result = simpanWarga(params.data);        break;
      case "hapusWarga"          : result = hapusWarga(params.id);           break;
      case "simpanIuranBulanan"  : result = simpanIuranBulanan(params.data); break;
      case "simpanPengeluaran"   : result = simpanPengeluaran(params.data);  break;
      case "hapusPengeluaran"    : result = hapusPengeluaran(params.id);     break;
      case "kirimAduan"          : result = kirimAduan(params.data);         break;
      case "uploadFotoAduan"     : result = uploadFotoAduan(params);         break;
      case "tanggapiAduan"       : result = tanggapiAduan(params.id, params.status, params.tanggapan); break;
      case "hapusAduan"          : result = hapusAduan(params.id);           break;
      case "simpanProgram"       : result = simpanProgram(params.data);      break;
      case "hapusProgram"        : result = hapusProgram(params.id);         break;
      case "initSheets"          : result = initAllSheets();                 break;
      default:
        result = { status: "error", message: "Action tidak dikenal: " + action };
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ status: "error", message: err.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//  HELPER: ambil / buat sheet
// ============================================================
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRow(sh, headers.length);
  }
  return sh;
}

function formatHeaderRow(sh, numCols) {
  const range = sh.getRange(1, 1, 1, numCols);
  range.setBackground("#1e3a5f");
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  sh.setFrozenRows(1);
}

// Sheet → array of objects
function sheetToObjects(sh) {
  if (!sh) return [];
  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

// Cari baris berdasarkan ID di kolom pertama (index 1)
function findRowById(sh, id) {
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1; // 1-based
  }
  return -1;
}

// ============================================================
//  HELPER: SIMPAN GAMBAR BASE64 KE GOOGLE DRIVE
// ============================================================
function saveImageToDrive(dataUrlOrBase64, prefix) {
  if (!dataUrlOrBase64) return "";
  const str = String(dataUrlOrBase64).trim();
  if (!str) return "";

  // Jika sudah merupakan link web (http/https), tidak perlu upload lagi
  if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) {
    return str;
  }

  try {
    let base64 = str;
    let mimeType = "image/jpeg";
    let ext = "jpg";

    if (str.indexOf("data:") === 0) {
      const parts = str.split(",");
      const meta = parts[0];
      base64 = parts[1];
      const match = meta.match(/:(.*?);/);
      if (match) mimeType = match[1];
      const sub = mimeType.split("/")[1];
      if (sub) ext = sub.replace("+xml", "");
    }

    const timeStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
    const fileName = (prefix || "FOTO_") + timeStr + "." + ext;
    const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);

    let file = null;

    // 1. Coba buat file langsung di folder DRIVE_FOLDER_ID
    if (DRIVE_FOLDER_ID) {
      try {
        const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        file = folder.createFile(blob);
      } catch (errFolder) {
        Logger.log("Folder DRIVE_FOLDER_ID akses terbatas (" + errFolder.message + "), membuat file di Drive utama...");
      }
    }

    // 2. Fallback: Buat file di Google Drive utama pengguna (ini selalu sukses)
    if (!file) {
      file = DriveApp.createFile(blob);
      try {
        // Coba masukkan ke folder tempat spreadsheet berada
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const ssFile = DriveApp.getFileById(ss.getId());
        const parents = ssFile.getParents();
        if (parents.hasNext()) {
          const ssParent = parents.next();
          ssParent.addFile(file);
        }
      } catch (e) {
        // Tetap aman di My Drive
      }
    }

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/uc?id=" + file.getId();
  } catch (err) {
    Logger.log("Gagal upload ke Google Drive: " + err.message);
    return "(Gagal upload ke Drive: " + err.message + ")";
  }
}

// ============================================================
//  FUNGSI TEST AKSES GOOGLE DRIVE (KLIK JALANKAN UNTUK OTORISASI)
// ============================================================
function testDriveAccess() {
  try {
    let folder = null;
    let locationName = "Google Drive Utama";

    if (DRIVE_FOLDER_ID) {
      try {
        folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        locationName = "Folder: " + folder.getName();
      } catch (e) {
        Logger.log("Folder ID tidak dapat diakses langsung: " + e.message);
      }
    }

    let testFile = null;
    if (folder) {
      try {
        testFile = folder.createFile("test_koneksi.txt", "Koneksi Google Drive Batujai Salva Residence OK pada " + new Date());
      } catch (errCreate) {
        Logger.log("Folder folder.createFile gagal (" + errCreate.message + "), beralih ke DriveApp.createFile...");
      }
    }

    if (!testFile) {
      testFile = DriveApp.createFile("test_koneksi.txt", "Koneksi Google Drive Batujai Salva Residence OK pada " + new Date());
      locationName = "My Drive (Utama)";
    }

    testFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const url = "https://drive.google.com/uc?id=" + testFile.getId();
    Logger.log("File tes berhasil dibuat: " + url);
    return "SUKSES! Tempat: " + locationName + " | Link: " + url;
  } catch (e) {
    Logger.log("Error akses Drive: " + e.message);
    return "GAGAL: " + e.message;
  }
}

// ============================================================
//  INISIALISASI SEMUA SHEET
// ============================================================
function initAllSheets() {
  // Warga
  getOrCreateSheet(SH.WARGA, [
    "id","blok","noRumah","nama","nik","noHp","statusTinggal","jumlahAnggota","keterangan"
  ]);

  // Iuran
  getOrCreateSheet(SH.IURAN, [
    "id","tahun","bulan","wargaId","blok","noRumah","nama",
    "sampahNominal","sampahStatus",
    "keamananNominal","keamananStatus",
    "kasNominal","kasStatus",
    "totalBayar","tanggalBayar","metode","catatan"
  ]);

  // Pengeluaran / Buku Kas
  getOrCreateSheet(SH.PENGELUARAN, [
    "id","tanggal","kategori","deskripsi","debet","kredit","bukti"
  ]);

  // Aduan & Saran
  getOrCreateSheet(SH.ADUAN, [
    "id","tanggal","kategori","judul","deskripsi",
    "namaPengirim","isAnonim","blokRumah","kontak","fotoUrl",
    "status","tanggapanRT","tanggalSelesai"
  ]);

  // Program Kerja
  getOrCreateSheet(SH.PROGRAM, [
    "id","nama","deskripsi","pelaksanaan","panitia","anggaran"
  ]);

  // Config (admin password dsb.)
  const cfgSh = getOrCreateSheet(SH.CONFIG, ["key","value"]);
  if (sheetToObjects(cfgSh).length === 0) {
    cfgSh.appendRow(["adminUsername", ADMIN_USERNAME]);
    cfgSh.appendRow(["adminPassword", ADMIN_PASSWORD]);
    cfgSh.appendRow(["namaRT",        "Batujai Salva Residence"]);
    cfgSh.appendRow(["alamatRT",      "Batujai Salva Residence, Indonesia"]);
  }

  return { status: "ok", message: "Semua sheet berhasil dibuat / diverifikasi." };
}

// ============================================================
//  DASHBOARD
// ============================================================
function getDashboardData() {
  const warga       = sheetToObjects(getSheet(SH.WARGA));
  const iuran       = sheetToObjects(getSheet(SH.IURAN));
  const pengeluaran = sheetToObjects(getSheet(SH.PENGELUARAN));
  const aduan       = sheetToObjects(getSheet(SH.ADUAN));
  const programs    = sheetToObjects(getSheet(SH.PROGRAM));

  let totalIuran = 0;
  iuran.forEach(r => totalIuran += (Number(r.totalBayar) || 0));

  let totalDebet = 0, totalKredit = 0;
  pengeluaran.forEach(p => {
    totalDebet  += (Number(p.debet)  || 0);
    totalKredit += (Number(p.kredit) || 0);
  });

  const totalPemasukan = totalIuran + totalDebet;
  const saldoKas       = totalPemasukan - totalKredit;

  let totalJiwa = 0, tetap = 0, kontrak = 0;
  warga.forEach(w => {
    totalJiwa += (Number(w.jumlahAnggota) || 1);
    if (String(w.statusTinggal) === "Tetap") tetap++; else kontrak++;
  });

  const aduanAktif = aduan.filter(a =>
    a.status === "Menunggu" || a.status === "Diproses"
  ).length;

  return {
    summary: {
      totalPemasukan, totalPengeluaran: totalKredit, saldoKas,
      totalWarga: warga.length, totalJiwa, tetapCount: tetap, kontrakCount: kontrak, aduanAktif
    },
    programs: programs.map(p => ({
      id: String(p.id), nama: p.nama, deskripsi: p.deskripsi,
      pelaksanaan: p.pelaksanaan, panitia: p.panitia, anggaran: Number(p.anggaran) || 0
    }))
  };
}

// ============================================================
//  WARGA
// ============================================================
function getWargaData(blok) {
  let list = sheetToObjects(getSheet(SH.WARGA));
  const optionsBlok = [...new Set(list.map(w => String(w.blok)))].sort();
  if (blok && blok !== "ALL") {
    list = list.filter(w => String(w.blok).toUpperCase() === String(blok).toUpperCase());
  }
  list.sort((a, b) => {
    if (a.blok !== b.blok) return String(a.blok).localeCompare(String(b.blok));
    return parseInt(a.noRumah, 10) - parseInt(b.noRumah, 10);
  });
  return { optionsBlok, list };
}

function simpanWarga(data) {
  const sh = getSheet(SH.WARGA);
  if (!sh) return { success: false, message: "Sheet Warga tidak ditemukan. Jalankan initSheets." };

  if (data.id) {
    const rowNum = findRowById(sh, data.id);
    if (rowNum > 0) {
      sh.getRange(rowNum, 1, 1, 9).setValues([[
        data.id, data.blok, data.noRumah, data.nama, data.nik || "-",
        data.noHp || "-", data.statusTinggal || "Tetap",
        Number(data.jumlahAnggota) || 1, data.keterangan || "-"
      ]]);
      return { success: true, message: "Data warga berhasil diperbarui!" };
    }
  }

  const id = "WRG-" + Date.now();
  sh.appendRow([
    id, String(data.blok || "").toUpperCase(), String(data.noRumah || ""),
    data.nama, data.nik || "-", data.noHp || "-",
    data.statusTinggal || "Tetap", Number(data.jumlahAnggota) || 1,
    data.keterangan || "-"
  ]);
  return { success: true, message: "Data warga berhasil ditambahkan!" };
}

function hapusWarga(id) {
  const sh = getSheet(SH.WARGA);
  const rowNum = findRowById(sh, id);
  if (rowNum < 0) return { success: false, message: "Data tidak ditemukan." };
  sh.deleteRow(rowNum);
  return { success: true, message: "Data warga berhasil dihapus!" };
}

// ============================================================
//  IURAN BULANAN
// ============================================================
function getIuranMatrixData(tahunParam, blokParam) {
  const tahun    = Number(tahunParam) || new Date().getFullYear();
  const blok     = blokParam || "ALL";
  const { optionsBlok, list: wargaList } = getWargaData(blok);
  const iuranAll = sheetToObjects(getSheet(SH.IURAN));

  const iuranMap = {};
  iuranAll.forEach(r => {
    if (Number(r.tahun) === tahun) {
      const key = `${r.wargaId}_${r.bulan}`;
      iuranMap[key] = {
        id: r.id,
        sampahNominal   : Number(r.sampahNominal)    || 0,
        sampahStatus    : r.sampahStatus    || "Belum",
        keamananNominal : Number(r.keamananNominal)  || 0,
        keamananStatus  : r.keamananStatus  || "Belum",
        kasNominal      : Number(r.kasNominal)       || 0,
        kasStatus       : r.kasStatus       || "Belum",
        totalBayar      : Number(r.totalBayar)       || 0,
        tanggalBayar    : r.tanggalBayar    || "",
        metode          : r.metode          || "Tunai",
        catatan         : r.catatan         || "-"
      };
    }
  });

  const matrix = wargaList.map(w => {
    const months = {};
    let totalTahun = 0;
    for (let m = 1; m <= 12; m++) {
      const rec = iuranMap[`${w.id}_${m}`] || {
        sampahNominal: 0, sampahStatus: "Belum",
        keamananNominal: 0, keamananStatus: "Belum",
        kasNominal: 0, kasStatus: "Belum", totalBayar: 0
      };
      totalTahun += rec.totalBayar;
      months[m] = rec;
    }
    return { warga: w, months, totalTahun };
  });

  return { tahun, optionsBlok, matrix };
}

function simpanIuranBulanan(data) {
  const sh = getSheet(SH.IURAN);
  if (!sh) return { success: false, message: "Sheet Iuran tidak ditemukan." };

  const tahun   = Number(data.tahun);
  const bulan   = Number(data.bulan);
  const wargaId = String(data.wargaId);

  const sampah   = Number(data.sampahNominal)   || 0;
  const keamanan = Number(data.keamananNominal) || 0;
  const kas      = Number(data.kasNominal)      || 0;
  const total    = sampah + keamanan + kas;

  const id    = data.id || `IUR-${wargaId}-${tahun}-${bulan}`;
  const rowData = [
    id, tahun, bulan, wargaId, data.blok, data.noRumah, data.nama,
    sampah,   data.sampahStatus    || (sampah   > 0 ? "Lunas" : "Belum"),
    keamanan, data.keamananStatus  || (keamanan > 0 ? "Lunas" : "Belum"),
    kas,      data.kasStatus       || (kas      > 0 ? "Lunas" : "Belum"),
    total,
    data.tanggalBayar || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    data.metode   || "Tunai",
    data.catatan  || "-"
  ];

  const allData = sh.getDataRange().getValues();
  let rowNum = -1;
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][3]) === wargaId &&
        Number(allData[i][1]) === tahun &&
        Number(allData[i][2]) === bulan) {
      rowNum = i + 1;
      break;
    }
  }

  if (rowNum > 0) {
    sh.getRange(rowNum, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sh.appendRow(rowData);
  }

  // Otomatis tambah ke buku kas
  if (total > 0 && !data.skipKasEntry) {
    simpanPengeluaran({
      tanggal  : rowData[14],
      kategori : "Iuran Warga",
      deskripsi: `Iuran ${data.nama} (Blok ${data.blok}/${data.noRumah}) - Bulan ${bulan}/${tahun}`,
      debet    : total,
      kredit   : 0
    });
  }

  return { success: true, message: `Iuran Bulan ${bulan}/${tahun} berhasil disimpan!` };
}

// ============================================================
//  PENGELUARAN / BUKU KAS
// ============================================================
function getPengeluaranData() {
  let list = sheetToObjects(getSheet(SH.PENGELUARAN));
  list.sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)));

  let saldo = 0;
  list = list.map(p => {
    saldo += (Number(p.debet) || 0) - (Number(p.kredit) || 0);
    return { ...p, debet: Number(p.debet) || 0, kredit: Number(p.kredit) || 0, saldo };
  });

  return list.reverse();
}

function simpanPengeluaran(data) {
  const sh = getSheet(SH.PENGELUARAN);
  if (!sh) return { success: false, message: "Sheet Pengeluaran tidak ditemukan." };

  // Otomatis upload bukti foto ke Google Drive jika berupa dataUrl/base64
  const buktiUrl = saveImageToDrive(data.bukti, "BUKTI_KAS_");

  if (data.id) {
    const rowNum = findRowById(sh, data.id);
    if (rowNum > 0) {
      sh.getRange(rowNum, 1, 1, 7).setValues([[
        data.id, data.tanggal, data.kategori, data.deskripsi,
        Number(data.debet) || 0, Number(data.kredit) || 0, buktiUrl
      ]]);
      return { success: true, message: "Transaksi kas berhasil diperbarui!", buktiUrl: buktiUrl };
    }
  }

  sh.appendRow([
    "OUT-" + Date.now(),
    data.tanggal   || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    data.kategori  || "Operasional Lingkungan",
    data.deskripsi || "-",
    Number(data.debet)  || 0,
    Number(data.kredit) || 0,
    buktiUrl
  ]);
  return { success: true, message: "Transaksi kas berhasil disimpan!", buktiUrl: buktiUrl };
}

function hapusPengeluaran(id) {
  const sh = getSheet(SH.PENGELUARAN);
  const rowNum = findRowById(sh, id);
  if (rowNum < 0) return { success: false, message: "Data tidak ditemukan." };
  sh.deleteRow(rowNum);
  return { success: true, message: "Transaksi kas berhasil dihapus!" };
}

// ============================================================
//  ADUAN & SARAN
// ============================================================
function getAduanData() {
  const list = sheetToObjects(getSheet(SH.ADUAN));
  return list
    .sort((a, b) => String(b.tanggal).localeCompare(String(a.tanggal)))
    .map(a => ({
      ...a,
      isAnonim: String(a.isAnonim) === "true" || a.isAnonim === true
    }));
}

function kirimAduan(data) {
  const sh = getSheet(SH.ADUAN);
  if (!sh) return { success: false, message: "Sheet Aduan tidak ditemukan." };

  const isAnon = !!data.isAnonim;
  // Otomatis upload foto aduan ke Google Drive jika ada foto base64
  const finalFotoUrl = saveImageToDrive(data.fotoUrl, "ADUAN_");

  sh.appendRow([
    "ADU-" + Date.now(),
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    data.kategori    || "Lainnya",
    data.judul       || "Aduan Warga",
    data.deskripsi   || "",
    isAnon ? "Warga Anonim 🔒" : (data.namaPengirim || "Warga"),
    isAnon,
    isAnon ? "Dirahasiakan" : (data.blokRumah || "-"),
    isAnon ? "-" : (data.kontak || "-"),
    finalFotoUrl,
    "Menunggu",
    "",
    ""
  ]);
  return { success: true, message: "Aduan/Saran berhasil dikirimkan ke Pengurus!", fotoUrl: finalFotoUrl };
}

function uploadFotoAduan(params) {
  try {
    const url = saveImageToDrive(params.base64, "ADUAN_UPLOAD_");
    return { success: true, url: url };
  } catch (err) {
    return { success: false, message: "Upload gagal: " + err.message };
  }
}

function tanggapiAduan(id, status, tanggapan) {
  const sh = getSheet(SH.ADUAN);
  const rowNum = findRowById(sh, id);
  if (rowNum < 0) return { success: false, message: "Aduan tidak ditemukan." };

  // kolom: status=11, tanggapanRT=12, tanggalSelesai=13
  sh.getRange(rowNum, 11).setValue(status);
  sh.getRange(rowNum, 12).setValue(tanggapan);
  if (status === "Selesai") {
    sh.getRange(rowNum, 13).setValue(
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd")
    );
  }
  return { success: true, message: "Tanggapan pengurus berhasil disimpan!" };
}

function hapusAduan(id) {
  const sh = getSheet(SH.ADUAN);
  const rowNum = findRowById(sh, id);
  if (rowNum < 0) return { success: false, message: "Data tidak ditemukan." };
  sh.deleteRow(rowNum);
  return { success: true, message: "Aduan berhasil dihapus!" };
}

// ============================================================
//  PROGRAM KERJA
// ============================================================
function getProgramData() {
  return sheetToObjects(getSheet(SH.PROGRAM)).map(p => ({
    id: String(p.id), nama: p.nama, deskripsi: p.deskripsi,
    pelaksanaan: p.pelaksanaan, panitia: p.panitia,
    anggaran: Number(p.anggaran) || 0
  }));
}

function simpanProgram(data) {
  const sh = getSheet(SH.PROGRAM);
  if (!sh) return { success: false, message: "Sheet ProgramKerja tidak ditemukan." };

  if (data.id) {
    const rowNum = findRowById(sh, data.id);
    if (rowNum > 0) {
      sh.getRange(rowNum, 1, 1, 6).setValues([[
        data.id, data.nama, data.deskripsi,
        data.pelaksanaan, data.panitia, Number(data.anggaran) || 0
      ]]);
      return { success: true, message: "Program berhasil diperbarui!" };
    }
  }

  sh.appendRow([
    "PROG-" + Date.now(),
    data.nama        || "-",
    data.deskripsi   || "-",
    data.pelaksanaan || "-",
    data.panitia     || "-",
    Number(data.anggaran) || 0
  ]);
  return { success: true, message: "Program berhasil disimpan!" };
}

function hapusProgram(id) {
  const sh = getSheet(SH.PROGRAM);
  const rowNum = findRowById(sh, id);
  if (rowNum < 0) return { success: false, message: "Data tidak ditemukan." };
  sh.deleteRow(rowNum);
  return { success: true, message: "Program berhasil dihapus!" };
}

// ============================================================
//  LOGIN
// ============================================================
function checkLogin(params) {
  const cfg = sheetToObjects(getSheet(SH.CONFIG));
  const cfgMap = {};
  cfg.forEach(r => { cfgMap[r.key] = r.value; });

  const user = cfgMap["adminUsername"] || ADMIN_USERNAME;
  const pass = cfgMap["adminPassword"] || ADMIN_PASSWORD;

  if (params.username === user && params.password === pass) {
    return { success: true };
  }
  return { success: false, message: "Username atau Password salah!" };
}