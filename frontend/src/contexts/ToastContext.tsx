'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastData, ToastType } from '@/components/ui/Toast';
import { AnimatePresence } from 'framer-motion';

interface ToastContextType {
  showToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 5000,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration,
      action,
    };

    setToasts(prev => {
      const newToasts = [newToast, ...prev];
      // Limit the number of toasts shown at once
      return newToasts.slice(0, maxToasts);
    });
  }, [maxToasts]);

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string) => {
    showToast('success', title, message);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast('error', title, message);
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast('warning', title, message);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast('info', title, message);
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Export context for advanced usage
export { ToastContext };