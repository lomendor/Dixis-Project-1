'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FeaturedProducts from '@/components/FeaturedProducts';
import FeaturedProducers from '@/components/FeaturedProducers';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ShoppingBag,
  Star,
  ArrowRight,
  Heart,
  Shield,
  Truck,
  Award,
  Leaf,
  Users,
  MapPin,
  CheckCircle
} from 'lucide-react';

const premiumFeatures = [
  {
    icon: Leaf,
    title: 'Αυθεντικά Ελληνικά',
    description: 'Προϊόντα από επιλεγμένους Έλληνες παραγωγούς με πιστοποίηση ποιότητας'
  },
  {
    icon: Truck,
    title: 'Φρέσκια Παράδοση',
    description: 'Απευθείας από τον παραγωγό στην πόρτα σας σε 24-48 ώρες'
  },
  {
    icon: Shield,
    title: 'Εγγύηση Ποιότητας',
    description: '100% ασφαλείς συναλλαγές και εγγύηση επιστροφής χρημάτων'
  }
];

const socialProof = [
  { number: '500+', label: 'Ικανοποιημένοι Πελάτες' },
  { number: '50+', label: 'Έλληνες Παραγωγοί' },
  { number: '1000+', label: 'Premium Προϊόντα' }
];

const trustSignals = [
  { icon: Truck, text: 'Δωρεάν αποστολή άνω των 50€' },
  { icon: Shield, text: '100% Ασφαλείς συναλλαγές' },
  { icon: Heart, text: '30 ημέρες εγγύηση επιστροφής' },
  { icon: Award, text: 'Πιστοποιημένοι παραγωγοί' }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50/30 to-white">

      {/* Hero Section - Dramatic Premium Layout */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 via-white to-emerald-50/30">

        {/* Sophisticated Background Elements */}
        <div className="absolute inset-0">
          {/* Primary Morphing Shape */}
          <motion.div
            animate={{
              scale: [1, 1.2, 0.9, 1],
              rotate: [0, 90, 180, 360],
              opacity: [0.04, 0.08, 0.06, 0.04]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-600/8 via-green-500/6 to-emerald-400/8 rounded-full blur-3xl"
          />

          {/* Secondary Floating Element */}
          <motion.div
            animate={{
              scale: [0.8, 1.1, 1, 0.8],
              x: [0, 50, -30, 0],
              y: [0, -40, 20, 0],
              opacity: [0.03, 0.06, 0.04, 0.03]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-400/6 via-orange-300/4 to-yellow-400/6 rounded-full blur-3xl"
          />

          {/* Accent Geometric Shape */}
          <motion.div
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 0.7, 1],
              opacity: [0.02, 0.05, 0.02]
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-stone-300/4 via-gray-200/3 to-stone-400/4 rounded-full blur-3xl"
          />

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.sin(i) * 50, 0],
                opacity: [0, 0.3, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut"
              }}
              className={`absolute w-2 h-2 bg-emerald-400/40 rounded-full blur-sm`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">

          {/* Sophisticated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative bg-gradient-to-r from-emerald-600/15 via-green-500/10 to-emerald-400/15 backdrop-blur-md border border-emerald-200/30 rounded-full px-8 py-4 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </motion.div>
                <span className="text-sm font-bold text-emerald-800 tracking-wide">
                  Η Αυθεντική Γεύση της Ελλάδας
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-full blur-xl opacity-50" />
            </motion.div>
          </motion.div>

          {/* Dramatic Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="max-w-6xl mx-auto mb-16"
          >
            <h1 className="relative">
              {/* Background Text Effect */}
              <span className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-black text-stone-200/20 blur-sm select-none">
                Από τον Παραγωγό στο Τραπέζι σας
              </span>

              {/* Main Text */}
              <span className="relative block text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tight">
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="block text-stone-900 mb-4"
                >
                  Από τον
                </motion.span>

                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="block relative"
                >
                  <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">
                    Παραγωγό
                  </span>

                  {/* Dynamic Underline */}
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
                    className="absolute -bottom-6 left-0 h-3 bg-gradient-to-r from-emerald-400/60 via-green-400/80 to-emerald-500/60 rounded-full"
                  />

                  {/* Sparkle Effects */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-4 -right-8 w-6 h-6 text-emerald-400"
                  >
                    <Sparkles className="w-full h-full" />
                  </motion.div>
                </motion.span>

                <motion.span
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="block text-stone-900 mt-6"
                >
                  στο Τραπέζι σας
                </motion.span>
              </span>
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="mt-12 space-y-6"
            >
              <p className="text-2xl md:text-3xl text-stone-700 max-w-4xl mx-auto leading-relaxed font-medium">
                Κάθε προϊόν φέρει την υπογραφή του παραγωγού του
              </p>
              <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
                Ανακαλύψτε την αυθεντική ελληνική γεύση με προϊόντα που ταξιδεύουν
                απευθείας από τα χωράφια και τα εργαστήρια στο σπίτι σας.
              </p>
            </motion.div>
          </motion.div>

          {/* Sophisticated CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 1, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
          >
            {/* Primary CTA */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="group relative"
            >
              <Button
                asChild
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-800 text-white px-10 py-7 text-xl font-bold shadow-2xl rounded-3xl border-0"
              >
                <Link href="/products">
                  <span className="relative z-20 flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="mr-4"
                    >
                      <ShoppingBag className="h-7 w-7" />
                    </motion.div>
                    Εξερεύνησε Προϊόντα
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="ml-4"
                    >
                      <ArrowRight className="h-7 w-7" />
                    </motion.div>
                  </span>

                  {/* Animated Background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 0.3, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </Link>
              </Button>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative"
            >
              <Button
                asChild
                variant="outline"
                size="lg"
                className="relative overflow-hidden border-2 border-stone-300/50 bg-white/90 backdrop-blur-md text-stone-700 hover:border-emerald-500 hover:bg-white px-10 py-7 text-xl font-semibold shadow-xl rounded-3xl"
              >
                <Link href="/producers">
                  <span className="relative z-20 flex items-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mr-4"
                    >
                      <Users className="h-7 w-7 text-emerald-600" />
                    </motion.div>
                    Γνώρισε τους Παραγωγούς
                  </span>

                  {/* Hover Background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-green-50"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </Button>

              {/* Subtle Glow */}
              <div className="absolute inset-0 bg-emerald-200/30 rounded-3xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-10" />
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {socialProof.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-2">
                  {item.number}
                </div>
                <div className="text-sm font-medium text-stone-600">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mt-12 max-w-4xl mx-auto"
          >
            {trustSignals.map((signal, index) => (
              <motion.div
                key={signal.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-stone-200/50"
              >
                <signal.icon className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-stone-700">{signal.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Elegant Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-stone-300 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-stone-400 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Premium Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-6">
              Γιατί να Επιλέξετε το Dixis
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Η δέσμευσή μας στην ποιότητα και την αυθεντικότητα μας κάνει την πρώτη επιλογή για premium ελληνικά προϊόντα.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative bg-gradient-to-br from-white to-stone-50/50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-emerald-200"
              >
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Products Section */}
      <section className="py-24 bg-gradient-to-br from-stone-50/50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-6">
              Επιλεγμένα Προϊόντα
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Ανακαλύψτε τα καλύτερα προϊόντα από τους πιο αξιόπιστους παραγωγούς της Ελλάδας.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FeaturedProducts />
          </motion.div>
        </div>
      </section>

      {/* Enhanced Featured Producers Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-6">
              Οι Παραγωγοί μας
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Γνωρίστε τους ανθρώπους πίσω από τα εξαιρετικά προϊόντα που φτάνουν στο τραπέζι σας.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FeaturedProducers />
          </motion.div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ξεκινήστε το Ταξίδι σας στη Γεύση
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Ανακαλύψτε την αυθεντική ελληνική γεύση με προϊόντα που φέρουν την υπογραφή των καλύτερων παραγωγών.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 rounded-2xl"
              >
                <Link href="/products">
                  <span className="relative z-10 flex items-center">
                    <ShoppingBag className="mr-3 h-6 w-6" />
                    Εξερεύνησε όλα τα Προϊόντα
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="group border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:border-white hover:bg-white/20 px-8 py-6 text-lg font-semibold shadow-lg rounded-2xl"
              >
                <Link href="/producers">
                  <Users className="mr-3 h-6 w-6" />
                  Δείτε όλους τους Παραγωγούς
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}