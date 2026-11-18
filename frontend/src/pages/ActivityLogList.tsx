import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Search,
  ShieldCheck,
  Download,
  Lock
} from 'lucide-react';

export const ActivityLogList: React.FC = () => {
  const { activityLogs, currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // PRD 11.1: Admin can see ALL logs; SPV can only see logs within their Team scope (Max 100 logs)
  const visibleLogs = useMemo(() => {
    let list = activityLogs;

    if (currentUser?.role === 'SPV') {
      const allowedTeamIds = ['team_core', 'team_fop'];
      list = list.filter((log) => !log.teamId || allowedTeamIds.includes(log.teamId));
    }

    return list
      .filter((log) => {
        if (entityFilter !== 'All' && log.entityType !== entityFilter) return false;
        if (roleFilter !== 'All' && log.actorRole !== roleFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            log.actorName.toLowerCase().includes(q) ||
            log.description.toLowerCase().includes(q) ||
            log.action.toLowerCase().includes(q) ||
            log.createdAt.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .slice(0, 100);
  }, [activityLogs, currentUser, entityFilter, roleFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Pelaku', 'Role', 'Aksi', 'Kategori', 'Deskripsi', 'Status'];
    const rows = visibleLogs.map((l) => [
      `"${l.createdAt}"`,
      `"${l.actorName}"`,
      l.actorRole,
      l.action,
      l.entityType,
      `"${l.description.replace(/"/g, '""')}"`,
      l.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CTSO_Activity_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Log audit aktivitas berhasil diekspor.', 'success');
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="bg-white dark:bg-[#18181A] px-4 py-3.5 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-[#111111] dark:text-[#F2F4F7] tracking-tight">
            Activity Logs
          </h1>
          <p className="text-[11px] text-[#647084] dark:text-gray-400 mt-0.5">
            Permanent audit trail tracking user logins, data mutations, approvals, and administrative actions (Max 100 recent logs).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-300">
            <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Audit Immutability: Active</span>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-700 dark:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3 h-3 text-slate-500 dark:text-slate-300" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Audit Policy Banner */}
      <div className="py-2 px-3 bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/50 rounded-lg text-[11px] text-sky-950 dark:text-sky-200 flex items-center gap-2.5">
        <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
        <div className="leading-snug">
          <strong>Kebijakan Audit CTSO:</strong> Activity Log tidak termasuk dalam fitur penghapusan Schedule History (maksimal menampilkan 100 log terbaru).
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white dark:bg-[#18181A] px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-black/20"
          >
            <option value="All">Semua Entitas</option>
            <option value="auth">Autentikasi (Auth)</option>
            <option value="schedule">Jadwal & Roster</option>
            <option value="request">Request Shifting</option>
            <option value="leave">Cuti / Izin</option>
            <option value="employee">Karyawan</option>
            <option value="permission">Permission</option>
            <option value="announcement">Pengumuman</option>
            <option value="history">Penghapusan Histori</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-black/20"
          >
            <option value="All">Semua Role</option>
            <option value="Admin">Admin</option>
            <option value="SPV">SPV</option>
            <option value="Employee">Employee</option>
          </select>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 dark:text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pelaku atau aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-white bg-white dark:bg-black/20 w-48 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Menampilkan: <strong>{visibleLogs.length}</strong> / Maks 100 log
        </div>
      </div>

      {/* Table of Activity Logs */}
      <div className="bg-white dark:bg-[#18181A] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2 px-3">Waktu (WITA)</th>
                <th className="py-2 px-3">Pelaku / Pengguna</th>
                <th className="py-2 px-3">Aksi</th>
                <th className="py-2 px-3">Entitas</th>
                <th className="py-2 px-3">Deskripsi Aktivitas</th>
                <th className="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {visibleLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 dark:text-gray-500">
                    Tidak ada aktivitas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                visibleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-1.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {log.createdAt}
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white">{log.actorName}</span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-1.5">
                        ({log.actorRole})
                      </span>
                    </td>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-800 dark:text-[#F9C900] text-[11px] whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300 text-[11px]">
                      {log.description}
                    </td>
                    <td className="py-1.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        {log.status}
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
  );
};
