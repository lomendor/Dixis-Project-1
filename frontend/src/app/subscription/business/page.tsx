'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  TruckIcon,
  StarIcon,
  BoltIcon,
  GiftIcon,
  ChartBarIcon,
  CameraIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  StarIcon as CrownIcon,
  CheckIcon,
  ArrowRightIcon,
  HeartIcon,
  CurrencyEuroIcon,
  PhoneIcon,
  DocumentTextIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const businessFeatures = [
  {
    icon: CurrencyEuroIcon,
    title: '0% Προμήθεια πλατφόρμας',
    description: 'Μηδενικό κόστος συναλλαγών σε όλες τις παραγγελίες',
    value: 'Εξοικονόμηση 8% ανά παραγγελία'
  },
  {
    icon: UserGroupIcon,
    title: 'Αποκλειστικός Account Manager',
    description: 'Προσωπικός σύμβουλος για τις ανάγκες της επιχείρησής σας',
    value: 'Άμεση επικοινωνία & υποστήριξη'
  },
  {
    icon: TruckIcon,
    title: 'Δωρεάν μεταφορικά & Προτεραιότητα',
    description: 'Δωρεάν παράδοση και προτεραιότητα στον προγραμματισμό',
    value: 'Παράδοση εντός 24h'
  },
  {
    icon: ShoppingBagIcon,
    title: 'Εργαλεία Bulk Παραγγελίας',
    description: 'CSV upload, προκαθορισμένες λίστες και μαζικές παραγγελίες',
    value: 'Εξοικονόμηση 70% χρόνου'
  },
  {
    icon: DocumentTextIcon,
    title: 'Αυτοματοποιημένη Τιμολόγηση',
    description: 'Αυτόματη έκδοση τιμολογίων και διαχείριση λογιστικών στοιχείων',
    value: 'Συμβατότητα με όλα τα λογιστικά'
  },
  {
    icon: ChartBarIcon,
    title: 'Προχωρημένα Analytics',
    description: 'Detailed reporting, cost analysis και business intelligence',
    value: 'ROI tracking & optimization'
  }
];

const businessTypes = [
  {
    type: 'Εστιατόρια & Ταβέρνες',
    description: 'Φρέσκα υλικά άμεσα από τον παραγωγό',
    icon: BuildingOfficeIcon,
    monthlyVolume: '€2,000-5,000',
    savings: '€160-400/μήνα',
    benefits: ['Φρεσκότητα εγγυημένη', 'Σταθερές τιμές', 'Εποχιακό μενού support']
  },
  {
    type: 'Hotels & Resorts',
    description: 'Premium τοπικά προϊόντα για τους επισκέπτες σας',
    icon: BuildingOfficeIcon,
    monthlyVolume: '€5,000-15,000',
    savings: '€400-1,200/μήνα',
    benefits: ['Τοπική αυθεντικότητα', 'Μεγάλοι όγκοι', 'Seasonal packages']
  },
  {
    type: 'Delikatessen & Gourmet',
    description: 'Εκλεκτά προϊόντα για το κατάστημά σας',
    icon: ShoppingBagIcon,
    monthlyVolume: '€1,500-4,000',
    savings: '€120-320/μήνα',
    benefits: ['Αποκλειστικά προϊόντα', 'Private labeling', 'Marketing support']
  },
  {
    type: 'Catering Services',
    description: 'Μαζική εστίαση με ποιοτικά υλικά',
    icon: UserGroupIcon,
    monthlyVolume: '€3,000-10,000',
    savings: '€240-800/μήνα',
    benefits: ['Bulk discounts', 'Reliable supply', 'Event planning support']
  }
];

const roiCalculator = [
  {
    volume: '€1,000',
    standardCommission: '€80',
    professionalCost: '€129',
    monthlySavings: '-€49',
    yearlyROI: '-€588'
  },
  {
    volume: '€2,000',
    standardCommission: '€160',
    professionalCost: '€129',
    monthlySavings: '€31',
    yearlyROI: '€372'
  },
  {
    volume: '€3,000',
    standardCommission: '€240',
    professionalCost: '€129',
    monthlySavings: '€111',
    yearlyROI: '€1,332'
  },
  {
    volume: '€5,000',
    standardCommission: '€400',
    professionalCost: '€129',
    monthlySavings: '€271',
    yearlyROI: '€3,252'
  },
  {
    volume: '€10,000',
    standardCommission: '€800',
    professionalCost: '€129',
    monthlySavings: '€671',
    yearlyROI: '€8,052'
  }
];

const successStories = [
  {
    business: 'Taverna Mykonos',
    location: 'Μύκονος',
    type: 'Εστιατόριο',
    monthlyVolume: '€4,200',
    savings: '€2,100/έτος',
    quote: 'Το Professional μας βοήθησε να μειώσουμε τα κόστη και να προσφέρουμε πιο αυθεντικές γεύσεις στους πελάτες μας.',
    manager: 'Νίκος Παπαδάκης, Chef/Owner'
  },
  {
    business: 'Aegean Resort',
    location: 'Σαντορίνη',
    type: 'Ξενοδοχείο',
    monthlyVolume: '€8,500',
    savings: '€5,400/έτος',
    quote: 'Οι επισκέπτες μας απολαμβάνουν πραγματικές τοπικές γεύσεις. Το account management team είναι εξαιρετικό.',
    manager: 'Μαρία Κωνσταντίνου, F&B Manager'
  }
];

export default function BusinessSubscriptionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BuildingOfficeIcon className="h-4 w-4" />
              Dixis Professional για Επιχειρήσεις
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Μηδενική προμήθεια,<br />
              <span className="text-purple-600">μέγιστα κέρδη</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Το Professional πλάνο για εστιατόρια, ξενοδοχεία και επιχειρήσεις τροφίμων που θέλουν 
              να εξοικονομήσουν κόστη και να προσφέρουν αυθεντικές ελληνικές γεύσεις.
            </p>

            {/* Pricing */}
            <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-purple-100 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">€129</div>
                <div className="text-sm text-gray-600">/μήνα</div>
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-gray-900">Dixis Professional</div>
                <div className="text-sm text-gray-600">ROI θετικό από €2,000 μηνιαίες παραγγελίες</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              >
                <Link href="/subscription/checkout?plan=professional">
                  Ξεκινήστε δωρεάν δοκιμή
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Link href="#roi-calculator">Υπολογίστε ROI</Link>
              </Button>
            </div>

            <p className="text-purple-700 mt-4 text-sm">
              30 ημέρες δωρεάν δοκιμή • Αποκλειστικός Account Manager • Υποστήριξη 24/7
            </p>
          </motion.div>
        </div>
      </section>

      {/* Business Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Σχεδιασμένο για επιχειρήσεις
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Όλα όσα χρειάζεστε για να διαχειριστείτε αποτελεσματικά τις προμήθειες σας
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <div className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md inline-block">
                  {feature.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ιδανικό για κάθε είδος επιχείρησης
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Από μικρές ταβέρνες έως μεγάλα resort, το Professional προσαρμόζεται στις ανάγκες σας
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {businessTypes.map((business, index) => (
              <motion.div
                key={business.type}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <business.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{business.type}</h3>
                    <p className="text-sm text-gray-600 mb-4">{business.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Μηνιαίος Όγκος</div>
                        <div className="text-lg font-bold text-purple-600">{business.monthlyVolume}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Εξοικονόμηση</div>
                        <div className="text-lg font-bold text-green-600">{business.savings}</div>
                      </div>
                    </div>

                    <ul className="space-y-1">
                      {business.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <CheckIcon className="h-3 w-3 text-purple-600 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi-calculator" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Υπολογιστής ROI
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Δείτε πόσα θα εξοικονομήσετε με το Professional πλάνο βάσει του μηνιαίου όγκου παραγγελιών σας
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-50 border-b border-purple-100">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Μηνιαίος Όγκος</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Προμήθεια 8%</th>
                    <th className="text-center py-4 px-6 font-semibold text-purple-700">Professional €129</th>
                    <th className="text-center py-4 px-6 font-semibold text-green-700">Μηνιαία Εξοικονόμηση</th>
                    <th className="text-center py-4 px-6 font-semibold text-emerald-700">Ετήσιο ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {roiCalculator.map((row, index) => (
                    <tr key={index} className={`border-b border-gray-100 hover:bg-gray-50 ${
                      parseFloat(row.monthlySavings.replace('€', '').replace('-', '')) > 0 ? 'bg-green-50' : ''
                    }`}>
                      <td className="py-4 px-6 font-medium text-gray-900">{row.volume}</td>
                      <td className="text-center py-4 px-6 text-red-600">{row.standardCommission}</td>
                      <td className="text-center py-4 px-6 text-purple-700 font-medium">{row.professionalCost}</td>
                      <td className={`text-center py-4 px-6 font-bold ${
                        row.monthlySavings.includes('-') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {row.monthlySavings}
                      </td>
                      <td className={`text-center py-4 px-6 font-bold ${
                        row.yearlyROI.includes('-') ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {row.yearlyROI}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-purple-50 p-4 text-center">
              <p className="text-sm text-purple-700">
                💡 <strong>Break-even point:</strong> €2,000 μηνιαίες παραγγελίες
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ιστορίες επιτυχίας επιχειρήσεων
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Δείτε πως άλλες επιχειρήσεις μείωσαν τα κόστη και βελτίωσαν την ποιότητα
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.business}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{story.business}</h3>
                    <p className="text-sm text-gray-600">{story.location} • {story.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Μηνιαίος Όγκος</div>
                    <div className="text-lg font-bold text-purple-600">{story.monthlyVolume}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Ετήσια Εξοικονόμηση</div>
                    <div className="text-lg font-bold text-green-600">{story.savings}</div>
                  </div>
                </div>

                <blockquote className="text-gray-700 italic mb-4">
                  "{story.quote}"
                </blockquote>

                <cite className="text-sm text-gray-600 not-italic">
                  — {story.manager}
                </cite>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ξεκινήστε τη δωρεάν δοκιμή σας σήμερα
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              30 ημέρες δωρεάν Professional με αποκλειστικό Account Manager και πλήρη υποστήριξη. 
              Δείτε τη διαφορά στα κόστη σας από την πρώτη παραγγελία.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                asChild 
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-50 px-8"
              >
                <Link href="/subscription/checkout?plan=professional&trial=30">
                  <span>Ξεκινήστε δωρεάν δοκιμή</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 backdrop-blur-sm px-8"
              >
                <Link href="/contact?type=business">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Μιλήστε με έναν ειδικό
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-purple-200 text-sm">
              <div className="flex items-center gap-1">
                <CheckIcon className="h-4 w-4" />
                30 ημέρες δωρεάν
              </div>
              <div className="flex items-center gap-1">
                <CheckIcon className="h-4 w-4" />
                Αποκλειστικός Account Manager
              </div>
              <div className="flex items-center gap-1">
                <CheckIcon className="h-4 w-4" />
                Ακύρωση οποιαδήποτε στιγμή
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}