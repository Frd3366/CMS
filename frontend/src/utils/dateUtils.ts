/**
 * Reliable local-time date utilities to prevent timezone date shifting (UTC midnight bug)
 * Especially critical in WITA (UTC+8), WIB (UTC+7), and WIT (UTC+9)
 */

export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
  return new Date(dateStr);
};

export const formatLocalDateIso = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayIso = (): string => {
  return formatLocalDateIso(new Date());
};

export const getWeekAheadIso = (days = 7): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatLocalDateIso(d);
};

export const formatDateDMY = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};
