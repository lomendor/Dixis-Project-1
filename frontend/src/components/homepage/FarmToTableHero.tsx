'use client';

import Link from 'next/link';

export default function FarmToTableHero() {
  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 min-h-screen flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-sm">
            <span className="text-2xl">🌱</span>
            <span className="text-emerald-700 font-semibold">Φρέσκα Ελληνικά Προϊόντα</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Από την{' '}
            <span className="text-emerald-600 relative">
              ελληνική γη
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-emerald-300 rounded-full transform -rotate-1"></div>
            </span>
            <br />
            στο τραπέζι σας
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed">
            Συνδέουμε απευθείας τους Έλληνες παραγωγούς με εσάς,
            <br className="hidden md:block" />
            για την καλύτερη ποιότητα και φρεσκάδα
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/products"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
            >
              <span>🛒</span>
              <span>Αγοράστε Τώρα</span>
            </Link>
            <Link
              href="/producers"
              className="bg-white hover:bg-gray-50 text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-emerald-600 inline-flex items-center justify-center space-x-2"
            >
              <span>👨‍🌾</span>
              <span>Γνωρίστε τους Παραγωγούς</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-gray-700 font-medium">Έλληνες Παραγωγοί</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600 mb-2">1000+</div>
              <div className="text-gray-700 font-medium">Φρέσκα Προϊόντα</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600 mb-2">95%</div>
              <div className="text-gray-700 font-medium">Ικανοποίηση Πελατών</div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 hidden lg:block animate-bounce">
          <div className="text-6xl opacity-20">🍅</div>
        </div>
        <div className="absolute top-40 right-20 hidden lg:block animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="text-6xl opacity-20">🫒</div>
        </div>
        <div className="absolute bottom-40 left-20 hidden lg:block animate-bounce" style={{ animationDelay: '2s' }}>
          <div className="text-6xl opacity-20">🌽</div>
        </div>
        <div className="absolute bottom-20 right-10 hidden lg:block animate-bounce" style={{ animationDelay: '3s' }}>
          <div className="text-6xl opacity-20">🍯</div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-emerald-600">
          <span className="text-sm font-medium mb-2">Κάντε scroll για περισσότερα</span>
          <div className="w-6 h-10 border-2 border-emerald-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-emerald-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}