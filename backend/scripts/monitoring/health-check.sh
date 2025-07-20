#!/bin/bash
# Dixis Fresh Health Check Script

# Configuration
APP_URL="${APP_URL:-https://dixis.gr}"
DB_CHECK_TIMEOUT=5
REDIS_CHECK_TIMEOUT=3
LOG_FILE="/var/log/dixis/health.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

check_http() {
    log "Checking HTTP response..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/health" --max-time 10)
    if [ "${HTTP_STATUS}" = "200" ]; then
        log "${GREEN}✅ HTTP: OK (200)${NC}"
        return 0
    else
        log "${RED}❌ HTTP: FAILED (${HTTP_STATUS})${NC}"
        return 1
    fi
}

check_database() {
    log "Checking database connection..."
    if timeout ${DB_CHECK_TIMEOUT} php artisan migrate:status >/dev/null 2>&1; then
        log "${GREEN}✅ Database: OK${NC}"
        return 0
    else
        log "${RED}❌ Database: FAILED${NC}"
        return 1
    fi
}

check_redis() {
    log "Checking Redis connection..."
    if timeout ${REDIS_CHECK_TIMEOUT} redis-cli ping >/dev/null 2>&1; then
        log "${GREEN}✅ Redis: OK${NC}"
        return 0
    else
        log "${RED}❌ Redis: FAILED${NC}"
        return 1
    fi
}

check_queue() {
    log "Checking queue workers..."
    QUEUE_WORKERS=$(ps aux | grep "queue:work" | grep -v grep | wc -l)
    if [ "${QUEUE_WORKERS}" -gt 0 ]; then
        log "${GREEN}✅ Queue: OK (${QUEUE_WORKERS} workers)${NC}"
        return 0
    else
        log "${YELLOW}⚠️  Queue: No workers running${NC}"
        return 1
    fi
}

check_storage() {
    log "Checking storage space..."
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "${DISK_USAGE}" -lt 90 ]; then
        log "${GREEN}✅ Storage: OK (${DISK_USAGE}% used)${NC}"
        return 0
    else
        log "${RED}❌ Storage: CRITICAL (${DISK_USAGE}% used)${NC}"
        return 1
    fi
}

# Main health check
log "Starting health check..."

CHECKS_PASSED=0
TOTAL_CHECKS=5

check_http && ((CHECKS_PASSED++))
check_database && ((CHECKS_PASSED++))
check_redis && ((CHECKS_PASSED++))
check_queue && ((CHECKS_PASSED++))
check_storage && ((CHECKS_PASSED++))

log "Health check completed: ${CHECKS_PASSED}/${TOTAL_CHECKS} checks passed"

if [ "${CHECKS_PASSED}" -eq "${TOTAL_CHECKS}" ]; then
    log "${GREEN}✅ All systems healthy${NC}"
    exit 0
elif [ "${CHECKS_PASSED}" -ge 3 ]; then
    log "${YELLOW}⚠️  Some issues detected but system functional${NC}"
    exit 1
else
    log "${RED}❌ Critical issues detected${NC}"
    exit 2
fi