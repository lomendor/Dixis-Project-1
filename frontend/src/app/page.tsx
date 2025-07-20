import Link from 'next/link';
import FeaturedProductsServer from '@/components/FeaturedProductsServer';
import FeaturedProducersServer from '@/components/FeaturedProducersServer';
import { ArrowRight, Leaf, Shield, Truck, Award, Star, MapPin, Users, Clock, Heart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* PREMIUM GREEK HERITAGE HERO */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Greek-Inspired Background */}
        <div className="absolute inset-0">
          {/* Sunset Gradient - Inspired by Greek Islands */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-50 via-primary-50 to-secondary-100"></div>
          
          {/* Olive Branch Pattern - Subtle Greek Heritage */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2315803d' stroke-width='1.5'%3E%3Cpath d='M50,100 Q70,80 90,100 Q110,120 130,100 Q150,80 170,100' opacity='0.6'/%3E%3Ccircle cx='70' cy='90' r='2' fill='%2315803d' opacity='0.4'/%3E%3Ccircle cx='110' cy='110' r='1.5' fill='%2315803d' opacity='0.3'/%3E%3Ccircle cx='150' cy='90' r='2' fill='%2315803d' opacity='0.4'/%3E%3Cpath d='M30,150 Q50,130 70,150 Q90,170 110,150' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}></div>

          {/* Warm Atmospheric Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-primary-100/20"></div>
        </div>

        {/* Premium Content */}
        <div className="relative z-10 container-premium py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            {/* Heritage Badge με Greek Character */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm text-primary-800 px-6 py-3 rounded-full text-sm font-semibold shadow-lg border border-primary-200/30 hover:scale-105 transition-transform duration-300">
                <div className="w-2 h-2 bg-accent-500 rounded-full mr-3 animate-pulse"></div>
                Από την Καρδιά της Ελλάδας
                <Award className="ml-3 h-4 w-4 text-primary-700" />
              </div>
            </div>

            {/* Hero Headlines - Streamlined */}
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[0.95] text-balance mb-8">
                <span className="block text-neutral-900 drop-shadow-sm">Κάθε γεύση</span>
                <span className="block bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600 bg-clip-text text-transparent drop-shadow-sm">
                  μια ιστορία
                </span>
              </h1>

              {/* Simplified Message */}
              <div className="max-w-3xl mx-auto">
                <p className="text-xl md:text-2xl text-neutral-700 leading-relaxed font-medium">
                  Αυθεντικά ελληνικά προϊόντα από παραδοσιακούς παραγωγούς
                </p>
              </div>
            </div>

            {/* Premium CTAs με Visual Hierarchy */}
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-20">
              <Link
                href="/products"
                className="group relative bg-gradient-to-r from-primary-700 to-primary-800 text-white px-10 py-5 text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden font-semibold w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center">
                  <div className="mr-4 p-2 bg-white/20 rounded-full group-hover:rotate-12 transition-transform duration-300">
                    <Leaf className="h-5 w-5" />
                  </div>
                  Ανακαλύψτε τις Ιστορίες
                  <ArrowRight className="ml-4 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </div>
              </Link>

              <Link
                href="/producers"
                className="group bg-white/90 backdrop-blur-sm text-primary-800 px-10 py-5 text-lg rounded-2xl shadow-lg hover:shadow-xl border border-primary-200 hover:border-primary-300 transition-all duration-300 font-semibold w-full sm:w-auto"
              >
                <div className="flex items-center justify-center">
                  <MapPin className="mr-3 h-5 w-5 text-accent-600" />
                  Γνωρίστε τους Παραγωγούς
                </div>
              </Link>
            </div>

            {/* Greek Heritage Stats με Mobile-First Approach */}
            <div className="w-full max-w-6xl mx-auto">
              {/* Desktop Grid (hidden on mobile) */}
              <div className="hidden md:grid grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300">
                  <div className="text-3xl md:text-4xl font-bold text-primary-700 mb-2">65+</div>
                  <div className="text-neutral-600 font-medium">Αυθεντικά Προϊόντα</div>
                  <div className="text-sm text-neutral-500 mt-1">από όλη την Ελλάδα</div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300">
                  <div className="text-3xl md:text-4xl font-bold text-accent-600 mb-2">4</div>
                  <div className="text-neutral-600 font-medium">Γενιές Παράδοσης</div>
                  <div className="text-sm text-neutral-500 mt-1">μέση οικογενειακή ιστορία</div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:bg-white/80 transition-all duration-300">
                  <div className="text-3xl md:text-4xl font-bold text-primary-700 mb-2">100%</div>
                  <div className="text-neutral-600 font-medium">Ελληνική Προέλευση</div>
                  <div className="text-sm text-neutral-500 mt-1">πιστοποιημένη ποιότητα</div>
                </div>
              </div>

              {/* Mobile Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto scrollbar-hide">
                <div className="flex gap-6 pb-4 px-4" style={{ scrollSnapType: 'x mandatory' }}>
                  <div 
                    className="flex-shrink-0 w-64 bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:bg-white/90 transition-all duration-300"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="text-4xl font-bold text-primary-700 mb-3">65+</div>
                    <div className="text-neutral-700 font-semibold mb-1">Αυθεντικά Προϊόντα</div>
                    <div className="text-sm text-neutral-500">από όλη την Ελλάδα</div>
                  </div>
                  
                  <div 
                    className="flex-shrink-0 w-64 bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:bg-white/90 transition-all duration-300"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="text-4xl font-bold text-accent-600 mb-3">4</div>
                    <div className="text-neutral-700 font-semibold mb-1">Γενιές Παράδοσης</div>
                    <div className="text-sm text-neutral-500">μέση οικογενειακή ιστορία</div>
                  </div>

                  <div 
                    className="flex-shrink-0 w-64 bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:bg-white/90 transition-all duration-300"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="text-4xl font-bold text-primary-700 mb-3">100%</div>
                    <div className="text-neutral-700 font-semibold mb-1">Ελληνική Προέλευση</div>
                    <div className="text-sm text-neutral-500">πιστοποιημένη ποιότητα</div>
                  </div>
                </div>
              </div>

              {/* Mobile Scroll Indicators */}
              <div className="flex justify-center mt-6 md:hidden">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block">
          <div className="flex flex-col items-center space-y-2 group cursor-pointer hover:scale-110 transition-transform duration-300">
            <div className="text-neutral-500 text-xs font-medium tracking-wider uppercase">
              Μάθετε περισσότερα
            </div>
            <div className="w-6 h-10 border-2 border-neutral-400 rounded-full flex justify-center overflow-hidden group-hover:border-primary-500 transition-colors duration-300">
              <div className="w-1 h-3 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCER STORIES - Mobile-First Horizontal Scroll */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container-premium">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-accent-100 text-accent-700 px-6 py-3 rounded-full text-sm font-bold mb-6">
              <Users className="mr-2 h-4 w-4" />
              Οι Παραγωγοί μας
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4 leading-tight">
              Γνωρίστε τους Ανθρώπους πίσω από τις Γεύσεις
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Κάθε παραγωγός έχει την δική του ιστορία και παράδοση που μεταφέρει στα προϊόντα του
            </p>
          </div>

          {/* Producer Stories Carousel με Real Data */}
          <FeaturedProducersServer />

          {/* View All Producers CTA */}
          <div className="text-center mt-16">
            <Link
              href="/producers"
              className="group inline-flex items-center bg-gradient-to-r from-accent-600 to-accent-700 text-white px-10 py-5 text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
            >
              <Users className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              Δείτε όλους τους παραγωγούς
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="py-20 lg:py-32 bg-secondary-50">
        <div className="container-premium">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-primary-100 text-primary-700 px-6 py-3 rounded-full text-sm font-bold mb-10">
              <Shield className="mr-2 h-4 w-4" />
              Γιατί Dixis
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 mb-8 leading-tight">
              Εξαιρετική Ποιότητα,<br />
              Αυθεντική Γεύση
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Κάθε προϊόν πληροί τα υψηλότερα πρότυπα ποιότητας και αυθεντικότητας που αξίζει η ελληνική γη
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-4">
            {/* Desktop Grid */}
            <div className="hidden lg:grid grid-cols-3 gap-12">
              {/* Feature 1 - Refined */}
              <div className="card-elevated p-12 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-20 h-20 bg-primary-700 rounded-xl flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform duration-300">
                  <Leaf className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                  Αυθεντική Ελληνική Κληρονομιά
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-8">
                  Προμηθευόμαστε απευθείας από πιστοποιημένους Έλληνες παραγωγούς που διατηρούν 
                  παραδοσιακές μεθόδους που μεταδίδονται από γενιά σε γενιά.
                </p>
                <div className="inline-flex items-center text-primary-700 font-medium text-sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  100% Ελληνική Προέλευση
                </div>
              </div>

              {/* Feature 2 - Refined */}
              <div className="card-elevated p-12 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-20 h-20 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform duration-300">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                  Φρέσκια Παράδοση
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-8">
                  Η παράδοση με ελεγχόμενη θερμοκρασία εξασφαλίζει ότι τα προϊόντα φτάνουν φρέσκα 
                  εντός 24 ωρών, διατηρώντας την κορυφαία ποιότητα και γεύση.
                </p>
                <div className="inline-flex items-center text-accent-600 font-medium text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Παράδοση 24 Ωρών
                </div>
              </div>

              {/* Feature 3 - Refined */}
              <div className="card-elevated p-12 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-20 h-20 bg-neutral-700 rounded-xl flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">
                  Εγγύηση Ποιότητας
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-8">
                  Ασφαλείς συναλλαγές, πλήρης εγγύηση ικανοποίησης και 
                  ακλόνητη δέσμευση για αριστεία σε κάθε παραγγελία.
                </p>
                <div className="inline-flex items-center text-neutral-700 font-medium text-sm">
                  <Star className="mr-2 h-4 w-4" />
                  Εγγύηση Ικανοποίησης
                </div>
              </div>
            </div>

            {/* Mobile Stacked Layout */}
            <div className="lg:hidden space-y-8">
              {/* Feature 1 - Mobile Optimized */}
              <div className="card-elevated p-8 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-primary-700 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Αυθεντική Ελληνική Κληρονομιά
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6 text-sm">
                  Προμηθευόμαστε απευθείας από πιστοποιημένους Έλληνες παραγωγούς που διατηρούν 
                  παραδοσιακές μεθόδους που μεταδίδονται από γενιά σε γενιά.
                </p>
                <div className="inline-flex items-center text-primary-700 font-medium text-sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  100% Ελληνική Προέλευση
                </div>
              </div>

              {/* Feature 2 - Mobile Optimized */}
              <div className="card-elevated p-8 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Φρέσκια Παράδοση
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6 text-sm">
                  Η παράδοση με ελεγχόμενη θερμοκρασία εξασφαλίζει ότι τα προϊόντα φτάνουν φρέσκα 
                  εντός 24 ωρών, διατηρώντας την κορυφαία ποιότητα και γεύση.
                </p>
                <div className="inline-flex items-center text-accent-600 font-medium text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Παράδοση 24 Ωρών
                </div>
              </div>

              {/* Feature 3 - Mobile Optimized */}
              <div className="card-elevated p-8 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-neutral-700 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Εγγύηση Ποιότητας
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6 text-sm">
                  Ασφαλείς συναλλαγές, πλήρης εγγύηση ικανοποίησης και 
                  ακλόνητη δέσμευση για αριστεία σε κάθε παραγγελία.
                </p>
                <div className="inline-flex items-center text-neutral-700 font-medium text-sm">
                  <Star className="mr-2 h-4 w-4" />
                  Εγγύηση Ικανοποίησης
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY-FIRST PRODUCT SHOWCASE με Real Data */}
      <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2315803d'%3E%3Ccircle cx='50' cy='50' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}></div>

        <div className="container-premium relative z-10">
          {/* Artisan-Focused Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-primary-100 to-accent-50 text-primary-800 px-8 py-4 rounded-2xl text-sm font-bold mb-10 shadow-lg border border-primary-200/30">
              <div className="w-3 h-3 bg-primary-600 rounded-full mr-3 animate-pulse"></div>
              Αριστουργήματα Γεύσης από την Ελλάδα
              <Award className="ml-3 h-5 w-5 text-primary-700" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold text-neutral-900 mb-8 leading-tight text-balance">
              Ιστορίες που <span className="bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">ζουν</span>
              <br />
              στις γεύσεις μας
            </h2>
            
            <p className="text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed font-light">
              Κάθε προϊόν φέρει την ψυχή του τόπου του και την αγάπη του παραγωγού. 
              Ανακαλύψτε τις πραγματικές ιστορίες πίσω από κάθε γεύση.
            </p>
          </div>

          {/* Enhanced Story Grid με Real Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto mb-24">
            
            {/* Cretan Olive Oil Story */}
            <div className="group relative">
              <div className="card-elevated overflow-hidden hover:-translate-y-3 transition-all duration-700 hover:shadow-2xl">
                {/* Enhanced Visual */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-100 relative overflow-hidden">
                  {/* Greek Landscape Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-200/30 via-accent-200/20 to-transparent"></div>
                  
                  {/* Product Hero */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl md:text-9xl opacity-40 transform group-hover:scale-110 transition-transform duration-700">🫒</div>
                  </div>
                  
                  {/* Heritage Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      4η Γενιά Παραγωγής
                    </span>
                  </div>

                  {/* Origin Badge */}
                  <div className="absolute top-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm text-primary-800 px-3 py-2 rounded-full text-xs font-semibold border border-primary-200">
                      Κρήτη
                    </div>
                  </div>
                </div>
                
                {/* Rich Storytelling Content */}
                <div className="p-8 lg:p-10">
                  {/* Producer Story */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-primary-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">Οικογένεια Παπαδάκη</div>
                      <div className="text-sm text-primary-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Χανιά, Κρήτη
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-6 leading-tight">
                    Εξαιρετικό Παρθένο Ελαιόλαδο Κορωνέικη
                  </h3>
                  
                  {/* Emotional Story */}
                  <div className="space-y-4 mb-8">
                    <p className="text-neutral-700 leading-relaxed">
                      Από τα αιωνόβια ελαιόδεντρα που κοιτάζουν τη θάλασσα της Κρήτης. 
                      Η οικογένεια Παπαδάκη φροντίζει αυτά τα δέντρα εδώ και 4 γενιές.
                    </p>
                    <p className="text-neutral-600 leading-relaxed">
                      Κάθε σταγόνα φέρει τη γεύση της κρητικής γης, τον αέρα του Αιγαίου 
                      και τη σοφία που μεταδίδεται από πατέρα σε γιο.
                    </p>
                  </div>

                  {/* Premium Pricing & CTA */}
                  <div className="flex items-center justify-between border-t border-secondary-200 pt-6">
                    <div>
                      <div className="price-text text-3xl font-bold text-neutral-900">
                        €24.50
                      </div>
                      <div className="text-sm text-neutral-500">/500ml</div>
                    </div>
                    <button className="btn-primary px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group/btn">
                      <Leaf className="mr-2 h-5 w-5 group-hover/btn:rotate-12 transition-transform" />
                      Δοκιμάστε την Ιστορία
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mountain Honey Story */}
            <div className="group relative">
              <div className="card-elevated overflow-hidden hover:-translate-y-3 transition-all duration-700 hover:shadow-2xl">
                {/* Enhanced Visual */}
                <div className="aspect-[4/3] bg-gradient-to-br from-accent-50 via-primary-50 to-secondary-100 relative overflow-hidden">
                  {/* Mountain Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-200/30 via-primary-200/20 to-transparent"></div>
                  
                  {/* Product Hero */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-8xl md:text-9xl opacity-40 transform group-hover:scale-110 transition-transform duration-700">🍯</div>
                  </div>
                  
                  {/* Purity Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      100% Αγνό Θυμάρι
                    </span>
                  </div>

                  {/* Origin Badge */}
                  <div className="absolute top-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm text-primary-800 px-3 py-2 rounded-full text-xs font-semibold border border-primary-200">
                      Ήπειρος
                    </div>
                  </div>
                </div>
                
                {/* Rich Storytelling Content */}
                <div className="p-8 lg:p-10">
                  {/* Producer Story */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mr-4">
                      <Heart className="h-6 w-6 text-accent-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">Οικογένεια Κωστόπουλου</div>
                      <div className="text-sm text-accent-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Μέτσοβο, Ήπειρος
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-6 leading-tight">
                    Μέλι Θυμαριού από Ελεύθερες Μέλισσες
                  </h3>
                  
                  {/* Emotional Story */}
                  <div className="space-y-4 mb-8">
                    <p className="text-neutral-700 leading-relaxed">
                      Στα άγρια θυμάρια των ηπειρωτικών βουνών, οι μέλισσες συλλέγουν 
                      το νέκταρ που γίνεται υγρός χρυσός.
                    </p>
                    <p className="text-neutral-600 leading-relaxed">
                      Η οικογένεια Κωστόπουλου φροντίζει τις κυψέλες με σεβασμό στη φύση, 
                      δημιουργώντας μέλι που μυρίζει βουνό και ελευθερία.
                    </p>
                  </div>

                  {/* Premium Pricing & CTA */}
                  <div className="flex items-center justify-between border-t border-secondary-200 pt-6">
                    <div>
                      <div className="price-text text-3xl font-bold text-neutral-900">
                        €18.80
                      </div>
                      <div className="text-sm text-neutral-500">/400g</div>
                    </div>
                    <button className="btn-primary px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group/btn">
                      <Heart className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                      Γεύση Βουνού
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Enhanced Featured Products Section */}
          <div className="text-center mb-16">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-neutral-900 mb-6">
              Περισσότερες Αυθεντικές Γεύσεις
            </h3>
            <p className="text-neutral-600 mb-12 max-w-2xl mx-auto">
              Ανακαλύψτε τη συλλογή μας με πάνω από 65 επιλεγμένα προϊόντα από όλη την Ελλάδα
            </p>
          </div>

          {/* Server Component για Real Data */}
          <FeaturedProductsServer />

          {/* Enhanced CTA */}
          <div className="text-center mt-20">
            <Link
              href="/products"
              className="group inline-flex items-center bg-gradient-to-r from-primary-700 to-primary-800 text-white px-12 py-6 text-xl rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 font-semibold"
            >
              <div className="mr-4 p-2 bg-white/20 rounded-full group-hover:rotate-12 transition-transform duration-300">
                <Leaf className="h-6 w-6" />
              </div>
              Εξερευνήστε Όλες τις Ιστορίες
              <ArrowRight className="ml-4 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ELEVATED TRUST & HERITAGE SECTION */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-50 via-accent-50/30 to-secondary-50 relative overflow-hidden">
        {/* Heritage Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2315803d'%3E%3Cpath d='M30,15 Q35,20 30,25 Q25,20 30,15 M20,30 Q25,35 20,40 Q15,35 20,30 M40,30 Q45,35 40,40 Q35,35 40,30'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>

        <div className="container-premium relative z-10">
          {/* Greek Heritage Introduction */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-sm text-primary-800 px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg border border-primary-200/50">
              <Star className="mr-2 h-4 w-4 text-accent-600" />
              Οι Αξίες μας
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-neutral-900 mb-6 leading-tight text-balance">
              Δεσμευμένοι στην 
              <span className="block text-primary-700">Ελληνική Αριστεία</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Κάθε λεπτομέρεια της εμπειρίας σας σχεδιάζεται με σεβασμό στην παράδοση 
              και προσήλωση στην ποιότητα
            </p>
          </div>

          {/* Mobile-First Trust Carousel */}
          <div className="relative mb-20">
            {/* Desktop Grid (hidden on mobile) */}
            <div className="hidden lg:grid grid-cols-4 gap-8">
              {/* Trust Element 1 */}
              <div className="group relative">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-3">Δωρεάν Αποστολή</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                    Για παραγγελίες άνω των 50€ σε όλη την Ελλάδα
                  </p>
                  <div className="text-xs text-primary-600 font-semibold">
                    Παράδοση 24-48 ώρες
                  </div>
                </div>
              </div>

              {/* Trust Element 2 */}
              <div className="group relative">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-3">Ασφαλή Πληρωμή</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                    256-bit SSL κρυπτογράφηση και ασφαλείς τραπεζικές συναλλαγές
                  </p>
                  <div className="text-xs text-accent-600 font-semibold">
                    Πιστοποιημένη Ασφάλεια
                  </div>
                </div>
              </div>

              {/* Trust Element 3 */}
              <div className="group relative">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-700 to-primary-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-3">Πιστοποιημένοι Παραγωγοί</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                    Όλοι οι παραγωγοί μας ελέγχονται για ποιότητα και αυθεντικότητα
                  </p>
                  <div className="text-xs text-primary-600 font-semibold">
                    Εγγύηση Αριστείας
                  </div>
                </div>
              </div>

              {/* Trust Element 4 */}
              <div className="group relative">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-600 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Leaf className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-3">100% Ελληνικά</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-4">
                    Αυθεντικά προϊόντα από την καρδιά της Ελλάδας
                  </p>
                  <div className="text-xs text-primary-600 font-semibold">
                    Πιστοποιημένη Προέλευση
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Carousel (visible on mobile/tablet) */}
            <div className="lg:hidden overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4 px-4" style={{ scrollSnapType: 'x mandatory' }}>
                {/* Mobile Trust Element 1 */}
                <div 
                  className="flex-shrink-0 w-72 group relative"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Truck className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 mb-2">Δωρεάν Αποστολή</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Για παραγγελίες άνω των 50€
                    </p>
                    <div className="text-xs text-primary-600 font-semibold">
                      Παράδοση 24-48 ώρες
                    </div>
                  </div>
                </div>

                {/* Mobile Trust Element 2 */}
                <div 
                  className="flex-shrink-0 w-72 group relative"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Shield className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 mb-2">Ασφαλή Πληρωμή</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      SSL κρυπτογράφηση και ασφαλείς συναλλαγές
                    </p>
                    <div className="text-xs text-accent-600 font-semibold">
                      Πιστοποιημένη Ασφάλεια
                    </div>
                  </div>
                </div>

                {/* Mobile Trust Element 3 */}
                <div 
                  className="flex-shrink-0 w-72 group relative"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-700 to-primary-800 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Award className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 mb-2">Πιστοποιημένοι</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Έλεγχος ποιότητας και αυθεντικότητας
                    </p>
                    <div className="text-xs text-primary-600 font-semibold">
                      Εγγύηση Αριστείας
                    </div>
                  </div>
                </div>

                {/* Mobile Trust Element 4 */}
                <div 
                  className="flex-shrink-0 w-72 group relative"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-accent-600 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                      <Leaf className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 mb-2">100% Ελληνικά</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed mb-3">
                      Αυθεντικά προϊόντα από την καρδιά της Ελλάδας
                    </p>
                    <div className="text-xs text-primary-600 font-semibold">
                      Πιστοποιημένη Προέλευση
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Scroll Indicators */}
            <div className="flex justify-center mt-6 lg:hidden">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
                <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Premium Final CTA Section */}
          <div className="relative">
            <div className="bg-gradient-to-r from-white via-white/95 to-white/90 backdrop-blur-sm rounded-3xl p-12 lg:p-16 text-center shadow-xl border border-white/70">
              {/* Greek Heritage Element */}
              <div className="inline-flex items-center bg-primary-100 text-primary-800 px-6 py-3 rounded-full text-sm font-bold mb-8">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3 animate-pulse"></div>
                Ένα Ταξίδι στις Γεύσεις της Ελλάδας
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-6 leading-tight text-balance">
                Ξεκινήστε την Αυθεντική σας
                <span className="block text-primary-700">Γαστρονομική Περιπέτεια</span>
              </h3>
              
              <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Γίνετε μέλος της κοινότητας που λατρεύει τις αυθεντικές ελληνικές γεύσεις 
                και υποστηρίζει τους τοπικούς παραγωγούς
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  href="/products"
                  className="group relative bg-gradient-to-r from-primary-700 to-primary-800 text-white px-12 py-5 text-xl rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden font-semibold w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-center">
                    <div className="mr-4 p-2 bg-white/20 rounded-full group-hover:rotate-12 transition-transform duration-300">
                      <Heart className="h-5 w-5" />
                    </div>
                    Ανακαλύψτε τα Προϊόντα μας
                    <ArrowRight className="ml-4 h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </div>
                </Link>

                <Link
                  href="/producers"
                  className="group bg-white/90 backdrop-blur-sm text-primary-800 px-12 py-5 text-xl rounded-2xl shadow-lg hover:shadow-xl border border-primary-200 hover:border-primary-300 transition-all duration-300 font-semibold w-full sm:w-auto"
                >
                  <div className="flex items-center justify-center">
                    <Users className="mr-3 h-5 w-5 text-accent-600" />
                    Γνωρίστε τους Παραγωγούς
                  </div>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center space-x-8 mt-12 pt-8 border-t border-secondary-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-700">2,500+</div>
                  <div className="text-sm text-neutral-600">Ικανοποιημένοι Πελάτες</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-600">4.9★</div>
                  <div className="text-sm text-neutral-600">Μέση Αξιολόγηση</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-700">365</div>
                  <div className="text-sm text-neutral-600">Ημέρες το Χρόνο</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}