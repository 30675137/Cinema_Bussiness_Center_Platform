/**
 * @spec T003-e2e-runner
 * Configuration validation utilities (T040, T041)
 */

import type { E2ERunConfig } from './schemas';
import { E2ERunConfigSchema } from './schemas';
import { fileExists } from './utils/file-utils';
import { ConfigValidationError } from './utils/error-handler';

/**
 * Validate E2ERunConfig with comprehensive checks (T040)
 * @param config - E2ERunConfig to validate
 * @throws ConfigValidationError if validation fails
 */
export function validateConfig(config: E2ERunConfig): void {
  // First, try basic URL parsing for clear error messages
  try {
    const url = new URL(config.baseURL);
    if (!url.protocol.startsWith('http')) {
      throw new ConfigValidationError(
        'baseURL must start with http:// or https://',
        { baseURL: config.baseURL }
      );
    }
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      throw error;
    }
    throw new ConfigValidationError('baseURL must be a valid URL', {
      baseURL: config.baseURL,
    });
  }

  // Then use Zod schema for comprehensive validation
  try {
    E2ERunConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof Error) {
      throw new ConfigValidationError(
        `Configuration validation failed: ${error.message}`,
        { config }
      );
    }
    throw new ConfigValidationError('Configuration validation failed', { config });
  }

  // Additional validation: Check env_profile pattern
  const envProfilePattern = /^[a-z0-9-]+$/;
  if (!envProfilePattern.test(config.env_profile)) {
    throw new ConfigValidationError(
      'env_profile must be lowercase alphanumeric with hyphens only',
      { env_profile: config.env_profile }
    );
  }

  // Additional validation: Check retries range
  if (config.retries < 0) {
    throw new ConfigValidationError('retries must be >= 0', {
      retries: config.retries,
    });
  }
  if (config.retries > 5) {
    throw new ConfigValidationError('retries must be <= 5', {
      retries: config.retries,
    });
  }

  // Additional validation: Check workers (if specified)
  if (config.workers !== undefined && config.workers < 1) {
    throw new ConfigValidationError('workers must be >= 1', {
      workers: config.workers,
    });
  }

  // Additional validation: Check timeout
  if (config.timeout < 1000) {
    throw new ConfigValidationError('timeout must be >= 1000ms', {
      timeout: config.timeout,
    });
  }

  // Additional validation: Check report_output_dir not empty
  if (!config.report_output_dir || config.report_output_dir.trim() === '') {
    throw new ConfigValidationError('report_output_dir cannot be empty', {
      report_output_dir: config.report_output_dir,
    });
  }

  // Warn if credentials_ref specified but file doesn't exist
  if (config.credentials_ref && !fileExists(config.credentials_ref)) {
    console.warn(
      `Warning: credentials file not found at '${config.credentials_ref}'`
    );
  }
}

/**
 * Check if baseURL is reachable (T041)
 * @param baseURL - URL to check
 * @returns Promise<boolean> - true if reachable, false otherwise
 */
export async function checkBaseUrlReachability(baseURL: string): Promise<boolean> {
  try {
    const controller = new AbortController();

    // Create timeout promise that rejects
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        controller.abort();
        reject(new Error('Request timeout'));
      }, 5000);
    });

    // Race between fetch and timeout
    const response = await Promise.race([
      fetch(baseURL, {
        method: 'GET',
        signal: controller.signal,
      }),
      timeoutPromise,
    ]);

    // Consider 2xx and 3xx status codes as reachable
    if (response.ok || (response.status >= 300 && response.status < 400)) {
      return true;
    }

    console.warn(
      `Warning: baseURL appears to be unreachable (status ${response.status}): ${baseURL}`
    );
    return false;
  } catch (error) {
    if (error instanceof Error) {
      console.warn(
        `Warning: baseURL appears to be unreachable: ${baseURL}\nError: ${error.message}`
      );
    } else {
      console.warn(`Warning: baseURL appears to be unreachable: ${baseURL}`);
    }
    return false;
  }
}
