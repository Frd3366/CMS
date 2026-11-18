import React, { useState, useEffect, useRef } from 'react';
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
  Trash2,
  ChevronRight
} from 'lucide-react';

interface TopRightNotificationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const TopRightNotification: React.FC<TopRightNotificationProps> = ({
  isOpen,
  onToggle,
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

  // Filter based on targetRole or targetUserId
  const visibleNotifications = notifications.filter((n) => {
    if (n.targetRole === 'all') return true;
    if (currentUser?.role === 'Admin') return true;
    if (n.targetRole && n.targetRole === currentUser?.role) return true;
    if (n.targetUserId && n.targetUserId === currentUser?.id) return true;
    return false;
  });

  const unreadCount = visibleNotifications.filter((n) => !n.isRead).length;

  // Take top 3 for the 1-line 3-second cycling ticker
  const topThree = visibleNotifications.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTickerHovered, setIsTickerHovered] = useState(false);
  const [isTickerDismissed, setIsTickerDismissed] = useState(false);
  const [isAutoCollapsed, setIsAutoCollapsed] = useState(false);

  // Auto-collapse into icon after 3 seconds of notification presence
  useEffect(() => {
    if (topThree.length === 0 || isTickerHovered || isOpen || isTickerDismissed) return;

    // Reset collapsed state when new notifications arrive
    setIsAutoCollapsed(false);

    const timer = setTimeout(() => {
      setIsAutoCollapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [topThree.length, visibleNotifications[0]?.id, isTickerHovered, isOpen, isTickerDismissed]);

  // Rotate between top 3 items if ticker is active and not collapsed
  useEffect(() => {
    if (topThree.length <= 1 || isTickerHovered || isOpen || isTickerDismissed || isAutoCollapsed) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % topThree.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [topThree.length, isTickerHovered, isOpen, isTickerDismissed, isAutoCollapsed]);

  const activeNotif = topThree[activeIndex] || topThree[0];

  const getIcon = (type: string) => {
    switch (type) {
      case 'schedule_change':
        return <CalendarDays className="w-3.5 h-3.5 text-[#111111] dark:text-[#F9C900]" />;
      case 'jobdesk_change':
        return <Layers className="w-3.5 h-3.5 text-[#111111] dark:text-[#F9C900]" />;
      case 'request':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-[#8C6700] dark:text-[#F9C900]" />;
      case 'employee':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'announcement':
        return <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#647084] dark:text-gray-400" />;
    }
  };

  const handleItemClick = (notif: (typeof visibleNotifications)[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.linkPath) {
      navigate(notif.linkPath);
      onClose();
    }
  };

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-20 left-4 lg:left-24 z-50 animate-fade-in w-80 sm:w-96 bg-white dark:bg-[#18181A] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden text-[#0F172A] dark:text-white max-h-[75vh] flex flex-col"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-black text-[#0F172A] dark:text-white tracking-wide">
            Notification Center
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-mono">
              {unreadCount} baru
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors text-xs flex items-center gap-1 font-semibold"
              title="Tandai semua dibaca"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {visibleNotifications.length > 0 && (
            <button
              type="button"
              onClick={clearNotifications}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
              title="Hapus semua"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/10 overscroll-contain">
            {visibleNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Bell className="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Belum ada notifikasi.</p>
              </div>
            ) : (
              visibleNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-start gap-3 ${
                    !n.isRead ? 'bg-[#E7F0FE]/40 dark:bg-amber-500/10' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 bg-white dark:bg-white/10 rounded-lg border border-slate-200 dark:border-white/10 shadow-2xs flex-shrink-0">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#F9C900] ring-1 ring-[#111111] dark:ring-white/50 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-gray-400">
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
          <div className="p-2.5 bg-[#F5F6F8] dark:bg-white/5 border-t border-slate-200 dark:border-white/10 text-center flex-shrink-0">
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
