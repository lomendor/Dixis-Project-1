'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  TruckIcon,
  StarIcon,
  BoltIcon,
  GiftIcon,
  HeartIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';

const premiumFeatures = [
  {
    icon: TruckIcon,
    title: 'Δωρεάν μεταφορικά',
    description: 'Σε όλες τις παραγγελίες, ανεξάρτητα από το ποσό',
    value: 'Εξοικονόμηση €5-8 ανά παραγγελία'
  },
  {
    icon: GiftIcon,
    title: 'Μηνιαίο κουτί εκλεκτών',
    description: 'Κουτί με 3-5 εποχιακά προϊόντα από διαφορετικούς παραγωγούς',
    value: 'Αξία €15-20 κάθε μήνα'
  },
  {
    icon: BoltIcon,
    title: 'Προτεραιότητα σε νέα προϊόντα',
    description: 'Πρώτη πρόσβαση σε νέα προϊόντα και εποχιακές συλλογές',
    value: 'Exclusive πρόσβαση 7 ημέρες νωρίτερα'
  },
  {
    icon: StarIcon,
    title: 'Ειδικές εκπτώσεις',
    description: 'Έως 20% έκπτωση σε επιλεγμένα προϊόντα κάθε εβδομάδα',
    value: 'Εξοικονόμηση έως €50/μήνα'
  },
  {
    icon: ClockIcon,
    title: 'Express παράδοση',
    description: 'Προτεραιότητα στην παράδοση για ταχύτερη εξυπηρέτηση',
    value: 'Παράδοση εντός 24h'
  },
  {
    icon: HeartIcon,
    title: 'Υποστήριξη παραγωγών',
    description: 'Μέρος της συνδρομής πηγαίνει άμεσα στους παραγωγούς',
    value: '€2 κάθε μήνα στην κοινότητα'
  }
];

const seasonalBoxes = [
  {
    season: 'Άνοιξη',
    title: 'Κουτί Ανοιξιάτικων Γεύσεων',
    description: 'Φρέσκα λαχανικά, αρωματικά βότανα και αγριόχορτα',
    products: ['Αγκινάρες Αργολίδας', 'Αρωματικό μείγμα Κρήτης', 'Άγριο μέλι θυμαρίσιο', 'Φρέσκα κρεμμυδάκια', 'Βραστά χόρτα'],
    value: '€18',
    image: '/seasonal-boxes/spring.jpg'
  },
  {
    season: 'Καλοκαίρι',
    title: 'Κουτί Καλοκαιρινής Απόλαυσης',
    description: 'Ζουμερά φρούτα και λαχανικά της σεζόν',
    products: ['Ντομάτες Σαντορίνης', 'Καρπούζι Τυρνάβου', 'Μέλι ηλιάνθου', 'Φρέσκια ρίγανη', 'Ελληνικό τυρί'],
    value: '€20',
    image: '/seasonal-boxes/summer.jpg'
  },
  {
    season: 'Φθινόπωρο',
    title: 'Κουτί Φθινοπωρινών Καρπών',
    description: 'Ξηροί καρποί και παραδοσιακά προϊόντα',
    products: ['Καρύδια Πηλίου', 'Κάστανα Εύβοιας', 'Σύκα Καλαμάτας', 'Παραδοσιακό τσίπουρο', 'Λουκούμι'],
    value: '€16',
    image: '/seasonal-boxes/autumn.jpg'
  }
];

const comparisonData = [
  {
    feature: 'Μεταφορικά',
    free: '€5-8 ανά παραγγελία',
    premium: 'Δωρεάν'
  },
  {
    feature: 'Νέα προϊόντα',
    free: 'Κανονική πρόσβαση',
    premium: '7 ημέρες νωρίτερα'
  },
  {
    feature: 'Εκπτώσεις',
    free: 'Περιστασιακές προσφορές',
    premium: 'Εβδομαδιαίες εκπτώσεις έως 20%'
  },
  {
    feature: 'Μηνιαίο κουτί',
    free: 'Δεν περιλαμβάνεται',
    premium: 'Εκλεκτά εποχιακά προϊόντα'
  },
  {
    feature: 'Παράδοση',
    free: 'Κανονικές προτεραιότητες',
    premium: 'Express εντός 24h'
  },
  {
    feature: 'Υποστήριξη',
    free: 'Email υποστήριξη',
    premium: 'Προτεραιότητα + τηλέφωνο'
  }
];

const testimonials = [
  {
    name: 'Μαρία Κωνσταντίνου',
    location: 'Αθήνα',
    quote: 'Με το Premium πλάνο εξοικονομώ χρήματα και χρόνο. Τα μηνιαία κουτιά με βοηθούν να ανακαλύπτω νέες γεύσεις κάθε μήνα.',
    savings: '€45/μήνα',
    family: '4μελής οικογένεια'
  },
  {
    name: 'Γιάννης Μιχαλόπουλος',
    location: 'Θεσσαλονίκη',
    quote: 'Η ποιότητα των προϊόντων είναι εξαιρετική και τα δωρεάν μεταφορικά κάνουν τη διαφορά. Ξέρω ότι υποστηρίζω Έλληνες παραγωγούς.',
    savings: '€32/μήνα',
    family: '2μελής οικογένεια'
  }
];

export default function PremiumSubscriptionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4" />
              Dixis Premium για Καταναλωτές
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Περισσότερες γεύσεις,<br />
              <span className="text-emerald-600">λιγότερα έξοδα</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Απολαύστε δωρεάν μεταφορικά, μηνιαίο κουτί εκλεκτών προϊόντων και προτεραιότητα 
              σε όλες τις νέες γεύσεις της ελληνικής γης.
            </p>

            {/* Pricing */}
            <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">€12.99</div>
                <div className="text-sm text-gray-600">/μήνα</div>
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-gray-900">Dixis Premium</div>
                <div className="text-sm text-gray-600">Εξοικονόμηση έως €75/μήνα</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                <Link href="/subscription/checkout?plan=premium">
                  Ξεκινήστε 30 ημέρες δωρεάν
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Link href="#features">Δείτε τα οφέλη</Link>
              </Button>
            </div>

            <p className="text-emerald-700 mt-4 text-sm">
              Χωρίς δέσμευση • Ακύρωση οποιαδήποτε στιγμή • Υποστήριξη 24/7
            </p>
          </motion.div>
        </div>
      </section>

      {/* Premium Features */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Όλα όσα περιλαμβάνει το Premium
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Κάθε χαρακτηριστικό σχεδιάστηκε για να σας εξοικονομεί χρήματα και χρόνο
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-block">
                  {feature.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Boxes */}
      <section className="py-16 md:py-24 bg-emerald-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Μηνιαία κουτιά εκλεκτών προϊόντων
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Κάθε μήνα λαμβάνετε ένα κουτί με εποχιακά προϊόντα από διαφορετικούς παραγωγούς
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {seasonalBoxes.map((box, index) => (
              <motion.div
                key={box.season}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-emerald-200 to-green-300 flex items-center justify-center">
                  <div className="text-center text-emerald-800">
                    <div className="text-lg font-medium mb-2">[{box.season} Box Image]</div>
                    <div className="text-sm">{box.title}</div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{box.title}</h3>
                    <span className="text-lg font-bold text-emerald-600">{box.value}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{box.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Περιλαμβάνει:</p>
                    <ul className="space-y-1">
                      {box.products.map((product, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          {product}
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

      {/* Comparison Table */}
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
              Δωρεάν vs Premium
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Δείτε τη διαφορά που κάνει το Premium πλάνο
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Χαρακτηριστικά</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-600">Δωρεάν Λογαριασμός</th>
                  <th className="text-center py-4 px-6 font-semibold text-emerald-700">Premium €12.99/μήνα</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                    <td className="text-center py-4 px-6 text-gray-600">{row.free}</td>
                    <td className="text-center py-4 px-6 text-emerald-700 font-medium">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
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
              Τι λένε οι πελάτες μας
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Χιλιάδες οικογένειες έχουν ήδη αναβαθμίσει στο Premium
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-800">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.location} • {testimonial.family}</p>
                  </div>
                  <div className="text-right ml-auto">
                    <div className="text-lg font-bold text-emerald-600">{testimonial.savings}</div>
                    <div className="text-xs text-gray-600">Εξοικονόμηση</div>
                  </div>
                </div>

                <blockquote className="text-gray-700 italic">
                  "{testimonial.quote}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ξεκινήστε τη δωρεάν δοκιμή σας
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              30 ημέρες δωρεάν για να δοκιμάσετε όλα τα προνόμια του Premium. 
              Χωρίς δέσμευση και με δυνατότητα ακύρωσης οποιαδήποτε στιγμή.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                asChild 
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8"
              >
                <Link href="/subscription/checkout?plan=premium&trial=30">
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
                <Link href="/products">
                  Συνεχίστε τις αγορές
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-emerald-200 text-sm">
              <div className="flex items-center gap-1">
                <CheckIcon className="h-4 w-4" />
                30 ημέρες δωρεάν
              </div>
              <div className="flex items-center gap-1">
                <CheckIcon className="h-4 w-4" />
                Χωρίς δέσμευση
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