import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SpvPermissionConfig, EmployeePermissionConfig } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Building,
  Save,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Lock,
  UserCog,
  UserCheck,
  ShieldAlert,
  CalendarDays,
  ArrowLeftRight,
  FileSpreadsheet,
  Megaphone,
  Layers,
  History
} from 'lucide-react';

export const RolePermission: React.FC = () => {
  const {
    spvPermissions,
    updateSpvPermissions,
    employeePermissions,
    updateEmployeePermissions,
    teams,
    currentUser
  } = useAuth();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<'SPV' | 'Employee' | 'Admin'>('SPV');
  const [spvPerms, setSpvPerms] = useState<SpvPermissionConfig>(spvPermissions);
  const [empPerms, setEmpPerms] = useState<EmployeePermissionConfig>(employeePermissions);

  const isAdmin = currentUser?.role === 'Admin';

  const handleToggleSpv = (key: keyof Omit<SpvPermissionConfig, 'teamScopeIds'>) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat memodifikasi matriks izin.', 'error');
      return;
    }
    setSpvPerms((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleTeamScope = (teamId: string) => {
    if (!isAdmin) return;
    setSpvPerms((prev) => {
      const exists = prev.teamScopeIds.includes(teamId);
      const updated = exists
        ? prev.teamScopeIds.filter((id) => id !== teamId)
        : [...prev.teamScopeIds, teamId];
      return {
        ...prev,
        teamScopeIds: updated
      };
    });
  };

  const handleToggleEmp = (key: keyof EmployeePermissionConfig) => {
    if (!isAdmin) {
      showToast('Akses ditolak: Hanya Admin yang dapat memodifikasi matriks izin.', 'error');
      return;
    }
    setEmpPerms((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSpv = () => {
    if (!isAdmin) return;
    updateSpvPermissions(spvPerms);
    showToast('Matriks hak akses dan cakupan SPV berhasil disimpan.', 'success');
  };

  const handleSaveEmp = () => {
    if (!isAdmin) return;
    updateEmployeePermissions(empPerms);
    showToast('Matriks hak akses Employee / Staf berhasil disimpan.', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#18181A] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#111111] dark:text-[#F2F4F7] tracking-tight">
              Role & Permissions
            </h1>
          </div>
          <p className="text-xs text-[#647084] dark:text-gray-400 mt-1">
            Configure granular feature permissions, security rules, and team scopes for SPV and Employee roles.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {selectedRole === 'SPV' && (
              <button
                type="button"
                onClick={handleSaveSpv}
                className="px-4 py-2 rounded-xl bg-[#F9C900] hover:bg-[#E5B800] text-[#111111] border border-[#E5B800] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Izin SPV</span>
              </button>
            )}
            {selectedRole === 'Employee' && (
              <button
                type="button"
                onClick={handleSaveEmp}
                className="px-4 py-2 rounded-xl bg-[#F9C900] hover:bg-[#E5B800] text-[#111111] border border-[#E5B800] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Izin Employee</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Role Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 max-w-xl">
        <button
          type="button"
          onClick={() => setSelectedRole('SPV')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'SPV'
              ? 'bg-white dark:bg-[#18181A] text-[#111111] dark:text-[#F9C900] shadow-sm border border-slate-200/80 dark:border-white/15'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCog className="w-4 h-4" />
          <span>Supervisor (SPV)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('Employee')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'Employee'
              ? 'bg-white dark:bg-[#18181A] text-[#111111] dark:text-[#F9C900] shadow-sm border border-slate-200/80 dark:border-white/15'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee (Staf)</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('Admin')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'Admin'
              ? 'bg-white dark:bg-[#18181A] text-[#111111] dark:text-[#F9C900] shadow-sm border border-slate-200/80 dark:border-white/15'
              : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Administrator</span>
        </button>
      </div>

      {/* TAB 1: SUPERVISOR (SPV) */}
      {selectedRole === 'SPV' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left 2 Cols: Granular Feature Permissions */}
          <div className="lg:col-span-2 bg-sky-50/40 dark:bg-sky-950/20 rounded-2xl border border-sky-200/80 dark:border-sky-800/40 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-sky-200/60 dark:border-white/10 bg-sky-100/40 dark:bg-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-[#111111] dark:text-[#F9C900]" />
                  <span>Matriks Izin Operasional Supervisor (SPV)</span>
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Admin dapat menentukan wewenang operasional SPV dalam mengelola roster dan persetujuan tugas.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300">
                8 Izin Tersedia
              </span>
            </div>

            <div className="divide-y divide-sky-100 dark:divide-white/10">
              {/* View Draft */}
              <div className="p-4 flex items-center justify-between hover:bg-sky-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Akses Draft Jadwal (View Draft)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat melihat roster yang masih berstatus Draft</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={spvPerms.canViewDraft}
                  onChange={() => handleToggleSpv('canViewDraft')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Edit Schedule */}
              <div className="p-4 flex items-center justify-between hover:bg-sky-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Pengelolaan Roster (Create / Edit / Delete Schedule)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat menambah, mengubah, dan memindahkan assignment roster</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={spvPerms.canEditSchedule}
                  onChange={() => handleToggleSpv('canEditSchedule')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Publish Schedule */}
              <div className="p-4 flex items-center justify-between hover:bg-sky-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Publikasi Roster (Publish Schedule)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat mengubah status Draft menjadi Published untuk Employee</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={spvPerms.canPublishSchedule}
                  onChange={() => handleToggleSpv('canPublishSchedule')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Manage Jobdesk */}
              <div className="p-4 flex items-center justify-between hover:bg-sky-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Alokasi Jobdesk (Manage Jobdesk)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat mengatur pembagian personel pada CT1, CT2, dan CT4</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={spvPerms.canManageJobdesk}
                  onChange={() => handleToggleSpv('canManageJobdesk')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Approve Requests */}
              <div className="p-4 flex items-center justify-between hover:bg-sky-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Persetujuan Tukar Shift (Approve Shift Exchange)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat menyetujui pengajuan tukar shift setelah disetujui pengganti</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={spvPerms.canApproveRequest}
                  onChange={() => handleToggleSpv('canApproveRequest')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Approve Leaves */}
              <div className="p-4 flex items-center justify-between hover:bg-sky-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Persetujuan Cuti & Izin (Approve Leave)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat menyetujui atau menolak permohonan cuti personel</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={spvPerms.canApproveLeave}
                  onChange={() => handleToggleSpv('canApproveLeave')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Manage Announcements */}
              <div className="p-4 flex items-center justify-between hover:bg-sky-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Publikasi Pengumuman (Manage Announcements)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat membuat dan menyiarkan bulletin operasional tim</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={spvPerms.canManageAnnouncement}
                  onChange={() => handleToggleSpv('canManageAnnouncement')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Export Reports */}
              <div className="p-4 flex items-center justify-between hover:bg-sky-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Ekspor Laporan (Export Reports)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat mengunduh file CSV/PDF rekapitulasi roster</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={spvPerms.canExportReport}
                  onChange={() => handleToggleSpv('canExportReport')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Col: Team Scope Assignment (PRD 7.6) */}
          <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-amber-200/60 dark:border-white/10 bg-amber-100/40 dark:bg-white/5">
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Cakupan Team SPV (Team Scope)
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Membatasi visibilitas dan Activity Log SPV berdasarkan kelompok tim yang menjadi tanggung jawabnya (PRD 2.2).
                </p>
              </div>

              <div className="p-4 space-y-3">
                {teams.map((t) => {
                  const isChecked = spvPerms.teamScopeIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-amber-100/80 dark:bg-amber-500/20 border-amber-300 dark:border-amber-700'
                          : 'bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:bg-amber-50/60 dark:hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={!isAdmin}
                        checked={isChecked}
                        onChange={() => handleToggleTeamScope(t.id)}
                        className="mt-0.5 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                          {t.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-amber-100/30 dark:bg-white/5 border-t border-amber-200/60 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400">
              Catatan: Lokasi kerja Badung dan Denpasar melekat pada roster harian dan terpisah dari konsep Team ini (PRD 7.6).
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE (STAF OPERASIONAL) */}
      {selectedRole === 'Employee' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left 2 Cols: Employee Granular Permissions */}
          <div className="lg:col-span-2 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-emerald-200/60 dark:border-white/10 bg-emerald-100/40 dark:bg-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Matriks Izin Operasional Karyawan (Employee)</span>
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Wewenang self-service staf operasional CTSO untuk melihat jadwal, pengajuan tukar shift, dan cuti.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                7 Fitur Self-Service
              </span>
            </div>

            <div className="divide-y divide-emerald-100 dark:divide-white/10">
              {/* View Schedule */}
              <div className="p-4 flex items-center justify-between hover:bg-emerald-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Akses Jadwal Roster (View Published Schedule)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat melihat roster kerja harian, mingguan, dan bulanan yang sudah Published</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={empPerms.canViewSchedule}
                  onChange={() => handleToggleEmp('canViewSchedule')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Request Swap */}
              <div className="p-4 flex items-center justify-between hover:bg-emerald-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Pengajuan Tukar Shift Mandiri (Request Shift Exchange)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat mengajukan permohonan pertukaran jadwal kerja dengan rekan satu tim</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={empPerms.canRequestSwap}
                  onChange={() => handleToggleEmp('canRequestSwap')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Respond Swap */}
              <div className="p-4 flex items-center justify-between hover:bg-emerald-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Konfirmasi Persetujuan Pengganti (Respond Swap Consent)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat menyetujui atau menolak ajakan tukar shift dari personel lain sebelum diteruskan ke SPV</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={empPerms.canRespondSwap}
                  onChange={() => handleToggleEmp('canRespondSwap')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Apply Leave */}
              <div className="p-4 flex items-center justify-between hover:bg-emerald-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Pengajuan Cuti & Izin (Apply Leave & Absence)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat mengajukan permohonan cuti tahunan, izin darurat, atau keterangan sakit</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={empPerms.canApplyLeave}
                  onChange={() => handleToggleEmp('canApplyLeave')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* View Jobdesk */}
              <div className="p-4 flex items-center justify-between hover:bg-emerald-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Akses Rincian Jobdesk (View Jobdesk Allocations)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat melihat peran tugas operasional CT1, CT2, dan CT4 pada hari tugasnya</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={empPerms.canViewJobdesk}
                  onChange={() => handleToggleEmp('canViewJobdesk')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* View Announcements */}
              <div className="p-4 flex items-center justify-between hover:bg-emerald-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Akses Papan Pengumuman (View Broadcasts)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat membaca instruksi dan bulletin pemeliharaan jaringan yang disiarkan</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={empPerms.canViewAnnouncements}
                  onChange={() => handleToggleEmp('canViewAnnouncements')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Download Schedule */}
              <div className="p-4 flex items-center justify-between hover:bg-emerald-100/30 dark:hover:bg-white/5 transition-colors">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Unduh Jadwal Kalender Pribadi (Download Schedule)</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Dapat mengunduh ringkasan kalender shift pribadi untuk integrasi gawai</div>
                </div>
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={empPerms.canDownloadSchedule}
                  onChange={() => handleToggleEmp('canDownloadSchedule')}
                  className="w-4 h-4 rounded text-[#111111] focus:ring-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Col: Strict Employee Access Boundaries */}
          <div className="bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-rose-200/60 dark:border-white/10 bg-rose-100/40 dark:bg-white/5">
                <h2 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Batasan Akses Employee (Security Boundary)</span>
                </h2>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                  Sesuai ketentuan keamanan sistem, Employee secara otomatis <strong>tidak memiliki akses</strong> ke modul berikut:
                </p>
              </div>

              <div className="p-4 space-y-2.5 text-xs">
                <div className="p-3 bg-white/80 dark:bg-white/5 rounded-xl border border-rose-200/80 dark:border-rose-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Akun Pengguna</div>
                      <div className="text-[10px] text-slate-500">/management/users</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    Akses Tertutup
                  </span>
                </div>

                <div className="p-3 bg-white/80 dark:bg-white/5 rounded-xl border border-rose-200/80 dark:border-rose-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Hak Akses & Izin</div>
                      <div className="text-[10px] text-slate-500">/management/permissions</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    Akses Tertutup
                  </span>
                </div>

                <div className="p-3 bg-white/80 dark:bg-white/5 rounded-xl border border-rose-200/80 dark:border-rose-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Activity Logs (Audit Forensik)</div>
                      <div className="text-[10px] text-slate-500">/management/activity-logs</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    Akses Tertutup
                  </span>
                </div>

                <div className="p-3 bg-white/80 dark:bg-white/5 rounded-xl border border-rose-200/80 dark:border-rose-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Schedule History & Diff</div>
                      <div className="text-[10px] text-slate-500">/management/schedule-history</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    Akses Tertutup
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-rose-100/30 dark:bg-white/5 border-t border-rose-200/60 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400">
              Menu ini otomatis disembunyikan dari sidebar navigasi akun bertipe Employee.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADMINISTRATOR OVERVIEW */}
      {selectedRole === 'Admin' && (
        <div className="bg-slate-50/60 dark:bg-white/5 p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#111111] dark:bg-white text-[#F9C900] dark:text-[#111111] shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Administrator (Super Admin Privileges)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Role Administrator memiliki wewenang penuh tanpa batas di seluruh sistem CTSO CMS.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-white dark:bg-[#18181A] rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Master Data CRUD</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Menambah, mengedit, dan menghapus kode shift, jobdesk, master karyawan, serta akun pengguna.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#18181A] rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Global Schedule Bypass</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Melihat seluruh draft jadwal, auto-generate jadwal lintas tim, dan publikasi tanpa pembatasan Team Scope.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-[#18181A] rounded-xl border border-slate-200 dark:border-white/10 space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Audit & Security Control</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Mengatur matriks hak akses SPV & Employee, audit forensik, dan pembersihan Schedule History permanen.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
