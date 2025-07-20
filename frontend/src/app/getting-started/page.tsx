import Link from 'next/link';

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Καλώς ήρθατε στο Dixis! 🌿
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Ο οδηγός για να ξεκινήσετε τις αγορές σας από τους καλύτερους Έλληνες παραγωγούς
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Start Steps */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Ξεκινήστε σε 3 απλά βήματα</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="text-center bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Εγγραφή</h3>
              <p className="text-gray-600 mb-6">
                Δημιουργήστε τον δωρεάν λογαριασμό σας και ανακαλύψτε 65+ αυθεντικά ελληνικά προϊόντα
              </p>
              <Link 
                href="/register"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Εγγραφή Τώρα
              </Link>
            </div>

            {/* Step 2 */}
            <div className="text-center bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Επιλογή Προϊόντων</h3>
              <p className="text-gray-600 mb-6">
                Περιηγηθείτε στην ποικιλία μας και προσθέστε τα αγαπημένα σας προϊόντα στο καλάθι
              </p>
              <Link 
                href="/products"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Δείτε Προϊόντα
              </Link>
            </div>

            {/* Step 3 */}
            <div className="text-center bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Παραγγελία</h3>
              <p className="text-gray-600 mb-6">
                Ολοκληρώστε την παραγγελία σας και λάβετέ τα απευθείας στην πόρτα σας σε 24-48 ώρες
              </p>
              <div className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg opacity-75">
                Έτοιμο για Παραγγελία
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <h3 className="text-lg font-bold text-blue-900 mb-4">🧪 Δοκιμαστικά Στοιχεία (Development Mode)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800">Πελάτης:</h4>
                <p className="text-sm text-blue-700">Email: test@dixis.gr</p>
                <p className="text-sm text-blue-700">Κωδικός: password</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">Παραγωγός:</h4>
                <p className="text-sm text-blue-700">Email: producer@dixis.gr</p>
                <p className="text-sm text-blue-700">Κωδικός: password</p>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🥬</span>
              </div>
              <h4 className="font-semibold mb-2">Φρέσκα Προϊόντα</h4>
              <p className="text-sm text-gray-600">Απευθείας από τους παραγωγούς</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚚</span>
              </div>
              <h4 className="font-semibold mb-2">Γρήγορη Παράδοση</h4>
              <p className="text-sm text-gray-600">24-48 ώρες σε όλη την Ελλάδα</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💳</span>
              </div>
              <h4 className="font-semibold mb-2">Ασφαλείς Πληρωμές</h4>
              <p className="text-sm text-gray-600">Κάρτα ή αντικαταβολή</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌿</span>
              </div>
              <h4 className="font-semibold mb-2">Βιολογικά</h4>
              <p className="text-sm text-gray-600">Πιστοποιημένα βιολογικά προϊόντα</p>
            </div>
          </div>

          {/* Customer Support */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Χρειάζεστε Βοήθεια;</h3>
            <p className="text-gray-600 mb-6">
              Η ομάδα υποστήριξής μας είναι εδώ για να σας βοηθήσει με οτιδήποτε χρειάζεστε
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">📧 Email</h4>
                <p className="text-sm text-gray-600">support@dixis.gr</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">📞 Τηλέφωνο</h4>
                <p className="text-sm text-gray-600">210 123 4567</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">💬 Chat</h4>
                <p className="text-sm text-gray-600">Δευτ-Παρ 9:00-17:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}