'use client';

import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';

import { emailService, EmailStatus } from '@/lib/services/emailService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EmailConfirmationStatusProps {
  orderId: number;
  className?: string;
  showResendButton?: boolean;
}

export default function EmailConfirmationStatus({ 
  orderId, 
  className = '',
  showResendButton = true 
}: EmailConfirmationStatusProps) {
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);

  // Load email status on mount
  useEffect(() => {
    loadEmailStatus();
  }, [orderId]);

  const loadEmailStatus = async () => {
    try {
      setLoading(true);
      const statuses = await emailService.getEmailStatus(orderId);
      setEmailStatuses(statuses);
    } catch (error) {
      logger.error('Failed to load email status', toError(error), errorToContext(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResending(true);
      const result = await emailService.sendOrderConfirmation(orderId);
      
      if (result.success) {
        // Reload status after successful resend
        await loadEmailStatus();
      }
    } catch (error) {
      logger.error('Failed to resend email', toError(error), errorToContext(error));
    } finally {
      setResending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <span>"✓"</span>;
      case 'pending':
        return <span className="text-yellow-500">🕐</span>;
      case 'failed':
        return <span className="text-red-500">⚠️</span>;
      default:
        return <FaEnvelope className="text-gray-400" size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Στάλθηκε';
      case 'delivered':
        return 'Παραδόθηκε';
      case 'pending':
        return 'Εκκρεμεί';
      case 'failed':
        return 'Αποτυχία';
      default:
        return 'Άγνωστο';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const confirmationEmail = emailStatuses.find(email => email.type === 'order_confirmation');
  const hasConfirmationEmail = !!confirmationEmail;
  const isEmailSent = confirmationEmail?.status === 'sent' || confirmationEmail?.status === 'delivered';

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <span>"⟳"</span>
        <span className="text-sm">Έλεγχος κατάστασης email...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Email Status */}
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {hasConfirmationEmail ? (
              getStatusIcon(confirmationEmail.status)
            ) : (
              <FaEnvelope className="text-gray-400" size={16} />
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">
              Email Επιβεβαίωσης Παραγγελίας
            </h4>
            <p className="text-sm text-gray-500">
              {hasConfirmationEmail ? (
                <>
                  Κατάσταση: <span className={`font-medium ${getStatusColor(confirmationEmail.status).split(' ')[0]}`}>
                    {getStatusText(confirmationEmail.status)}
                  </span>
                  {confirmationEmail.sentAt && (
                    <span className="ml-2">
                      • {new Date(confirmationEmail.sentAt).toLocaleString('el-GR')}
                    </span>
                  )}
                </>
              ) : (
                'Το email θα σταλεί αυτόματα μετά την επιβεβαίωση της παραγγελίας'
              )}
            </p>
          </div>
        </div>

        {/* Resend Button */}
        {showResendButton && hasConfirmationEmail && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={resending}
            className="flex items-center space-x-1"
          >
            {resending ? (
              <span>"⟳"</span>
            ) : (
              <span>🔄</span>
            )}
            <span>{resending ? 'Αποστολή...' : 'Επαναποστολή'}</span>
          </Button>
        )}
      </div>

      {/* Error Message */}
      {confirmationEmail?.status === 'failed' && confirmationEmail.error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
            <div>
              <h5 className="font-medium text-red-800">Σφάλμα Αποστολής Email</h5>
              <p className="text-sm text-red-600 mt-1">{confirmationEmail.error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {isEmailSent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <span>"✓"</span>
            <div>
              <h5 className="font-medium text-green-800">Email Στάλθηκε Επιτυχώς</h5>
              <p className="text-sm text-green-600 mt-1">
                Ελέγξτε το email σας για τις λεπτομέρειες της παραγγελίας σας.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Email Types */}
      {emailStatuses.filter(email => email.type !== 'order_confirmation').map((email) => (
        <div key={email.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex items-center space-x-2">
            {getStatusIcon(email.status)}
            <span className="text-sm font-medium capitalize">
              {email.type.replace('_', ' ')}
            </span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(email.status)}`}>
            {getStatusText(email.status)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Compact version for inline display
export function EmailStatusBadge({ orderId, className = '' }: { orderId: number; className?: string }) {
  const [isEmailSent, setIsEmailSent] = useState<boolean | null>(null);

  useEffect(() => {
    const checkEmailStatus = async () => {
      try {
        const sent = await emailService.isOrderConfirmationSent(orderId);
        setIsEmailSent(sent);
      } catch (error) {
        logger.error('Failed to check email status', toError(error), errorToContext(error));
        setIsEmailSent(false);
      }
    };

    checkEmailStatus();
  }, [orderId]);

  if (isEmailSent === null) {
    return (
      <div className={`inline-flex items-center space-x-1 text-gray-500 ${className}`}>
        <span>"⟳"</span>
        <span className="text-xs">Έλεγχος...</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      {isEmailSent ? (
        <>
          <span>"✓"</span>
          <span className="text-xs text-green-600">Email στάλθηκε</span>
        </>
      ) : (
        <>
          <span className="text-yellow-500 text-xs">🕐</span>
          <span className="text-xs text-yellow-600">Email εκκρεμεί</span>
        </>
      )}
    </div>
  );
}
