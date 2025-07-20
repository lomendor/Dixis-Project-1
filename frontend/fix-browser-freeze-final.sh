#!/bin/bash

echo "🔧 Final Browser Freeze Fix"
echo "=========================="

# 1. Kill all node processes
echo "1. Killing all Node processes..."
pkill -f node

# 2. Clear ALL caches
echo "2. Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf ~/.npm

# 3. Fix the problematic files
echo "3. Fixing problematic components..."

# Fix ErrorBoundary
cat > src/components/ui/ErrorBoundary.tsx << 'EOF'
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Κάτι πήγε στραβά</h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Δοκιμάστε ξανά
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
EOF

# 4. Create a working homepage
echo "4. Creating working homepage..."
cat > src/app/page.tsx << 'EOF'
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Καλώς ήρθατε στο Dixis
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Απευθείας από τον παραγωγό στο τραπέζι σας
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/products"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Δείτε Προϊόντα
            </Link>
            <Link
              href="/producers"
              className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Γνωρίστε τους Παραγωγούς
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# 5. Start clean
echo "5. Starting clean development server..."
npm run dev