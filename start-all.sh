#!/bin/bash

echo "🚀 Starting Dixis Marketplace - Clean Repository..."
echo "=================================================="

# Start Laravel Backend
echo "📦 Starting Laravel Backend on http://localhost:8000"
cd backend && php artisan serve &
LARAVEL_PID=$!

# Wait a bit for Laravel to start
sleep 3

# Start Next.js Frontend
echo "🌱 Starting Next.js Frontend on http://localhost:3000"
cd ../frontend && npm run dev &
NEXTJS_PID=$!

echo ""
echo "✅ Both servers are starting!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Health: http://localhost:8000/api/health"
echo "📍 Products API: http://localhost:8000/api/v1/products"
echo ""
echo "🛠️  To set up dependencies first time:"
echo "   cd frontend && npm install"
echo "   cd backend && composer install"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "echo '🛑 Stopping servers...'; kill $LARAVEL_PID $NEXTJS_PID; exit" INT
wait