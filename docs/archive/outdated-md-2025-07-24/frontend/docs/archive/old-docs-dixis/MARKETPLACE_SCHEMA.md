# 🏗️ Dixis Fresh Marketplace Database Schema

## Overview
Database schema designed for a Greek agricultural marketplace where producers sell directly to consumers and businesses with subscription-based commission tiers.

## Core Business Logic
- **Commission Rates**: 12% (no subscription), 9% (tier 1), 7% (tier 2)
- **Business Buyers**: 0% commission with subscription
- **Producer Approval**: Admin verification required for producer registration
- **Product Focus**: Non-perishable items (honey, oils, nuts, grains, cosmetics)
- **Seasonal Management**: Pre-scheduling and inventory planning
- **Payment Timing**: Based on producer trust levels

---

## 🗄️ Database Tables

### 1. Users (Enhanced)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'producer', 'consumer', 'business') DEFAULT 'consumer',
    status ENUM('active', 'inactive', 'suspended', 'pending_verification') DEFAULT 'active',
    email_verified_at TIMESTAMP NULL,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    language VARCHAR(5) DEFAULT 'el',
    timezone VARCHAR(50) DEFAULT 'Europe/Athens',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);
```

### 2. Producer Profiles
```sql
CREATE TABLE producer_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    business_registration_number VARCHAR(50),
    tax_number VARCHAR(20) NOT NULL,
    description TEXT,
    specialties JSON, -- ["honey", "olive_oil", "nuts"]
    location_address TEXT,
    location_city VARCHAR(100),
    location_region VARCHAR(100),
    location_postal_code VARCHAR(10),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    website_url VARCHAR(500),
    social_media JSON, -- {"facebook": "url", "instagram": "url"}
    farm_photos JSON, -- ["url1", "url2", "url3"]
    certification_documents JSON, -- [{"type": "bio", "url": "cert.pdf"}]
    
    -- Verification & Trust
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_notes TEXT,
    trust_level ENUM('new', 'trusted', 'premium') DEFAULT 'new',
    admin_notes TEXT,
    verified_at TIMESTAMP NULL,
    verified_by BIGINT NULL,
    
    -- Business Settings
    payment_terms_days INT DEFAULT 7, -- Payment delay based on trust
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_zones JSON, -- ["athens", "thessaloniki"]
    processing_time_days INT DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_verification_status (verification_status),
    INDEX idx_trust_level (trust_level),
    INDEX idx_location (location_lat, location_lng)
);
```

### 3. Business Profiles
```sql
CREATE TABLE business_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    vat_number VARCHAR(20) NOT NULL,
    tax_number VARCHAR(20) NOT NULL,
    business_type ENUM('restaurant', 'retail', 'wholesale', 'hotel', 'other'),
    industry VARCHAR(100),
    employee_count ENUM('1-5', '6-20', '21-50', '51-200', '200+'),
    annual_revenue_range ENUM('under_100k', '100k-500k', '500k-1m', '1m-5m', 'over_5m'),
    billing_address TEXT,
    shipping_address TEXT,
    contact_person VARCHAR(200),
    contact_phone VARCHAR(20),
    payment_terms ENUM('immediate', '15_days', '30_days') DEFAULT 'immediate',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vat (vat_number)
);
```

### 4. Subscription Tiers
```sql
CREATE TABLE subscription_tiers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_type ENUM('producer', 'business') NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL,
    yearly_price DECIMAL(10, 2),
    commission_rate DECIMAL(5, 2) NOT NULL, -- 12.00, 9.00, 7.00, 0.00
    features JSON, -- ["priority_support", "analytics", "bulk_upload"]
    max_products INT DEFAULT NULL, -- NULL = unlimited
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_type (user_type),
    INDEX idx_active (is_active)
);
```

### 5. User Subscriptions
```sql
CREATE TABLE user_subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    tier_id BIGINT NOT NULL,
    status ENUM('active', 'cancelled', 'expired', 'trial') DEFAULT 'active',
    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP NULL,
    trial_end DATE NULL,
    
    -- Payment tracking
    stripe_subscription_id VARCHAR(255),
    last_payment_at TIMESTAMP NULL,
    next_billing_date DATE NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tier_id) REFERENCES subscription_tiers(id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_billing_date (next_billing_date)
);
```

### 6. Products (Enhanced)
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producer_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2), -- Producer's cost for transparency
    compare_at_price DECIMAL(10, 2), -- Original price for discounts
    
    -- Inventory
    sku VARCHAR(100),
    barcode VARCHAR(50),
    track_inventory BOOLEAN DEFAULT TRUE,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    allow_backorders BOOLEAN DEFAULT FALSE,
    
    -- Physical attributes
    weight_grams INT,
    dimensions_cm JSON, -- {"length": 10, "width": 5, "height": 3}
    
    -- Product categorization
    category_id BIGINT,
    subcategory_id BIGINT,
    tags JSON, -- ["organic", "local", "seasonal"]
    
    -- Seasonal management
    is_seasonal BOOLEAN DEFAULT FALSE,
    season_start_month INT, -- 1-12
    season_end_month INT, -- 1-12
    pre_order_enabled BOOLEAN DEFAULT FALSE,
    pre_order_release_date DATE NULL,
    
    -- Certifications & Quality
    certifications JSON, -- ["bio", "pdo", "pgi"]
    nutritional_info JSON,
    allergens JSON, -- ["nuts", "dairy"]
    shelf_life_days INT,
    storage_instructions TEXT,
    
    -- Media
    images JSON, -- ["url1", "url2", "url3"] - first is primary
    video_urls JSON,
    
    -- SEO & Marketing
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    
    -- Status & Visibility
    status ENUM('draft', 'active', 'inactive', 'archived') DEFAULT 'draft',
    visibility ENUM('public', 'private', 'password_protected') DEFAULT 'public',
    published_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_producer_status (producer_id, status),
    INDEX idx_slug (slug),
    INDEX idx_featured (featured),
    INDEX idx_seasonal (is_seasonal, season_start_month, season_end_month),
    FULLTEXT idx_search (name, description, tags)
);
```

### 7. Orders (Enhanced with Commission Tracking)
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    
    -- Order totals
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Commission breakdown
    total_commission DECIMAL(10, 2) DEFAULT 0,
    commission_rate DECIMAL(5, 2), -- Rate applied at order time
    producer_payout DECIMAL(10, 2), -- Amount going to producers
    
    -- Order lifecycle
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    fulfillment_status ENUM('unfulfilled', 'partial', 'fulfilled') DEFAULT 'unfulfilled',
    
    -- Addresses
    billing_address JSON,
    shipping_address JSON,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    
    -- Shipping
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(255),
    tracking_url VARCHAR(500),
    estimated_delivery DATE,
    delivered_at TIMESTAMP NULL,
    
    -- Special attributes
    is_business_order BOOLEAN DEFAULT FALSE,
    special_instructions TEXT,
    internal_notes TEXT,
    
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_business_order (is_business_order),
    INDEX idx_placed_at (placed_at)
);
```

### 8. Order Items (with Commission Details)
```sql
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    producer_id BIGINT NOT NULL,
    
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Commission breakdown per item
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    producer_amount DECIMAL(10, 2) NOT NULL, -- What producer receives
    
    -- Product snapshot (in case product changes)
    product_name VARCHAR(200),
    product_sku VARCHAR(100),
    product_image VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (producer_id) REFERENCES users(id),
    INDEX idx_order (order_id),
    INDEX idx_producer (producer_id)
);
```

### 9. Producer Payouts
```sql
CREATE TABLE producer_payouts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producer_id BIGINT NOT NULL,
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,
    
    -- Financial summary
    total_sales_amount DECIMAL(10, 2) NOT NULL,
    total_commission DECIMAL(10, 2) NOT NULL,
    net_payout_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payout details
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    payout_method ENUM('bank_transfer', 'paypal', 'stripe') DEFAULT 'bank_transfer',
    payout_reference VARCHAR(255),
    
    -- Banking details (encrypted)
    bank_account_last4 VARCHAR(4),
    
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES users(id),
    INDEX idx_producer_period (producer_id, payout_period_start),
    INDEX idx_status (status)
);
```

### 10. Payout Line Items
```sql
CREATE TABLE payout_line_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payout_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    
    sale_amount DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL,
    net_amount DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payout_id) REFERENCES producer_payouts(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id),
    INDEX idx_payout (payout_id)
);
```

### 11. Product Reviews & Ratings
```sql
CREATE TABLE product_reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    order_id BIGINT, -- Link to verified purchase
    
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    
    -- Review metadata
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    
    helpful_votes INT DEFAULT 0,
    total_votes INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_product_status (product_id, status),
    INDEX idx_customer (customer_id),
    INDEX idx_verified (is_verified_purchase)
);
```

### 12. Seasonal Inventory Planning
```sql
CREATE TABLE seasonal_inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    
    year INT NOT NULL,
    season ENUM('spring', 'summer', 'autumn', 'winter') NOT NULL,
    
    planned_quantity INT NOT NULL,
    planned_price DECIMAL(10, 2),
    estimated_harvest_date DATE,
    pre_order_start_date DATE,
    pre_order_end_date DATE,
    
    actual_quantity INT DEFAULT 0,
    status ENUM('planning', 'pre_order', 'harvesting', 'completed') DEFAULT 'planning',
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (producer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_season (product_id, year, season),
    INDEX idx_producer_year (producer_id, year),
    INDEX idx_status (status)
);
```

### 13. Adoption Program (Future Feature)
```sql
CREATE TABLE adoptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    adopter_id BIGINT NOT NULL,
    producer_id BIGINT NOT NULL,
    
    adoption_type ENUM('tree', 'beehive', 'plot', 'animal') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Adoption terms
    duration_months INT NOT NULL,
    monthly_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    
    -- Expected deliveries
    estimated_yield VARCHAR(200), -- "20kg honey" or "50L olive oil"
    delivery_schedule ENUM('monthly', 'quarterly', 'end_of_season') DEFAULT 'end_of_season',
    
    -- Tracking & Updates
    location_coordinates JSON, -- For tree/plot adoptions
    live_stream_url VARCHAR(500),
    update_frequency ENUM('weekly', 'monthly', 'seasonal') DEFAULT 'monthly',
    
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    started_at DATE NOT NULL,
    ends_at DATE NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (adopter_id) REFERENCES users(id),
    FOREIGN KEY (producer_id) REFERENCES users(id),
    INDEX idx_adopter (adopter_id),
    INDEX idx_producer (producer_id),
    INDEX idx_status (status)
);
```

---

## 🔄 Key Relationships & Business Logic

### Commission Calculation Logic
1. **Consumer Orders**: Use producer's current subscription tier commission rate
2. **Business Orders**: Check if business has active subscription (0% rate) or use default rate
3. **Commission Storage**: Rate captured at order time to handle subscription changes

### Producer Trust Level Progression
- **New**: 7-day payment delay, basic features
- **Trusted**: 3-day payment delay, bulk upload tools
- **Premium**: 1-day payment delay, priority support, analytics

### Seasonal Product Flow
1. Producer plans seasonal inventory
2. Enables pre-orders with release dates
3. Customers can pre-order and pay in advance
4. Producer updates actual harvest quantities
5. Automatic notifications for delivery scheduling

---

## 📊 Analytics & Reporting Tables

### Commission Analytics
```sql
CREATE TABLE commission_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    tier_id BIGINT,
    user_type ENUM('producer', 'business'),
    
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    total_commission DECIMAL(12, 2) DEFAULT 0,
    avg_commission_rate DECIMAL(5, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_date_tier (date, tier_id, user_type),
    INDEX idx_date (date)
);
```

This schema supports all the marketplace requirements you outlined while providing flexibility for future enhancements like the adoption program and livestreaming features.