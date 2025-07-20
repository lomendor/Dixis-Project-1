'use client';

import Link from 'next/link';

const subscriptionTiers = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Δωρεάν',
    period: '',
    description: 'Για νέους χρήστες',
    popular: false,
    benefits: [
      'Πρόσβαση σε όλα τα προϊόντα',
      '12% προμήθεια για παραγωγούς',
      'Βασική υποστήριξη',
      'Εγγραφή χωρίς κόστος'
    ],
    cta: 'Ξεκινήστε δωρεάν',
    link: '/register'
  },
  {
    id: 'essential',
    name: 'Essential',
    price: '€39',
    period: '/μήνα',
    description: 'Για παραγωγούς με όγκο πωλήσεων',
    popular: true,
    benefits: [
      'Μόλις 6% προμήθεια',
      'Ενισχυμένη προβολή προϊόντων',
      'Βασικά analytics πωλήσεων',
      'Προτεινόμενος παραγωγός badge'
    ],
    cta: 'Αναβαθμίστε τώρα',
    link: '/subscription/essential'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '€89',
    period: '/μήνα',
    description: 'Για μεγάλες επιχειρήσεις',
    popular: false,
    benefits: [
      'Μόλις 4% προμήθεια',
      'Αποκλειστική υποστήριξη',
      'Προηγμένα analytics και reports',
      'Bulk παραγγελίες και τιμολόγηση'
    ],
    cta: 'Επιλέξτε Premium',
    link: '/subscription/premium'
  }
];

export default function SubscriptionBenefits() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Επιλέξτε το πλάνο σας
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Από δωρεάν εγγραφή μέχρι premium υπηρεσίες για μεγάλους όγκους. 
            Επιλέξτε αυτό που ταιριάζει στις ανάγκες σας.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden ${
                tier.popular 
                  ? 'border-green-500 ring-2 ring-green-100' 
                  : 'border-gray-200'
              }`}
            >
              {tier.popular && (
                <div className="bg-green-500 text-white text-center py-2 text-sm font-medium">
                  Δημοφιλές
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                  
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                    {tier.period && <span className="text-gray-500">{tier.period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.link}
                  className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    tier.popular 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">🚚</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Δωρεάν μεταφορικά</h3>
            <p className="text-sm text-gray-600">Σε παραγγελίες άνω των €30 για Premium χρήστες</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">👥</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Αποκλειστική υποστήριξη</h3>
            <p className="text-sm text-gray-600">Dedicated account manager για Premium επιχειρήσεις</p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
            <p className="text-sm text-gray-600">Προηγμένα στατιστικά πωλήσεων και αγοράς</p>
          </div>
        </div>

        <div className="text-center bg-white rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ξεκινήστε δωρεάν σήμερα
          </h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Δημιουργήστε δωρεάν λογαριασμό και αναβαθμίστε όποτε οι ανάγκες σας αλλάξουν.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Δημιουργία λογαριασμού
            </Link>
            
            <Link 
              href="/b2b/login"
              className="inline-flex items-center justify-center border border-green-500 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Εγγραφή B2B
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}