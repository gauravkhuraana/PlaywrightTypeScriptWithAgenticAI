/**
 * Logger utility class for structured logging
 */
export class Logger {
  private readonly context: string;
  private readonly timestamp: string;

  constructor(context: string) {
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: any): void {
    this.log('ERROR', message, error);
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      this.log('DEBUG', message, data);
    }
  }

  /**
   * Log success message
   */
  success(message: string, data?: any): void {
    this.log('SUCCESS', message, data);
  }

  /**
   * Log step message (for test steps)
   */
  step(message: string, data?: any): void {
    this.log('STEP', message, data);
  }

  /**
   * Internal log method
   */
  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    
    // Choose appropriate console method based on level
    switch (level) {
      case 'ERROR':
        console.error(logMessage, data ? data : '');
        break;
      case 'WARN':
        console.warn(logMessage, data ? data : '');
        break;
      case 'DEBUG':
        console.debug(logMessage, data ? data : '');
        break;
      case 'SUCCESS':
        console.log(`✅ ${logMessage}`, data ? data : '');
        break;
      case 'STEP':
        console.log(`🔸 ${logMessage}`, data ? data : '');
        break;
      default:
        console.log(logMessage, data ? data : '');
    }

    // Write to file if enabled
    if (process.env.LOG_TO_FILE) {
      this.writeToFile(level, message, data);
    }
  }

  /**
   * Write log to file
   */
  private writeToFile(level: string, message: string, data?: any): void {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const logDir = 'test-results/logs';
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        context: this.context,
        message,
        data
      };
      
      const logFile = path.join(logDir, `test-${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: string): Logger {
    return new Logger(`${this.context}:${additionalContext}`);
  }

  /**
   * Log performance timing
   */
  timing(label: string, startTime: number): void {
    const duration = Date.now() - startTime;
    this.info(`Performance: ${label} took ${duration}ms`);
  }

  /**
   * Log with custom format
   */
  custom(level: string, message: string, data?: any): void {
    this.log(level, message, data);
  }
}
