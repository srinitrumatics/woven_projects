"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const sizeClasses = {
  sm: "max-w-lg",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-5xl",
} as const;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: keyof typeof sizeClasses;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideHeader?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  size = "sm",
  children,
  footer,
  hideHeader = false,
}: ModalProps) {
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <Dialog.Content
            aria-modal="true"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              lastFocusedRef.current?.focus();
            }}
            className={`modal-content pointer-events-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
          >
            {!hideHeader && (
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                <Dialog.Title className="text-lg font-bold text-gray-700 dark:text-white">
                  {title}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    aria-label="Close"
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            )}
            {hideHeader && <Dialog.Title className="sr-only">{title}</Dialog.Title>}

            <div className="p-6 overflow-y-auto scrollbar-thin flex-1">
              {children}
            </div>

            {footer && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end items-center gap-3 flex-shrink-0">
                {footer}
              </div>
            )}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
