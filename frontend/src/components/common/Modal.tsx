import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModalState } from '../../context/ModalContext';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  allowEsc?: boolean;
  closeOnBackdrop?: boolean;
  maxWidth?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  badge?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  allowEsc = true,
  closeOnBackdrop = true,
  maxWidth = 'max-w-lg',
  size,
  badge,
}) => {
  const resolvedMaxWidth = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : size === 'xl' ? 'max-w-4xl' : maxWidth;
  const { registerModal } = useModalState();

  useEffect(() => {
    if (!isOpen) return;
    const unregister = registerModal();
    return () => unregister();
  }, [isOpen, registerModal]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allowEsc) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allowEsc, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto !mt-0"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="fixed inset-0 bg-[#202938]/60 backdrop-blur-sm transition-opacity animate-fade-in !mt-0"
        onClick={() => {
          if (closeOnBackdrop) {
            onClose();
          }
        }}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#18181A] text-left shadow-2xl transition-all sm:my-8 w-full ${resolvedMaxWidth} border border-slate-200/80 dark:border-white/10 animate-scale-up`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-[#111111] dark:text-white leading-6">
                {title}
              </h3>
              {badge}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="px-6 py-5 text-sm text-[#111111] dark:text-gray-200">
            {children}
          </div>

          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-white/[0.03] border-t border-slate-100 dark:border-white/10">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
