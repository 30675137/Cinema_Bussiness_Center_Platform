/**
 * @spec T003-e2e-runner
 * Configuration loader with Zod validation (T013)
 */

import { E2ERunConfigSchema, type E2ERunConfig } from './schemas';
import { readJsonFile } from './utils/file-utils';
import { ConfigValidationError } from './utils/error-handler';
import { ZodError } from 'zod';

/**
 * Load and validate E2ERunConfig from JSON file
 * @param filePath - Path to E2ERunConfig JSON file
 * @returns Validated E2ERunConfig object with defaults applied
 * @throws ConfigValidationError if file cannot be read or validation fails
 */
export function loadConfig(filePath: string): E2ERunConfig {
  try {
    // Read JSON file
    const rawData = readJsonFile(filePath);

    // Validate with Zod schema
    const validatedConfig = E2ERunConfigSchema.parse(rawData);

    return validatedConfig;
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod validation errors
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      throw new ConfigValidationError(
        `Configuration validation failed:\n${errorMessages.join('\n')}`,
        {
          configPath: filePath,
          errors: error.errors,
        }
      );
    }

    // Re-throw as ConfigValidationError for consistency
    if (error instanceof Error) {
      throw new ConfigValidationError(
        `Failed to load configuration: ${error.message}`,
        { configPath: filePath }
      );
    }

    throw new ConfigValidationError('Failed to load configuration', {
      configPath: filePath,
    });
  }
}
