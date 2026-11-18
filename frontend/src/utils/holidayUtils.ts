export interface HolidayRecord {
  [dateIso: string]: string; // e.g. "2026-11-10": "Hari Pahlawan"
}

const DEFAULT_HOLIDAYS: HolidayRecord = {
  '2026-01-01': 'Tahun Baru Masehi',
  '2026-02-17': 'Tahun Baru Imlek',
  '2026-03-19': 'Hari Raya Nyepi',
  '2026-03-20': 'Hari Raya Idul Fitri',
  '2026-05-01': 'Hari Buruh',
  '2026-05-14': 'Kenaikan Isa Almasih',
  '2026-05-31': 'Hari Raya Waisak',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-08-17': 'Hari Kemerdekaan RI',
  '2026-11-10': 'Hari Pahlawan',
  '2026-12-25': 'Hari Raya Natal'
};

export const getStoredHolidays = (): HolidayRecord => {
  try {
    const raw = localStorage.getItem('cms_holidays');
    if (raw) return { ...DEFAULT_HOLIDAYS, ...JSON.parse(raw) };
  } catch (e) {
    // fallback
  }
  return DEFAULT_HOLIDAYS;
};

export const saveStoredHolidays = (holidays: HolidayRecord) => {
  try {
    localStorage.setItem('cms_holidays', JSON.stringify(holidays));
    window.dispatchEvent(new Event('cms_holidays_updated'));
  } catch (e) {
    // fallback
  }
};
