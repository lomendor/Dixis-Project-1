'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { logger } from '@/lib/logging/productionLogger';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
}

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    updateAvailable: false
  });

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if service workers are supported
    const isSupported = 'serviceWorker' in navigator;
    setSwState(prev => ({ ...prev, isSupported }));

    if (!isSupported) {
      logger.info('Service Workers not supported');
      return;
    }

    // Register service worker
    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => setSwState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSwState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setSwState(prev => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      logger.info('Service Worker registered successfully:', registration);
      setSwState(prev => ({ ...prev, isRegistered: true }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              setSwState(prev => ({ ...prev, updateAvailable: true }));
              logger.info('New service worker update available');
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        logger.info('Message from service worker:', event.data);
      });

    } catch (error) {
      logger.error('Service Worker registration failed:', toError(error), errorToContext(error));
    }
  };

  const updateServiceWorker = async () => {
    if (!navigator.serviceWorker.controller) return;

    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  };

  return (
    <>
      {children}
      
      {/* Update notification */}
      {swState.updateAvailable && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Νέα έκδοση διαθέσιμη!</h4>
              <p className="text-sm opacity-90">Κάντε κλικ για ενημέρωση</p>
            </div>
            <button
              onClick={updateServiceWorker}
              className="ml-4 bg-white text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Ενημέρωση
            </button>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {!swState.isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          <span className="text-sm font-medium">
            📡 Εκτός σύνδεσης - Περιηγηθείτε στα αποθηκευμένα προϊόντα
          </span>
        </div>
      )}
    </>
  );
}

// Hook for using service worker state
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
      
      // Store the event for later use
      (window as any).deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        logger.info('PWA installed successfully');
        setIsInstallable(false);
      }
      
      (window as any).deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      logger.error('PWA installation failed:', toError(error), errorToContext(error));
      return false;
    }
  };

  return {
    isOnline,
    isInstallable,
    installPWA
  };
}

// PWA Install Button Component
export function PWAInstallButton() {
  const { isInstallable, installPWA } = useServiceWorker();

  if (!isInstallable) return null;

  return (
    <button
      onClick={installPWA}
      className="fixed bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors z-50 flex items-center gap-2"
    >
      <span>📱</span>
      <span className="text-sm font-medium">Εγκατάσταση App</span>
    </button>
  );
}
