/**
 * @spec T004-e2e-testdata-planner
 * Custom error classes for E2E testdata planner
 */

/**
 * Blueprint validation error
 * Thrown when a blueprint fails schema validation
 */
export class BlueprintValidationError extends Error {
  public readonly blueprintId: string;

  constructor(blueprintId: string, validationMessage: string) {
    super(`Blueprint validation failed for ${blueprintId}: ${validationMessage}`);
    this.name = 'BlueprintValidationError';
    this.blueprintId = blueprintId;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BlueprintValidationError);
    }
  }
}

/**
 * Circular dependency error
 * Thrown when a circular dependency is detected in the dependency graph
 */
export class CircularDependencyError extends Error {
  public readonly cycle: string[];

  constructor(cycle: string[]) {
    const cyclePath = cycle.join(' → ');
    super(`Circular dependency detected: ${cyclePath}`);
    this.name = 'CircularDependencyError';
    this.cycle = cycle;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CircularDependencyError);
    }
  }
}

/**
 * Environment mismatch error
 * Thrown when a blueprint is used in an environment it's not configured for
 */
export class EnvironmentMismatchError extends Error {
  public readonly blueprintId: string;
  public readonly currentEnv: string;
  public readonly allowedEnvs: string[];

  constructor(blueprintId: string, currentEnv: string, allowedEnvs: string[]) {
    super(
      `Blueprint ${blueprintId} is not available for environment "${currentEnv}". ` +
        `Allowed environments: ${allowedEnvs.join(', ')}`
    );
    this.name = 'EnvironmentMismatchError';
    this.blueprintId = blueprintId;
    this.currentEnv = currentEnv;
    this.allowedEnvs = allowedEnvs;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnvironmentMismatchError);
    }
  }
}

/**
 * Seed file not found error
 * Thrown when a referenced seed file doesn't exist
 */
export class SeedFileNotFoundError extends Error {
  public readonly filePath: string;

  constructor(filePath: string) {
    super(`Seed file not found: ${filePath}`);
    this.name = 'SeedFileNotFoundError';
    this.filePath = filePath;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SeedFileNotFoundError);
    }
  }
}

/**
 * Database script error
 * Thrown when a SQL script fails to execute
 */
export class DbScriptError extends Error {
  public readonly scriptPath: string;
  public readonly sqlError: string;

  constructor(scriptPath: string, sqlError: string) {
    super(`Database script execution failed for ${scriptPath}: ${sqlError}`);
    this.name = 'DbScriptError';
    this.scriptPath = scriptPath;
    this.sqlError = sqlError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DbScriptError);
    }
  }
}

/**
 * API call error
 * Thrown when an API call fails during data setup
 */
export class ApiCallError extends Error {
  public readonly endpoint: string;
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly responseBody?: unknown;

  constructor(endpoint: string, statusCode: number, statusText: string, responseBody?: unknown) {
    let message = `API call failed for ${endpoint}: ${statusCode} ${statusText}`;

    if (responseBody) {
      message += `\nResponse: ${JSON.stringify(responseBody, null, 2)}`;
    }

    super(message);
    this.name = 'ApiCallError';
    this.endpoint = endpoint;
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.responseBody = responseBody;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiCallError);
    }
  }
}
