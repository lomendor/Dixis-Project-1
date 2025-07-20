'use client';

import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: '🔍',
      title: 'Ανακαλύψτε',
      description: 'Εξερευνήστε χιλιάδες αυθεντικά ελληνικά προϊόντα από επαληθευμένους παραγωγούς',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      number: '02',
      icon: '🛒',
      title: 'Επιλέξτε',
      description: 'Προσθέστε τα αγαπημένα σας προϊόντα στο καλάθι και προχωρήστε στην παραγγελία',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      number: '03',
      icon: '💳',
      title: 'Πληρώστε',
      description: 'Ολοκληρώστε την παραγγελία σας με ασφαλή τρόπο πληρωμής της επιλογής σας',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      number: '04',
      icon: '🚚',
      title: 'Παραλάβετε',
      description: 'Απολαύστε τα φρέσκα προϊόντα σας που θα φτάσουν στην πόρτα σας σε 24-48 ώρες',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 rounded-full px-6 py-3 mb-6">
            <span className="text-emerald-600 text-lg">⚡</span>
            <span className="text-emerald-700 font-semibold">Πώς λειτουργεί</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Απλά βήματα για φρέσκα προϊόντα
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Σε μόλις 4 απλά βήματα μπορείτε να απολαύσετε τα καλύτερα ελληνικά προϊόντα 
            απευθείας από τους παραγωγούς
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 via-purple-200 to-orange-200 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group text-center"
              >
                {/* Step Circle */}
                <div className="relative mb-6">
                  <div className={`w-24 h-24 ${step.bgColor} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                    <span className="text-4xl">{step.icon}</span>
                  </div>
                  
                  {/* Step Number */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r ${step.color} text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg`}>
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className={`mt-6 h-1 bg-gradient-to-r ${step.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Γιατί να επιλέξετε το Dixis;
            </h3>
            <p className="text-lg text-gray-600">
              Οι λόγοι που χιλιάδες πελάτες μας εμπιστεύονται καθημερινά
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Ποιότητα Εγγυημένη</h4>
              <p className="text-gray-600">Όλα τα προϊόντα ελέγχονται για την ποιότητα και την αυθεντικότητά τους</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">💚</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Υποστήριξη Παραγωγών</h4>
              <p className="text-gray-600">Κάθε αγορά υποστηρίζει άμεσα τους Έλληνες παραγωγούς</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Γρήγορη Εξυπηρέτηση</h4>
              <p className="text-gray-600">Ταχύτατη παραδοση και άριστη εξυπηρέτηση πελατών</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Έτοιμοι να ξεκινήσετε;
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Ανακαλύψτε τη μαγεία των αυθεντικών ελληνικών γεύσεων σε μόλις λίγα κλικ
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
              >
                <span>🚀</span>
                <span>Ξεκινήστε τώρα</span>
              </Link>
              <Link
                href="/producers"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
              >
                <span>👨‍🌾</span>
                <span>Γνωρίστε τους παραγωγούς</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}