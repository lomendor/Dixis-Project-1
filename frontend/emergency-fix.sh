#!/bin/bash

echo "🚨 EMERGENCY BROWSER FREEZE FIX"
echo "================================"

# Kill any running Next.js processes
echo "1. Killing all Next.js processes..."
pkill -f "next dev" || true

# Clear all caches
echo "2. Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules/.vite

# Disable problematic components temporarily
echo "3. Creating emergency page..."
cat > src/app/page.tsx << 'EOF'
export default function EmergencyHome() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dixis Fresh</h1>
        <p className="text-xl mb-8">Emergency Mode Active</p>
        <div className="space-y-4">
          <a href="/products" className="block text-blue-600 hover:underline">
            Products (Test if working)
          </a>
          <a href="/cart" className="block text-blue-600 hover:underline">
            Cart (Test if working)
          </a>
        </div>
      </div>
    </div>
  );
}
EOF

# Start with minimal setup
echo "4. Starting minimal server..."
echo "Visit http://localhost:3000 to test"
npm run dev