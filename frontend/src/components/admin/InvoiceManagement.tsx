'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logging/productionLogger';
import { errorToContext, toError } from '@/lib/utils/errorUtils';
import { 
  DocumentTextIcon, 
  EnvelopeIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  orderId: number;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  vatAmount: number;
  total: number;
  status: 'pending' | 'sent' | 'paid' | 'overdue';
  emailSent: boolean;
  emailSentAt?: string;
  paidAt?: string;
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emailSendingId, setEmailSendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from your backend
      // For now, using mock data
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-202412-001',
          orderNumber: 'ORD-001',
          orderId: 1,
          customerName: 'Γιάννης Παπαδόπουλος',
          customerEmail: 'giannis@example.com',
          issueDate: '2024-12-20',
          dueDate: '2025-01-19',
          amount: 150.00,
          vatAmount: 36.00,
          total: 186.00,
          status: 'sent',
          emailSent: true,
          emailSentAt: '2024-12-20T10:30:00Z'
        },
        {
          id: '2',
          invoiceNumber: 'INV-202412-002',
          orderNumber: 'ORD-002',
          orderId: 2,
          customerName: 'Μαρία Καζάκου',
          customerEmail: 'maria@example.com',
          issueDate: '2024-12-19',
          dueDate: '2025-01-18',
          amount: 89.50,
          vatAmount: 21.48,
          total: 110.98,
          status: 'pending',
          emailSent: false
        },
        {
          id: '3',
          invoiceNumber: 'INV-202412-003',
          orderNumber: 'ORD-003',
          orderId: 3,
          customerName: 'Κώστας Νικολάου',
          customerEmail: 'kostas@example.com',
          issueDate: '2024-11-15',
          dueDate: '2024-12-15',
          amount: 235.75,
          vatAmount: 56.58,
          total: 292.33,
          status: 'overdue',
          emailSent: true,
          emailSentAt: '2024-11-15T09:15:00Z'
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      logger.error('Failed to fetch invoices', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      setEmailSendingId(invoice.id);
      
      const response = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: invoice.orderId,
          recipientEmail: invoice.customerEmail,
          subject: `Τιμολόγιο ${invoice.invoiceNumber} - Dixis Fresh`,
          customMessage: 'Παρακαλούμε βρείτε συνημμένο το τιμολόγιό σας.'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      // Update invoice status
      setInvoices(prev => prev.map(inv => 
        inv.id === invoice.id 
          ? { ...inv, emailSent: true, emailSentAt: new Date().toISOString(), status: 'sent' as const }
          : inv
      ));

      logger.info('Invoice sent successfully', { invoiceId: invoice.id });
      
    } catch (error) {
      logger.error('Failed to send invoice', toError(error), errorToContext(error));
      alert('Αποτυχία αποστολής τιμολογίου');
    } finally {
      setEmailSendingId(null);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: invoice.orderId,
          format: 'pdf'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      logger.info('Invoice downloaded', { invoiceId: invoice.id });
      
    } catch (error) {
      logger.error('Failed to download invoice', toError(error), errorToContext(error));
      alert('Αποτυχία λήψης τιμολογίου');
    }
  };

  const handlePreviewInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: invoice.orderId,
          format: 'html'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice preview');
      }

      const html = await response.text();
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(html);
        previewWindow.document.close();
      }

      logger.info('Invoice previewed', { invoiceId: invoice.id });
      
    } catch (error) {
      logger.error('Failed to preview invoice', toError(error), errorToContext(error));
      alert('Αποτυχία προεπισκόπησης τιμολογίου');
    }
  };

  const getStatusIcon = (status: Invoice['status'], emailSent: boolean) => {
    switch (status) {
      case 'pending':
        return emailSent ? (
          <CheckCircleIcon className="w-5 h-5 text-blue-500" />
        ) : (
          <ClockIcon className="w-5 h-5 text-yellow-500" />
        );
      case 'sent':
        return <EnvelopeIcon className="w-5 h-5 text-green-500" />;
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'pending': return 'Εκκρεμές';
      case 'sent': return 'Στάλθηκε';
      case 'paid': return 'Πληρώθηκε';
      case 'overdue': return 'Ληξιπρόθεσμο';
      default: return 'Άγνωστο';
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Φόρτωση τιμολογίων...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Διαχείριση Τιμολογίων</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredInvoices.length} από {invoices.length} τιμολόγια
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Αναζήτηση τιμολογίων..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Όλες οι καταστάσεις</option>
              <option value="pending">Εκκρεμές</option>
              <option value="sent">Στάλθηκε</option>
              <option value="paid">Πληρώθηκε</option>
              <option value="overdue">Ληξιπρόθεσμο</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν τιμολόγια</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Δοκιμάστε διαφορετικά κριτήρια αναζήτησης'
              : 'Δεν υπάρχουν τιμολόγια ακόμα'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Τιμολόγιο
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Πελάτης
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ημερομηνία
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ποσό
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Κατάσταση
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(invoice.status, invoice.emailSent)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Παραγγελία: {invoice.orderNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>
                          Έκδοση: {new Date(invoice.issueDate).toLocaleDateString('el-GR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Λήξη: {new Date(invoice.dueDate).toLocaleDateString('el-GR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        €{invoice.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        (ΦΠΑ: €{invoice.vatAmount.toFixed(2)})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                      {invoice.emailSent && invoice.emailSentAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Στάλθηκε: {new Date(invoice.emailSentAt).toLocaleDateString('el-GR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreviewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          title="Προεπισκόπηση"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          title="Λήψη PDF"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleSendInvoice(invoice)}
                          disabled={emailSendingId === invoice.id}
                          className="text-purple-600 hover:text-purple-900 flex items-center space-x-1 disabled:opacity-50"
                          title="Αποστολή Email"
                        >
                          {emailSendingId === invoice.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          ) : (
                            <EnvelopeIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}