import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { logger } from '@/lib/logging/productionLogger';

/**
 * React Hook for Email Service
 * 
 * Provides easy access to email functionality with React state management
 */

import { useState, useEffect, useCallback } from 'react';
import { emailService, EmailStatus } from '@/lib/services/emailService';
import { toast } from 'sonner';

export interface UseEmailServiceOptions {
  orderId?: number;
  autoLoad?: boolean;
  onEmailSent?: () => void;
  onEmailFailed?: (error: string) => void;
}

export interface UseEmailServiceReturn {
  // State
  emailStatuses: EmailStatus[];
  isLoading: boolean;
  isResending: boolean;
  error: string | null;
  
  // Computed values
  hasConfirmationEmail: boolean;
  isConfirmationSent: boolean;
  confirmationStatus: string | null;
  
  // Actions
  loadEmailStatus: () => Promise<void>;
  resendConfirmation: () => Promise<boolean>;
  checkEmailStatus: () => Promise<boolean>;
  clearError: () => void;
}

export function useEmailService(options: UseEmailServiceOptions = {}): UseEmailServiceReturn {
  const { orderId, autoLoad = true, onEmailSent, onEmailFailed } = options;
  
  // State
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load email status
  const loadEmailStatus = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const statuses = await emailService.getEmailStatus(orderId);
      setEmailStatuses(statuses);
    } catch (err: any) {
      const errorMessage = err.message || 'Σφάλμα κατά τη φόρτωση κατάστασης email';
      setError(errorMessage);
      logger.error('Failed to load email status:', toError(err), errorToContext(err));
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Resend confirmation email
  const resendConfirmation = useCallback(async (): Promise<boolean> => {
    if (!orderId) return false;
    
    try {
      setIsResending(true);
      setError(null);
      
      const result = await emailService.sendOrderConfirmation(orderId);
      
      if (result.success) {
        // Reload email status after successful resend
        await loadEmailStatus();
        onEmailSent?.();
        return true;
      } else {
        const errorMessage = result.message || 'Αποτυχία αποστολής email';
        setError(errorMessage);
        onEmailFailed?.(errorMessage);
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Σφάλμα κατά την αποστολή email';
      setError(errorMessage);
      onEmailFailed?.(errorMessage);
      logger.error('Failed to resend email:', toError(err), errorToContext(err));
      return false;
    } finally {
      setIsResending(false);
    }
  }, [orderId, loadEmailStatus, onEmailSent, onEmailFailed]);

  // Check if email was sent (simple boolean check)
  const checkEmailStatus = useCallback(async (): Promise<boolean> => {
    if (!orderId) return false;
    
    try {
      return await emailService.isOrderConfirmationSent(orderId);
    } catch (err) {
      logger.error('Failed to check email status:', toError(err), errorToContext(err));
      return false;
    }
  }, [orderId]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && orderId) {
      loadEmailStatus();
    }
  }, [autoLoad, orderId, loadEmailStatus]);

  // Computed values
  const confirmationEmail = emailStatuses.find(email => email.type === 'order_confirmation');
  const hasConfirmationEmail = !!confirmationEmail;
  const isConfirmationSent = confirmationEmail?.status === 'sent' || confirmationEmail?.status === 'delivered';
  const confirmationStatus = confirmationEmail?.status || null;

  return {
    // State
    emailStatuses,
    isLoading,
    isResending,
    error,
    
    // Computed values
    hasConfirmationEmail,
    isConfirmationSent,
    confirmationStatus,
    
    // Actions
    loadEmailStatus,
    resendConfirmation,
    checkEmailStatus,
    clearError
  };
}

// Simplified hook for just checking if email was sent
export function useEmailConfirmationStatus(orderId?: number) {
  const [isEmailSent, setIsEmailSent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      const sent = await emailService.isOrderConfirmationSent(orderId);
      setIsEmailSent(sent);
    } catch (error) {
      logger.error('Failed to check email confirmation status:', toError(error), errorToContext(error));
      setIsEmailSent(false);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isEmailSent,
    isLoading,
    refresh: checkStatus
  };
}

