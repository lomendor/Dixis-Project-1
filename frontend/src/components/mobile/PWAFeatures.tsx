'use client';

import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logging/productionLogger';

// PWA Install Prompt Component
interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://');
      setIsInstalled(isInstalled);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay if not already installed
      if (!isInstalled) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
      
      logger.info('PWA install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      logger.info('PWA installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      logger.info('PWA install accepted');
      onInstall?.();
    } else {
      logger.info('PWA install dismissed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
    logger.info('PWA install prompt dismissed');
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 sm:max-w-sm sm:mx-auto">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">Εγκαταστήστε την εφαρμογή</h3>
          <p className="text-sm text-gray-600 mt-1">
            Προσθέστε το Dixis Fresh στην αρχική οθόνη για γρήγορη πρόσβαση
          </p>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
            >
              Εγκατάσταση
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Όχι τώρα
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Offline Status Component
export function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineMessage(true);
        logger.warn('Application went offline');
      } else if (showOfflineMessage) {
        logger.info('Application back online');
        // Hide message after 2 seconds when back online
        setTimeout(() => setShowOfflineMessage(false), 2000);
      }
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showOfflineMessage]);

  if (!showOfflineMessage) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
      isOnline ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <div className="px-4 py-2 text-center text-white text-sm font-medium">
        {isOnline ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Συνδέθηκε ξανά στο διαδίκτυο</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
            <span>Χωρίς σύνδεση - Λειτουργία offline</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Push Notifications Component
interface PushNotificationsProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function PushNotifications({ 
  onPermissionGranted, 
  onPermissionDenied 
}: PushNotificationsProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Show prompt after delay if permission not yet requested
      if (Notification.permission === 'default') {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      logger.warn('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      setShowPrompt(false);

      if (permission === 'granted') {
        logger.info('Notification permission granted');
        onPermissionGranted?.();
        
        // Send welcome notification
        new Notification('Dixis Fresh', {
          body: 'Θα λαμβάνετε ειδοποιήσεις για νέες παραγγελίες και προσφορές',
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png'
        });
      } else {
        logger.info('Notification permission denied');
        onPermissionDenied?.();
      }
    } catch (error) {
      logger.error('Error requesting notification permission', toError(error), errorToContext(error));
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Δοκιμαστική ειδοποίηση', {
        body: 'Αυτή είναι μια δοκιμαστική ειδοποίηση από το Dixis Fresh',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'test-notification',
        requireInteraction: false
      });
      
      logger.info('Test notification sent');
    }
  };

  if (!showPrompt || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40 sm:max-w-sm sm:mx-auto">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM13 3h2.586a1 1 0 01.707.293l6.414 6.414a1 1 0 01.293.707V16a2 2 0 01-2 2h-5m-6 0a2 2 0 01-2-2V4a2 2 0 012-2h5m0 0v5a2 2 0 002 2h5" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">Ενεργοποίηση ειδοποιήσεων</h3>
          <p className="text-sm text-gray-600 mt-1">
            Λάβετε ειδοποιήσεις για νέες παραγγελίες και προσφορές
          </p>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Ενεργοποίηση
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Όχι τώρα
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Debug: Test notification button for granted permission */}
      {permission === 'granted' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={sendTestNotification}
            className="w-full px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Δοκιμαστική ειδοποίηση
          </button>
        </div>
      )}
    </div>
  );
}

// Service Worker Status Component
export function ServiceWorkerStatus() {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable' | 'activated'>('checking');
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setStatus('available');
        logger.info('Service Worker ready');
      });

      // Listen for SW updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdatePrompt(true);
        logger.info('Service Worker updated');
      });

      // Check for updates periodically
      setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 60000); // Check every minute
    } else {
      setStatus('unavailable');
      logger.warn('Service Worker not supported');
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (showUpdatePrompt) {
    return (
      <div className="fixed top-4 left-4 right-4 bg-blue-600 text-white rounded-lg p-4 z-50 sm:max-w-sm sm:mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Νέα έκδοση διαθέσιμη</h3>
            <p className="text-sm opacity-90 mt-1">Ανανεώστε για τις τελευταίες βελτιώσεις</p>
          </div>
          <button
            onClick={handleUpdate}
            className="ml-4 px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Ανανέωση
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Background Sync Component
export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      setIsSupported(true);
      
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('background-sync');
      }).then(() => {
        setIsRegistered(true);
        logger.info('Background sync registered');
      }).catch((error) => {
        logger.error('Background sync registration failed', toError(error), errorToContext(error));
      });
    }
  }, []);

  const scheduleSync = useCallback((tag: string, data?: any) => {
    if (!isSupported || !isRegistered) return Promise.reject('Background sync not available');

    return navigator.serviceWorker.ready.then((registration) => {
      // Store data in IndexedDB for the service worker to process
      if (data) {
        const request = indexedDB.open('sync-store', 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['sync-data'], 'readwrite');
          const store = transaction.objectStore('sync-data');
          store.put({ tag, data, timestamp: Date.now() });
        };
      }
      
      return registration.sync.register(tag);
    });
  }, [isSupported, isRegistered]);

  return { isSupported, isRegistered, scheduleSync };
}