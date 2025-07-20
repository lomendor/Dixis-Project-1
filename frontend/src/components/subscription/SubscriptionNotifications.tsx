'use client';

import React, { useState, useEffect } from 'react';
import { useUserSubscription } from '../../lib/api/hooks/useSubscription';
import { SubscriptionStatus } from '../../lib/api/models/subscription/types';
import { 
  AlertTriangle, 
  CreditCard, 
  Clock, 
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react';

interface SubscriptionNotificationsProps {
  userId: string;
  className?: string;
}

interface NotificationItem {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  expiresAt?: Date;
}

export const SubscriptionNotifications: React.FC<SubscriptionNotificationsProps> = ({
  userId,
  className = ''
}) => {
  const { data: subscription } = useUserSubscription(userId);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (!subscription) return;

    const newNotifications: NotificationItem[] = [];
    const now = new Date();

    // Grace period warning
    if (subscription.gracePeriodEnd) {
      const gracePeriodEnd = new Date(subscription.gracePeriodEnd);
      const daysLeft = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0 && daysLeft <= 7) {
        newNotifications.push({
          id: 'grace-period-warning',
          type: 'warning',
          title: 'Περίοδος Χάριτος',
          message: `Η συνδρομή σας έχει ληγμένη πληρωμή. Έχετε ${daysLeft} ημέρες για ανανέωση πριν χάσετε την πρόσβαση στις premium λειτουργίες.`,
          action: {
            label: 'Ανανέωση Τώρα',
            onClick: () => window.location.href = '/producer/subscription'
          },
          dismissible: false
        });
      }
    }

    // Upcoming renewal
    if (subscription.nextBillingDate && subscription.status === SubscriptionStatus.ACTIVE) {
      const nextBilling = new Date(subscription.nextBillingDate);
      const daysUntilRenewal = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilRenewal <= 7 && daysUntilRenewal > 0) {
        newNotifications.push({
          id: 'upcoming-renewal',
          type: 'info',
          title: 'Επερχόμενη Ανανέωση',
          message: `Η συνδρομή σας θα ανανεωθεί σε ${daysUntilRenewal} ημέρες. Θα χρεωθείτε €${
            subscription.billingCycle === 'monthly' ? subscription.plan.monthlyPrice : subscription.plan.yearlyPrice
          }.`,
          action: {
            label: 'Διαχείριση Συνδρομής',
            onClick: () => window.location.href = '/producer/subscription'
          },
          dismissible: true
        });
      }
    }

    // Cancellation notice
    if (subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd) {
      const periodEnd = new Date(subscription.currentPeriodEnd);
      const daysLeft = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      newNotifications.push({
        id: 'cancellation-notice',
        type: 'warning',
        title: 'Συνδρομή Ακυρωμένη',
        message: `Η συνδρομή σας θα λήξει σε ${daysLeft} ημέρες. Θα επιστρέψετε στο δωρεάν πλάνο με 12% προμήθεια.`,
        action: {
          label: 'Επαναφορά Συνδρομής',
          onClick: () => window.location.href = '/producer/subscription'
        },
        dismissible: false
      });
    }

    // Payment failed
    if (subscription.status === SubscriptionStatus.PAST_DUE) {
      newNotifications.push({
        id: 'payment-failed',
        type: 'error',
        title: 'Αποτυχία Πληρωμής',
        message: 'Η τελευταία πληρωμή σας απέτυχε. Παρακαλώ ενημερώστε τη μέθοδο πληρωμής σας.',
        action: {
          label: 'Ενημέρωση Πληρωμής',
          onClick: () => window.location.href = '/producer/subscription'
        },
        dismissible: false
      });
    }

    // Trial ending
    if (subscription.status === SubscriptionStatus.TRIAL && subscription.trialEnd) {
      const trialEnd = new Date(subscription.trialEnd);
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 3 && daysLeft > 0) {
        newNotifications.push({
          id: 'trial-ending',
          type: 'info',
          title: 'Δοκιμαστική Περίοδος',
          message: `Η δοκιμαστική περίοδός σας λήγει σε ${daysLeft} ημέρες. Ενεργοποιήστε συνδρομή για συνέχεια.`,
          action: {
            label: 'Ενεργοποίηση',
            onClick: () => window.location.href = '/producer/subscription'
          },
          dismissible: false
        });
      }
    }

    // Filter out dismissed notifications
    const visibleNotifications = newNotifications.filter(
      notification => !dismissedNotifications.includes(notification.id)
    );

    setNotifications(visibleNotifications);
  }, [subscription, dismissedNotifications]);

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => [...prev, notificationId]);
  };

  const getNotificationStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    const iconClass = 'w-5 h-5';
    
    switch (type) {
      case 'error':
        return <AlertTriangle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <Clock className={`${iconClass} text-yellow-500`} />;
      case 'info':
        return <CreditCard className={`${iconClass} text-blue-500`} />;
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      default:
        return <AlertTriangle className={`${iconClass} text-gray-500`} />;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 ${getNotificationStyle(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                {notification.title}
              </h3>
              <p className="text-sm opacity-90">
                {notification.message}
              </p>
              
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  {notification.action.label}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {notification.dismissible && (
              <button
                onClick={() => dismissNotification(notification.id)}
                className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};