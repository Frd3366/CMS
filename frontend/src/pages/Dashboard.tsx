import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarOff,
  MapPin,
  Clock,
  Layers,
  Search,
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';
import { getShiftBadgeStyle, getJobdeskBadgeStyle, getContrastTextColor } from '../utils/codeStyles';

export const Dashboard: React.FC = () => {
  const { employees, schedules, shifts, jobdesks, currentUser } = useAuth();
  const navigate = useNavigate();

  const getTodayIso = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayIso());
  const [locationFilter, setLocationFilter] = useState<'All' | 'Badung' | 'Denpasar'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterJobdesk] = useState<string>('all');

  const [activeModalTitle, setActiveModalTitle] = useState<string | null>(null);
  const [modalAssignments, setModalAssignments] = useState<any[]>([]);

  useEffect(() => {
    if (!activeModalTitle) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModalTitle(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalTitle]);

  const dayAssignments = useMemo(() => {
    return schedules.filter((s) => {
      if (s.date !== selectedDate) return false;
      if (currentUser?.role === 'Employee' && s.publicationStatus !== 'Published') {
        return false;
      }
      if (locationFilter !== 'All' && s.location !== locationFilter) {
        return false;
      }
      return true;
    });
  }, [schedules, selectedDate, locationFilter, currentUser]);

  const kpis = useMemo(() => {
    const totalKaryawan = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'active').length;
    const workingToday = dayAssignments.filter((s) => s.shiftCode !== 'OFF').length;
    const offDay = dayAssignments.filter((s) => s.shiftCode === 'OFF').length;
    const badungShift = dayAssignments.filter((s) => s.location === 'Badung' && s.shiftCode !== 'OFF').length;
    const denpasarShift = dayAssignments.filter((s) => s.location === 'Denpasar' && s.shiftCode !== 'OFF').length;

    return { totalKaryawan, activeEmployees, workingToday, offDay, badungShift, denpasarShift };
  }, [employees, dayAssignments]);

  const kanbanColumns = useMemo(() => {
    const activeMasterJobdesks = jobdesks.filter((j) => j.status === 'active' || !j.status);
    const targetJobdesks = activeMasterJobdesks.length > 0 ? activeMasterJobdesks : jobdesks;
    return targetJobdesks.map((jd) => {
      const items = dayAssignments.filter((s) => s.jobdeskCode === jd.code);
      return {
        code: jd.code,
        name: jd.name || jd.code,
        description: jd.description || '',
        color: jd.color || '#0284C7',
        textColor: jd.textColor,
        items
      };
    });
  }, [dayAssignments, jobdesks]);

  const shiftGroups = useMemo(() => {
    return shifts.map((sh) => {
      const items = dayAssignments.filter((s) => s.shiftCode === sh.code);
      return {
        ...sh,
        count: items.length,
        items
      };
    });
  }, [shifts, dayAssignments]);

  const filteredRoster = useMemo(() => {
    return dayAssignments.filter((item) => {
      if (filterShift !== 'all' && item.shiftCode !== filterShift) return false;
      if (filterJobdesk !== 'all' && item.jobdeskCode !== filterJobdesk) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.employeeName.toLowerCase().includes(q);
        const matchCode = item.employeeCode.toLowerCase().includes(q);
        const matchLoc = (item.location || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchLoc) return false;
      }
      return true;
    });
  }, [dayAssignments, filterShift, filterJobdesk, searchQuery]);

  const getShiftHours = (shiftCode: string) => {
    const sh = shifts.find((s) => s.code === shiftCode);
    if (!sh) return '-';
    if (sh.isOff) return 'OFF (Rest)';
    return `${sh.startTime} - ${sh.endTime}${sh.endDayOffset > 0 ? ' (+1)' : ''}`;
  };

  const openKpiDetail = (title: string, list: any[]) => {
    setActiveModalTitle(title);
    setModalAssignments(list);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#18181A] p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-[#F2F4F7] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
            Realtime operational monitoring, Jobdesk Allocation, and Personnel Attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-[#0F172A] dark:text-white transition-all shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-gray-300" aria-hidden="true" />
            <span className="sr-only">Pilih Tanggal Operasional</span>
            <input
              type="date"
              aria-label="Pilih Tanggal Operasional"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-xs text-[#0F172A] dark:text-white"
            />
          </label>

          <div className="flex items-center p-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-xs" role="group" aria-label="Filter Lokasi Hub">
            {(['All', 'Badung', 'Denpasar'] as const).map((loc) => {
              const label = loc === 'All' ? 'All Hubs' : loc;
              const isActive = locationFilter === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setLocationFilter(loc)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-xs dark:bg-white dark:text-[#0F172A]'
                      : 'text-slate-600 dark:text-gray-300 hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <button
          type="button"
          onClick={() =>
            openKpiDetail(
              'Master Employees',
              employees.map((e) => ({
                employeeName: e.name,
                employeeCode: e.employeeNo,
                shiftCode: e.level,
                jobdeskCode: undefined,
                location: e.defaultLocation,
                publicationStatus: e.status === 'active' ? 'Active' : 'Inactive'
              }))
            )
          }
          className="text-left bg-white dark:bg-[#18181A] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-xs transition-all flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">Total Personnel</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-center">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#0F172A] dark:text-white font-mono tracking-tight">
              {kpis.totalKaryawan}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                {kpis.activeEmployees} Aktif
              </span>
              <span className="text-[11px] text-slate-600 dark:text-gray-300">Registered staff</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            openKpiDetail(
              `Working Personnel (${selectedDate})`,
              dayAssignments.filter((s) => s.shiftCode !== 'OFF')
            )
          }
          className="text-left bg-white dark:bg-[#18181A] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-xs transition-all flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">Working Today</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center">
              <UserCheck className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#0F172A] dark:text-white font-mono tracking-tight">
              {kpis.workingToday}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <span className={`w-1.5 h-1.5 rounded-full ${kpis.workingToday > 0 ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                On Duty
              </span>
              <span className="text-[11px] text-slate-600 dark:text-gray-300">
                {kpis.workingToday > 0 ? 'Active roster' : 'Not active'}
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            openKpiDetail(
              `Employees on Off Day (${selectedDate})`,
              dayAssignments.filter((s) => s.shiftCode === 'OFF')
            )
          }
          className="text-left bg-white dark:bg-[#18181A] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-rose-400 dark:hover:border-rose-500/60 shadow-xs transition-all flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">Off Day</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center">
              <CalendarOff className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#0F172A] dark:text-white font-mono tracking-tight">
              {kpis.offDay}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                Rest Code
              </span>
              <span className="text-[11px] text-slate-600 dark:text-gray-300">Scheduled off</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            openKpiDetail(
              `Badung Hub Roster (${selectedDate})`,
              dayAssignments.filter((s) => s.location === 'Badung' && s.shiftCode !== 'OFF')
            )
          }
          className="text-left bg-white dark:bg-[#18181A] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-xs transition-all flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">Badung Hub</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center">
              <MapPin className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#0F172A] dark:text-white font-mono tracking-tight">
              {kpis.badungShift}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                <span className={`w-1.5 h-1.5 rounded-full ${kpis.badungShift > 0 ? 'bg-amber-600' : 'bg-slate-400'}`} />
                Kerobokan
              </span>
              <span className="text-[11px] text-slate-600 dark:text-gray-300">
                {kpis.badungShift > 0 ? 'Active duty' : 'Not active'}
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            openKpiDetail(
              `Denpasar Hub Roster (${selectedDate})`,
              dayAssignments.filter((s) => s.location === 'Denpasar' && s.shiftCode !== 'OFF')
            )
          }
          className="text-left bg-white dark:bg-[#18181A] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-sky-400 dark:hover:border-sky-500/60 shadow-xs transition-all flex flex-col justify-between min-h-[148px]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">Denpasar Hub</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 flex items-center justify-center">
              <MapPin className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#0F172A] dark:text-white font-mono tracking-tight">
              {kpis.denpasarShift}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50">
                <span className={`w-1.5 h-1.5 rounded-full ${kpis.denpasarShift > 0 ? 'bg-sky-600' : 'bg-slate-400'}`} />
                Gatsu Timur
              </span>
              <span className="text-[11px] text-slate-600 dark:text-gray-300">
                {kpis.denpasarShift > 0 ? 'Active duty' : 'Not active'}
              </span>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#18181A] p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <span>Jobdesk Allocation Today</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                  Daily personnel assignment across CT1 (Dispatch), CT2 (Surveillance), CT4 (Field)
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/jobdesk')}
                className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                <span>Buka Matriks Jobdesk</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {kanbanColumns.map((col) => (
                <div
                  key={col.code}
                  className="bg-white dark:bg-[#18181A] rounded-xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-[#18181A]">
                    <span
                      style={{
                        backgroundColor: col.color,
                        color: col.textColor || getContrastTextColor(col.color)
                      }}
                      className="text-xs font-black font-mono px-3 py-1 rounded-md shadow-2xs inline-block"
                    >
                      {col.code}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2.5 flex-1 min-h-[160px] bg-slate-50/50 dark:bg-white/[0.02]">
                    {col.items.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center p-6 text-xs text-slate-500 dark:text-gray-400 italic">
                        Tidak ada personel bertugas di {col.code} pada tanggal ini.
                      </div>
                    ) : (
                      col.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openKpiDetail(`Assignment Detail: ${item.employeeName}`, [item])}
                          className={`w-full text-left p-3 rounded-xl border-0 hover:opacity-95 space-y-2 transition-all ${
                            getJobdeskBadgeStyle(col.code).card
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-current truncate">
                              {item.employeeName}
                            </span>
                            <span className="text-[10px] font-mono text-current opacity-80">
                              {item.employeeCode}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-current/15">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${getShiftBadgeStyle(item.shiftCode).badge}`}>
                              {item.shiftCode}
                            </span>

                            <span className="flex items-center gap-1 text-current opacity-85 text-[10px] font-medium font-mono">
                              <MapPin className="w-3 h-3 text-current opacity-75" aria-hidden="true" />
                              {item.location || '-'}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181A] p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div>
                <h2 className="text-sm font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <span>Personnel Roster Directory</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-gray-300 mt-1">
                  Full list of scheduled personnel for {selectedDate} ({filteredRoster.length} records)
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none z-10" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Cari nama atau ID personel"
                    placeholder="Search name, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[#0F172A] dark:text-white placeholder-slate-500 shadow-2xs"
                  />
                </div>

                <select
                  aria-label="Filter berdasarkan shift"
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-[#0F172A] dark:text-white font-semibold shadow-2xs"
                >
                  <option value="all">All Shifts</option>
                  {shifts.map((sh) => (
                    <option key={sh.id} value={sh.code}>
                      {sh.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 dark:border-white/10 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-white/5 text-slate-600 dark:text-gray-300 font-bold border-b border-slate-200/80 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4">Jobdesk</th>
                    <th className="py-3 px-4">Hub Location</th>
                    <th className="py-3 px-4">Working Hours</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-slate-600 dark:text-gray-300 italic">
                        Tidak ada jadwal personel untuk filter tanggal ini. Buka menu Schedule untuk menambahkan jadwal.
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#0F172A] dark:text-white">{item.employeeName}</div>
                          <div className="text-[10px] text-slate-600 dark:text-gray-300 font-mono mt-0.5">{item.employeeCode}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                              getShiftBadgeStyle(item.shiftCode).badge
                            }`}
                          >
                            {item.shiftCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.jobdeskCode ? (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono ${
                              getJobdeskBadgeStyle(item.jobdeskCode).badge
                            }`}>
                              {item.jobdeskCode}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600 dark:text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1.5 text-[#0F172A] dark:text-gray-200 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                            {item.location || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-gray-300 font-mono text-[11px]">
                          {getShiftHours(item.shiftCode)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.publicationStatus === 'Published'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                                : 'bg-[#FFFBEA] dark:bg-amber-950 text-[#8C6700] dark:text-amber-300 border border-[#FFEE85]'
                            }`}
                          >
                            {item.publicationStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#18181A] p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Shift Distribution</span>
              </h2>
              <span className="text-[11px] text-slate-600 dark:text-gray-300">Click shift to view</span>
            </div>

            <div className="space-y-3">
              {shiftGroups.map((sh) => {
                const total = dayAssignments.length || 1;
                const pct = Math.round((sh.count / total) * 100);

                return (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => openKpiDetail(`Shift Personnel: ${sh.name}`, sh.items)}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-white mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            backgroundColor: sh.color || '#0284C7',
                            color: sh.textColor || getContrastTextColor(sh.color || '#0284C7')
                          }}
                          className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs"
                        >
                          {sh.code}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-gray-300">
                          {sh.startTime} - {sh.endTime}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#0F172A] dark:text-white">{sh.count} Staff</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: sh.color || '#F9C900' }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {activeModalTitle &&
        createPortal(
          <div
            className="fixed inset-0 z-50 !mt-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label={activeModalTitle}
            onClick={() => setActiveModalTitle(null)}
          >
            <div
              className="bg-white dark:bg-[#18181A] rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#111111] dark:text-white">{activeModalTitle}</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-300">
                    Total {modalAssignments.length} records matching this category
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Tutup dialog"
                  onClick={() => setActiveModalTitle(null)}
                  className="p-2 text-slate-500 hover:text-[#111111] dark:text-gray-300 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 pr-1">
                {modalAssignments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-600 dark:text-gray-300 italic">
                    Tidak ada personel dalam kategori ini pada tanggal {selectedDate}.
                  </div>
                ) : (
                  modalAssignments.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#111111] dark:text-white">{item.employeeName}</div>
                        <div className="text-[11px] text-slate-600 dark:text-gray-300 font-mono">
                          {item.employeeCode} &bull; {item.location || 'Hub'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${getShiftBadgeStyle(item.shiftCode).badge}`}>
                          {item.shiftCode}
                        </span>
                        {item.jobdeskCode && (
                          <span className={`ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${getJobdeskBadgeStyle(item.jobdeskCode).badge}`}>
                            {item.jobdeskCode}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 text-right">
                <button
                  type="button"
                  onClick={() => setActiveModalTitle(null)}
                  className="px-4 py-2 rounded-xl bg-[#111111] text-[#F9C900] dark:bg-white dark:text-[#111111] text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
