/**
 * @spec T003-e2e-runner
 * CLI logging utilities with chalk-based colored output (T010)
 */

import chalk from 'chalk';

/**
 * Log informational message (blue)
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function info(message: string, ...args: unknown[]): void {
  console.log(chalk.blue('[INFO]'), message, ...args);
}

/**
 * Log success message (green)
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function success(message: string, ...args: unknown[]): void {
  console.log(chalk.green('[SUCCESS]'), message, ...args);
}

/**
 * Log error message (red)
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function error(message: string, ...args: unknown[]): void {
  console.error(chalk.red('[ERROR]'), message, ...args);
}

/**
 * Log warning message (yellow)
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function warn(message: string, ...args: unknown[]): void {
  console.warn(chalk.yellow('[WARN]'), message, ...args);
}

/**
 * Log debug message (gray) - only if DEBUG env var is set
 * @param message - Message to log
 * @param args - Additional arguments to log
 */
export function debug(message: string, ...args: unknown[]): void {
  if (process.env.DEBUG) {
    console.log(chalk.gray('[DEBUG]'), message, ...args);
  }
}

/**
 * Log a formatted section header
 * @param title - Section title
 */
export function section(title: string): void {
  console.log();
  console.log(chalk.bold.cyan(`=== ${title} ===`));
  console.log();
}

/**
 * Log a step in a multi-step process
 * @param step - Step number
 * @param total - Total number of steps
 * @param message - Step description
 */
export function step(step: number, total: number, message: string): void {
  console.log(chalk.magenta(`[${step}/${total}]`), message);
}
