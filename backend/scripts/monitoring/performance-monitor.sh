#!/bin/bash
# Dixis Fresh Performance Monitor

LOG_FILE="/var/log/dixis/performance.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=80
ALERT_THRESHOLD_RESPONSE_TIME=2000

log_metric() {
    echo "$(date +'%Y-%m-%d %H:%M:%S'),$1,$2" >> "${LOG_FILE}"
}

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
log_metric "cpu_usage" "${CPU_USAGE}"

# Memory Usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
log_metric "memory_usage" "${MEMORY_USAGE}"

# Response Time
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://dixis.gr | awk '{print $1 * 1000}')
log_metric "response_time_ms" "${RESPONSE_TIME}"

# Database Connections
DB_CONNECTIONS=$(mysql -u${DB_USERNAME} -p${DB_PASSWORD} -h${DB_HOST} -e "SHOW STATUS LIKE 'Threads_connected';" | tail -1 | awk '{print $2}')
log_metric "db_connections" "${DB_CONNECTIONS}"

# Queue Size
QUEUE_SIZE=$(php artisan queue:monitor | grep "pending" | awk '{print $2}' || echo "0")
log_metric "queue_size" "${QUEUE_SIZE}"

echo "Performance metrics logged at $(date)"