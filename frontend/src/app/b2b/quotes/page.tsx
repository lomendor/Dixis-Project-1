'use client';

import { logger } from '@/lib/logging/productionLogger';
import { toError, errorToContext } from '@/lib/utils/errorUtils';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Eye, ShoppingCart, Calendar } from 'lucide-react';

interface Quote {
  id: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  total: number;
  itemsCount: number;
  validUntil: string;
  contactPerson: string;
  deliveryDate?: string;
  notes?: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      // Simulate API call to fetch quotes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockQuotes: Quote[] = [
        {
          id: 'Q-2024-001',
          requestDate: '2024-01-15',
          status: 'approved',
          total: 1250.50,
          itemsCount: 8,
          validUntil: '2024-02-15',
          contactPerson: 'Γιάννης Παπαδόπουλος',
          deliveryDate: '2024-01-25',
          notes: 'Επείγουσα παραγγελία για εκδήλωση'
        },
        {
          id: 'Q-2024-002',
          requestDate: '2024-01-18',
          status: 'pending',
          total: 890.25,
          itemsCount: 5,
          validUntil: '2024-02-18',
          contactPerson: 'Μαρία Κωνσταντίνου',
          deliveryDate: '2024-01-30'
        },
        {
          id: 'Q-2024-003',
          requestDate: '2024-01-20',
          status: 'rejected',
          total: 2150.75,
          itemsCount: 12,
          validUntil: '2024-02-20',
          contactPerson: 'Δημήτρης Αντωνίου',
          notes: 'Δεν μπορούμε να καλύψουμε τις ποσότητες'
        }
      ];
      
      setQuotes(mockQuotes);
    } catch (error) {
      logger.error('Failed to fetch quotes:', toError(error), errorToContext(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return 'Εκκρεμεί';
      case 'approved':
        return 'Εγκρίθηκε';
      case 'rejected':
        return 'Απορρίφθηκε';
      case 'expired':
        return 'Έληξε';
      default:
        return 'Άγνωστο';
    }
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredQuotes = selectedStatus === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.status === selectedStatus);

  const handleConvertToOrder = (quoteId: string) => {
    alert(`Μετατροπή προσφοράς ${quoteId} σε παραγγελία`);
    // Here you would implement the conversion logic
  };  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Φόρτωση προσφορών...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Οι Προσφορές μου</h1>
                <p className="text-sm text-gray-600">Διαχείριση αιτημάτων προσφορών</p>
              </div>
            </div>
            <Link
              href="/b2b/quotes/request"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Νέα Προσφορά
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Φίλτρο:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Όλες οι προσφορές</option>
                <option value="pending">Εκκρεμείς</option>
                <option value="approved">Εγκεκριμένες</option>
                <option value="rejected">Απορριφθείσες</option>
                <option value="expired">Ληγμένες</option>
              </select>
              <span className="text-sm text-gray-500">
                {filteredQuotes.length} από {quotes.length} προσφορές
              </span>
            </div>
          </div>
        </div>

        {/* Quotes List */}
        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Δεν βρέθηκαν προσφορές</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'all' 
                ? 'Δεν έχετε κάνει ακόμα αιτήματα προσφορών'
                : `Δεν υπάρχουν προσφορές με κατάσταση "${getStatusText(selectedStatus as Quote['status'])}"`
              }
            </p>
            <Link
              href="/b2b/quotes/request"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Δημιουργία Πρώτης Προσφοράς
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(quote.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{quote.id}</h3>
                        <p className="text-sm text-gray-600">
                          Αίτημα: {new Date(quote.requestDate).toLocaleDateString('el-GR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                        {getStatusText(quote.status)}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        €{quote.total.toFixed(2)}
                      </span>
                    </div>
                  </div>                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{quote.itemsCount} προϊόντα</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Ισχύει έως: {new Date(quote.validUntil).toLocaleDateString('el-GR')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Επικοινωνία: {quote.contactPerson}</span>
                    </div>
                  </div>

                  {quote.deliveryDate && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Επιθυμητή παράδοση:</strong> {new Date(quote.deliveryDate).toLocaleDateString('el-GR')}
                      </p>
                    </div>
                  )}

                  {quote.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Σημειώσεις:</strong> {quote.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>Προβολή Λεπτομερειών</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {quote.status === 'approved' && (
                        <button
                          onClick={() => handleConvertToOrder(quote.id)}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Μετατροπή σε Παραγγελία</span>
                        </button>
                      )}
                      
                      {quote.status === 'pending' && (
                        <span className="text-sm text-yellow-600 font-medium">
                          Αναμονή απάντησης...
                        </span>
                      )}
                      
                      {quote.status === 'rejected' && (
                        <Link
                          href="/b2b/quotes/request"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Νέα Προσφορά
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}