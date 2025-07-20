import { toError, errorToContext } from '@/lib/utils/errorUtils';

/**
 * Production logging service with multiple levels and remote logging
 */

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
}

class ProductionLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: process.env.NODE_ENV === 'development',
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: '/api/monitoring/logs',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if log level should be processed
   */
  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= configLevelIndex;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      context
    };

    // Add error stack if available
    if (error) {
      entry.stack = error.stack;
    }

    // Add browser context if available
    if (typeof window !== 'undefined') {
      entry.url = window.location.href;
      entry.userAgent = navigator.userAgent;
    }

    // Add user ID if available (from auth context)
    try {
      const user = this.getCurrentUser();
      if (user) {
        entry.userId = user.id;
      }
    } catch (e) {
      // Ignore errors getting user context
    }

    return entry;
  }

  /**
   * Get current user (implement based on your auth system)
   */
  private getCurrentUser(): { id: string } | null {
    // This should be implemented based on your authentication system
    // For example, reading from localStorage, context, or cookies
    if (typeof window === 'undefined') return null; // Server-side

    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Log to console if enabled
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const style = this.getConsoleStyle(entry.level);
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
    
    console.log(
      `%c${prefix}`,
      style,
      entry.message,
      entry.context ? entry.context : ''
    );

    if (entry.stack) {
      console.log(entry.stack);
    }
  }

  /**
   * Get console styling for log level
   */
  private getConsoleStyle(level: LogEntry['level']): string {
    const styles = {
      debug: 'color: #6B7280',
      info: 'color: #3B82F6',
      warn: 'color: #F59E0B; font-weight: bold',
      error: 'color: #EF4444; font-weight: bold',
      fatal: 'color: #DC2626; font-weight: bold; background: #FEE2E2'
    };
    return styles[level];
  }

  /**
   * Add log entry to buffer
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Flush immediately for error and fatal logs
    if (entry.level === 'error' || entry.level === 'fatal') {
      this.flush();
    } else if (this.logBuffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (typeof window === 'undefined') return; // Server-side

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * Flush logs to remote endpoint
   */
  private async flush(): Promise<void> {
    if (!this.config.enableRemote || this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await this.sendLogs(logsToSend);
    } catch (error) {
      // If sending fails, add logs back to buffer for retry
      this.logBuffer.unshift(...logsToSend);
      console.warn('Failed to send logs to remote endpoint:', error);
    }
  }

  /**
   * Send logs to remote endpoint with retry logic
   */
  private async sendLogs(logs: LogEntry[], retryCount = 0): Promise<void> {
    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          this.sendLogs(logs, retryCount + 1);
        }, delay);
      } else {
        throw error;
      }
    }
  }

  /**
   * Main logging method
   */
  private log(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);
    
    this.logToConsole(entry);
    this.addToBuffer(entry);
  }

  /**
   * Public logging methods
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  public error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    // Handle the case where error is unknown and needs to be converted
    const convertedError = error instanceof Error ? error : (error ? toError(error) : undefined);
    this.log('error', message, context, convertedError);
  }

  public fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('fatal', message, context, error);
  }

  /**
   * Log API calls
   */
  public apiCall(method: string, url: string, status: number, duration: number): void {
    this.info('API Call', {
      method,
      url,
      status,
      duration,
      type: 'api_call'
    });
  }

  /**
   * Log user actions
   */
  public userAction(action: string, details?: Record<string, any>): void {
    this.info('User Action', {
      action,
      ...details,
      type: 'user_action'
    });
  }

  /**
   * Log performance metrics
   */
  public performance(metric: string, value: number, context?: Record<string, any>): void {
    this.info('Performance Metric', {
      metric,
      value,
      ...context,
      type: 'performance'
    });
  }

  /**
   * Flush all pending logs immediately
   */
  public async flushNow(): Promise<void> {
    await this.flush();
  }

  /**
   * Destroy logger and cleanup
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush(); // Final flush
  }
}

// Create singleton instance with safe initialization
let logger: ProductionLogger;

try {
  logger = new ProductionLogger();
} catch (error) {
  // Fallback logger if initialization fails
  logger = {
    debug: (message: string, context?: Record<string, any>) => console.log('[DEBUG]', message, context),
    info: (message: string, context?: Record<string, any>) => console.log('[INFO]', message, context),
    warn: (message: string, context?: Record<string, any>) => console.warn('[WARN]', message, context),
    error: (message: string, error?: Error | unknown, context?: Record<string, any>) => console.error('[ERROR]', message, error, context),
    fatal: (message: string, error?: Error, context?: Record<string, any>) => console.error('[FATAL]', message, error, context),
    apiCall: (method: string, url: string, status: number, duration: number) => console.log('[API]', method, url, status, duration),
    userAction: (action: string, details?: Record<string, any>) => console.log('[USER]', action, details),
    performance: (metric: string, value: number, context?: Record<string, any>) => console.log('[PERF]', metric, value, context),
    flushNow: async () => Promise.resolve(),
    destroy: () => {}
  } as any;
}

// Safe global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    try {
      logger.error('Global Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    } catch (e) {
      console.error('Logger error:', e);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      logger.error('Unhandled Promise Rejection', toError(event.reason), errorToContext(event.reason));
    } catch (e) {
      console.error('Logger error:', e);
    }
  });
}

export { ProductionLogger, logger };
export type { LogEntry, LoggerConfig };
export default logger;
