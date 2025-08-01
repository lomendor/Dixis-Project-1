# 🔐 SSL Certificates Directory

## 📋 **Certificate Files Structure**

```
docker/ssl/
├── dixis.io.crt          # Main SSL certificate
├── dixis.io.key          # Private key
├── dixis.io.chain.crt    # Certificate chain
├── dhparam.pem           # Diffie-Hellman parameters
└── README.md             # This file
```

## 🚀 **Production Setup Instructions**

### **1. Let's Encrypt (Recommended)**
```bash
# Install Certbot
sudo apt update && sudo apt install certbot

# Generate certificates
sudo certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@dixis.io \
  --agree-tos \
  --no-eff-email \
  -d dixis.io \
  -d www.dixis.io

# Copy certificates to Docker volume
sudo cp /etc/letsencrypt/live/dixis.io/fullchain.pem ./dixis.io.crt
sudo cp /etc/letsencrypt/live/dixis.io/privkey.pem ./dixis.io.key
sudo cp /etc/letsencrypt/live/dixis.io/chain.pem ./dixis.io.chain.crt
```

### **2. Generate Diffie-Hellman Parameters**
```bash
# Generate strong DH parameters (takes 5-10 minutes)
openssl dhparam -out dhparam.pem 2048
```

### **3. Set Correct Permissions**
```bash
chmod 600 *.key
chmod 644 *.crt *.pem
chown root:root *
```

## 🔄 **Auto-Renewal Setup**

### **Cron Job for Certificate Renewal**
```bash
# Add to root crontab
0 3 * * 0 /usr/bin/certbot renew --quiet && docker-compose restart nginx-proxy
```

### **Docker Compose SSL Profile**
```bash
# Renew certificates
docker-compose --profile ssl-renewal run --rm certbot

# Restart nginx to load new certificates
docker-compose restart nginx-proxy
```

## 🧪 **Development Setup (Self-Signed)**

### **Generate Self-Signed Certificates for Development**
```bash
# Generate private key
openssl genrsa -out dixis.io.key 2048

# Generate certificate signing request
openssl req -new -key dixis.io.key -out dixis.io.csr \
  -subj "/C=GR/ST=Attica/L=Athens/O=Dixis Platform/CN=dixis.io"

# Generate self-signed certificate
openssl x509 -req -days 365 -in dixis.io.csr -signkey dixis.io.key -out dixis.io.crt

# Create chain (same as cert for self-signed)
cp dixis.io.crt dixis.io.chain.crt

# Generate DH parameters
openssl dhparam -out dhparam.pem 2048
```

## 🔐 **Security Best Practices**

1. **Key Protection**: Never commit private keys to git
2. **Permissions**: Restrict access to certificate files (600 for keys, 644 for certs)
3. **Backup**: Securely backup certificates and keys
4. **Monitoring**: Monitor certificate expiration dates
5. **Rotation**: Regularly rotate certificates (Let's Encrypt auto-renews every 90 days)

## 📊 **SSL Configuration Verification**

### **Test SSL Configuration**
```bash
# Test SSL certificate
openssl x509 -in dixis.io.crt -text -noout

# Check certificate chain
openssl verify -CAfile dixis.io.chain.crt dixis.io.crt

# Test SSL connection
openssl s_client -connect dixis.io:443 -servername dixis.io
```

### **Online SSL Checkers**
- SSL Labs: https://www.ssllabs.com/ssltest/
- SSL Checker: https://www.sslchecker.com/sslchecker

## 🇬🇷 **Greek Market Considerations**

- **Domain**: Ensure certificates include both dixis.io and www.dixis.io
- **Compliance**: SSL/TLS required for GDPR compliance
- **Trust**: Greek users expect secure connections for payments
- **Performance**: Modern TLS versions for faster connections

## 🚨 **Important Notes**

- **Production**: Use Let's Encrypt or commercial certificates
- **Development**: Self-signed certificates are acceptable
- **Staging**: Use Let's Encrypt staging environment for testing
- **Security**: Monitor certificate expiration and renewal