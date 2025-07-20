export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Επικοινωνία</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Είμαστε εδώ για να σας βοηθήσουμε. Επικοινωνήστε μαζί μας για οποιαδήποτε ερώτηση.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">Στείλτε μας μήνυμα</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Όνομα *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Το όνομά σας"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Θέμα
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Επιλέξτε θέμα</option>
                    <option value="general">Γενική ερώτηση</option>
                    <option value="producer">Ενδιαφέρον για συνεργασία ως παραγωγός</option>
                    <option value="order">Ερώτηση για παραγγελία</option>
                    <option value="technical">Τεχνικό πρόβλημα</option>
                    <option value="other">Άλλο</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Μήνυμα *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Γράψτε το μήνυμά σας εδώ..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Αποστολή Μηνύματος
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">Στοιχεία Επικοινωνίας</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@dixis.gr</p>
                    <p className="text-gray-600">support@dixis.gr</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Τηλέφωνο</h3>
                    <p className="text-gray-600">+30 210 123 4567</p>
                    <p className="text-sm text-gray-500">Δευτέρα - Παρασκευή, 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Διεύθυνση</h3>
                    <p className="text-gray-600">
                      Λεωφόρος Κηφισίας 123<br />
                      15451 Νέο Ψυχικό<br />
                      Αθήνα, Ελλάδα
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">⏰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ώρες Λειτουργίας</h3>
                    <p className="text-gray-600">
                      Δευτέρα - Παρασκευή: 9:00 - 18:00<br />
                      Σάββατο: 10:00 - 15:00<br />
                      Κυριακή: Κλειστά
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Συχνές Ερωτήσεις</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ίσως η απάντηση που ψάχνετε βρίσκεται στις συχνές ερωτήσεις μας.
                </p>
                <a 
                  href="/faq"
                  className="text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Δείτε τις συχνές ερωτήσεις →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
