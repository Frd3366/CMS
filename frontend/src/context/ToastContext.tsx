import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ToastItem, ToastType } from '../types';
import { useAuth } from './AuthContext';
import { useModalState } from './ModalContext';

interface ToastContextType {
  toasts: ToastItem[];
  pendingCount: number;
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
  clearQueue: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_CHANNEL_NAME = 'gx_cms_toasts';
const MAX_ACTIVE_TOASTS = 3; // TOAST-01
const MAX_PENDING_QUEUE = 10; // TOAST-22
const DEFAULT_DURATION = 3000; // TOAST-03 (3 detik)

// Format message according to TOAST-12 (Max 80 chars with ellipsis)
export const formatToastText = (msg: string): string => {
  if (msg.length <= 80) return msg;
  return msg.slice(0, 77) + '...';
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { isAnyModalOpen } = useModalState();

  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const [pendingQueue, setPendingQueue] = useState<ToastItem[]>([]);
  const [isTabActive, setIsTabActive] = useState<boolean>(!document.hidden);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const pausedToastsRef = useRef<Set<string>>(new Set());
  const timerMapRef = useRef<Map<string, { timeoutId: any; remaining: number; startedAt: number }>>(new Map());

  // Set up BroadcastChannel (TOAST-28, TOAST-29, TOAST-30)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    try {
      const channel = new BroadcastChannel(TOAST_CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const payload = event.data;
        if (!payload || !currentUser || payload.userId !== currentUser.userId) return; // TOAST-30: user isolation

        if (payload.action === 'ADD') {
          handleIncomingToast(payload.toast, false);
        } else if (payload.action === 'DISMISS') {
          handleDismissInternal(payload.id, false);
        } else if (payload.action === 'DISMISS_ALL') {
          handleDismissAllInternal(false);
        }
      };

      return () => {
        channel.close();
      };
    } catch (e) {
      console.warn('Toast BroadcastChannel init failed:', e);
    }
  }, [currentUser]);

  // Tab visibility tracker (TOAST-19, TOAST-20, TOAST-26)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const active = !document.hidden;
      setIsTabActive(active);

      if (active) {
        // Tab became active: prune expired items using global expiresAt
        const now = Date.now();
        setActiveToasts((prev) => {
          const valid = prev.filter((t) => t.expiresAt > now);
          return valid;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Listen to Global Logout cleanup event (AUTH-07, TOAST-27)
  useEffect(() => {
    const handleClearEvent = () => {
      clearAllInternal();
    };
    window.addEventListener('gx:clear-toasts', handleClearEvent);
    return () => window.removeEventListener('gx:clear-toasts', handleClearEvent);
  }, []);

  // Dismiss on page navigation / browser refresh (TOAST-18)
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearAllInternal();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Keyboard navigation: Esc key dismisses all active toasts (TOAST-14)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Only if modal is not handling it
        if (!isAnyModalOpen && activeToasts.length > 0) {
          dismissAllToasts();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnyModalOpen, activeToasts]);

  // Auto-fill active toasts from pending queue if active < 3 (FIFO, TOAST-01, TOAST-02)
  useEffect(() => {
    if (activeToasts.length < MAX_ACTIVE_TOASTS && pendingQueue.length > 0) {
      const nextItem = pendingQueue[0];
      setPendingQueue((prev) => prev.slice(1));
      
      const now = Date.now();
      const itemWithTimes: ToastItem = {
        ...nextItem,
        createdAt: now,
        expiresAt: now + nextItem.duration,
      };

      setActiveToasts((prev) => [...prev, itemWithTimes]);
      startToastTimer(itemWithTimes.id, itemWithTimes.duration);
    }
  }, [activeToasts.length, pendingQueue]);

  // Start auto-dismiss timer (TOAST-03, TOAST-20)
  const startToastTimer = useCallback((id: string, durationMs: number) => {
    if (timerMapRef.current.has(id)) {
      clearTimeout(timerMapRef.current.get(id)!.timeoutId);
    }

    const startedAt = Date.now();
    const timeoutId = setTimeout(() => {
      handleDismissInternal(id, true);
    }, durationMs);

    timerMapRef.current.set(id, {
      timeoutId,
      remaining: durationMs,
      startedAt,
    });
  }, []);

  // Internal dismiss
  const handleDismissInternal = useCallback((id: string, broadcast: boolean = true) => {
    if (timerMapRef.current.has(id)) {
      clearTimeout(timerMapRef.current.get(id)!.timeoutId);
      timerMapRef.current.delete(id);
    }
    pausedToastsRef.current.delete(id);

    setActiveToasts((prev) => prev.filter((t) => t.id !== id));

    if (broadcast && channelRef.current && currentUser) {
      try {
        channelRef.current.postMessage({
          action: 'DISMISS',
          id,
          userId: currentUser.userId,
        });
      } catch (err) {
        console.warn('Toast broadcast failed', err);
      }
    }
  }, [currentUser]);

  const handleDismissAllInternal = useCallback((broadcast: boolean = true) => {
    timerMapRef.current.forEach((val) => clearTimeout(val.timeoutId));
    timerMapRef.current.clear();
    pausedToastsRef.current.clear();
    setActiveToasts([]);
    setPendingQueue([]);

    if (broadcast && channelRef.current && currentUser) {
      try {
        channelRef.current.postMessage({
          action: 'DISMISS_ALL',
          userId: currentUser.userId,
        });
      } catch (err) {
        console.warn('Toast broadcast failed', err);
      }
    }
  }, [currentUser]);

  const clearAllInternal = () => {
    timerMapRef.current.forEach((val) => clearTimeout(val.timeoutId));
    timerMapRef.current.clear();
    pausedToastsRef.current.clear();
    setActiveToasts([]);
    setPendingQueue([]);
  };

  // Add toast logic (handles FIFO, Max 3 active, Max 10 pending, Replace Latest on overflow, Duplicates allowed)
  const handleIncomingToast = useCallback(
    (toast: ToastItem, broadcast: boolean = true) => {
      // Check active slot availability
      setActiveToasts((prevActive) => {
        if (prevActive.length < MAX_ACTIVE_TOASTS) {
          const now = Date.now();
          const activated: ToastItem = {
            ...toast,
            createdAt: now,
            expiresAt: now + toast.duration,
          };
          startToastTimer(activated.id, activated.duration);
          return [...prevActive, activated];
        } else {
          // Push to pending queue
          setPendingQueue((prevQueue) => {
            if (prevQueue.length >= MAX_PENDING_QUEUE) {
              // TOAST-23: Overflow Replace Latest: replace the last element in pending queue
              const replaced = [...prevQueue.slice(0, MAX_PENDING_QUEUE - 1), toast];
              return replaced;
            }
            return [...prevQueue, toast];
          });
          return prevActive;
        }
      });

      if (broadcast && channelRef.current && currentUser) {
        try {
          channelRef.current.postMessage({
            action: 'ADD',
            toast,
            userId: currentUser.userId,
          });
        } catch (err) {
          console.warn('Toast broadcast failed', err);
        }
      }
    },
    [currentUser, startToastTimer]
  );

  // User-facing showToast
  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      // Create internal opaque correlation ID (R-01)
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const truncatedMessage = formatToastText(message); // TOAST-12

      const newToast: ToastItem = {
        id,
        message: truncatedMessage,
        type,
        duration: DEFAULT_DURATION,
        createdAt: Date.now(),
        expiresAt: Date.now() + DEFAULT_DURATION,
      };

      handleIncomingToast(newToast, true);
    },
    [handleIncomingToast]
  );

  const dismissToast = useCallback(
    (id: string) => {
      handleDismissInternal(id, true);
    },
    [handleDismissInternal]
  );

  const dismissAllToasts = useCallback(() => {
    handleDismissAllInternal(true);
  }, [handleDismissAllInternal]);

  // Pause on hover (TOAST-05)
  const pauseToast = useCallback((id: string) => {
    const timerData = timerMapRef.current.get(id);
    if (!timerData) return;

    clearTimeout(timerData.timeoutId);
    const elapsed = Date.now() - timerData.startedAt;
    const remaining = Math.max(200, timerData.remaining - elapsed);

    pausedToastsRef.current.add(id);
    timerMapRef.current.set(id, {
      ...timerData,
      remaining,
    });
  }, []);

  // Resume on pointer leave (TOAST-05)
  const resumeToast = useCallback(
    (id: string) => {
      if (!pausedToastsRef.current.has(id)) return;
      pausedToastsRef.current.delete(id);

      const timerData = timerMapRef.current.get(id);
      if (!timerData) return;

      const startedAt = Date.now();
      const timeoutId = setTimeout(() => {
        handleDismissInternal(id, true);
      }, timerData.remaining);

      timerMapRef.current.set(id, {
        timeoutId,
        remaining: timerData.remaining,
        startedAt,
      });
    },
    [handleDismissInternal]
  );

  const clearQueue = useCallback(() => {
    setPendingQueue([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts: isTabActive ? activeToasts : [], // TOAST-19, TOAST-26: only rendered on active tab
        pendingCount: pendingQueue.length,
        showToast,
        dismissToast,
        dismissAllToasts,
        pauseToast,
        resumeToast,
        clearQueue,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
