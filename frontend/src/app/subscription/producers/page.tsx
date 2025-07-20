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
  EyeIcon,
  PhoneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const producerTiers = [
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'Δωρεάν για πάντα',
    price: '€0',
    period: '/μήνα',
    commission: '12%',
    description: 'Ξεκινήστε τη πώληση στο Dixis χωρίς κόστος',
    color: 'gray',
    popular: false,
    features: [
      { text: 'Προμήθεια 12% ανά πώληση', included: true },
      { text: 'Βασική προβολή προϊόντων', included: true },
      { text: 'Πρόσβαση στη πλατφόρμα πωλήσεων', included: true },
      { text: 'Βασική υποστήριξη μέσω email', included: true },
      { text: 'Ενισχυμένη προβολή', included: false },
      { text: 'Analytics πωλήσεων', included: false },
      { text: 'Brand Services', included: false },
      { text: 'Αποκλειστική υποστήριξη', included: false }
    ],
    cta: 'Ξεκινήστε δωρεάν',
    link: '/register?type=producer'
  },
  {
    id: 'essential',
    name: 'Essential',
    subtitle: 'Για παραγωγούς που θέλουν να αναπτυχθούν',
    price: '€39',
    period: '/μήνα',
    commission: '6%',
    description: 'Μειώστε την προμήθεια στο μισό και αυξήστε τις πωλήσεις',
    color: 'blue',
    popular: true,
    features: [
      { text: 'Προμήθεια μόλις 6% ανά πώληση', included: true },
      { text: 'Ενισχυμένη προβολή προϊόντων', included: true },
      { text: '"Προτεινόμενος Παραγωγός" badge', included: true },
      { text: 'Βασικά analytics πωλήσεων', included: true },
      { text: 'Προτεραιότητα στα αποτελέσματα αναζήτησης', included: true },
      { text: 'Email υποστήριξη εντός 24h', included: true },
      { text: 'Έκπτωση 10% στις Brand Services', included: true },
      { text: 'Μηνιαία reports πωλήσεων', included: true }
    ],
    cta: 'Αναβαθμίστε τώρα',
    link: '/subscription/checkout?plan=essential'
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'Για επαγγελματίες παραγωγούς',
    price: '€89',
    period: '/μήνα',
    commission: '4%',
    description: 'Μέγιστη προβολή και ελάχιστη προμήθεια για μέγιστα κέρδη',
    color: 'emerald',
    popular: false,
    features: [
      { text: 'Προμήθεια μόλις 4% ανά πώληση', included: true },
      { text: 'Premium προβολή και τοποθέτηση', included: true },
      { text: '"Premium Παραγωγός" badge', included: true },
      { text: 'Προχωρημένα analytics & insights', included: true },
      { text: 'Αποκλειστική θέση στη homepage', included: true },
      { text: 'Τηλεφωνική υποστήριξη', included: true },
      { text: 'Έκπτωση 20% στις Brand Services', included: true },
      { text: 'Εβδομαδιαία market intelligence reports', included: true }
    ],
    cta: 'Γίνετε Premium',
    link: '/subscription/checkout?plan=premium'
  }
];

const successStories = [
  {
    name: 'Γιάννης Παπαδόπουλος',
    location: 'Καλαμάτα, Μεσσηνία',
    product: 'Βιολογικό Ελαιόλαδο',
    tier: 'Premium',
    increase: '+340%',
    quote: 'Με το Premium πλάνο τριπλασίασα τις πωλήσεις μου σε 6 μήνες. Η προβολή και τα analytics με βοήθησαν να καταλάβω τι θέλει η αγορά.',
    image: '/testimonials/giannis.jpg'
  },
  {
    name: 'Μαρία Αντωνίου',
    location: 'Χανιά, Κρήτη',
    product: 'Αρωματικά Βότανα',
    tier: 'Essential',
    increase: '+180%',
    quote: 'Το Essential με βοήθησε να αυξήσω τις παραγγελίες και να μειώσω τα κόστη. Η επένδυση αποσβέστηκε σε 2 μήνες.',
    image: '/testimonials/maria.jpg'
  }
];

const brandServices = [
  {
    icon: CameraIcon,
    title: 'Professional Photography',
    description: 'Φωτογράφιση προϊόντων και farm visits',
    price: 'από €150',
    discount: { essential: '10%', premium: '20%' }
  },
  {
    icon: StarIcon,
    title: 'Brand & Label Design',
    description: 'Σχεδιασμός λογότυπου και συσκευασίας',
    price: 'από €300',
    discount: { essential: '10%', premium: '20%' }
  },
  {
    icon: ChartBarIcon,
    title: 'Market Intelligence',
    description: 'Analytics και market trends',
    price: 'από €80/μήνα',
    discount: { essential: '10%', premium: '20%' }
  }
];

export default function ProducersSubscriptionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-emerald-50 to-green-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <StarIcon className="h-4 w-4" />
              Πλάνα για Παραγωγούς
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Αυξήστε τις πωλήσεις,<br />
              <span className="text-emerald-600">μειώστε τις προμήθειες</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Επιλέξτε το πλάνο που ταιριάζει στην επιχείρησή σας και απολαύστε μειωμένες προμήθειες, 
              ενισχυμένη προβολή και επαγγελματικές υπηρεσίες branding.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                <Link href="#plans">Δείτε τα πλάνα</Link>
              </Button>
              
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Link href="#success-stories">Ιστορίες επιτυχίας</Link>
              </Button>
            </div>
          </motion.div>

          {/* ROI Calculator Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-emerald-100"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Υπολογιστής ROI</h3>
              <p className="text-gray-600">Δείτε πόσα θα εξοικονομήσετε με το κατάλληλο πλάνο</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">€1,000</div>
                <div className="text-sm text-gray-600">Μηνιαίες πωλήσεις</div>
                <div className="text-xs text-red-600 mt-1">Basic: €120 προμήθεια</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="text-2xl font-bold text-blue-600">€60</div>
                <div className="text-sm text-gray-600">Essential προμήθεια</div>
                <div className="text-xs text-green-600 mt-1">Εξοικονόμηση: €21/μήνα</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                <div className="text-2xl font-bold text-emerald-600">€40</div>
                <div className="text-sm text-gray-600">Premium προμήθεια</div>
                <div className="text-xs text-green-600 mt-1">Εξοικονόμηση: €41/μήνα</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Επιλέξτε το κατάλληλο πλάνο
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Όσο μεγαλώνει η επιχείρησή σας, τόσο περισσότερα εξοικονομείτε
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {producerTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
                  tier.popular 
                    ? 'border-blue-200 ring-2 ring-blue-100 scale-105' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                      Δημοφιλές
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{tier.subtitle}</p>
                    
                    {/* Pricing */}
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-gray-500">{tier.period}</span>
                    </div>
                    
                    {/* Commission */}
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${tier.color}-100 text-${tier.color}-800`}>
                      {tier.commission} προμήθεια
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-3">{tier.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          feature.included 
                            ? `bg-${tier.color}-100` 
                            : 'bg-gray-100'
                        }`}>
                          <CheckIcon className={`h-3 w-3 ${
                            feature.included 
                              ? `text-${tier.color}-600` 
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <span className={`text-sm ${
                          feature.included 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                        }`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    asChild
                    size="lg"
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : tier.id === 'basic'
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : `bg-${tier.color}-600 hover:bg-${tier.color}-700 text-white`
                    }`}
                  >
                    <Link href={tier.link}>
                      {tier.cta}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ιστορίες επιτυχίας
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Δείτε πως άλλοι παραγωγοί αύξησαν τις πωλήσεις τους με το Dixis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-200 to-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-800">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{story.name}</h3>
                    <p className="text-sm text-gray-600">{story.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                        {story.tier}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {story.product}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{story.increase}</div>
                    <div className="text-xs text-gray-600">Αύξηση πωλήσεων</div>
                  </div>
                </div>

                <blockquote className="text-gray-700 italic">
                  "{story.quote}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Services */}
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
              Επαγγελματικές υπηρεσίες branding
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Αναπτύξτε την επωνυμία σας με τις αποκλειστικές υπηρεσίες του Dixis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {brandServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <div className="mb-4">
                  <div className="text-lg font-bold text-blue-600 mb-2">{service.price}</div>
                  <div className="text-xs text-gray-600">
                    <div>Essential: -{service.discount.essential} έκπτωση</div>
                    <div>Premium: -{service.discount.premium} έκπτωση</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                  Μάθετε περισσότερα
                </Button>
              </motion.div>
            ))}
          </div>
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
              Γίνετε μέλος της κοινότητας παραγωγών του Dixis και αυξήστε τις πωλήσεις σας
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8"
              >
                <Link href="/subscription/checkout?plan=essential">
                  Ξεκινήστε με Essential
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 backdrop-blur-sm px-8"
              >
                <Link href="/contact?type=producer">
                  Μιλήστε με έναν ειδικό
                </Link>
              </Button>
            </div>

            <p className="text-emerald-200 mt-6 text-sm">
              30 ημέρες δωρεάν δοκιμή • Ακύρωση οποιαδήποτε στιγμή • Υποστήριξη 24/7
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}