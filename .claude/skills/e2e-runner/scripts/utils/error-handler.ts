/**
 * @spec T003-e2e-runner
 * Custom error classes and error handling utilities (T011)
 */

/**
 * Base error class for all e2e-runner errors
 */
export class E2ERunnerError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'E2ERunnerError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when configuration validation fails
 */
export class ConfigValidationError extends E2ERunnerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIG_VALIDATION_ERROR', details);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Error thrown when credentials file is invalid or cannot be loaded
 */
export class CredentialsError extends E2ERunnerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CREDENTIALS_ERROR', details);
    this.name = 'CredentialsError';
  }
}

/**
 * Error thrown when test execution fails
 */
export class TestExecutionError extends E2ERunnerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TEST_EXECUTION_ERROR', details);
    this.name = 'TestExecutionError';
  }
}

/**
 * Error thrown when report generation fails
 */
export class ReportGenerationError extends E2ERunnerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'REPORT_GENERATION_ERROR', details);
    this.name = 'ReportGenerationError';
  }
}

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends E2ERunnerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'FILE_OPERATION_ERROR', details);
    this.name = 'FileOperationError';
  }
}

/**
 * Format error for CLI output
 * @param error - Error to format
 * @returns Formatted error message
 */
export function formatError(error: unknown): string {
  if (error instanceof E2ERunnerError) {
    let message = `[${error.code}] ${error.message}`;
    if (error.details && Object.keys(error.details).length > 0) {
      message += `\nDetails: ${JSON.stringify(error.details, null, 2)}`;
    }
    return message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Check if error is a specific type of E2ERunnerError
 * @param error - Error to check
 * @param ErrorClass - Error class to check against
 * @returns true if error is instance of ErrorClass
 */
export function isErrorType<T extends E2ERunnerError>(
  error: unknown,
  ErrorClass: new (...args: any[]) => T
): error is T {
  return error instanceof ErrorClass;
}
