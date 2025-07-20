import Link from 'next/link';

export default function ProducerGettingStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Γίνετε Παραγωγός στο Dixis! 🌱
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Ο πλήρης οδηγός για να ξεκινήσετε να πουλάτε τα προϊόντα σας στην καλύτερη πλατφόρμα για Έλληνες παραγωγούς
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Start Steps */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Ξεκινήστε να πουλάτε σε 5 απλά βήματα</h2>
          
          <div className="space-y-8 mb-16">
            {/* Step 1 */}
            <div className="flex items-start bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Εγγραφή ως Παραγωγός</h3>
                <p className="text-gray-600 mb-4">
                  Δημιουργήστε τον δωρεάν λογαριασμό παραγωγού σας και συμπληρώστε τα στοιχεία της επιχείρησής σας
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link 
                    href="/producer/register"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Εγγραφή Παραγωγού
                  </Link>
                  <Link 
                    href="/login"
                    className="inline-block border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Είμαι ήδη εγγεγραμμένος
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Επαλήθευση Επιχείρησης</h3>
                <p className="text-gray-600 mb-4">
                  Η ομάδα μας θα επαληθεύσει τα στοιχεία σας εντός 24-48 ωρών. Τα προϊόντα σας θα είναι ορατά μετά την έγκριση.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Απαιτούμενα Έγγραφα:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• ΑΦΜ και στοιχεία επιχείρησης</li>
                    <li>• Πιστοποιητικά ποιότητας (αν υπάρχουν)</li>
                    <li>• Φωτογραφίες παραγωγής/εγκαταστάσεων</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Προσθήκη Προϊόντων</h3>
                <p className="text-gray-600 mb-4">
                  Προσθέστε τα προϊόντα σας με επαγγελματικές φωτογραφίες και λεπτομερείς περιγραφές
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">💡 Συμβουλές για Καλύτερες Πωλήσεις:</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Χρησιμοποιήστε υψηλής ποιότητας φωτογραφίες</li>
                    <li>• Γράψτε λεπτομερείς περιγραφές</li>
                    <li>• Αναφέρετε την προέλευση και τις ιδιότητες</li>
                    <li>• Ορίστε ανταγωνιστικές τιμές</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Διαχείριση Παραγγελιών</h3>
                <p className="text-gray-600 mb-4">
                  Λαμβάνετε παραγγελίες άμεσα και διαχειρίζεστε τις αποστολές από το dashboard σας
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">📦 Διαδικασία Εκτέλεσης:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Λαμβάνετε άμεση ειδοποίηση για νέες παραγγελίες</li>
                    <li>• Επιβεβαιώνετε τη διαθεσιμότητα εντός 4 ωρών</li>
                    <li>• Προετοιμάζετε και αποστέλλετε εντός 24-48 ωρών</li>
                    <li>• Ενημερώνετε τον κωδικό παρακολούθησης</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
                <span className="text-2xl font-bold text-green-600">5</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Πληρωμές & Έσοδα</h3>
                <p className="text-gray-600 mb-4">
                  Λαμβάνετε τα κέρδη σας κάθε εβδομάδα με αυτόματη μεταφορά στον τραπεζικό σας λογαριασμό
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">💰 Προμήθεια & Πληρωμές:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>12% προμήθεια</strong> (μειώνεται με συνδρομή)</li>
                    <li>• Εβδομαδιαίες πληρωμές κάθε Παρασκευή</li>
                    <li>• Αυτόματη μεταφορά στον τραπεζικό σας λογαριασμό</li>
                    <li>• Αναλυτικές αναφορές πωλήσεων</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <h3 className="text-lg font-bold text-blue-900 mb-4">🧪 Δοκιμαστικός Λογαριασμός Παραγωγού</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800">Στοιχεία Σύνδεσης:</h4>
                <p className="text-sm text-blue-700">Email: producer@dixis.gr</p>
                <p className="text-sm text-blue-700">Κωδικός: password</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">Dashboard:</h4>
                <Link 
                  href="/login"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Είσοδος στο Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Support & Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Benefits */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">🌟 Γιατί να Επιλέξετε το Dixis</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Άμεση πρόσβαση σε χιλιάδες πελάτες</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Μηδενικό κόστος εγγραφής και συντήρησης</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Εβδομαδιαίες πληρωμές</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Διαχείριση παραγγελιών & αποθέματος</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Εργαλεία μάρκετινγκ & προώθησης</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>24/7 υποστήριξη παραγωγών</span>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">🤝 Υποστήριξη Παραγωγών</h3>
              <div className="space-y-4 text-gray-600">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">📧 Email Support</h4>
                  <p className="text-sm">producers@dixis.gr</p>
                  <p className="text-xs text-gray-500">Απάντηση εντός 2 ωρών</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">📞 Τηλεφωνική Υποστήριξη</h4>
                  <p className="text-sm">210 123 4567</p>
                  <p className="text-xs text-gray-500">Δευτ-Παρ 9:00-18:00</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold mb-1">💬 Live Chat</h4>
                  <p className="text-sm">Άμεση επικοινωνία</p>
                  <p className="text-xs text-gray-500">Δευτ-Σαβ 8:00-20:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Έτοιμοι να Ξεκινήσετε;</h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Γίνετε μέρος της μεγαλύτερης κοινότητας Ελλήνων παραγωγών και αρχίστε να πουλάτε σήμερα!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/producer/register"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Εγγραφή Παραγωγού
              </Link>
              <Link
                href="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                Σύνδεση
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}