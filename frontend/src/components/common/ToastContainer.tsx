import React from 'react';
import { useToast } from '../../context/ToastContext';
import { useModalState } from '../../context/ModalContext';
import { ToastType } from '../../types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-[#8C6700] flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-[#111111] flex-shrink-0" />
};

const TOAST_STYLES: Record<ToastType, { border: string; bg: string; text: string; badge: string }> = {
  success: {
    border: 'border-emerald-200',
    bg: 'bg-white',
    text: 'text-[#111111]',
    badge: 'bg-emerald-50 text-emerald-700'
  },
  error: {
    border: 'border-rose-200',
    bg: 'bg-white',
    text: 'text-[#111111]',
    badge: 'bg-rose-50 text-rose-700'
  },
  warning: {
    border: 'border-[#FFEE85]',
    bg: 'bg-white',
    text: 'text-[#111111]',
    badge: 'bg-[#FFFBEA] text-[#8C6700] font-bold'
  },
  info: {
    border: 'border-[#CBD5E1]',
    bg: 'bg-white',
    text: 'text-[#111111]',
    badge: 'bg-[#E7F0FE] text-[#111111] font-bold'
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, pauseToast, resumeToast } = useToast();
  const { isAnyModalOpen } = useModalState();

  if (isAnyModalOpen || toasts.length === 0) {
    return null;
  }

  // PRD Section 10.1:
  // - Posisi: Sisi kiri layar
  // - Durasi: 3 detik
  // - Maksimal 3 toast tampil bersamaan
  // - Compact dan tidak menghalangi interaksi utama
  const visibleToasts = toasts.slice(0, 3);

  return (
    <div
      className="fixed bottom-6 left-6 z-50 pointer-events-none flex flex-col gap-2 max-w-sm w-full transition-all duration-200"
      aria-live="polite"
      aria-label="Notifikasi toast operasional"
    >
      {visibleToasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            onMouseEnter={() => pauseToast(toast.id)}
            onMouseLeave={() => resumeToast(toast.id)}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl border ${style.border} ${style.bg} shadow-clean-md animate-fade-in`}
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5">{TOAST_ICONS[toast.type]}</span>
              <div>
                <p className={`text-xs font-bold ${style.text}`}>{toast.message}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${style.badge}`}>
                    {toast.type}
                  </span>
                  <span className="text-[10px] text-[#647084]">CTSO Hub</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#647084] hover:text-[#111111] p-1 rounded transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
