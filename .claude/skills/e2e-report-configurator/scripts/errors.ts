/**
 * @spec T006-e2e-report-configurator
 * Error message catalog and error handling utilities
 */

/**
 * Error codes for E2E Report Configurator
 */
export enum ErrorCode {
  // Configuration errors (1xxx)
  CONFIG_NOT_FOUND = 'E1001',
  CONFIG_INVALID_STRUCTURE = 'E1002',
  CONFIG_MISSING_FIELD = 'E1003',
  CONFIG_BACKUP_FAILED = 'E1004',

  // Validation errors (2xxx)
  VALIDATION_TYPESCRIPT_FAILED = 'E2001',
  VALIDATION_PLAYWRIGHT_FAILED = 'E2002',
  VALIDATION_PATH_CONFLICT = 'E2003',
  VALIDATION_DIRECTORY_PERMISSION = 'E2004',

  // Directory errors (3xxx)
  DIRECTORY_CREATE_FAILED = 'E3001',
  DIRECTORY_NOT_WRITABLE = 'E3002',
  DIRECTORY_NOT_EXIST = 'E3003',

  // Reporter errors (4xxx)
  REPORTER_HTML_MISSING = 'E4001',
  REPORTER_INVALID_FORMAT = 'E4002',
  REPORTER_DUPLICATE_PATH = 'E4003',

  // Options errors (5xxx)
  OPTIONS_INVALID_FORMAT = 'E5001',
  OPTIONS_INVALID_ARTIFACTS = 'E5002',
  OPTIONS_INVALID_OUTPUT = 'E5003',

  // Documentation errors (6xxx)
  DOCS_GENERATION_FAILED = 'E6001',
  DOCS_WRITE_FAILED = 'E6002',

  // General errors (9xxx)
  UNKNOWN_ERROR = 'E9999'
}

/**
 * Error messages with user-friendly descriptions and solutions
 */
export const ERROR_MESSAGES: Record<
  ErrorCode,
  { title: string; description: string; solution: string }
> = {
  [ErrorCode.CONFIG_NOT_FOUND]: {
    title: 'Configuration File Not Found',
    description: 'The playwright.config.ts file does not exist in the current directory.',
    solution:
      'Run "npm init playwright@latest" to initialize Playwright, or specify the correct path with --config'
  },

  [ErrorCode.CONFIG_INVALID_STRUCTURE]: {
    title: 'Invalid Configuration Structure',
    description: 'The playwright.config.ts file is missing required fields.',
    solution:
      'Ensure your config has "reporter", "use.screenshot", "use.video", and "use.trace" fields'
  },

  [ErrorCode.CONFIG_MISSING_FIELD]: {
    title: 'Missing Required Field',
    description: 'A required field is missing from the Playwright configuration.',
    solution: 'Add the missing field to your playwright.config.ts file'
  },

  [ErrorCode.CONFIG_BACKUP_FAILED]: {
    title: 'Configuration Backup Failed',
    description: 'Failed to create a backup of the configuration file before updating.',
    solution: 'Check file permissions and disk space, then try again'
  },

  [ErrorCode.VALIDATION_TYPESCRIPT_FAILED]: {
    title: 'TypeScript Compilation Failed',
    description: 'The configuration file has TypeScript syntax errors.',
    solution:
      'Run "npx tsc --noEmit" to see detailed errors, then fix the syntax issues'
  },

  [ErrorCode.VALIDATION_PLAYWRIGHT_FAILED]: {
    title: 'Playwright Runtime Validation Failed',
    description: 'Playwright cannot load the configuration file.',
    solution:
      'Run "npx playwright test --list" to see detailed errors, verify the config structure'
  },

  [ErrorCode.VALIDATION_PATH_CONFLICT]: {
    title: 'Reporter Path Conflict',
    description: 'Multiple reporters are configured to use the same output path.',
    solution: 'Use unique output paths for each reporter format'
  },

  [ErrorCode.VALIDATION_DIRECTORY_PERMISSION]: {
    title: 'Directory Permission Error',
    description: 'The specified directory is not writable.',
    solution:
      'Check directory permissions with "ls -la" and fix with "chmod 755 <directory>"'
  },

  [ErrorCode.DIRECTORY_CREATE_FAILED]: {
    title: 'Directory Creation Failed',
    description: 'Failed to create required directories for test reports.',
    solution: 'Check disk space and parent directory permissions'
  },

  [ErrorCode.DIRECTORY_NOT_WRITABLE]: {
    title: 'Directory Not Writable',
    description: 'The directory exists but is not writable.',
    solution: 'Fix permissions with "chmod 755 <directory>"'
  },

  [ErrorCode.DIRECTORY_NOT_EXIST]: {
    title: 'Directory Does Not Exist',
    description: 'The specified directory does not exist.',
    solution: 'Run the setup command first to create required directories'
  },

  [ErrorCode.REPORTER_HTML_MISSING]: {
    title: 'HTML Reporter Required',
    description: 'HTML reporter is mandatory but not specified.',
    solution: 'Include "html" in the --format parameter (e.g., --format html,json)'
  },

  [ErrorCode.REPORTER_INVALID_FORMAT]: {
    title: 'Invalid Reporter Format',
    description: 'The specified reporter format is not supported.',
    solution: 'Use one of: html, json, junit (e.g., --format html,json,junit)'
  },

  [ErrorCode.REPORTER_DUPLICATE_PATH]: {
    title: 'Duplicate Reporter Path',
    description: 'The same output path is used by multiple reporters.',
    solution: 'Configure unique output directories for each reporter'
  },

  [ErrorCode.OPTIONS_INVALID_FORMAT]: {
    title: 'Invalid Format Option',
    description: 'The --format parameter value is invalid.',
    solution:
      'Use comma-separated formats: html, html,json, or html,json,junit'
  },

  [ErrorCode.OPTIONS_INVALID_ARTIFACTS]: {
    title: 'Invalid Artifacts Policy',
    description: 'The --artifacts parameter value is invalid.',
    solution: 'Use one of: on-failure, always, never'
  },

  [ErrorCode.OPTIONS_INVALID_OUTPUT]: {
    title: 'Invalid Output Directory',
    description: 'The --output parameter value is invalid.',
    solution: 'Provide a relative path (e.g., reports/e2e or test-results)'
  },

  [ErrorCode.DOCS_GENERATION_FAILED]: {
    title: 'Documentation Generation Failed',
    description: 'Failed to generate CI/CD documentation.',
    solution: 'Check the error details and try again'
  },

  [ErrorCode.DOCS_WRITE_FAILED]: {
    title: 'Documentation Write Failed',
    description: 'Failed to write documentation to file.',
    solution: 'Check directory permissions and disk space'
  },

  [ErrorCode.UNKNOWN_ERROR]: {
    title: 'Unknown Error',
    description: 'An unexpected error occurred.',
    solution: 'Check the error details and contact support if the issue persists'
  }
}

/**
 * Custom error class with error codes
 */
export class ConfiguratorError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message?: string,
    public readonly details?: any
  ) {
    const errorInfo = ERROR_MESSAGES[code]
    super(message || errorInfo.description)
    this.name = 'ConfiguratorError'
  }

  /**
   * Formats error as user-friendly message
   */
  format(): string {
    const errorInfo = ERROR_MESSAGES[this.code]
    const lines: string[] = []

    lines.push(`❌ ${errorInfo.title}`)
    lines.push('')
    lines.push(`Code: ${this.code}`)
    lines.push(`Description: ${this.message}`)
    lines.push('')
    lines.push(`💡 Solution: ${errorInfo.solution}`)

    if (this.details) {
      lines.push('')
      lines.push('Details:')
      lines.push(JSON.stringify(this.details, null, 2))
    }

    return lines.join('\n')
  }
}

/**
 * Creates a ConfiguratorError
 *
 * @param code - Error code
 * @param message - Optional custom message
 * @param details - Optional error details
 * @returns ConfiguratorError instance
 *
 * @example
 * ```ts
 * throw createError(ErrorCode.CONFIG_NOT_FOUND, 'Custom message', { path: '/path/to/config' })
 * ```
 */
export function createError(
  code: ErrorCode,
  message?: string,
  details?: any
): ConfiguratorError {
  return new ConfiguratorError(code, message, details)
}

/**
 * Formats any error as user-friendly message
 *
 * @param error - Error object
 * @returns Formatted error message
 *
 * @example
 * ```ts
 * try {
 *   // ...
 * } catch (error) {
 *   console.error(formatError(error))
 * }
 * ```
 */
export function formatError(error: unknown): string {
  if (error instanceof ConfiguratorError) {
    return error.format()
  }

  if (error instanceof Error) {
    return `❌ Error: ${error.message}`
  }

  return `❌ Unknown error: ${String(error)}`
}
