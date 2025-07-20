'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ShoppingBag, 
  Star, 
  ArrowRight, 
  Play,
  Heart,
  Shield,
  Truck,
  Award
} from 'lucide-react';

const floatingProducts = [
  { id: 1, name: 'Θυμαρίσιο Μέλι', location: 'Κρήτη', icon: '🍯', price: '€18.50' },
  { id: 2, name: 'Extra Virgin', location: 'Καλαμάτα', icon: '🫒', price: '€28.90' },
  { id: 3, name: 'Φέτα ΠΟΠ', location: 'Ήπειρος', icon: '🧀', price: '€12.40' },
  { id: 4, name: 'Ασύρτικο', location: 'Σαντορίνη', icon: '🍷', price: '€32.00' }
];

export default function HeroSection() {
  const [currentProduct, setCurrentProduct] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % floatingProducts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-green-50/40 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-green-400/20 to-lime-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, 20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 left-1/2 w-96 h-96 bg-gradient-to-br from-lime-400/20 to-emerald-400/20 rounded-full blur-3xl"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex"
            >
              <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 px-5 py-2.5 text-sm font-semibold shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Το #1 Marketplace Ελληνικών Προϊόντων
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h1 className="text-6xl lg:text-8xl font-black leading-[0.9]">
                <motion.span 
                  className="text-gray-900 block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Γεύσου την
                </motion.span>
                <motion.span 
                  className="relative block mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-lime-500 bg-clip-text text-transparent">
                    Αυθεντική
                  </span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute -bottom-4 left-0 h-3 bg-gradient-to-r from-emerald-400/30 to-lime-400/30 rounded-full"
                  />
                </motion.span>
                <motion.span 
                  className="text-gray-900 block mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Ελλάδα
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-gray-600 max-w-xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Αυθεντικά ελληνικά προϊόντα απευθείας από τους παραγωγούς στο σπίτι σας. 
                Γεύσεις που αγαπήσατε, ποιότητα που εμπιστεύεστε.
              </motion.p>
            </motion.div>


            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-6 text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300">
                <Link href="/products">
                  <span className="relative z-10 flex items-center">
                    <ShoppingBag className="mr-3 h-6 w-6" />
                    Εξερεύνησε τα Προϊόντα
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-lime-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity"
                    initial={false}
                  />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="group border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-700 hover:border-emerald-600 hover:bg-emerald-50 px-10 py-6 text-lg font-semibold shadow-lg">
                <Play className="mr-3 h-6 w-6 text-emerald-600" />
                Πώς Λειτουργεί
              </Button>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Δωρεάν αποστολή άνω των 50€</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">100% Ασφαλείς συναλλαγές</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700">30 ημέρες εγγύηση</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Dynamic Product Display */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative lg:h-[600px]"
          >
            {/* Main Display Area */}
            <div className="relative h-full">
              {/* 3D Product Showcase */}
              <div className="relative w-full h-full">
                {/* Central Product Display */}
                <motion.div
                  animate={{ 
                    rotateY: [0, 360],
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                    {/* Rotating Product Cards */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentProduct}
                        initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border border-gray-100">
                          <div className="flex flex-col items-center justify-center h-full">
                            <motion.div
                              animate={{ 
                                y: [0, -10, 0],
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                              }}
                              className="text-8xl mb-6"
                            >
                              {floatingProducts[currentProduct].icon}
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {floatingProducts[currentProduct].name}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {floatingProducts[currentProduct].location}
                            </p>
                            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                              {floatingProducts[currentProduct].price}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Floating Mini Cards */}
                {floatingProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: currentProduct === index ? 0 : 1, 
                      scale: currentProduct === index ? 0 : 1,
                      x: Math.cos(index * Math.PI / 2) * 150,
                      y: Math.sin(index * Math.PI / 2) * 150,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 cursor-pointer"
                      onClick={() => setCurrentProduct(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{product.icon}</div>
                        <div>
                          <div className="font-semibold text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.price}</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}

                {/* Decorative Elements */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ 
                    duration: 30, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-400 rounded-full -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-green-400 rounded-full -translate-x-1/2"></div>
                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-lime-400 rounded-full -translate-y-1/2"></div>
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-yellow-400 rounded-full -translate-y-1/2"></div>
                </motion.div>
              </div>
            </div>

            {/* Background Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-200/30 to-lime-200/30 rounded-full blur-3xl pointer-events-none"></div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1440 320" className="w-full h-20 fill-white">
          <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}