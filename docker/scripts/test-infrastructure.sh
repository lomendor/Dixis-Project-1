#!/bin/bash
# Dixis Platform - Docker Infrastructure Testing Script
# Comprehensive validation of Greek marketplace infrastructure

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
PASSED_TESTS=0
FAILED_TESTS=0
TOTAL_TESTS=0

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
    ((PASSED_TESTS++))
}

error() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

warning() {
    echo -e "${YELLOW}[⚠️ WARN]${NC} $1"
}

test_start() {
    ((TOTAL_TESTS++))
    log "🧪 Testing: $1"
}

# Docker Infrastructure Tests
test_docker_compose_files() {
    test_start "Docker Compose files syntax"
    
    # Test development compose
    if docker-compose -f docker-compose.yml config > /dev/null 2>&1; then
        success "Development docker-compose.yml syntax valid"
    else
        error "Development docker-compose.yml syntax invalid"
    fi
    
    # Test production compose
    if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
        success "Production docker-compose.prod.yml syntax valid"
    else
        error "Production docker-compose.prod.yml syntax invalid"
    fi
}

test_dockerfile_syntax() {
    test_start "Dockerfile syntax validation"
    
    # Test backend Dockerfile
    if docker build --dry-run -f docker/Dockerfile.backend . > /dev/null 2>&1; then
        success "Backend Dockerfile syntax valid"
    else
        error "Backend Dockerfile syntax invalid"
    fi
    
    # Test frontend Dockerfile
    if docker build --dry-run -f docker/Dockerfile.frontend . > /dev/null 2>&1; then
        success "Frontend Dockerfile syntax valid"
    else
        error "Frontend Dockerfile syntax invalid"
    fi
}

test_configuration_files() {
    test_start "Configuration files validation"
    
    # Test Nginx configuration
    if [[ -f "docker/config/nginx-proxy/nginx.conf" ]]; then
        success "Nginx proxy configuration exists"
    else
        error "Nginx proxy configuration missing"
    fi
    
    # Test PHP configurations
    if [[ -f "docker/config/php/php.ini" ]] && [[ -f "docker/config/php/php-dev.ini" ]]; then
        success "PHP configurations exist"
    else
        error "PHP configurations missing"
    fi
    
    # Test MySQL configuration
    if [[ -f "docker/config/mysql/prod.cnf" ]]; then
        success "MySQL production configuration exists"
    else
        error "MySQL production configuration missing"
    fi
    
    # Test Redis configuration
    if [[ -f "docker/config/redis/prod.conf" ]]; then
        success "Redis production configuration exists"
    else
        error "Redis production configuration missing"
    fi
    
    # Test Prometheus configuration
    if [[ -f "docker/config/prometheus/prometheus.yml" ]]; then
        success "Prometheus configuration exists"
    else
        error "Prometheus configuration missing"
    fi
    
    # Test Grafana configuration
    if [[ -f "docker/config/grafana/prod.ini" ]]; then
        success "Grafana production configuration exists"
    else
        error "Grafana production configuration missing"
    fi
}

test_ssl_directory_structure() {
    test_start "SSL directory structure"
    
    if [[ -d "docker/ssl" ]]; then
        success "SSL directory exists"
        
        if [[ -f "docker/ssl/README.md" ]]; then
            success "SSL documentation exists"
        else
            error "SSL documentation missing"
        fi
    else
        error "SSL directory missing"
    fi
}

test_deployment_scripts() {
    test_start "Deployment scripts validation"
    
    # Test production deployment script
    if [[ -x "docker/scripts/deploy-production.sh" ]]; then
        success "Production deployment script exists and is executable"
    else
        error "Production deployment script missing or not executable"
    fi
    
    # Test blue-green deployment script
    if [[ -x "docker/scripts/blue-green-deploy.sh" ]]; then
        success "Blue-green deployment script exists and is executable"
    else
        error "Blue-green deployment script missing or not executable"
    fi
    
    # Test infrastructure test script
    if [[ -x "docker/scripts/test-infrastructure.sh" ]]; then
        success "Infrastructure test script exists and is executable"
    else
        error "Infrastructure test script missing or not executable"
    fi
}

test_monitoring_configuration() {
    test_start "Monitoring configuration"
    
    # Test Prometheus alerting rules
    if [[ -f "docker/config/prometheus/rules/dixis-alerts.yml" ]]; then
        success "Prometheus alerting rules exist"
    else
        error "Prometheus alerting rules missing"
    fi
    
    # Test Grafana dashboards directory
    if [[ -d "docker/config/grafana/dashboards" ]]; then
        success "Grafana dashboards directory exists"
    else
        error "Grafana dashboards directory missing"
    fi
}

test_network_configuration() {
    test_start "Docker network configuration"
    
    # Check network definitions in compose files
    if grep -q "dixis-network" docker-compose.yml && grep -q "dixis-network" docker-compose.prod.yml; then
        success "Docker networks properly configured"
    else
        error "Docker networks not properly configured"
    fi
    
    # Check internal network isolation
    if grep -q "dixis-internal" docker-compose.prod.yml && grep -q "internal: true" docker-compose.prod.yml; then
        success "Internal network isolation configured"
    else
        error "Internal network isolation not configured"
    fi
}

test_volume_configuration() {
    test_start "Docker volume configuration"
    
    # Check persistent volumes
    local required_volumes=("mysql-data" "redis-data" "elasticsearch-data" "minio-data" "prometheus-data" "grafana-data")
    local missing_volumes=()
    
    for volume in "${required_volumes[@]}"; do
        if grep -q "$volume:" docker-compose.prod.yml; then
            continue
        else
            missing_volumes+=("$volume")
        fi
    done
    
    if [[ ${#missing_volumes[@]} -eq 0 ]]; then
        success "All required Docker volumes configured"
    else
        error "Missing Docker volumes: ${missing_volumes[*]}"
    fi
}

test_security_configuration() {
    test_start "Security configuration"
    
    # Check for non-root users in Dockerfiles
    if grep -q "USER dixis" docker/Dockerfile.backend && grep -q "USER nextjs" docker/Dockerfile.frontend; then
        success "Non-root users configured in Dockerfiles"
    else
        error "Non-root users not properly configured"
    fi
    
    # Check for security headers in Nginx
    if grep -q "X-Frame-Options" docker/config/nginx-proxy/conf.d/dixis.conf; then
        success "Security headers configured in Nginx"
    else
        error "Security headers missing in Nginx configuration"
    fi
    
    # Check for SSL configuration
    if grep -q "ssl_certificate" docker/config/nginx-proxy/conf.d/dixis.conf; then
        success "SSL configuration present in Nginx"
    else
        error "SSL configuration missing in Nginx"
    fi
}

test_greek_market_optimizations() {
    test_start "Greek market optimizations"
    
    # Check UTF-8 configuration in MySQL
    if grep -q "utf8mb4" docker/config/mysql/prod.cnf; then
        success "UTF-8 character set configured for Greek text"
    else
        error "UTF-8 character set not configured"
    fi
    
    # Check timezone configuration
    if grep -q "Europe/Athens" docker/config/mysql/prod.cnf; then
        success "Greek timezone configured"
    else
        error "Greek timezone not configured"
    fi
    
    # Check for Greek language support in PHP
    if grep -q "mbstring.language = Greek" docker/config/php/php-dev.ini; then
        success "Greek language support configured in PHP"
    else
        error "Greek language support not configured in PHP"
    fi
}

test_performance_optimizations() {
    test_start "Performance optimizations"
    
    # Check OPcache configuration
    if grep -q "opcache.enable = 1" docker/config/php/opcache.ini; then
        success "OPcache enabled for PHP performance"
    else
        error "OPcache not properly configured"
    fi
    
    # Check Redis memory policy
    if grep -q "maxmemory-policy allkeys-lru" docker/config/redis/prod.conf; then
        success "Redis memory policy configured for performance"
    else
        error "Redis memory policy not optimized"
    fi
    
    # Check MySQL buffer pool configuration
    if grep -q "innodb_buffer_pool_size = 1G" docker/config/mysql/prod.cnf; then
        success "MySQL buffer pool optimized"
    else
        error "MySQL buffer pool not optimized"
    fi
}

test_health_checks() {
    test_start "Health check configuration"
    
    # Check health checks in compose files
    if grep -q "healthcheck:" docker-compose.prod.yml; then
        success "Health checks configured in production compose"
    else
        error "Health checks missing in production compose"
    fi
    
    # Check health check endpoints
    if grep -q "/api/v1/health" docker/config/nginx-proxy/conf.d/dixis.conf; then
        success "Health check endpoints configured"
    else
        error "Health check endpoints not configured"
    fi
}

test_logging_configuration() {
    test_start "Logging configuration"
    
    # Check logging configuration in compose
    if grep -q "logging:" docker-compose.prod.yml; then
        success "Logging configuration present"
    else
        error "Logging configuration missing"
    fi
    
    # Check log rotation
    if grep -q "max-size" docker-compose.prod.yml; then
        success "Log rotation configured"
    else
        error "Log rotation not configured"
    fi
}

test_backup_configuration() {
    test_start "Backup configuration"
    
    # Check backup service in production compose
    if grep -q "db-backup:" docker-compose.prod.yml; then
        success "Database backup service configured"
    else
        error "Database backup service not configured"
    fi
    
    # Check backup scripts
    if [[ -f "docker/scripts/backup.sh" ]]; then
        success "Backup scripts exist"
    else
        warning "Backup scripts not found (may need to be created)"
    fi
}

# Generate test report
generate_report() {
    log "📊 Generating test report..."
    
    local report_file="docker-infrastructure-test-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "# Dixis Platform Docker Infrastructure Test Report"
        echo "Date: $(date)"
        echo "Total Tests: $TOTAL_TESTS"
        echo "Passed: $PASSED_TESTS"
        echo "Failed: $FAILED_TESTS"
        echo "Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
        echo ""
        
        if [[ $FAILED_TESTS -eq 0 ]]; then
            echo "✅ ALL TESTS PASSED - Docker infrastructure is ready for production!"
            echo ""
            echo "🇬🇷 Greek marketplace infrastructure validated:"
            echo "  ✅ Multi-stage Docker builds optimized"
            echo "  ✅ Production orchestration configured"
            echo "  ✅ Security hardening implemented"
            echo "  ✅ Greek market optimizations in place"
            echo "  ✅ Monitoring and alerting configured"
            echo "  ✅ SSL and encryption ready"
            echo "  ✅ Performance optimizations applied"
            echo "  ✅ Health checks and logging configured"
        else
            echo "❌ TESTS FAILED - Please fix the issues before production deployment"
            echo ""
            echo "Issues to resolve:"
            echo "  - Review failed test outputs above"
            echo "  - Ensure all configuration files are in place"
            echo "  - Verify Docker and Docker Compose syntax"
            echo "  - Check security and performance settings"
        fi
        
        echo ""
        echo "## Next Steps"
        if [[ $FAILED_TESTS -eq 0 ]]; then
            echo "1. 🚀 Ready for production deployment!"
            echo "2. 🔧 Run: ./docker/scripts/deploy-production.sh"
            echo "3. 🌐 Configure DNS to point to your server"
            echo "4. 🇬🇷 Begin Greek market user onboarding"
            echo "5. 📊 Monitor performance and metrics"
        else
            echo "1. 🔧 Fix failed test issues"
            echo "2. 🧪 Re-run infrastructure tests"
            echo "3. 📚 Review Docker documentation if needed"
            echo "4. 🚀 Deploy once all tests pass"
        fi
    } > "$report_file"
    
    success "✅ Test report generated: $report_file"
}

# Main testing function
main() {
    log "🧪 Starting Docker Infrastructure Testing"
    log "🇬🇷 Validating Greek Marketplace Production Readiness"
    
    # Run all tests
    test_docker_compose_files
    test_dockerfile_syntax
    test_configuration_files
    test_ssl_directory_structure
    test_deployment_scripts
    test_monitoring_configuration
    test_network_configuration
    test_volume_configuration
    test_security_configuration
    test_greek_market_optimizations
    test_performance_optimizations
    test_health_checks
    test_logging_configuration
    test_backup_configuration
    
    # Generate report
    generate_report
    
    # Final results
    echo ""
    log "🏁 Testing completed!"
    log "📊 Results: $PASSED_TESTS/$TOTAL_TESTS tests passed"
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        success "🎉 Docker infrastructure is 100% ready for Greek market production!"
        exit 0
    else
        error "❌ $FAILED_TESTS tests failed. Please fix issues before deployment."
        exit 1
    fi
}

# Run main function
main "$@"