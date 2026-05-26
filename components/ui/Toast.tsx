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

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
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

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 10000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

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

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
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
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30',
    error: 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30',
    info: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30',
    warning: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30',
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
        {toast.message}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
