/**
 * @spec T006-e2e-report-configurator
 * Logging utility for structured output
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  level?: LogLevel
  /** Enable colorized output */
  colors?: boolean
  /** Enable timestamps */
  timestamps?: boolean
}

/**
 * ANSI color codes
 */
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private level: LogLevel
  private colors: boolean
  private timestamps: boolean

  constructor(config: LoggerConfig = {}) {
    this.level = config.level ?? LogLevel.INFO
    this.colors = config.colors ?? true
    this.timestamps = config.timestamps ?? false
  }

  /**
   * Formats log message with optional color and timestamp
   */
  private format(
    level: string,
    message: string,
    color?: string
  ): string {
    const parts: string[] = []

    if (this.timestamps) {
      const timestamp = new Date().toISOString()
      parts.push(`[${timestamp}]`)
    }

    parts.push(`[${level}]`)
    parts.push(message)

    const formatted = parts.join(' ')

    if (this.colors && color) {
      return `${color}${formatted}${COLORS.reset}`
    }

    return formatted
  }

  /**
   * Debug log (lowest priority)
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.format('DEBUG', message, COLORS.dim), ...args)
    }
  }

  /**
   * Info log (general information)
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.format('INFO', message, COLORS.cyan), ...args)
    }
  }

  /**
   * Success log (positive outcome)
   */
  success(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.format('✓', message, COLORS.green), ...args)
    }
  }

  /**
   * Warning log (potential issues)
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.format('WARN', message, COLORS.yellow), ...args)
    }
  }

  /**
   * Error log (failures)
   */
  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.format('ERROR', message, COLORS.red), ...args)
    }
  }

  /**
   * Step log (workflow progress)
   */
  step(step: number, total: number, message: string): void {
    if (this.level <= LogLevel.INFO) {
      const prefix = `[${step}/${total}]`
      console.log(this.format(prefix, message, COLORS.blue))
    }
  }

  /**
   * Spinner-style progress (single line update)
   */
  progress(message: string): void {
    if (this.level <= LogLevel.INFO) {
      process.stdout.write(`\r${this.format('⏳', message, COLORS.cyan)}`)
    }
  }

  /**
   * Clear progress line
   */
  clearProgress(): void {
    if (this.level <= LogLevel.INFO) {
      process.stdout.write('\r\x1b[K')
    }
  }

  /**
   * Creates a child logger with same config
   */
  child(config?: Partial<LoggerConfig>): Logger {
    return new Logger({
      level: config?.level ?? this.level,
      colors: config?.colors ?? this.colors,
      timestamps: config?.timestamps ?? this.timestamps
    })
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger()

/**
 * Creates a logger with custom configuration
 *
 * @param config - Logger configuration
 * @returns Configured logger instance
 *
 * @example
 * ```ts
 * const logger = createLogger({ level: LogLevel.DEBUG, timestamps: true })
 * logger.debug('Detailed debug information')
 * logger.info('General information')
 * logger.success('Operation completed')
 * logger.warn('Potential issue detected')
 * logger.error('Operation failed')
 * ```
 */
export function createLogger(config?: LoggerConfig): Logger {
  return new Logger(config)
}
