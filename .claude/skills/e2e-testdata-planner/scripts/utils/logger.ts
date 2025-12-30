/**
 * @spec T004-e2e-testdata-planner
 * Simple logging utility with colored output
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Current log level (can be controlled by environment variable)
let currentLogLevel = LogLevel.INFO;

// Check if LOG_LEVEL environment variable is set
if (process.env.LOG_LEVEL) {
  const envLevel = process.env.LOG_LEVEL.toUpperCase();
  if (envLevel in LogLevel) {
    currentLogLevel = LogLevel[envLevel as keyof typeof LogLevel] as LogLevel;
  }
}

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  debug: '\x1b[90m', // Gray
  info: '\x1b[36m', // Cyan
  success: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  section: '\x1b[1m\x1b[35m', // Bold Magenta
  step: '\x1b[34m', // Blue
};

/**
 * Format timestamp for log messages
 */
function timestamp(): string {
  const now = new Date();
  return now.toISOString().substring(11, 23); // HH:MM:SS.mmm
}

/**
 * Log a debug message (only shown when LOG_LEVEL=DEBUG)
 */
export function debug(message: string, ...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.log(`${colors.debug}[${timestamp()}] [DEBUG] ${message}${colors.reset}`, ...args);
  }
}

/**
 * Log an info message
 */
export function info(message: string, ...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(`${colors.info}[${timestamp()}] [INFO] ${message}${colors.reset}`, ...args);
  }
}

/**
 * Log a success message
 */
export function success(message: string, ...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(`${colors.success}✅ ${message}${colors.reset}`, ...args);
  }
}

/**
 * Log a warning message
 */
export function warn(message: string, ...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`${colors.warn}[${timestamp()}] [WARN] ${message}${colors.reset}`, ...args);
  }
}

/**
 * Log an error message
 */
export function error(message: string, ...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`${colors.error}[${timestamp()}] [ERROR] ${message}${colors.reset}`, ...args);
  }
}

/**
 * Log a section header (for CLI output organization)
 */
export function section(title: string): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(`\n${colors.section}═══ ${title} ═══${colors.reset}\n`);
  }
}

/**
 * Log a numbered step (for multi-step processes)
 */
export function step(stepNumber: number, message: string): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log(`${colors.step}${stepNumber}. ${message}${colors.reset}`);
  }
}

/**
 * Set the current log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Get the current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}
