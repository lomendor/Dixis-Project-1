'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/productionLogger';
import { isDemoMode, enableDemoMode, disableDemoMode } from '@/lib/demo/demoData';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoModeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function DemoModeToggle({ 
  className = '', 
  showLabel = true 
}: DemoModeToggleProps) {
  const [isDemo, setIsDemo] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoMode());
  }, []);

  const toggleDemoMode = () => {
    const newDemoMode = !isDemo;
    
    if (newDemoMode) {
      enableDemoMode();
      logger.info('Demo mode enabled');
    } else {
      disableDemoMode();
      logger.info('Demo mode disabled');
    }
    
    setIsDemo(newDemoMode);
    setShowNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);

    // Reload page to apply demo mode
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={toggleDemoMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isDemo ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={isDemo}
          aria-label="Toggle demo mode"
        >
          <motion.span
            layout
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              isDemo ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        
        {showLabel && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {isDemo ? '🎭 Demo Mode' : '📊 Live Data'}
            </span>
            <span className="text-xs text-gray-500">
              {isDemo ? 'Showing realistic sample data' : 'Using real API data'}
            </span>
          </div>
        )}
      </div>

      {/* Demo Mode Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-4 right-4 z-50 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {isDemo ? (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🎭</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">📊</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">
                  {isDemo ? 'Demo Mode Ενεργό' : 'Live Mode Ενεργό'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isDemo 
                    ? 'Χρησιμοποιούνται ρεαλιστικά δείγματα δεδομένων για επίδειξη'
                    : 'Χρησιμοποιούνται πραγματικά δεδομένα από το API'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Η σελίδα θα ανανεωθεί για εφαρμογή των αλλαγών...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Demo Mode Banner Component
export function DemoModeBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoMode());
  }, []);

  if (!isDemo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-center relative overflow-hidden"
    >
      <div className="relative z-10 flex items-center justify-center space-x-2">
        <span className="text-lg">🎭</span>
        <span className="font-medium text-sm">
          DEMO MODE - Προβολή ρεαλιστικών δεδομένων για επίδειξη
        </span>
        <span className="text-lg">🎭</span>
      </div>
      
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: [-100, 300] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}

// Demo Mode Features Card
export function DemoFeaturesCard() {
  const features = [
    '🍯 6 αυθεντικά ελληνικά προϊόντα',
    '🏭 3 επαληθευμένοι παραγωγοί',
    '📊 Ρεαλιστικά analytics δεδομένα',
    '🛒 Προσομοιωμένες παραγγελίες',
    '💰 Χονδρικές τιμές & εκπτώσεις',
    '📱 Πλήρη mobile εμπειρία'
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 max-w-md">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🎭</span>
        <h3 className="text-lg font-semibold text-gray-900">Demo Mode Features</h3>
      </div>
      
      <div className="space-y-2">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2 text-sm text-gray-700"
          >
            <span>{feature}</span>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-100 rounded-md">
        <p className="text-xs text-blue-800">
          💡 Tip: Δοκιμάστε όλες τις λειτουργίες με ασφάλεια! 
          Τα δεδομένα επαναφέρονται αυτόματα.
        </p>
      </div>
    </div>
  );
}