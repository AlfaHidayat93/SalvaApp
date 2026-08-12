const SHEET_PROGRAM = "Program";
const SHEET_PEMASUKAN = "Pemasukan";
const SHEET_PENGELUARAN = "Pengeluaran";

// Setup Sheet otomatis jika belum ada
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let sProg = ss.getSheetByName(SHEET_PROGRAM);
  if (!sProg) {
    sProg = ss.insertSheet(SHEET_PROGRAM);
    sProg.appendRow(["ID", "Nama Program", "Deskripsi", "Pelaksanaan", "Panitia", "Anggaran"]);
  }
  
  let sPem = ss.getSheetByName(SHEET_PEMASUKAN);
  if (!sPem) {
    sPem = ss.insertSheet(SHEET_PEMASUKAN);
    // Kolom sesuai screenshot: Blok, No. Rumah, Nama Warga, Nominal, Catatan, Tanggal
    sPem.appendRow(["Blok", "No. Rumah", "Nama Warga", "Nominal", "Catatan", "Tanggal"]);
  }
  
  let sPeng = ss.getSheetByName(SHEET_PENGELUARAN);
  if (!sPeng) {
    sPeng = ss.insertSheet(SHEET_PENGELUARAN);
    sPeng.appendRow(["ID", "Tanggal", "Deskripsi", "Debet", "Kredit"]);
  }
  
  let sAdmin = ss.getSheetByName("Admin");
  if (!sAdmin) {
    sAdmin = ss.insertSheet("Admin");
    sAdmin.appendRow(["Username", "Password"]);
    sAdmin.appendRow(["admin", "admin123"]);
  }
}

// Endpoint Pembacaan Data (GET)
function doGet(e) {
  setupDatabase();
  const action = e.parameter.action || "getDashboardData";
  let result = {};

  try {
    if (action === "getDashboardData") {
      result = getDashboardData();
    } else if (action === "getPemasukanData") {
      const blok = e.parameter.blok || "ALL";
      result = getPemasukanData(blok);
    } else if (action === "getPengeluaranData") {
      result = getPengeluaranData();
    } else {
      result = { status: "error", message: "Action tidak dikenal" };
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return responseJSON(result);
}

// Endpoint Penyimpanan Data & Login (POST)
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
        result = { success: false, message: "Username/Password salah!" };
      }
    } else if (action === "simpanProgram") {
      result = simpanProgram(body.data);
    } else if (action === "hapusProgram") {
      result = hapusProgram(body.id);
    } else if (action === "simpanPemasukan") {
      result = simpanPemasukan(body.data);
    } else if (action === "hapusPemasukan") {
      result = hapusPemasukan(body.id);
    } else if (action === "simpanPengeluaran") {
      result = simpanPengeluaran(body.data);
    } else if (action === "hapusPengeluaran") {
      result = hapusPengeluaran(body.id);
    } else {
      result = { status: "error", message: "Action POST tidak dikenal" };
    }
  } catch (err) {
    result = { status: "error", message: err.toString() };
  }

  return responseJSON(result);
}

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
  } catch(e) {}
  return String(val);
}

function checkLoginFromSheet(username, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Admin");
  if (!sheet) return username === "admin" && password === "admin123";
  
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const sheetUser = String(values[i][0]).trim();
    const sheetPass = String(values[i][1]).trim();
    if (sheetUser === username && sheetPass === password) {
      return true;
    }
  }
  return false;
}

function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let totalIuran = 0;
  const sPem = ss.getSheetByName(SHEET_PEMASUKAN);
  if (sPem) {
    const valPem = sPem.getDataRange().getValues();
    if (valPem.length > 1) {
      for (let i = 1; i < valPem.length; i++) {
        totalIuran += Number(valPem[i][3]) || 0; // Kolom Nominal di index 3
      }
    }
  }

  let totalDebetPengeluaran = 0;
  let totalKreditPengeluaran = 0;
  const sPeng = ss.getSheetByName(SHEET_PENGELUARAN);
  if (sPeng) {
    const valPeng = sPeng.getDataRange().getValues();
    if (valPeng.length > 1) {
      for (let i = 1; i < valPeng.length; i++) {
        totalDebetPengeluaran += Number(valPeng[i][3]) || 0; // Kolom Debet di index 3
        totalKreditPengeluaran += Number(valPeng[i][4]) || 0; // Kolom Kredit di index 4
      }
    }
  }

  const sProg = ss.getSheetByName(SHEET_PROGRAM);
  const programs = [];
  if (sProg) {
    const valProg = sProg.getDataRange().getValues();
    if (valProg.length > 1) {
      for (let i = 1; i < valProg.length; i++) {
        programs.push({
          id: valProg[i][0],
          nama: valProg[i][1],
          deskripsi: valProg[i][2],
          pelaksanaan: valProg[i][3],
          panitia: valProg[i][4],
          anggaran: Number(valProg[i][5]) || 0
        });
      }
    }
  }

  return {
    summary: {
      totalIuranWarga: totalIuran + totalDebetPengeluaran,
      totalPengeluaran: totalKreditPengeluaran,
      saldoKas: (totalIuran + totalDebetPengeluaran) - totalKreditPengeluaran
    },
    programs: programs
  };
}

function getPemasukanData(selectedBlok) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sPem = ss.getSheetByName(SHEET_PEMASUKAN);
  if (!sPem) return { optionsBlok: [], list: [] };

  const values = sPem.getDataRange().getValues();
  const optionsBlok = new Set();
  const list = [];

  if (values.length > 1) {
    for (let i = 1; i < values.length; i++) {
      const rawBlok = String(values[i][0] || "").trim(); // Col A is Blok
      if (!rawBlok || rawBlok === "Blok" || rawBlok === "BLOK") continue;

      const cleanBlok = rawBlok.replace(/^blok\s*/i, "");
      optionsBlok.add(cleanBlok);

      if (!selectedBlok || selectedBlok === "ALL" || selectedBlok.toUpperCase() === cleanBlok.toUpperCase()) {
        list.push({
          id: "PEM-" + (i + 1), // Row-based virtual ID (1-indexed row number)
          blok: rawBlok,
          noRumah: values[i][1] || "-", // Col B is No Rumah
          nama: values[i][2] || "-",    // Col C is Nama
          nominal: Number(values[i][3]) || 0, // Col D is Nominal
          catatan: values[i][4] || "-", // Col E is Catatan
          tanggal: formatDateISO(values[i][5]) // Col F is Tanggal
        });
      }
    }
  }

  return {
    optionsBlok: Array.from(optionsBlok).sort(),
    list: list
  };
}

function getPengeluaranData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sPeng = ss.getSheetByName(SHEET_PENGELUARAN);
  if (!sPeng) return [];

  const values = sPeng.getDataRange().getValues();
  const list = [];
  let runningSaldo = 0;

  if (values.length > 1) {
    const tempRows = [];
    for (let i = 1; i < values.length; i++) {
      const dbId = values[i][0] ? String(values[i][0]) : ("OUT-" + (i + 1));
      tempRows.push({
        id: dbId,
        rowIndex: i + 1,
        tanggal: formatDateISO(values[i][1]),
        deskripsi: values[i][2],
        debet: Number(values[i][3]) || 0,
        kredit: Number(values[i][4]) || 0
      });
    }

    // Sort by date ascending for correct running balance calculation
    tempRows.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    // Calculate running balance
    for (let i = 0; i < tempRows.length; i++) {
      const r = tempRows[i];
      runningSaldo += (r.debet - r.kredit);
      list.push({
        id: r.id,
        rowIndex: r.rowIndex,
        tanggal: r.tanggal,
        deskripsi: r.deskripsi,
        debet: r.debet,
        kredit: r.kredit,
        saldo: runningSaldo
      });
    }
  }

  return list.reverse();
}

function updateRowInSheet(sheetName, id, dataArray) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
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
    if (values[i][0] === id) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function simpanProgram(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PROGRAM);
  
  if (data.id) {
    const success = updateRowInSheet(SHEET_PROGRAM, data.id, [
      data.id, data.nama, data.deskripsi, data.pelaksanaan, data.panitia, Number(data.anggaran)
    ]);
    if (success) {
      return { success: true, message: "Program berhasil diperbarui!" };
    }
  }
  
  const id = "PROG-" + Date.now();
  sheet.appendRow([id, data.nama, data.deskripsi, data.pelaksanaan, data.panitia, Number(data.anggaran)]);
  return { success: true, message: "Program berhasil disimpan!" };
}

function hapusProgram(id) {
  const success = deleteRowInSheet(SHEET_PROGRAM, id);
  return { success: success, message: success ? "Program berhasil dihapus!" : "Program tidak ditemukan!" };
}

function simpanPemasukan(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PEMASUKAN);
  
  const tgl = data.tanggal ? formatDateISO(data.tanggal) : formatDateISO(new Date());
  
  if (data.id && data.id.startsWith("PEM-")) {
    const rowNum = parseInt(data.id.split('-')[1], 10);
    if (rowNum > 1 && rowNum <= sheet.getLastRow()) {
      sheet.getRange(rowNum, 1, 1, 6).setValues([[
        data.blok, data.noRumah, data.nama, Number(data.nominal), data.catatan, tgl
      ]]);
      return { success: true, message: "Pemasukan berhasil diperbarui!" };
    }
  }
  
  sheet.appendRow([data.blok, data.noRumah, data.nama, Number(data.nominal), data.catatan, tgl]);
  return { success: true, message: "Pemasukan berhasil disimpan!" };
}

function hapusPemasukan(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PEMASUKAN);
  if (id && id.startsWith("PEM-")) {
    const rowNum = parseInt(id.split('-')[1], 10);
    if (rowNum > 1 && rowNum <= sheet.getLastRow()) {
      sheet.deleteRow(rowNum);
      return { success: true, message: "Pemasukan berhasil dihapus!" };
    }
  }
  return { success: false, message: "Pemasukan tidak ditemukan!" };
}

function simpanPengeluaran(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PENGELUARAN);
  const tgl = data.tanggal ? formatDateISO(data.tanggal) : formatDateISO(new Date());
  
  if (data.id) {
    const values = sheet.getDataRange().getValues();
    
    // 1. Cari berdasarkan ID di Kolom A
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && String(values[i][0]) === String(data.id)) {
        sheet.getRange(i + 1, 1, 1, 5).setValues([[
          data.id, tgl, data.deskripsi, Number(data.debet), Number(data.kredit)
        ]]);
        return { success: true, message: "Pengeluaran berhasil diperbarui!" };
      }
    }
    
    // 2. Fallback berdasarkan nomor baris jika format virtual OUT-rowNum
    if (data.id.startsWith("OUT-")) {
      const rowNum = parseInt(data.id.split('-')[1], 10);
      if (rowNum > 1 && rowNum <= sheet.getLastRow()) {
        const existingId = values[rowNum - 1][0] || "";
        sheet.getRange(rowNum, 1, 1, 5).setValues([[
          existingId, tgl, data.deskripsi, Number(data.debet), Number(data.kredit)
        ]]);
        return { success: true, message: "Pengeluaran berhasil diperbarui!" };
      }
    }
  }
  
  const newId = "OUT-" + Date.now();
  sheet.appendRow([newId, tgl, data.deskripsi, Number(data.debet), Number(data.kredit)]);
  return { success: true, message: "Pengeluaran berhasil disimpan!" };
}

function hapusPengeluaran(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PENGELUARAN);
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] && String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Pengeluaran berhasil dihapus!" };
    }
  }
  
  if (id && String(id).startsWith("OUT-")) {
    const rowNum = parseInt(id.split('-')[1], 10);
    if (rowNum > 1 && rowNum <= sheet.getLastRow()) {
      sheet.deleteRow(rowNum);
      return { success: true, message: "Pengeluaran berhasil dihapus!" };
    }
  }
  
  return { success: false, message: "Pengeluaran tidak ditemukan!" };
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}