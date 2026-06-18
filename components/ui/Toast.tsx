"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XMarkIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number, onConfirm?: () => void, onCancel?: () => void) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000, onConfirm?: () => void, onCancel?: () => void) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration, onConfirm, onCancel }]);

    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const success = (msg: string, dur?: number) => showToast(msg, 'success', dur);
  const error = (msg: string, dur?: number) => showToast(msg, 'error', dur);
  const info = (msg: string, dur?: number) => showToast(msg, 'info', dur);
  const warning = (msg: string, dur?: number) => showToast(msg, 'warning', dur);
  const confirm = (msg: string, onConfirm: () => void, onCancel?: () => void) => showToast(msg, 'confirm', Infinity, onConfirm, onCancel);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, confirm }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: () => void }) => {
  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <ExclamationCircleIcon className="w-6 h-6 text-red-500" />,
    info: <InformationCircleIcon className="w-6 h-6 text-primary" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />,
    confirm: <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30',
    error: 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30',
    info: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30',
    warning: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30',
    confirm: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      layout
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md min-w-[320px] max-w-md ${bgColors[toast.type]}`}
    >
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
        <div className="mb-1">{toast.message}</div>
        {toast.type === 'confirm' && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                toast.onConfirm?.();
                onRemove();
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                toast.onCancel?.();
                onRemove();
              }}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      {toast.type !== 'confirm' && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 self-start"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};
