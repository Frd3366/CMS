// Google Sheets Auto-Backup Helper for CTSO Management System
// Supports custom Google Sheet URL (changeable anytime) and configurable interval (default: 60 mins / 1 hour)
import { API_BASE } from '../api/client';

export interface GoogleSheetsBackupConfig {
  enabled: boolean;
  sheetUrl: string;
  scriptUrl: string;
  intervalMinutes: number; // default 60 (1 hour)
  lastBackupAt?: string;
  lastBackupTimestamp?: number;
  lastStatus?: 'idle' | 'success' | 'error';
  lastMessage?: string;
}

const STORAGE_KEY = 'ctso_cms_gsheets_backup_config';

export const getGoogleSheetsConfig = (): GoogleSheetsBackupConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: !!parsed.enabled,
        sheetUrl: parsed.sheetUrl || '',
        scriptUrl: parsed.scriptUrl || '',
        intervalMinutes: Number(parsed.intervalMinutes) || 60,
        lastBackupAt: parsed.lastBackupAt || '-',
        lastBackupTimestamp: parsed.lastBackupTimestamp || 0,
        lastStatus: parsed.lastStatus || 'idle',
        lastMessage: parsed.lastMessage || ''
      };
    }
  } catch (e) {
    console.warn('Failed to read Google Sheets config from storage', e);
  }
  return {
    enabled: false,
    sheetUrl: '',
    scriptUrl: '',
    intervalMinutes: 60,
    lastBackupAt: '-',
    lastBackupTimestamp: 0,
    lastStatus: 'idle',
    lastMessage: ''
  };
};

export const saveGoogleSheetsConfig = (config: GoogleSheetsBackupConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('cms_gsheets_config_updated'));
  } catch (e) {
    console.warn('Failed to save Google Sheets config to storage', e);
  }
};

export const extractSpreadsheetId = (urlOrId: string): string => {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return trimmed;
};

export interface BackupDataSnapshot {
  schedules: any[];
  employees: any[];
  shifts: any[];
  jobdesks: any[];
  requests: any[];
  leaves: any[];
}

export const formatBackupPayload = (snapshot: BackupDataSnapshot, sheetUrl: string) => {
  const nowWita =
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Makassar'
    })
      .format(new Date())
      .replace(/\./g, ':') + ' WITA';

  return {
    sheetUrl: sheetUrl.trim(),
    spreadsheetId: extractSpreadsheetId(sheetUrl),
    timestamp: nowWita,
    schedules: (snapshot.schedules || []).map((s) => [
      s.date || '',
      s.employeeCode || '',
      s.employeeName || '',
      s.shiftCode || '',
      s.jobdeskCode || '-',
      s.location || '-',
      s.publicationStatus || 'Published',
      s.updatedAt || nowWita
    ]),
    employees: (snapshot.employees || []).map((e) => [
      e.employeeNo || '',
      e.name || '',
      e.level || '',
      e.role || '',
      e.email || '',
      e.phone || '',
      e.defaultLocation || '',
      e.status || 'active'
    ]),
    shifts: (snapshot.shifts || []).map((sh) => [
      sh.code || '',
      sh.name || '',
      sh.startTime || '',
      sh.endTime || '',
      sh.status || 'active',
      sh.note || ''
    ]),
    jobdesks: (snapshot.jobdesks || []).map((jd) => [
      jd.code || '',
      jd.name || '',
      jd.description || '',
      jd.status || 'active'
    ]),
    requests: (snapshot.requests || []).map((r) => [
      r.id || '',
      r.requestType || '',
      r.requesterName || '',
      r.replacementName || '-',
      r.workDate || '',
      r.currentShift || '',
      r.requestedShift || r.requestedJobdesk || '-',
      r.status || '',
      r.reason || ''
    ]),
    leaves: (snapshot.leaves || []).map((l) => [
      l.id || '',
      l.employeeName || '',
      l.type || '',
      l.startDate || '',
      l.endDate || '',
      l.status || '',
      l.reason || ''
    ])
  };
};

export const executeGoogleSheetsBackup = async (
  snapshot: BackupDataSnapshot,
  customConfig?: GoogleSheetsBackupConfig
): Promise<{ success: boolean; message: string; timestamp: string }> => {
  const config = customConfig || getGoogleSheetsConfig();

  if (!config.sheetUrl.trim()) {
    return {
      success: false,
      message: 'Link Google Sheets belum diisi.',
      timestamp: config.lastBackupAt || '-'
    };
  }

  const payload = formatBackupPayload(snapshot, config.sheetUrl);

  // If user pasted an Apps Script Web App URL either in scriptUrl or directly in sheetUrl
  const targetEndpoint =
    config.scriptUrl.trim() ||
    (config.sheetUrl.includes('script.google.com') ? config.sheetUrl.trim() : '');

  if (!targetEndpoint) {
    return {
      success: false,
      message: 'Masukkan URL Web App Google Apps Script untuk menghubungkan penulisan otomatis ke Sheet.',
      timestamp: config.lastBackupAt || '-'
    };
  }

  // Attempt 1: Via Backend API
  try {
    const res = await fetch(`${API_BASE}/gsheets/backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptUrl: targetEndpoint,
        payload
      })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        const updated: GoogleSheetsBackupConfig = {
          ...config,
          lastBackupAt: payload.timestamp,
          lastBackupTimestamp: Date.now(),
          lastStatus: 'success',
          lastMessage: 'Backup otomatis berhasil dikirim via server.'
        };
        saveGoogleSheetsConfig(updated);
        return {
          success: true,
          message: 'Data berhasil di-backup ke Google Sheets!',
          timestamp: payload.timestamp
        };
      }
    }
  } catch {
    // Fallback to client browser fetch
  }

  // Attempt 2: Direct Browser Fetch to Google Apps Script Web App
  try {
    await fetch(targetEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const updated: GoogleSheetsBackupConfig = {
      ...config,
      lastBackupAt: payload.timestamp,
      lastBackupTimestamp: Date.now(),
      lastStatus: 'success',
      lastMessage: 'Backup berhasil dikirim ke Google Sheets.'
    };
    saveGoogleSheetsConfig(updated);

    return {
      success: true,
      message: 'Data berhasil di-backup ke Google Sheets!',
      timestamp: payload.timestamp
    };
  } catch (err: any) {
    const updated: GoogleSheetsBackupConfig = {
      ...config,
      lastStatus: 'error',
      lastMessage: err?.message || 'Gagal menghubungi Google Sheets.'
    };
    saveGoogleSheetsConfig(updated);
    return {
      success: false,
      message: err?.message || 'Gagal mengirim backup ke Google Sheets.',
      timestamp: config.lastBackupAt || '-'
    };
  }
};

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    // Membuka Google Sheet sesuai Link yang diinput di CMS (bisa diganti-ganti kapan saja)
    var ss = data.sheetUrl && data.sheetUrl.indexOf("docs.google.com/spreadsheets") !== -1
      ? SpreadsheetApp.openByUrl(data.sheetUrl)
      : SpreadsheetApp.getActiveSpreadsheet();

    function syncTab(sheetName, headers, rows) {
      var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
      sheet.clearContents();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#F9C900");
      if (rows && rows.length > 0) {
        sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
    }

    syncTab("Jadwal_Shift", ["Tanggal", "ID Karyawan", "Nama Karyawan", "Kode Shift", "Jobdesk", "Lokasi Hub", "Status", "Waktu Update"], data.schedules);
    syncTab("Master_Karyawan", ["ID Karyawan", "Nama", "Jabatan", "Role", "Email", "No HP", "Lokasi Default", "Status"], data.employees);
    syncTab("Master_Shift", ["Kode Shift", "Nama Shift", "Jam Mulai", "Jam Selesai", "Status", "Catatan"], data.shifts);
    syncTab("Master_Jobdesk", ["Kode Jobdesk", "Nama Fungsi", "Deskripsi", "Status"], data.jobdesks);
    syncTab("Requests_Shift", ["ID Request", "Jenis", "Pemohon", "Rekan Pengganti", "Tanggal", "Shift Asal", "Shift/Jobdesk Tujuan", "Status", "Alasan"], data.requests);
    syncTab("Leaves_Cuti", ["ID Cuti", "Nama Karyawan", "Kategori", "Tgl Mulai", "Tgl Selesai", "Status", "Keterangan"], data.leaves);

    return ContentService.createTextOutput(JSON.stringify({ ok: true, updatedAt: data.timestamp }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
