'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  XMarkIcon,
  ClockIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

interface Notification {
  id: string;
  type: 'new_order' | 'order_update' | 'payment' | 'system' | 'urgent';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
  read: boolean;
  urgent: boolean;
}

interface NotificationCenterProps {
  producerId: string;
  className?: string;
}

export default function NotificationCenter({ producerId, className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUrgent = notifications.some(n => !n.read && n.urgent);

  useEffect(() => {
    fetchNotifications();
    // Set up real-time notifications polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [producerId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from a real API
      // For now, we'll simulate with mock data
      const mockNotifications: Notification[] = [
        {
          id: 'notif_1',
          type: 'new_order',
          title: 'Νέα Παραγγελία!',
          message: 'Νέα παραγγελία ORD-2024-003 - €67.30',
          data: {
            orderId: 'ORD-2024-003',
            orderNumber: 'ORD-2024-003',
            customerName: 'Ελένη Γεωργίου',
            totalAmount: 67.30,
            itemCount: 5,
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          read: false,
          urgent: true,
        },
        {
          id: 'notif_2',
          type: 'order_update',
          title: 'Ενημέρωση Παραγγελίας',
          message: 'Η παραγγελία ORD-2024-002 παραδόθηκε επιτυχώς',
          data: {
            orderId: 'ORD-2024-002',
            status: 'delivered',
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false,
          urgent: false,
        },
        {
          id: 'notif_3',
          type: 'payment',
          title: 'Πληρωμή Ολοκληρώθηκε',
          message: 'Λάβατε €45.20 από την εβδομαδιαία πληρωμή',
          data: {
            amount: 45.20,
            period: 'weekly',
          },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          read: true,
          urgent: false,
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // In production, this would call an API to mark as read
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string, urgent: boolean) => {
    const iconClass = `h-5 w-5 ${urgent ? 'text-red-500' : 'text-gray-500'}`;
    
    switch (type) {
      case 'new_order':
        return <CurrencyEuroIcon className={iconClass} />;
      case 'order_update':
        return <CheckCircleIcon className={iconClass} />;
      case 'payment':
        return <CurrencyEuroIcon className={iconClass} />;
      case 'urgent':
        return <ExclamationCircleIcon className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes} λεπτά πριν`;
    if (hours < 24) return `${hours} ώρες πριν`;
    return `${days} ημέρες πριν`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className={`h-6 w-6 ${hasUrgent ? 'text-red-500' : 'text-green-600'}`} />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 h-5 w-5 text-xs font-bold text-white rounded-full flex items-center justify-center ${
            hasUrgent ? 'bg-red-500 animate-pulse' : 'bg-green-600'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ειδοποιήσεις</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Όλα ως διαβασμένα
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Φόρτωση ειδοποιήσεων...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Δεν έχετε νέες ειδοποιήσεις</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-green-500' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.urgent)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                              {notification.urgent && !notification.read && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Επείγον
                                </span>
                              )}
                            </p>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-700' : 'text-gray-500'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {/* Additional data for order notifications */}
                            {notification.type === 'new_order' && notification.data && (
                              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                                <div className="flex justify-between">
                                  <span>Πελάτης: {notification.data.customerName}</span>
                                  <span className="font-medium">€{notification.data.totalAmount}</span>
                                </div>
                                <div className="text-gray-600 mt-1">
                                  {notification.data.itemCount} προϊόντα
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatTimeAgo(notification.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page if exists
                }}
                className="w-full text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Δείτε όλες τις ειδοποιήσεις
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}