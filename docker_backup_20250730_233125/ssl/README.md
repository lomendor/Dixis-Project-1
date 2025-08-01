# 🔐 SSL Certificates Directory

## 📋 **Certificate Files Structure**

```
docker/ssl/
├── dixis.gr.crt          # Main SSL certificate
├── dixis.gr.key          # Private key
├── dixis.gr.chain.crt    # Certificate chain
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
  --email admin@dixis.gr \
  --agree-tos \
  --no-eff-email \
  -d dixis.gr \
  -d www.dixis.gr

# Copy certificates to Docker volume
sudo cp /etc/letsencrypt/live/dixis.gr/fullchain.pem ./dixis.gr.crt
sudo cp /etc/letsencrypt/live/dixis.gr/privkey.pem ./dixis.gr.key
sudo cp /etc/letsencrypt/live/dixis.gr/chain.pem ./dixis.gr.chain.crt
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
openssl genrsa -out dixis.gr.key 2048

# Generate certificate signing request
openssl req -new -key dixis.gr.key -out dixis.gr.csr \
  -subj "/C=GR/ST=Attica/L=Athens/O=Dixis Platform/CN=dixis.gr"

# Generate self-signed certificate
openssl x509 -req -days 365 -in dixis.gr.csr -signkey dixis.gr.key -out dixis.gr.crt

# Create chain (same as cert for self-signed)
cp dixis.gr.crt dixis.gr.chain.crt

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
openssl x509 -in dixis.gr.crt -text -noout

# Check certificate chain
openssl verify -CAfile dixis.gr.chain.crt dixis.gr.crt

# Test SSL connection
openssl s_client -connect dixis.gr:443 -servername dixis.gr
```

### **Online SSL Checkers**
- SSL Labs: https://www.ssllabs.com/ssltest/
- SSL Checker: https://www.sslchecker.com/sslchecker

## 🇬🇷 **Greek Market Considerations**

- **Domain**: Ensure certificates include both dixis.gr and www.dixis.gr
- **Compliance**: SSL/TLS required for GDPR compliance
- **Trust**: Greek users expect secure connections for payments
- **Performance**: Modern TLS versions for faster connections

## 🚨 **Important Notes**

- **Production**: Use Let's Encrypt or commercial certificates
- **Development**: Self-signed certificates are acceptable
- **Staging**: Use Let's Encrypt staging environment for testing
- **Security**: Monitor certificate expiration and renewal