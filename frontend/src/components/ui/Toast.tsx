'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const TOAST_ICONS = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const TOAST_STYLES = {
  success: {
    container: 'bg-white border-green-200 shadow-lg',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-600',
  },
  error: {
    container: 'bg-white border-red-200 shadow-lg',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-600',
  },
  warning: {
    container: 'bg-white border-yellow-200 shadow-lg',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    message: 'text-yellow-600',
  },
  info: {
    container: 'bg-white border-blue-200 shadow-lg',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-600',
  },
};

export default function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(toast.duration || 5000);

  const IconComponent = TOAST_ICONS[toast.type];
  const styles = TOAST_STYLES[toast.type];

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          handleClose();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  const progressPercentage = toast.duration ? (timeLeft / toast.duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`
            relative border rounded-lg p-4 max-w-sm w-full pointer-events-auto
            backdrop-blur-sm
            ${styles.container}
          `}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Progress Bar */}
          {toast.duration && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-500"
                initial={{ width: '100%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          )}

          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${styles.icon}`}>
              <IconComponent className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${styles.title}`}>
                {toast.title}
              </div>
              {toast.message && (
                <div className={`text-sm mt-1 ${styles.message}`}>
                  {toast.message}
                </div>
              )}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className={`
                    text-sm font-medium mt-2 px-3 py-1 rounded-md
                    ${toast.type === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                    ${toast.type === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                    ${toast.type === 'warning' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                    ${toast.type === 'info' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                    transition-colors
                  `}
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}