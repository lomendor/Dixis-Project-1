# 🔧 DIXIS DEVELOPMENT WORKFLOW - ENGINEERING GUIDE

**Purpose**: Complete development workflow documentation and best practices  
**Status**: Established workflow with Context Engineering automation  
**Last Updated**: 2025-07-24

## 🗂️ Quick Navigation
- **Workflow Hub**: [CLAUDE.md](../CLAUDE.md)
- **Technical Architecture**: [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- **Enterprise Features**: [ENTERPRISE_FEATURES.md](ENTERPRISE_FEATURES.md)
- **Greek Market**: [GREEK_MARKET_STRATEGY.md](GREEK_MARKET_STRATEGY.md)

---

## 🚀 QUICK START GUIDE

### **Development Environment Setup**
```bash
# Clone repository
git clone https://github.com/dixis/marketplace.git
cd marketplace

# Backend setup (Laravel)
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000

# Frontend setup (Next.js)
cd ../frontend
npm install
cp .env.example .env.local
npm run dev  # Runs on port 3000

# Start Context Engineering
cd ..
node scripts/context-hooks.js work-start
```

### **Essential Development Commands**
```bash
# Context Engineering Workflow
node scripts/context-hooks.js work-start      # Start intelligent work session
node scripts/context-hooks.js work-status     # Check current progress
node scripts/context-hooks.js suggest-next    # Get AI-powered suggestions
node scripts/context-hooks.js smart-commit    # Generate commit message

# Testing Commands
npm run test              # Run frontend tests
php artisan test         # Run backend tests
npm run e2e              # Run end-to-end tests
./scripts/auto-test-hooks.sh all  # Run all tests

# Code Quality
npm run lint             # Frontend linting
./vendor/bin/phpstan     # Backend static analysis
npm run format           # Auto-format code
```

---

## 🌿 GIT WORKFLOW

### **Branch Strategy**
```
main                    # Production-ready code
├── develop            # Integration branch
│   ├── feature/*      # New features
│   ├── fix/*         # Bug fixes
│   ├── chore/*       # Maintenance tasks
│   └── greek-market/* # Greek integration features
```

### **Branch Naming Convention**
```bash
# Feature branches
feature/viva-wallet-integration
feature/greek-shipping-setup
feature/b2b-dashboard-enhancement

# Fix branches
fix/cart-calculation-error
fix/greek-translation-update

# Greek market specific
greek-market/payment-integration
greek-market/vat-configuration
```

### **Commit Message Format**
```bash
# Context Engineering auto-generated format
<type>(<scope>): <subject>

[Context Engineering Verified]
- Platform Status: 100% functional
- Tests: All passing
- Greek Market Impact: <description>

# Types: feat, fix, docs, style, refactor, test, chore
# Example:
feat(payments): integrate Viva Wallet for Greek market

[Context Engineering Verified]
- Platform Status: 100% functional  
- Tests: All passing
- Greek Market Impact: Enables installment payments for B2B customers
```

### **Pull Request Process**
```bash
# 1. Create feature branch
git checkout -b feature/greek-payment-integration

# 2. Make changes with Context Engineering
node scripts/context-hooks.js work-start
# ... make changes ...

# 3. Generate smart commit
node scripts/context-hooks.js smart-commit

# 4. Push and create PR
git push origin feature/greek-payment-integration
gh pr create --title "feat: Greek payment integration" --body "$(node scripts/context-hooks.js pr-description)"

# 5. Automated checks run
- Context Engineering verification
- Unit and integration tests
- Code quality checks
- Security scanning
```

---

## 🧪 TESTING STRATEGY

### **Test Pyramid**
```
         E2E Tests
        /    10%    \
       ──────────────
      Integration Tests
      /      30%      \
     ──────────────────
    Unit Tests & Component
    /        60%         \
   ────────────────────────
```

### **Backend Testing (Laravel)**
```php
// Unit Test Example
class GreekVATCalculatorTest extends TestCase
{
    public function test_calculates_mainland_vat_correctly()
    {
        $calculator = new GreekVATCalculator();
        $result = $calculator->calculate(100, 'mainland');
        $this->assertEquals(24, $result); // 24% mainland VAT
    }
    
    public function test_calculates_island_vat_correctly()
    {
        $calculator = new GreekVATCalculator();
        $result = $calculator->calculate(100, 'island');
        $this->assertEquals(13, $result); // 13% island VAT
    }
}

// Feature Test Example
class B2BOrderTest extends TestCase
{
    public function test_bulk_order_creation_with_discounts()
    {
        $businessUser = User::factory()->businessUser()->create();
        
        $response = $this->actingAs($businessUser)
            ->postJson('/api/v1/bulk-orders', [
                'products' => [
                    ['id' => 1, 'quantity' => 100],
                    ['id' => 2, 'quantity' => 200]
                ]
            ]);
            
        $response->assertStatus(201)
            ->assertJsonStructure(['order', 'discount_applied']);
    }
}
```

### **Frontend Testing (Next.js)**
```typescript
// Component Test Example
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';

describe('ProductCard', () => {
  it('displays Greek product information correctly', () => {
    const product = {
      name: 'Ελιές Καλαμών',
      price: 5.99,
      producer: 'Αγρόκτημα Καλαμάτας'
    };
    
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Ελιές Καλαμών')).toBeInTheDocument();
    expect(screen.getByText('€5.99')).toBeInTheDocument();
    expect(screen.getByText('Αγρόκτημα Καλαμάτας')).toBeInTheDocument();
  });
});

// E2E Test Example (Playwright)
test('Greek customer complete purchase flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Προϊόντα');
  await page.click('text=Ελιές Καλαμών');
  await page.click('text=Προσθήκη στο καλάθι');
  await page.click('text=Ολοκλήρωση παραγγελίας');
  
  // Viva Wallet payment
  await page.fill('[name="cardNumber"]', '4111111111111111');
  await page.click('text=Πληρωμή');
  
  await expect(page).toHaveURL('/order-confirmation');
});
```

### **Testing Commands**
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests

# Watch mode for development
npm run test:watch      # Frontend
php artisan test --watch # Backend

# Coverage reports
npm run test:coverage   # Generate coverage report
```

---

## 📦 DEPLOYMENT PROCESS

### **Development → Staging → Production**
```bash
# 1. Development deployment (automatic on push)
git push origin develop
# Triggers GitHub Actions for dev environment

# 2. Staging deployment (PR to main)
gh pr create --base main --head develop
# Automated staging deployment on PR

# 3. Production deployment (merge to main)
gh pr merge
# Triggers production deployment pipeline
```

### **Deployment Checklist**
```bash
# Pre-deployment verification
node scripts/context-hooks.js deployment-check
✓ All tests passing
✓ No security vulnerabilities
✓ Database migrations ready
✓ Environment variables configured
✓ Greek market features tested
✓ Performance benchmarks met
```

### **GitHub Actions Workflow**
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Context Engineering Checks
        run: node scripts/context-hooks.js deployment-verify
        
      - name: Run Tests
        run: |
          npm run test:all
          php artisan test
          
      - name: Build and Deploy
        run: |
          docker build -t dixis/marketplace .
          docker push dixis/marketplace
          ssh deploy@server 'docker pull && docker-compose up -d'
```

---

## 🔍 CODE REVIEW GUIDELINES

### **Review Checklist**
- [ ] **Context Engineering Verified**: Changes align with platform reality
- [ ] **Tests Added**: New functionality has test coverage
- [ ] **Greek Market Impact**: Consider impact on Greek features
- [ ] **Performance**: No degradation in response times
- [ ] **Security**: No new vulnerabilities introduced
- [ ] **Documentation**: Updated relevant documentation

### **Review Process**
```bash
# Automated review assistance
node scripts/context-hooks.js review-pr <PR-NUMBER>

# Outputs:
✓ Code quality checks passed
✓ Test coverage maintained (85%+)
✓ No security issues detected
✓ Greek market features unaffected
⚠ Performance: API response +50ms (review needed)
```

### **Code Style Guidelines**
```php
// Backend (Laravel) - PSR-12 Standard
class GreekMarketService
{
    private VivaWalletClient $paymentClient;
    
    public function processPayment(Order $order): PaymentResult
    {
        // Clear, self-documenting code
        $amount = $this->calculateTotalWithVAT($order);
        $installments = $this->determineInstallmentOptions($amount);
        
        return $this->paymentClient->charge($amount, $installments);
    }
}
```

```typescript
// Frontend (Next.js) - Airbnb Style Guide
interface GreekProduct {
  name: string;
  price: number;
  producer: string;
  region: GreekRegion;
}

export const ProductCard: FC<{ product: GreekProduct }> = ({ product }) => {
  // Consistent component structure
  const { t } = useTranslation('products');
  const formattedPrice = formatGreekCurrency(product.price);
  
  return (
    <Card>
      <ProductImage src={product.image} alt={product.name} />
      <ProductInfo>
        <Title>{product.name}</Title>
        <Price>{formattedPrice}</Price>
        <Producer>{product.producer}</Producer>
      </ProductInfo>
    </Card>
  );
};
```

---

## 🛡️ SECURITY DEVELOPMENT PRACTICES

### **Security Checklist**
- [ ] **Input Validation**: All user inputs sanitized
- [ ] **SQL Injection Prevention**: Use parameterized queries
- [ ] **XSS Prevention**: Escape all output
- [ ] **CSRF Protection**: Tokens on all forms
- [ ] **Authentication**: Proper session management
- [ ] **Authorization**: Role-based access control
- [ ] **Sensitive Data**: Encrypted storage and transmission

### **Security Testing**
```bash
# Automated security scanning
npm audit                    # Check npm dependencies
composer audit              # Check PHP dependencies
npm run security-scan       # OWASP dependency check

# Manual security review
node scripts/context-hooks.js security-audit
```

---

## 📊 PERFORMANCE OPTIMIZATION

### **Performance Guidelines**
- **Database Queries**: Use eager loading to prevent N+1
- **API Responses**: Cache frequently accessed data
- **Frontend Bundle**: Keep under 200KB for initial load
- **Images**: Use WebP format with lazy loading
- **Greek Content**: CDN endpoints in Athens

### **Performance Monitoring**
```bash
# Real-time performance tracking
node scripts/context-hooks.js performance-monitor

# Output:
API Response Times:
├── /products: 145ms avg
├── /categories: 89ms avg
└── /cart: 178ms avg

Database Queries:
├── Product listing: 23ms
├── Cart calculation: 45ms
└── Order creation: 67ms

Frontend Metrics:
├── First Paint: 1.2s
├── TTI: 2.1s
└── Bundle Size: 187KB
```

---

## 🤖 CONTEXT ENGINEERING INTEGRATION

### **Development Automation**
```bash
# Intelligent development assistance
node scripts/context-hooks.js dev-assist

Available Commands:
├── work-start          # Auto-detect current task
├── suggest-code        # AI-powered code suggestions
├── test-impact         # Analyze test impact of changes
├── performance-check   # Real-time performance monitoring
├── security-scan       # Automated security review
└── deploy-ready        # Deployment readiness check
```

### **Workflow Optimization**
```javascript
// Context Engineering hooks for development
{
  onFileChange: (file) => {
    // Auto-run relevant tests
    // Update documentation if needed
    // Check Greek market impact
  },
  
  onCommit: (changes) => {
    // Generate smart commit message
    // Run pre-commit checks
    // Update Context Engineering metrics
  },
  
  onPullRequest: (pr) => {
    // Automated code review
    // Performance impact analysis
    // Greek market compatibility check
  }
}
```

---

## 📚 LEARNING RESOURCES

### **Technology Documentation**
- **Laravel**: [Official Documentation](https://laravel.com/docs)
- **Next.js**: [Official Documentation](https://nextjs.org/docs)
- **PostgreSQL**: [Official Documentation](https://www.postgresql.org/docs/)
- **Docker**: [Official Documentation](https://docs.docker.com/)

### **Greek Market Resources**
- **Viva Wallet API**: [Developer Documentation](https://developer.vivawallet.com/)
- **AfterSalesPro**: [API Documentation](https://www.aftersalespro.gr/api)
- **Greek VAT**: [AADE Guidelines](https://www.aade.gr/)
- **Greek E-commerce**: [Market Statistics](https://www.greekecommerce.gr/)

### **Best Practices**
- **Clean Code**: Robert C. Martin principles
- **Design Patterns**: Laravel and React patterns
- **Testing**: TDD/BDD methodologies
- **Security**: OWASP guidelines

---

## 🆘 TROUBLESHOOTING

### **Common Issues**
```bash
# Port conflicts
Error: Port 3000 already in use
Solution: kill -9 $(lsof -ti:3000)

# Database connection
Error: SQLSTATE[08006] Connection refused
Solution: sudo service postgresql start

# Node modules issues
Error: Module not found
Solution: rm -rf node_modules && npm install

# Laravel permissions
Error: Permission denied storage/logs
Solution: chmod -R 775 storage bootstrap/cache
```

### **Debug Commands**
```bash
# Context Engineering debugging
node scripts/context-hooks.js debug --verbose

# Laravel debugging
php artisan tinker
>>> \DB::listen(function($q) { dump($q->sql); });

# Next.js debugging
npm run dev -- --inspect
```

---

**🏆 Development Excellence**: This workflow combines modern development practices with Context Engineering automation to create an efficient, intelligent development environment focused on Greek market success.

**Next Development Focus**: Implement Viva Wallet integration and Greek shipping setup using the established workflow and Context Engineering assistance.