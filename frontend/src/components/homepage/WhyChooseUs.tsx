'use client';

import Link from 'next/link';

export default function WhyChooseUs() {
  const features = [
    {
      icon: '🌱',
      title: 'Απευθείας από τον Παραγωγό',
      description: 'Χωρίς μεσάζοντες, για τη μέγιστη φρεσκάδα και τις καλύτερες τιμές',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: '✅',
      title: 'Εγγυημένη Ποιότητα',
      description: 'Όλοι οι παραγωγοί μας είναι πιστοποιημένοι και ελέγχονται τακτικά',
      color: 'from-blue-400 to-blue-500'
    },
    {
      icon: '🚚',
      title: 'Γρήγορη Παράδοση',
      description: 'Παραλαμβάνετε τα προϊόντα σας σε 24-48 ώρες σε όλη την Ελλάδα',
      color: 'from-purple-400 to-purple-500'
    },
    {
      icon: '🛡️',
      title: 'Ασφαλείς Πληρωμές',
      description: 'Κρυπτογραφημένες συναλλαγές με υποστήριξη όλων των τραπεζών',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: '💚',
      title: 'Οικολογική Επιλογή',
      description: 'Υποστηρίζουμε βιώσιμες πρακτικές και τοπική παραγωγή',
      color: 'from-teal-400 to-cyan-500'
    },
    {
      icon: '📞',
      title: '24/7 Υποστήριξη',
      description: 'Η ομάδα μας είναι πάντα εδώ για να σας βοηθήσει',
      color: 'from-pink-400 to-rose-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 rounded-full px-6 py-3 mb-6">
            <span className="text-emerald-600 text-lg">⭐</span>
            <span className="text-emerald-700 font-semibold">Γιατί να μας επιλέξετε</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Η διαφορά που κάνουμε
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Συνδέουμε τους Έλληνες παραγωγούς με τους καταναλωτές, 
            δημιουργώντας μια αξιόπιστη και βιώσιμη αλυσίδα εφοδιασμού
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative p-8">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{feature.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-200 transition-colors duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Εμπιστεύονται ήδη το Dixis
            </h3>
            <p className="text-lg text-gray-600">
              Χιλιάδες ικανοποιημένοι πελάτες σε όλη την Ελλάδα
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">15,000+</div>
              <div className="text-gray-700 font-medium">Ευχαριστημένοι Πελάτες</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-gray-700 font-medium">Έλληνες Παραγωγοί</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">50,000+</div>
              <div className="text-gray-700 font-medium">Επιτυχημένες Παραδόσεις</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">4.9/5</div>
              <div className="text-gray-700 font-medium">Βαθμολογία Ικανοποίησης</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Έτοιμοι να ανακαλύψετε τη διαφορά;
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Ξεκινήστε την περιπέτεια των γεύσεων με τα καλύτερα ελληνικά προϊόντα
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
              >
                <span>🛍️</span>
                <span>Ξεκινήστε τώρα</span>
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
              >
                <span>📖</span>
                <span>Μάθετε περισσότερα</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}