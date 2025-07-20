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
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const subscriptionComparison = [
  {
    feature: 'Προμήθεια πλατφόρμας',
    free: '12%',
    essential: '6%',
    premium: '4%',
    professional: '0%'
  },
  {
    feature: 'Μεταφορικά',
    free: 'Κανονικά',
    essential: 'Κανονικά',
    premium: 'Δωρεάν',
    professional: 'Δωρεάν + Προτεραιότητα'
  },
  {
    feature: 'Προβολή προϊόντων',
    free: 'Βασική',
    essential: 'Ενισχυμένη',
    premium: 'Premium',
    professional: 'VIP'
  },
  {
    feature: 'Analytics & Reports',
    free: 'Όχι',
    essential: 'Βασικά',
    premium: 'Προχωρημένα',
    professional: 'Πλήρη + Account Manager'
  },
  {
    feature: 'Brand Services',
    free: 'Όχι',
    essential: 'Έκπτωση 10%',
    premium: 'Έκπτωση 20%',
    professional: 'Δωρεάν συμβουλευτική'
  }
];

const userTypes = [
  {
    id: 'consumers',
    title: 'Καταναλωτές & Οικογένειες',
    description: 'Απολαύστε φρέσκα προϊόντα με δωρεάν μεταφορικά και ειδικές προσφορές',
    icon: HeartIcon,
    color: 'emerald',
    plan: 'Dixis Premium',
    price: '€12.99/μήνα',
    benefits: [
      'Δωρεάν μεταφορικά σε όλες τις παραγγελίες',
      'Μηνιαίο κουτί με εκλεκτά τοπικά προϊόντα',
      'Προτεραιότητα σε νέα προϊόντα',
      'Ειδικές εκπτώσεις έως 20%'
    ],
    cta: 'Ξεκινήστε Premium',
    link: '/subscription/premium'
  },
  {
    id: 'producers',
    title: 'Παραγωγοί & Καλλιεργητές',
    description: 'Αναπτύξτε τις πωλήσεις σας με λιγότερη προμήθεια και επαγγελματικές υπηρεσίες',
    icon: StarIcon,
    color: 'blue',
    plan: 'Essential ή Premium',
    price: 'από €39/μήνα',
    benefits: [
      'Μειωμένη προμήθεια από 12% σε 6% ή 4%',
      'Ενισχυμένη προβολή προϊόντων',
      'Επαγγελματικές υπηρεσίες branding',
      'Analytics πωλήσεων και τάσεων'
    ],
    cta: 'Γίνετε Παραγωγός',
    link: '/subscription/producers'
  },
  {
    id: 'business',
    title: 'Επιχειρήσεις & Εστιατόρια',
    description: 'Μηδενική προμήθεια και αποκλειστική υποστήριξη για μεγάλους όγκους παραγγελιών',
    icon: ShoppingBagIcon,
    color: 'purple',
    plan: 'Professional',
    price: '€129/μήνα',
    benefits: [
      '0% προμήθεια σε όλες τις παραγγελίες',
      'Αποκλειστικός account manager',
      'Εργαλεία bulk παραγγελίας',
      'Προτεραιότητα παράδοσης'
    ],
    cta: 'Ξεκινήστε Professional',
    link: '/subscription/business'
  }
];

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <SparklesIcon className="h-4 w-4" />
              Συνδρομητικά πλάνα Dixis
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Περισσότερα οφέλη,<br />
              <span className="text-emerald-600">καλύτερες τιμές</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Επιλέξτε το πλάνο που ταιριάζει στις ανάγκες σας και απολαύστε αποκλειστικά προνόμια, 
              ειδικές τιμές και υπηρεσίες premium στην κοινότητα farm-to-table του Dixis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                <Link href="#user-types">Επιλέξτε πλάνο</Link>
              </Button>
              
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Link href="#comparison">Σύγκριση πλάνων</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="user-types" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ποιο πλάνο σας ταιριάζει;
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Από καταναλωτές έως παραγωγούς και επιχειρήσεις, έχουμε το κατάλληλο πλάνο για εσάς
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-${type.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon className={`h-8 w-8 text-${type.color}-600`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{type.title}</h3>
                  <p className="text-gray-600 mb-6">{type.description}</p>

                  {/* Plan Info */}
                  <div className="mb-6">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 bg-${type.color}-100 text-${type.color}-800`}>
                      {type.plan}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{type.price}</div>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-3 mb-8">
                    {type.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckIcon className={`h-5 w-5 text-${type.color}-600 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    asChild
                    size="lg"
                    className={`w-full bg-${type.color}-600 hover:bg-${type.color}-700 text-white`}
                  >
                    <Link href={type.link}>
                      <span>{type.cta}</span>
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Σύγκριση πλάνων
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Δείτε αναλυτικά τι περιλαμβάνει κάθε πλάνο
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Χαρακτηριστικά</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Δωρεάν</th>
                    <th className="text-center py-4 px-6 font-semibold text-blue-700">Essential<br /><span className="text-sm font-normal">€39/μήνα</span></th>
                    <th className="text-center py-4 px-6 font-semibold text-emerald-700">Premium<br /><span className="text-sm font-normal">€12.99-€89/μήνα</span></th>
                    <th className="text-center py-4 px-6 font-semibold text-purple-700">Professional<br /><span className="text-sm font-normal">€129/μήνα</span></th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionComparison.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                      <td className="text-center py-4 px-6 text-gray-600">{row.free}</td>
                      <td className="text-center py-4 px-6 text-blue-700 font-medium">{row.essential}</td>
                      <td className="text-center py-4 px-6 text-emerald-700 font-medium">{row.premium}</td>
                      <td className="text-center py-4 px-6 text-purple-700 font-medium">{row.professional}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ξεκινήστε τη συνδρομή σας σήμερα
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Εγγραφείτε τώρα και απολαύστε όλα τα προνόμια της κοινότητας Dixis
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8"
              >
                <Link href="/subscription/premium">
                  Ξεκινήστε με Premium
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 backdrop-blur-sm px-8"
              >
                <Link href="/contact">
                  Μιλήστε με έναν ειδικό
                </Link>
              </Button>
            </div>

            <p className="text-emerald-200 mt-6 text-sm">
              Χωρίς δέσμευση • Ακύρωση οποιαδήποτε στιγμή • Υποστήριξη 24/7
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}