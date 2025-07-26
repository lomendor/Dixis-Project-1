import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';
import { UNIFIED_API_CONFIG } from '@/lib/api/config/unified';

/**
 * Email Service for Dixis Fresh
 * 
 * Handles email confirmation and status tracking for orders
 * Integrates with Laravel backend email system
 */

import { apiClient } from '@/lib/api/client/apiClient';
import { toast } from 'sonner';

export interface EmailConfirmationRequest {
  orderId: number;
  email: string;
  type: 'order_confirmation' | 'order_status' | 'shipping_notification';
}

export interface EmailStatus {
  id: number;
  orderId: number;
  type: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  shippingMethod: string;
}

class EmailService {
  private readonly baseUrl = UNIFIED_API_CONFIG.BASE_URL;

  /**
   * Send order confirmation email
   * Note: The backend automatically sends emails via OrderCreated event
   * This method is for manual resending or status checking
   */
  async sendOrderConfirmation(orderId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/api/v1/orders/${orderId}/resend-confirmation`);
      
      if ((response.data as any)?.success) {
        toast.success('Email επιβεβαίωσης στάλθηκε επιτυχώς!');
        return { success: true, message: 'Email sent successfully' };
      } else {
        toast.error('Σφάλμα κατά την αποστολή email');
        return { success: false, message: (response.data as any)?.message || 'Failed to send email' };
      }
    } catch (error: any) {
      logger.error('Email service error:', toError(error), errorToContext(error));
      const errorMessage = error?.response?.data?.message || 'Σφάλμα κατά την αποστολή email';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }

  /**
   * Get email status for an order
   */
  async getEmailStatus(orderId: number): Promise<EmailStatus[]> {
    try {
      const response = await apiClient.get(`/api/v1/orders/${orderId}/email-status`);
      return (response.data as any)?.emails || [];
    } catch (error: any) {
      logger.error('Failed to get email status:', toError(error), errorToContext(error));
      return [];
    }
  }

  /**
   * Check if order confirmation email was sent
   */
  async isOrderConfirmationSent(orderId: number): Promise<boolean> {
    try {
      const emailStatuses = await this.getEmailStatus(orderId);
      return emailStatuses.some(email => 
        email.type === 'order_confirmation' && 
        (email.status === 'sent' || email.status === 'delivered')
      );
    } catch (error) {
      logger.error('Failed to check email status:', toError(error), errorToContext(error));
      return false;
    }
  }

  /**
   * Generate email preview (for testing/admin purposes)
   */
  async generateEmailPreview(orderId: number, type: string = 'order_confirmation'): Promise<string> {
    try {
      const response = await apiClient.get(`/api/v1/orders/${orderId}/email-preview?type=${type}`);
      return (response.data as any)?.html || '';
    } catch (error: any) {
      logger.error('Failed to generate email preview:', toError(error), errorToContext(error));
      throw new Error('Δεν ήταν δυνατή η δημιουργία προεπισκόπησης email');
    }
  }

  /**
   * Test email configuration (admin only)
   */
  async testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/api/v1/admin/test-email');
      return {
        success: (response.data as any)?.success,
        message: (response.data as any)?.message || 'Email test completed'
      };
    } catch (error: any) {
      logger.error('Email test failed:', toError(error), errorToContext(error));
      return {
        success: false,
        message: error?.response?.data?.message || 'Email test failed'
      };
    }
  }

  /**
   * Send custom email with attachment
   */
  async sendEmail(params: {
    to: string;
    cc?: string[];
    subject: string;
    html: string;
    attachment?: {
      filename: string;
      content: Buffer;
      contentType: string;
    };
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/api/v1/email/send', params);
      
      if ((response.data as any)?.success) {
        return { success: true, message: 'Email sent successfully' };
      } else {
        return { success: false, message: (response.data as any)?.message || 'Failed to send email' };
      }
    } catch (error: any) {
      logger.error('Failed to send email:', toError(error), errorToContext(error));
      return { success: false, message: error?.response?.data?.message || 'Email sending failed' };
    }
  }

  /**
   * Show email confirmation status to user
   */
  showEmailConfirmationStatus(orderId: number, sent: boolean = true) {
    if (sent) {
      toast.success(
        'Email επιβεβαίωσης στάλθηκε!',
        {
          description: 'Ελέγξτε το email σας για τις λεπτομέρειες της παραγγελίας.',
          duration: 5000
        }
      );
    } else {
      toast.info(
        'Email επιβεβαίωσης θα σταλεί σύντομα',
        {
          description: 'Θα λάβετε email με τις λεπτομέρειες της παραγγελίας σας.',
          duration: 4000
        }
      );
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export class for testing
export { EmailService };

// Export convenient functions
export const sendEmail = emailService.sendEmail.bind(emailService);

// Types are already exported at the top of the file
