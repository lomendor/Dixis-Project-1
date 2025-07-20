'use client';

import React from 'react';
import Link from 'next/link';
import SimpleFeaturedProducts from '@/components/SimpleFeaturedProducts';
import { 
  ShoppingBag,
  Truck,
  Shield,
  Award,
  Leaf,
  Users,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Αυθεντικά Ελληνικά',
    description: 'Προϊόντα από επιλεγμένους Έλληνες παραγωγούς'
  },
  {
    icon: Truck,
    title: 'Φρέσκια Παράδοση',
    description: 'Απευθείας από τον παραγωγό στην πόρτα σας'
  },
  {
    icon: Shield,
    title: 'Εγγύηση Ποιότητας',
    description: '100% ασφαλείς συναλλαγές και εγγύηση επιστροφής'
  }
];

const stats = [
  { number: '500+', label: 'Ικανοποιημένοι Πελάτες' },
  { number: '50+', label: 'Έλληνες Παραγωγοί' },
  { number: '1000+', label: 'Premium Προϊόντα' }
];

export default function SimpleHomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Leaf className="w-4 h-4 mr-2" />
              Η Αυθεντική Γεύση της Ελλάδας
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Από τον <span className="text-green-600">Παραγωγό</span><br />
              στο Τραπέζι σας
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Ανακαλύψτε την αυθεντική ελληνική γεύση με προϊόντα που ταξιδεύουν 
              απευθείας από τα χωράφια στο σπίτι σας.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/products"
                className="inline-flex items-center bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Εξερεύνησε Προϊόντα
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                href="/become-producer"
                className="inline-flex items-center border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                <Users className="w-5 h-5 mr-2" />
                Γίνε Παραγωγός
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Γιατί να Επιλέξετε το Dixis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Η δέσμευσή μας στην ποιότητα και την αυθεντικότητα μας κάνει την πρώτη επιλογή.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Επιλεγμένα Προϊόντα
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ανακαλύψτε τα καλύτερα προϊόντα από τους πιο αξιόπιστους παραγωγούς της Ελλάδας.
            </p>
          </div>

          <SimpleFeaturedProducts />
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div className="flex items-center justify-center">
              <Truck className="w-6 h-6 mr-3" />
              <span className="font-medium">Δωρεάν αποστολή άνω των 50€</span>
            </div>
            <div className="flex items-center justify-center">
              <Shield className="w-6 h-6 mr-3" />
              <span className="font-medium">100% Ασφαλείς συναλλαγές</span>
            </div>
            <div className="flex items-center justify-center">
              <Award className="w-6 h-6 mr-3" />
              <span className="font-medium">Πιστοποιημένοι παραγωγοί</span>
            </div>
            <div className="flex items-center justify-center">
              <Leaf className="w-6 h-6 mr-3" />
              <span className="font-medium">Αυθεντικά ελληνικά προϊόντα</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}