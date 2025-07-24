#!/bin/bash

# Dixis Load Testing Script
# Usage: ./scripts/load-test.sh [test-type] [duration]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BASE_URL=${1:-"http://localhost"}
TEST_DURATION=${2:-"60s"}
CONCURRENT_USERS=${3:-"10"}
TEST_TYPE=${4:-"basic"}

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v curl &> /dev/null; then
        error "curl is not installed. Please install curl first."
    fi
    
    if ! command -v ab &> /dev/null; then
        warning "Apache Bench (ab) is not installed. Some tests will be skipped."
        warning "Install with: sudo apt-get install apache2-utils (Ubuntu) or brew install apache2 (macOS)"
    fi
    
    success "Dependencies check completed"
}

# Basic health check
health_check() {
    log "Performing health check..."
    
    # Check frontend
    if curl -f -s "$BASE_URL:3000" > /dev/null; then
        success "Frontend is responding"
    else
        warning "Frontend is not responding"
    fi
    
    # Check backend API
    if curl -f -s "$BASE_URL:8000/api/health" > /dev/null; then
        success "Backend API is responding"
    else
        warning "Backend API is not responding"
    fi
    
    # Check monitoring
    if curl -f -s "$BASE_URL:9090" > /dev/null; then
        success "Prometheus is responding"
    else
        warning "Prometheus is not responding"
    fi
}

# Basic load test using curl
basic_load_test() {
    log "Starting basic load test..."
    
    local start_time=$(date +%s)
    local success_count=0
    local error_count=0
    
    # Test endpoints
    local endpoints=(
        "$BASE_URL:3000"
        "$BASE_URL:8000/api/health"
        "$BASE_URL:8000/api/v1/products"
        "$BASE_URL:8000/api/v1/categories"
        "$BASE_URL:8000/api/v1/producers"
    )
    
    log "Testing ${#endpoints[@]} endpoints for $TEST_DURATION..."
    
    for endpoint in "${endpoints[@]}"; do
        log "Testing: $endpoint"
        
        for i in {1..10}; do
            if curl -f -s "$endpoint" > /dev/null 2>&1; then
                ((success_count++))
                echo -n "."
            else
                ((error_count++))
                echo -n "x"
            fi
        done
        echo ""
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local total_requests=$((success_count + error_count))
    local success_rate=$(echo "scale=2; $success_count * 100 / $total_requests" | bc -l 2>/dev/null || echo "N/A")
    
    echo ""
    success "Basic load test completed"
    log "Duration: ${duration}s"
    log "Total requests: $total_requests"
    log "Successful requests: $success_count"
    log "Failed requests: $error_count"
    log "Success rate: ${success_rate}%"
}

# Apache Bench load test
ab_load_test() {
    if ! command -v ab &> /dev/null; then
        warning "Apache Bench not available, skipping AB test"
        return
    fi
    
    log "Starting Apache Bench load test..."
    
    local endpoints=(
        "$BASE_URL:3000/"
        "$BASE_URL:8000/api/health"
        "$BASE_URL:8000/api/v1/products"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log "AB Testing: $endpoint"
        
        # Create results directory
        mkdir -p results
        
        # Run AB test
        ab -n 100 -c $CONCURRENT_USERS "$endpoint" > "results/ab_$(basename $endpoint)_$(date +%s).txt" 2>&1
        
        if [ $? -eq 0 ]; then
            success "AB test completed for $endpoint"
        else
            warning "AB test failed for $endpoint"
        fi
    done
    
    success "Apache Bench tests completed. Results saved in results/ directory"
}

# Stress test with progressive load
stress_test() {
    log "Starting progressive stress test..."
    
    local endpoint="$BASE_URL:8000/api/v1/products"
    local concurrent_levels=(1 5 10 20 50)
    
    for level in "${concurrent_levels[@]}"; do
        log "Testing with $level concurrent users..."
        
        local start_time=$(date +%s)
        local pids=()
        
        # Start concurrent requests
        for ((i=1; i<=level; i++)); do
            (
                for ((j=1; j<=20; j++)); do
                    curl -f -s "$endpoint" > /dev/null 2>&1
                done
            ) &
            pids+=($!)
        done
        
        # Wait for all requests to complete
        for pid in "${pids[@]}"; do
            wait $pid
        done
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log "Level $level completed in ${duration}s"
        
        # Brief pause between levels
        sleep 2
    done
    
    success "Progressive stress test completed"
}

# Database performance test
db_performance_test() {
    log "Starting database performance test..."
    
    local api_endpoint="$BASE_URL:8000/api/v1"
    local endpoints=(
        "$api_endpoint/products?limit=100"
        "$api_endpoint/products?category=1"
        "$api_endpoint/products?producer=1"
        "$api_endpoint/categories"
        "$api_endpoint/producers"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log "Testing DB query: $endpoint"
        
        local start_time=$(date +%s%3N)
        
        if curl -f -s "$endpoint" > /dev/null; then
            local end_time=$(date +%s%3N)
            local response_time=$((end_time - start_time))
            
            if [ $response_time -lt 1000 ]; then
                success "Query completed in ${response_time}ms (FAST)"
            elif [ $response_time -lt 3000 ]; then
                warning "Query completed in ${response_time}ms (ACCEPTABLE)"
            else
                error "Query completed in ${response_time}ms (SLOW)"
            fi
        else
            error "Query failed for $endpoint"
        fi
    done
    
    success "Database performance test completed"
}

# Memory and resource monitoring
resource_monitoring() {
    log "Starting resource monitoring during load test..."
    
    # Monitor for 60 seconds
    local duration=60
    local interval=5
    local iterations=$((duration / interval))
    
    log "Monitoring system resources for ${duration}s..."
    
    for ((i=1; i<=iterations; i++)); do
        echo "=== Iteration $i/$(($iterations)) ===" >> results/resource_monitor.log
        echo "Time: $(date)" >> results/resource_monitor.log
        
        # Docker stats (if available)
        if command -v docker &> /dev/null; then
            echo "Docker Stats:" >> results/resource_monitor.log
            docker stats --no-stream >> results/resource_monitor.log 2>/dev/null || echo "Docker stats not available" >> results/resource_monitor.log
        fi
        
        # System resources
        echo "System Resources:" >> results/resource_monitor.log
        echo "Memory: $(free -h | grep Mem)" >> results/resource_monitor.log 2>/dev/null || echo "Memory info not available" >> results/resource_monitor.log
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')" >> results/resource_monitor.log 2>/dev/null || echo "CPU info not available" >> results/resource_monitor.log
        echo "" >> results/resource_monitor.log
        
        sleep $interval
    done
    
    success "Resource monitoring completed. Check results/resource_monitor.log"
}

# Generate test report
generate_report() {
    log "Generating test report..."
    
    cat > results/load_test_report.md << EOF
# Dixis Load Test Report

**Date**: $(date)
**Base URL**: $BASE_URL
**Test Duration**: $TEST_DURATION
**Concurrent Users**: $CONCURRENT_USERS
**Test Type**: $TEST_TYPE

## Test Configuration
- Frontend URL: $BASE_URL:3000
- Backend API: $BASE_URL:8000
- Monitoring: $BASE_URL:9090

## Test Results

### Health Check
$(if [ -f results/health_check.log ]; then cat results/health_check.log; else echo "No health check results"; fi)

### Performance Summary
- All test results are stored in the results/ directory
- Check individual test files for detailed metrics
- Resource monitoring data available in resource_monitor.log

## Recommendations

### Performance Optimizations
1. Review slow database queries (>3000ms)
2. Consider Redis caching for frequently accessed data
3. Optimize image loading and static assets
4. Monitor memory usage during peak loads

### Scaling Considerations
1. Database connection pooling
2. CDN for static assets
3. Load balancer configuration
4. Horizontal scaling strategy

### Monitoring Setup
1. Configure Prometheus alerts for high response times
2. Set up Grafana dashboards for real-time monitoring
3. Implement application performance monitoring (APM)
4. Log aggregation and analysis

---

*Report generated by Dixis Load Testing Script*
EOF

    success "Test report generated: results/load_test_report.md"
}

# Main execution
main() {
    log "Starting Dixis load testing..."
    
    # Create results directory
    mkdir -p results
    
    # Check dependencies
    check_dependencies
    
    # Perform tests based on type
    case $TEST_TYPE in
        "basic")
            health_check
            basic_load_test
            ;;
        "full")
            health_check
            basic_load_test
            ab_load_test
            db_performance_test
            ;;
        "stress")
            health_check
            stress_test
            resource_monitoring &
            MONITOR_PID=$!
            sleep 60
            kill $MONITOR_PID 2>/dev/null || true
            ;;
        "performance")
            health_check
            db_performance_test
            ab_load_test
            ;;
        *)
            error "Unknown test type: $TEST_TYPE. Use: basic, full, stress, or performance"
            ;;
    esac
    
    # Generate report
    generate_report
    
    success "Load testing completed! Check results/ directory for detailed reports."
    
    log "Quick start commands:"
    log "• View results: ls -la results/"
    log "• Read report: cat results/load_test_report.md"
    log "• Monitor resources: tail -f results/resource_monitor.log"
}

# Help message
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Dixis Load Testing Script"
    echo ""
    echo "Usage: $0 [base-url] [duration] [concurrent-users] [test-type]"
    echo ""
    echo "Parameters:"
    echo "  base-url         Base URL (default: http://localhost)"
    echo "  duration         Test duration (default: 60s)"
    echo "  concurrent-users Number of concurrent users (default: 10)"
    echo "  test-type        Type of test: basic, full, stress, performance (default: basic)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Basic test with defaults"
    echo "  $0 http://localhost 120s 20 full     # Full test for 2 minutes with 20 users"
    echo "  $0 https://dixis.io 300s 50 stress   # Stress test for 5 minutes with 50 users"
    echo ""
    echo "Test Types:"
    echo "  basic       - Simple health checks and basic load test"
    echo "  full        - Complete testing suite with AB and DB tests"
    echo "  stress      - Progressive load testing with resource monitoring"
    echo "  performance - Focus on database and API performance"
    exit 0
fi

# Run main function
main "$@"