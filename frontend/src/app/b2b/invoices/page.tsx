'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Eye, Calendar, Euro, Filter } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  amount: number;
  taxAmount: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  itemsCount: number;
  paymentMethod?: string;
  paidDate?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Simulate API call to fetch invoices
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          orderNumber: 'ORD-2024-015',
          issueDate: '2024-01-15',
          dueDate: '2024-02-14',
          status: 'paid',
          amount: 1250.50,
          taxAmount: 300.12,
          totalAmount: 1550.62,
          customerName: 'Test Business Ltd',
          customerEmail: 'accounting@testbusiness.com',
          itemsCount: 8,
          paymentMethod: 'Bank Transfer',
          paidDate: '2024-01-20'
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          orderNumber: 'ORD-2024-018',
          issueDate: '2024-01-18',
          dueDate: '2024-02-17',
          status: 'pending',
          amount: 890.25,
          taxAmount: 213.66,
          totalAmount: 1103.91,
          customerName: 'Alpha Enterprises',
          customerEmail: 'finance@alpha.com',
          itemsCount: 5
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          orderNumber: 'ORD-2024-020',
          issueDate: '2024-01-20',
          dueDate: '2024-01-25',
          status: 'overdue',
          amount: 2150.75,
          taxAmount: 516.18,
          totalAmount: 2666.93,
          customerName: 'Beta Corporation',
          customerEmail: 'payments@beta.com',
          itemsCount: 12
        },
        {
          id: '4',
          invoiceNumber: 'INV-2024-004',
          orderNumber: 'ORD-2024-022',
          issueDate: '2024-01-22',
          dueDate: '2024-02-21',
          status: 'pending',
          amount: 675.00,
          taxAmount: 162.00,
          totalAmount: 837.00,
          customerName: 'Gamma Solutions',
          customerEmail: 'billing@gamma.com',
          itemsCount: 4
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      logger.error('Failed to fetch invoices:', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'Πληρωμένο';
      case 'pending':
        return 'Εκκρεμεί';
      case 'overdue':
        return 'Ληξιπρόθεσμο';
      case 'cancelled':
        return 'Ακυρωμένο';
      default:
        return 'Άγνωστο';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const statusMatch = selectedStatus === 'all' || invoice.status === selectedStatus;
    const monthMatch = selectedMonth === 'all' || 
      new Date(invoice.issueDate).getMonth() === parseInt(selectedMonth);
    return statusMatch && monthMatch;
  });

  const handleDownloadInvoice = (invoiceId: string) => {
    // Simulate PDF download
    alert(`Κατέβασμα τιμολογίου ${invoiceId}`);
  };

  const handleViewInvoice = (invoiceId: string) => {
    // Navigate to invoice details
    alert(`Προβολή τιμολογίου ${invoiceId}`);
  };

  const getTotalStats = () => {
    const total = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paid = filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pending = filteredInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdue = filteredInvoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    return { total, paid, pending, overdue };
  };

  const stats = getTotalStats();  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Φόρτωση τιμολογίων...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/b2b/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Επιστροφή στο Dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Τιμολόγια</h1>
                <p className="text-sm text-gray-600">Διαχείριση τιμολογίων και πληρωμών</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Συνολικά</p>
                <p className="text-2xl font-bold text-gray-900">€{stats.total.toFixed(2)}</p>
              </div>
              <Euro className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Πληρωμένα</p>
                <p className="text-2xl font-bold text-green-900">€{stats.paid.toFixed(2)}</p>
              </div>
              <Euro className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Εκκρεμή</p>
                <p className="text-2xl font-bold text-yellow-900">€{stats.pending.toFixed(2)}</p>
              </div>
              <Euro className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Ληξιπρόθεσμα</p>
                <p className="text-2xl font-bold text-red-900">€{stats.overdue.toFixed(2)}</p>
              </div>
              <Euro className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Φίλτρα:</span>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Όλες οι καταστάσεις</option>
                <option value="paid">Πληρωμένα</option>
                <option value="pending">Εκκρεμή</option>
                <option value="overdue">Ληξιπρόθεσμα</option>
                <option value="cancelled">Ακυρωμένα</option>
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Όλοι οι μήνες</option>
                <option value="0">Ιανουάριος</option>
                <option value="1">Φεβρουάριος</option>
                <option value="2">Μάρτιος</option>
                <option value="3">Απρίλιος</option>
                <option value="4">Μάιος</option>
                <option value="5">Ιούνιος</option>
                <option value="6">Ιούλιος</option>
                <option value="7">Αύγουστος</option>
                <option value="8">Σεπτέμβριος</option>
                <option value="9">Οκτώβριος</option>
                <option value="10">Νοέμβριος</option>
                <option value="11">Δεκέμβριος</option>
              </select>
              
              <span className="text-sm text-gray-500">
                {filteredInvoices.length} από {invoices.length} τιμολόγια
              </span>
            </div>
          </div>
        </div>        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν τιμολόγια</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all' && selectedMonth === 'all'
                ? 'Δεν έχετε ακόμα τιμολόγια'
                : 'Δεν υπάρχουν τιμολόγια με τα επιλεγμένα κριτήρια'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      Λήξη
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
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Παραγγελία: {invoice.orderNumber}
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
                        {new Date(invoice.issueDate).toLocaleDateString('el-GR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.dueDate).toLocaleDateString('el-GR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            €{invoice.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.itemsCount} προϊόντα
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                        {invoice.status === 'paid' && invoice.paidDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Πληρώθηκε: {new Date(invoice.paidDate).toLocaleDateString('el-GR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Προβολή</span>
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>PDF</span>
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
    </div>
  );
}