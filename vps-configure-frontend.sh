#!/bin/bash

# Frontend configuration and Nginx setup for Dixis Greek Market

set -e

echo "🎨 Configuring Frontend & Nginx..."
echo "================================="

# Configure frontend
cd /var/www/dixis-marketplace/frontend

echo "📝 Creating frontend environment..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://dixis.io/api
NEXT_PUBLIC_APP_URL=https://dixis.io
NEXT_PUBLIC_APP_NAME="Dixis Greek Marketplace"
NEXT_PUBLIC_DEFAULT_LOCALE=el
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
EOF

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm ci

# Build frontend
echo "🔨 Building frontend (this may take a few minutes)..."
npm run build

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/dixis << 'EOF'
server {
    listen 80;
    server_name dixis.io www.dixis.io;
    
    # Redirect to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name dixis.io www.dixis.io;
    
    # Root directory for Laravel
    root /var/www/dixis-marketplace/backend/public;
    index index.php;
    
    # SSL certificates (from backup or new)
    ssl_certificate /etc/letsencrypt/live/dixis.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dixis.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    
    # Greek market optimizations
    client_max_body_size 50M;
    client_body_timeout 120s;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Laravel API routes
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # Laravel storage
    location /storage {
        alias /var/www/dixis-marketplace/backend/storage/app/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # PHP processing
    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_read_timeout 300;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
    }
    
    # Next.js frontend (all other routes)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ /\.env {
        deny all;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/dixis /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Fix permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/dixis-marketplace
chmod -R 755 /var/www/dixis-marketplace
chmod -R 775 /var/www/dixis-marketplace/backend/storage
chmod -R 775 /var/www/dixis-marketplace/backend/bootstrap/cache

# Configure SSL from backup
echo "🔐 Configuring SSL..."
if [ -d /root/backups/*/ssl-certificates ]; then
    echo "Restoring SSL certificates from backup..."
    mkdir -p /etc/letsencrypt/live/dixis.io
    cp -r /root/backups/*/ssl-certificates/* /etc/letsencrypt/live/dixis.io/ 2>/dev/null || true
    
    # Also restore renewal config
    mkdir -p /etc/letsencrypt/renewal
    cp /root/backups/*/ssl-renewal-config /etc/letsencrypt/renewal/dixis.io.conf 2>/dev/null || true
    
    # Fix permissions
    chmod 600 /etc/letsencrypt/live/dixis.io/privkey.pem
    
    echo "✅ SSL certificates restored"
else
    echo "⚠️ No SSL backup found. Generating new certificate..."
    # Comment out SSL lines in nginx for now
    sed -i 's/listen 443 ssl http2;/listen 443 http2;/' /etc/nginx/sites-available/dixis
    sed -i 's/ssl_certificate/#ssl_certificate/' /etc/nginx/sites-available/dixis
    sed -i 's/ssl_protocols/#ssl_protocols/' /etc/nginx/sites-available/dixis
    sed -i 's/ssl_ciphers/#ssl_ciphers/' /etc/nginx/sites-available/dixis
    sed -i 's/ssl_prefer_server_ciphers/#ssl_prefer_server_ciphers/' /etc/nginx/sites-available/dixis
fi

# Test nginx configuration
nginx -t

# Start services
echo "🚀 Starting services..."

# Start frontend with PM2
cd /var/www/dixis-marketplace/frontend
pm2 delete dixis-frontend 2>/dev/null || true
pm2 start npm --name "dixis-frontend" -- start -- --port 3001
pm2 save
pm2 startup systemd -u root --hp /root

# Restart services
systemctl restart php8.3-fpm
systemctl restart nginx
systemctl restart redis-server

echo "✅ Frontend & Nginx configuration complete!"
echo ""
echo "📊 Service Status:"
systemctl is-active nginx && echo "✅ Nginx: Active" || echo "❌ Nginx: Inactive"
systemctl is-active php8.3-fpm && echo "✅ PHP-FPM: Active" || echo "❌ PHP-FPM: Inactive"
pm2 list

echo ""
echo "🌐 Your site should now be accessible at:"
echo "   HTTP:  http://dixis.io (redirects to HTTPS)"
echo "   HTTPS: https://dixis.io"
echo ""
echo "⚠️ If SSL is not working, run:"
echo "   certbot --nginx -d dixis.io -d www.dixis.io"