/**
 * @spec T003-e2e-runner
 * Credentials loading and environment variable injection (T027, T028, T029, T030)
 */

import { CredentialsFileSchema, type CredentialsFile } from './schemas';
import { readJsonFile } from './utils/file-utils';
import { CredentialsError } from './utils/error-handler';
import { ZodError } from 'zod';
import { statSync } from 'fs';

/**
 * Load and validate credentials from JSON file (T027)
 * @param filePath - Path to credentials JSON file
 * @returns Validated CredentialsFile object
 * @throws CredentialsError if file cannot be read or validation fails
 */
export function loadCredentials(filePath: string): CredentialsFile {
  try {
    // Read JSON file
    const rawData = readJsonFile(filePath);

    // Validate with Zod schema
    const validatedCredentials = CredentialsFileSchema.parse(rawData);

    return validatedCredentials;
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod validation errors
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      throw new CredentialsError(
        `Credentials validation failed:\n${errorMessages.join('\n')}`,
        {
          credentialsPath: filePath,
          errors: error.errors,
        }
      );
    }

    // Re-throw as CredentialsError for consistency
    if (error instanceof Error) {
      throw new CredentialsError(
        `Failed to load credentials: ${error.message}`,
        { credentialsPath: filePath }
      );
    }

    throw new CredentialsError('Failed to load credentials', {
      credentialsPath: filePath,
    });
  }
}

/**
 * Validate that credentials env_profile matches config env_profile (T028)
 * @param configProfile - env_profile from E2ERunConfig
 * @param credentialsProfile - env_profile from CredentialsFile
 * @throws CredentialsError if profiles do not match
 */
export function validateEnvProfileMatch(
  configProfile: string,
  credentialsProfile: string
): void {
  if (configProfile !== credentialsProfile) {
    throw new CredentialsError(
      `env_profile mismatch: config has "${configProfile}" but credentials has "${credentialsProfile}"`,
      {
        configProfile,
        credentialsProfile,
      }
    );
  }
}

/**
 * Inject credentials into environment variables (T029)
 * Sets environment variables in format:
 * - E2E_USER_<ROLE>_USERNAME
 * - E2E_USER_<ROLE>_PASSWORD
 * - E2E_API_<SERVICE>_KEY
 * - E2E_API_<SERVICE>_SECRET (optional)
 *
 * @param credentials - CredentialsFile object
 */
export function injectCredentials(credentials: CredentialsFile): void {
  // Inject user credentials
  if (credentials.users) {
    for (const user of credentials.users) {
      const roleUpper = user.role.toUpperCase().replace(/-/g, '_');
      process.env[`E2E_USER_${roleUpper}_USERNAME`] = user.username;
      process.env[`E2E_USER_${roleUpper}_PASSWORD`] = user.password;

      if (user.display_name) {
        process.env[`E2E_USER_${roleUpper}_DISPLAY_NAME`] = user.display_name;
      }
    }
  }

  // Inject API key credentials
  if (credentials.api_keys) {
    for (const apiKey of credentials.api_keys) {
      const serviceUpper = apiKey.service.toUpperCase().replace(/-/g, '_');
      process.env[`E2E_API_${serviceUpper}_KEY`] = apiKey.api_key;

      if (apiKey.api_secret) {
        process.env[`E2E_API_${serviceUpper}_SECRET`] = apiKey.api_secret;
      }
    }
  }
}

/**
 * Check credentials file permissions and warn if too permissive (T030)
 * Unix only - on Windows, this check is skipped
 *
 * @param filePath - Path to credentials file
 */
export function checkFilePermissions(filePath: string): void {
  // Skip on Windows
  if (process.platform === 'win32') {
    return;
  }

  try {
    const stats = statSync(filePath);
    const mode = stats.mode & 0o777; // Get permission bits

    // Warn if permissions are more permissive than 0600 (owner read/write only)
    if (mode > 0o600) {
      console.warn(
        `\n⚠️  WARNING: Credentials file has insecure permissions (${mode.toString(8)})` +
          `\nRecommended: chmod 600 ${filePath}` +
          `\nCurrent permissions allow others to read sensitive credentials.\n`
      );
    }
  } catch (error) {
    // If we can't check permissions, don't fail - just skip the check
    return;
  }
}
