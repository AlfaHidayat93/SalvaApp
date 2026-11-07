/**
 * SISTEM INFORMASI RT/RW - PORTAL KAS, WARGA & ASPIRASI
 * Backend Google Apps Script (Code.gs)
 */

const SHEET_WARGA = "Warga";
const SHEET_IURAN = "Iuran";
const SHEET_PENGELUARAN = "Pengeluaran";
const SHEET_ADUAN = "Aduan";
const SHEET_PROGRAM = "Program";
const SHEET_ADMIN = "Admin";

// Setup database & sheet otomatis jika belum ada
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Warga / Penghuni Blok
  let sWarga = ss.getSheetByName(SHEET_WARGA);
  if (!sWarga) {
    sWarga = ss.insertSheet(SHEET_WARGA);
    sWarga.appendRow(["ID", "Blok", "No Rumah", "Nama Lengkap", "NIK", "No HP", "Status Tinggal", "Jumlah Anggota", "Keterangan"]);
  }

  // 2. Sheet Iuran Bulanan Warga
  let sIuran = ss.getSheetByName(SHEET_IURAN);
  if (!sIuran) {
    sIuran = ss.insertSheet(SHEET_IURAN);
    sIuran.appendRow([
      "ID", "Tahun", "Bulan", "WargaID", "Blok", "No Rumah", "Nama Warga",
      "SampahNominal", "SampahStatus", "KeamananNominal", "KeamananStatus",
      "KasNominal", "KasStatus", "TotalBayar", "TanggalBayar", "Metode", "Catatan"
    ]);
  }

  // 3. Sheet Pengeluaran & Buku Kas
  let sPeng = ss.getSheetByName(SHEET_PENGELUARAN);
  if (!sPeng) {
    sPeng = ss.insertSheet(SHEET_PENGELUARAN);
    sPeng.appendRow(["ID", "Tanggal", "Kategori", "Deskripsi", "Debet", "Kredit", "Bukti"]);
  }

  // 4. Sheet Pusat Aduan & Saran Warga
  let sAduan = ss.getSheetByName(SHEET_ADUAN);
  if (!sAduan) {
    sAduan = ss.insertSheet(SHEET_ADUAN);
    sAduan.appendRow(["ID", "Tanggal", "Kategori", "Judul", "Deskripsi", "Nama Pengirim", "IsAnonim", "Blok Rumah", "Kontak", "FotoUrl", "Status", "Tanggapan RT", "Tanggal Selesai"]);
  }

  // 5. Sheet Program Kerja RT (Pertahankan data yang sudah ada)
  let sProg = ss.getSheetByName(SHEET_PROGRAM);
  if (!sProg) {
    sProg = ss.insertSheet(SHEET_PROGRAM);
    sProg.appendRow(["ID", "Nama Program", "Deskripsi", "Pelaksanaan", "Panitia", "Anggaran"]);
  }

  // 6. Sheet Admin Credentials
  let sAdmin = ss.getSheetByName(SHEET_ADMIN);
  if (!sAdmin) {
    sAdmin = ss.insertSheet(SHEET_ADMIN);
    sAdmin.appendRow(["Username", "Password"]);
    sAdmin.appendRow(["admin", "admin123"]);
  }
}

// Endpoint Pembacaan Data (GET)
function doGet(e) {
  setupDatabase();
  const action = (e && e.parameter && e.parameter.action) || "getDashboardData";
  let result = {};

  try {
    if (action === "getDashboardData") {
      result = getDashboardData();
    } else if (action === "getWargaData") {
      const blok = (e && e.parameter && e.parameter.blok) || "ALL";
      result = getWargaData(blok);
    } else if (action === "getIuranMatrixData") {
      const tahun = parseInt((e && e.parameter && e.parameter.tahun) || new Date().getFullYear(), 10);
      const blok = (e && e.parameter && e.parameter.blok) || "ALL";
      result = getIuranMatrixData(tahun, blok);
    } else if (action === "getPengeluaranData") {
      result = getPengeluaranData();
    } else if (action === "getAduanData") {
      result = getAduanData();
    } else if (action === "getPemasukanData") {
      // Kompatibilitas mundur
      const blok = (e && e.parameter && e.parameter.blok) || "ALL";
      result = getPemasukanData(blok);
    } else {
      result = { status: "error", message: "Action GET '" + action + "' tidak dikenal" };
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return responseJSON(result);
}

// Endpoint Penyimpanan Data & Aksi (POST)
function doPost(e) {
  setupDatabase();
  let result = {};

  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === "checkLogin") {
      const loginSuccess = checkLoginFromSheet(body.username, body.password);
      if (loginSuccess) {
        result = { success: true };
      } else {
        result = { success: false, message: "Username atau Password salah!" };
      }
    } else if (action === "simpanWarga") {
      result = simpanWarga(body.data);
    } else if (action === "hapusWarga") {
      result = hapusWarga(body.id);
    } else if (action === "simpanIuranBulanan") {
      result = simpanIuranBulanan(body.data);
    } else if (action === "hapusIuranBulanan") {
      result = hapusIuranBulanan(body.id);
    } else if (action === "simpanPengeluaran") {
      result = simpanPengeluaran(body.data);
    } else if (action === "hapusPengeluaran") {
      result = hapusPengeluaran(body.id);
    } else if (action === "kirimAduan") {
      result = kirimAduan(body.data);
    } else if (action === "tanggapiAduan") {
      result = tanggapiAduan(body.id, body.status, body.tanggapan);
    } else if (action === "hapusAduan") {
      result = hapusAduan(body.id);
    } else if (action === "simpanProgram") {
      result = simpanProgram(body.data);
    } else if (action === "hapusProgram") {
      result = hapusProgram(body.id);
    } else {
      result = { status: "error", message: "Action POST '" + action + "' tidak dikenal" };
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return responseJSON(result);
}

// -------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------
function formatDateISO(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || "GMT", "yyyy-MM-dd");
  }
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return Utilities.formatDate(d, Session.getScriptTimeZone() || "GMT", "yyyy-MM-dd");
    }
  } catch (e) {}
  return String(val);
}

function parseNumber(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  var str = String(val).trim().replace(/[^\d,\.-]/g, "");
  if (str.indexOf(".") !== -1 && str.indexOf(",") !== -1) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.indexOf(",") !== -1) {
    str = str.replace(",", ".");
  } else if (str.indexOf(".") !== -1) {
    var parts = str.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      str = str.replace(/\./g, "");
    }
  }
  return Number(str) || 0;
}

function checkLoginFromSheet(username, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ADMIN);
  if (!sheet) return username === "admin" && password === "admin123";

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const sheetUser = String(values[i][0]).trim();
    const sheetPass = String(values[i][1]).trim();
    if (sheetUser === username && sheetPass === password) {
      return true;
    }
  }
  return username === "admin" && password === "admin123";
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateRowInSheet(sheetName, id, dataArray) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      const range = sheet.getRange(i + 1, 1, 1, dataArray.length);
      range.setValues([dataArray]);
      return true;
    }
  }
  return false;
}

function deleteRowInSheet(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// -------------------------------------------------------------
// 1. DASHBOARD OVERVIEW DATA
// -------------------------------------------------------------
function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Hitung pemasukan dari Iuran + Debet Pengeluaran
  let totalIuran = 0;
  const sIuran = ss.getSheetByName(SHEET_IURAN);
  if (sIuran) {
    const valIuran = sIuran.getDataRange().getValues();
    if (valIuran.length > 1) {
      for (let i = 1; i < valIuran.length; i++) {
        totalIuran += parseNumber(valIuran[i][13]); // Col 13 is TotalBayar
      }
    }
  }

  // Hitung Pengeluaran Kas (Debet & Kredit)
  let totalDebet = 0;
  let totalKredit = 0;
  const sPeng = ss.getSheetByName(SHEET_PENGELUARAN);
  if (sPeng) {
    const valPeng = sPeng.getDataRange().getValues();
    if (valPeng.length > 1) {
      for (let i = 1; i < valPeng.length; i++) {
        // Col 4: Debet, Col 5: Kredit (jika ada kolom Kategori) atau Col 3, Col 4
        if (valPeng[0].length >= 7) {
          totalDebet += parseNumber(valPeng[i][4]);
          totalKredit += parseNumber(valPeng[i][5]);
        } else {
          totalDebet += parseNumber(valPeng[i][3]);
          totalKredit += parseNumber(valPeng[i][4]);
        }
      }
    }
  }

  // Statistik Warga
  let totalWarga = 0;
  let totalJiwa = 0;
  let tetapCount = 0;
  let kontrakCount = 0;
  const sWarga = ss.getSheetByName(SHEET_WARGA);
  if (sWarga) {
    const valW = sWarga.getDataRange().getValues();
    if (valW.length > 1) {
      for (let i = 1; i < valW.length; i++) {
        if (!valW[i][0] && !valW[i][1]) continue;
        totalWarga++;
        totalJiwa += parseNumber(valW[i][7]) || 1;
        const status = String(valW[i][6] || "").toLowerCase();
        if (status.indexOf("kontrak") !== -1 || status.indexOf("kost") !== -1) {
          kontrakCount++;
        } else {
          tetapCount++;
        }
      }
    }
  }

  // Statistik Aduan Aktif
  let aduanAktif = 0;
  const sAduan = ss.getSheetByName(SHEET_ADUAN);
  if (sAduan) {
    const valA = sAduan.getDataRange().getValues();
    if (valA.length > 1) {
      for (let i = 1; i < valA.length; i++) {
        const st = String(valA[i][10] || "").toLowerCase();
        if (st === "menunggu" || st === "diproses") {
          aduanAktif++;
        }
      }
    }
  }

  // Program Kerja
  const programs = [];
  const sProg = ss.getSheetByName(SHEET_PROGRAM);
  if (sProg) {
    const valProg = sProg.getDataRange().getValues();
    if (valProg.length > 1) {
      for (let i = 1; i < valProg.length; i++) {
        if (!valProg[i][1] && !valProg[i][0]) continue;
        programs.push({
          id: valProg[i][0] || "PROG-" + i,
          nama: valProg[i][1] || "-",
          deskripsi: valProg[i][2] || "-",
          pelaksanaan: valProg[i][3] || "-",
          panitia: valProg[i][4] || "-",
          anggaran: parseNumber(valProg[i][5])
        });
      }
    }
  }

  const totalPemasukan = totalIuran + totalDebet;
  const saldoKas = totalPemasukan - totalKredit;

  return {
    summary: {
      totalPemasukan: totalPemasukan,
      totalIuranWarga: totalPemasukan, // backward compatibility
      totalPengeluaran: totalKredit,
      saldoKas: saldoKas,
      totalWarga: totalWarga,
      totalJiwa: totalJiwa,
      tetapCount: tetapCount,
      kontrakCount: kontrakCount,
      aduanAktif: aduanAktif
    },
    programs: programs
  };
}

// -------------------------------------------------------------
// 2. DAFTAR WARGA / PENGHUNI BLOK
// -------------------------------------------------------------
function getWargaData(selectedBlok) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sWarga = ss.getSheetByName(SHEET_WARGA);
  if (!sWarga) return { optionsBlok: [], list: [] };

  const values = sWarga.getDataRange().getValues();
  const optionsBlok = new Set();
  const list = [];

  if (values.length > 1) {
    for (let i = 1; i < values.length; i++) {
      const rawBlok = String(values[i][1] || "").trim();
      if (!rawBlok || rawBlok.toUpperCase() === "BLOK") continue;

      const cleanBlok = rawBlok.replace(/^blok\s*/i, "").toUpperCase();
      optionsBlok.add(cleanBlok);

      if (!selectedBlok || selectedBlok === "ALL" || selectedBlok.toUpperCase() === cleanBlok) {
        list.push({
          id: String(values[i][0] || ("WRG-" + (i + 1))),
          blok: cleanBlok,
          noRumah: String(values[i][2] || "-"),
          nama: String(values[i][3] || "-"),
          nik: String(values[i][4] || "-"),
          noHp: String(values[i][5] || "-"),
          statusTinggal: String(values[i][6] || "Tetap"),
          jumlahAnggota: parseNumber(values[i][7]) || 1,
          keterangan: String(values[i][8] || "-")
        });
      }
    }
  }

  // Urutkan list berdasarkan Blok, lalu Nomor Rumah
  list.sort((a, b) => {
    if (a.blok !== b.blok) return a.blok.localeCompare(b.blok);
    return parseInt(a.noRumah, 10) - parseInt(b.noRumah, 10);
  });

  return {
    optionsBlok: Array.from(optionsBlok).sort(),
    list: list
  };
}

function simpanWarga(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_WARGA);
  if (!sheet) return { success: false, message: "Sheet Warga tidak ditemukan!" };

  const blok = String(data.blok || "").trim().toUpperCase();
  const noRumah = String(data.noRumah || "").trim();
  const nama = String(data.nama || "").trim();
  const nik = String(data.nik || "-").trim();
  const noHp = String(data.noHp || "-").trim();
  const statusTinggal = String(data.statusTinggal || "Tetap").trim();
  const jumlahAnggota = parseNumber(data.jumlahAnggota) || 1;
  const keterangan = String(data.keterangan || "-").trim();

  if (data.id) {
    const success = updateRowInSheet(SHEET_WARGA, data.id, [
      data.id, blok, noRumah, nama, nik, noHp, statusTinggal, jumlahAnggota, keterangan
    ]);
    if (success) return { success: true, message: "Data warga berhasil diperbarui!" };
  }

  const id = "WRG-" + Date.now();
  sheet.appendRow([id, blok, noRumah, nama, nik, noHp, statusTinggal, jumlahAnggota, keterangan]);
  return { success: true, message: "Data warga berhasil ditambahkan!" };
}

function hapusWarga(id) {
  const success = deleteRowInSheet(SHEET_WARGA, id);
  return { success: success, message: success ? "Data warga berhasil dihapus!" : "Data warga tidak ditemukan!" };
}

// -------------------------------------------------------------
// 3. IURAN BULANAN WARGA (MATRIX STATUS SAMPAH, KEAMANAN, KAS)
// -------------------------------------------------------------
function getIuranMatrixData(tahun, selectedBlok) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sWarga = ss.getSheetByName(SHEET_WARGA);
  const sIuran = ss.getSheetByName(SHEET_IURAN);

  const wargaRes = getWargaData(selectedBlok);
  const wargaList = wargaRes.list;
  const optionsBlok = wargaRes.optionsBlok;

  // Baca data iuran untuk tahun terpilih
  const iuranMap = {}; // key: wargaId_bulan (1-12)
  if (sIuran) {
    const values = sIuran.getDataRange().getValues();
    if (values.length > 1) {
      for (let i = 1; i < values.length; i++) {
        const rowTahun = parseInt(values[i][1], 10);
        if (rowTahun === tahun) {
          const rowBulan = parseInt(values[i][2], 10); // 1-12
          const rowWargaId = String(values[i][3] || "");
          const key = rowWargaId + "_" + rowBulan;

          iuranMap[key] = {
            id: values[i][0],
            sampahNominal: parseNumber(values[i][7]),
            sampahStatus: String(values[i][8] || "Belum"),
            keamananNominal: parseNumber(values[i][9]),
            keamananStatus: String(values[i][10] || "Belum"),
            kasNominal: parseNumber(values[i][11]),
            kasStatus: String(values[i][12] || "Belum"),
            totalBayar: parseNumber(values[i][13]),
            tanggalBayar: formatDateISO(values[i][14]),
            metode: String(values[i][15] || "-"),
            catatan: String(values[i][16] || "-")
          };
        }
      }
    }
  }

  // Gabungkan ke matrix warga per bulan
  const matrix = wargaList.map(w => {
    const months = {};
    let totalTahunWarga = 0;

    for (let m = 1; m <= 12; m++) {
      const rec = iuranMap[w.id + "_" + m] || {
        id: "",
        sampahNominal: 0,
        sampahStatus: "Belum",
        keamananNominal: 0,
        keamananStatus: "Belum",
        kasNominal: 0,
        kasStatus: "Belum",
        totalBayar: 0,
        tanggalBayar: "",
        metode: "-",
        catatan: "-"
      };

      totalTahunWarga += rec.totalBayar;
      months[m] = rec;
    }

    return {
      warga: w,
      months: months,
      totalTahun: totalTahunWarga
    };
  });

  return {
    tahun: tahun,
    optionsBlok: optionsBlok,
    matrix: matrix
  };
}

function simpanIuranBulanan(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_IURAN);
  if (!sheet) return { success: false, message: "Sheet Iuran tidak ditemukan!" };

  const id = data.id || ("IUR-" + Date.now());
  const tahun = parseInt(data.tahun, 10);
  const bulan = parseInt(data.bulan, 10);
  const wargaId = String(data.wargaId || "");
  const blok = String(data.blok || "");
  const noRumah = String(data.noRumah || "");
  const nama = String(data.nama || "");

  const sampahNominal = parseNumber(data.sampahNominal);
  const sampahStatus = data.sampahStatus || (sampahNominal > 0 ? "Lunas" : "Belum");
  const keamananNominal = parseNumber(data.keamananNominal);
  const keamananStatus = data.keamananStatus || (keamananNominal > 0 ? "Lunas" : "Belum");
  const kasNominal = parseNumber(data.kasNominal);
  const kasStatus = data.kasStatus || (kasNominal > 0 ? "Lunas" : "Belum");

  const totalBayar = sampahNominal + keamananNominal + kasNominal;
  const tglBayar = data.tanggalBayar ? formatDateISO(data.tanggalBayar) : formatDateISO(new Date());
  const metode = String(data.metode || "Tunai");
  const catatan = String(data.catatan || "-");

  const rowData = [
    id, tahun, bulan, wargaId, blok, noRumah, nama,
    sampahNominal, sampahStatus,
    keamananNominal, keamananStatus,
    kasNominal, kasStatus,
    totalBayar, tglBayar, metode, catatan
  ];

  // Cari apakah sudah pernah tercatat untuk WargaID, Tahun, dan Bulan ini
  const values = sheet.getDataRange().getValues();
  let foundRow = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][3]) === wargaId && parseInt(values[i][1], 10) === tahun && parseInt(values[i][2], 10) === bulan) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow !== -1) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { success: true, message: "Pembayaran iuran bulan " + bulan + "/" + tahun + " berhasil disimpan!" };
}

function hapusIuranBulanan(id) {
  const success = deleteRowInSheet(SHEET_IURAN, id);
  return { success: success, message: success ? "Data iuran berhasil dihapus!" : "Data iuran tidak ditemukan!" };
}

// -------------------------------------------------------------
// 4. PENGELUARAN & BUKU KAS
// -------------------------------------------------------------
function getPengeluaranData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sPeng = ss.getSheetByName(SHEET_PENGELUARAN);
  if (!sPeng) return [];

  const values = sPeng.getDataRange().getValues();
  const list = [];
  let runningSaldo = 0;

  if (values.length > 1) {
    const tempRows = [];
    const isNewFormat = values[0].length >= 7; // [ID, Tanggal, Kategori, Deskripsi, Debet, Kredit, Bukti]

    for (let i = 1; i < values.length; i++) {
      const dbId = values[i][0] ? String(values[i][0]) : ("OUT-" + (i + 1));
      if (isNewFormat) {
        tempRows.push({
          id: dbId,
          rowIndex: i + 1,
          tanggal: formatDateISO(values[i][1]),
          kategori: String(values[i][2] || "Umum"),
          deskripsi: String(values[i][3] || "-"),
          debet: parseNumber(values[i][4]),
          kredit: parseNumber(values[i][5]),
          bukti: String(values[i][6] || "")
        });
      } else {
        // Format lama 5 kolom
        tempRows.push({
          id: dbId,
          rowIndex: i + 1,
          tanggal: formatDateISO(values[i][1]),
          kategori: "Umum",
          deskripsi: String(values[i][2] || "-"),
          debet: parseNumber(values[i][3]),
          kredit: parseNumber(values[i][4]),
          bukti: ""
        });
      }
    }

    // Urutkan tanggal naik untuk hitung saldo berjalan
    tempRows.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    for (let i = 0; i < tempRows.length; i++) {
      const r = tempRows[i];
      runningSaldo += (r.debet - r.kredit);
      list.push({
        id: r.id,
        rowIndex: r.rowIndex,
        tanggal: r.tanggal,
        kategori: r.kategori,
        deskripsi: r.deskripsi,
        debet: r.debet,
        kredit: r.kredit,
        saldo: runningSaldo,
        bukti: r.bukti
      });
    }
  }

  return list.reverse();
}

function simpanPengeluaran(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PENGELUARAN);
  if (!sheet) return { success: false, message: "Sheet Pengeluaran tidak ditemukan!" };

  const tgl = data.tanggal ? formatDateISO(data.tanggal) : formatDateISO(new Date());
  const kategori = String(data.kategori || "Umum");
  const deskripsi = String(data.deskripsi || "-");
  const debet = parseNumber(data.debet);
  const kredit = parseNumber(data.kredit);
  const bukti = String(data.bukti || "");

  if (data.id) {
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(data.id)) {
        if (values[0].length >= 7) {
          sheet.getRange(i + 1, 1, 1, 7).setValues([[data.id, tgl, kategori, deskripsi, debet, kredit, bukti]]);
        } else {
          sheet.getRange(i + 1, 1, 1, 5).setValues([[data.id, tgl, deskripsi, debet, kredit]]);
        }
        return { success: true, message: "Transaksi kas berhasil diperbarui!" };
      }
    }
  }

  const newId = "OUT-" + Date.now();
  sheet.appendRow([newId, tgl, kategori, deskripsi, debet, kredit, bukti]);
  return { success: true, message: "Transaksi kas berhasil disimpan!" };
}

function hapusPengeluaran(id) {
  const success = deleteRowInSheet(SHEET_PENGELUARAN, id);
  return { success: success, message: success ? "Transaksi kas berhasil dihapus!" : "Transaksi kas tidak ditemukan!" };
}

// -------------------------------------------------------------
// 5. PUSAT ADUAN & SARAN (ASPIRASI WARGA)
// -------------------------------------------------------------
function getAduanData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sAduan = ss.getSheetByName(SHEET_ADUAN);
  if (!sAduan) return [];

  const values = sAduan.getDataRange().getValues();
  const list = [];

  if (values.length > 1) {
    for (let i = 1; i < values.length; i++) {
      if (!values[i][0] && !values[i][3]) continue;
      const isAnonim = String(values[i][6]).toLowerCase() === "true" || String(values[i][6]) === "1";

      list.push({
        id: String(values[i][0] || ("ADU-" + i)),
        tanggal: formatDateISO(values[i][1]),
        kategori: String(values[i][2] || "Umum"),
        judul: String(values[i][3] || "-"),
        deskripsi: String(values[i][4] || "-"),
        namaPengirim: isAnonim ? "Warga Anonim 🔒" : String(values[i][5] || "Warga"),
        isAnonim: isAnonim,
        blokRumah: isAnonim ? "Dirahasiakan" : String(values[i][7] || "-"),
        kontak: isAnonim ? "-" : String(values[i][8] || "-"),
        fotoUrl: String(values[i][9] || ""),
        status: String(values[i][10] || "Menunggu"), // Menunggu, Diproses, Selesai, Ditolak
        tanggapanRT: String(values[i][11] || ""),
        tanggalSelesai: formatDateISO(values[i][12])
      });
    }
  }

  return list.reverse(); // Terbaru di atas
}

function kirimAduan(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ADUAN);
  if (!sheet) return { success: false, message: "Sheet Aduan tidak ditemukan!" };

  const id = "ADU-" + Date.now();
  const tgl = formatDateISO(new Date());
  const kategori = String(data.kategori || "Umum");
  const judul = String(data.judul || "Aduan Warga");
  const deskripsi = String(data.deskripsi || "");
  const isAnonim = !!data.isAnonim;
  const nama = isAnonim ? "Warga Anonim" : String(data.nama || "Warga");
  const blokRumah = isAnonim ? "Dirahasiakan" : String(data.blokRumah || "-");
  const kontak = isAnonim ? "-" : String(data.kontak || "-");
  const fotoUrl = String(data.fotoUrl || "");
  const status = "Menunggu";
  const tanggapanRT = "";
  const tglSelesai = "";

  sheet.appendRow([id, tgl, kategori, judul, deskripsi, nama, isAnonim, blokRumah, kontak, fotoUrl, status, tanggapanRT, tglSelesai]);
  return { success: true, message: "Aduan/Saran Anda berhasil dikirim dan akan segera ditinjau oleh Pengurus RT/RW!" };
}

function tanggapiAduan(id, status, tanggapan) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_ADUAN);
  if (!sheet) return { success: false, message: "Sheet Aduan tidak ditemukan!" };

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.getRange(i + 1, 11).setValue(status); // Col 11: Status
      sheet.getRange(i + 1, 12).setValue(tanggapan); // Col 12: Tanggapan RT
      if (status === "Selesai") {
        sheet.getRange(i + 1, 13).setValue(formatDateISO(new Date())); // Col 13: Tanggal Selesai
      }
      return { success: true, message: "Tanggapan RT berhasil disimpan!" };
    }
  }

  return { success: false, message: "Aduan tidak ditemukan!" };
}

function hapusAduan(id) {
  const success = deleteRowInSheet(SHEET_ADUAN, id);
  return { success: success, message: success ? "Aduan berhasil dihapus!" : "Aduan tidak ditemukan!" };
}

// -------------------------------------------------------------
// 6. PROGRAM KERJA (KOMPATIBILITAS)
// -------------------------------------------------------------
function simpanProgram(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PROGRAM);
  if (!sheet) return { success: false, message: "Sheet Program tidak ditemukan!" };

  if (data.id) {
    const ok = updateRowInSheet(SHEET_PROGRAM, data.id, [
      data.id, data.nama, data.deskripsi, data.pelaksanaan, data.panitia, parseNumber(data.anggaran)
    ]);
    if (ok) return { success: true, message: "Program berhasil diperbarui!" };
  }

  const id = "PROG-" + Date.now();
  sheet.appendRow([id, data.nama, data.deskripsi, data.pelaksanaan, data.panitia, parseNumber(data.anggaran)]);
  return { success: true, message: "Program berhasil disimpan!" };
}

function hapusProgram(id) {
  const ok = deleteRowInSheet(SHEET_PROGRAM, id);
  return { success: ok, message: ok ? "Program berhasil dihapus!" : "Program tidak ditemukan!" };
}

// Kompatibilitas mundur untuk getPemasukanData
function getPemasukanData(selectedBlok) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sIuran = ss.getSheetByName(SHEET_IURAN);
  if (!sIuran) return { optionsBlok: [], list: [] };

  const values = sIuran.getDataRange().getValues();
  const optionsBlok = new Set();
  const list = [];

  if (values.length > 1) {
    for (let i = 1; i < values.length; i++) {
      const rawBlok = String(values[i][4] || "").trim().toUpperCase();
      if (!rawBlok) continue;
      optionsBlok.add(rawBlok);

      if (!selectedBlok || selectedBlok === "ALL" || selectedBlok.toUpperCase() === rawBlok) {
        list.push({
          id: String(values[i][0] || ("PEM-" + i)),
          blok: rawBlok,
          noRumah: String(values[i][5] || "-"),
          nama: String(values[i][6] || "-"),
          nominal: parseNumber(values[i][13]),
          tanggal: formatDateISO(values[i][14]),
          catatan: "Bulan " + values[i][2] + "/" + values[i][1] + " (" + values[i][15] + ")"
        });
      }
    }
  }

  return {
    optionsBlok: Array.from(optionsBlok).sort(),
    list: list
  };
}