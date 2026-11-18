import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CheckCheck,
  CalendarDays,
  Layers,
  ArrowLeftRight,
  UserPlus,
  Megaphone,
  Info,
  ExternalLink,
  X,
  Trash2
} from 'lucide-react';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    currentUser
  } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Filter based on targetRole or targetUserId
  const visibleNotifications = notifications.filter((n) => {
    if (n.targetRole === 'all') return true;
    if (currentUser?.role === 'Admin') return true;
    if (n.targetRole && n.targetRole === currentUser?.role) return true;
    if (n.targetUserId && n.targetUserId === currentUser?.id) return true;
    return false;
  });

  const unreadCount = visibleNotifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'schedule_change':
        return <CalendarDays className="w-4 h-4 text-[#111111]" />;
      case 'jobdesk_change':
        return <Layers className="w-4 h-4 text-[#111111]" />;
      case 'request':
        return <ArrowLeftRight className="w-4 h-4 text-[#8C6700]" />;
      case 'employee':
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-[#647084]" />;
    }
  };

  const handleItemClick = (notif: (typeof visibleNotifications)[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.linkPath) {
      navigate(notif.linkPath);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#18181A] rounded-2xl shadow-clean-lg border border-[#E2E8F0] dark:border-white/10 z-50 overflow-hidden animate-fade-in text-[#111111] dark:text-white">
      {/* Header */}
      <div className="px-4 py-3 bg-[#F5F6F8] dark:bg-white/5 border-b border-[#E2E8F0] dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#111111] dark:text-[#F9C900]" />
          <h3 className="text-xs font-extrabold text-[#111111] dark:text-white tracking-wide">
            Notification Center
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F9C900] text-[#111111]">
              {unreadCount} baru
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {visibleNotifications.length > 0 && (
            <button
              type="button"
              onClick={clearNotifications}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Hapus dan bersihkan semua notifikasi"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          )}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-[11px] font-bold text-[#111111] dark:text-[#F9C900] hover:underline flex items-center gap-1 transition-colors"
              title="Tandai semua telah dibaca"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Baca Semua</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#647084] dark:text-gray-400 hover:text-[#111111] dark:hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E2E8F0] dark:divide-white/10">
        {visibleNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <Bell className="w-8 h-8 text-[#CBD5E1] dark:text-white/20 mx-auto mb-2" />
            <p className="text-xs text-[#647084] dark:text-gray-400 font-medium">Belum ada notifikasi.</p>
          </div>
        ) : (
          visibleNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-3.5 hover:bg-[#F5F6F8] dark:hover:bg-white/5 cursor-pointer transition-colors flex items-start gap-3 ${
                !n.isRead ? 'bg-[#E7F0FE]/40 dark:bg-amber-500/10' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 bg-white dark:bg-white/10 rounded-lg border border-[#CBD5E1] dark:border-white/10 shadow-2xs flex-shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-[#111111] dark:text-white truncate">
                    {n.title}
                  </h4>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#F9C900] ring-1 ring-[#111111] dark:ring-white/50 flex-shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-[#647084] dark:text-gray-300 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-[#647084] dark:text-gray-400">
                  <span>{n.createdAt}</span>
                  {n.linkPath && (
                    <span className="text-[#111111] dark:text-[#F9C900] font-bold flex items-center gap-0.5 hover:underline">
                      Lihat Detail <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-[#F5F6F8] dark:bg-white/5 border-t border-[#E2E8F0] dark:border-white/10 text-center">
        <button
          type="button"
          onClick={() => {
            navigate('/management/requests');
            onClose();
          }}
          className="text-[11px] font-bold text-[#111111] dark:text-[#F9C900] hover:text-[#8C6700] transition-colors"
        >
          Buka Seluruh Alur Operasional &rarr;
        </button>
      </div>
    </div>
  );
};
