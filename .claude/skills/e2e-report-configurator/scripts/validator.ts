/**
 * @spec T006-e2e-report-configurator
 * Configuration validation for Playwright setup
 */

import { fileExists, readFileContent } from './file-utils'
import { exec } from 'child_process'
import { promisify } from 'util'
import { access, constants } from 'fs/promises'

const execAsync = promisify(exec)

/**
 * Validation result structure
 */
export interface ValidationResult {
  /** True if validation passed */
  valid: boolean
  /** List of validation errors */
  errors: string[]
  /** Optional warning messages */
  warnings?: string[]
}

/**
 * Validates Playwright config file structure
 *
 * Checks:
 * - File exists
 * - Contains required fields: reporter, use.screenshot, use.video, use.trace
 *
 * @param configPath - Path to playwright.config.ts
 * @returns Validation result
 *
 * @example
 * ```ts
 * const result = await validateConfigStructure('playwright.config.ts')
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors)
 * }
 * ```
 */
export async function validateConfigStructure(
  configPath: string
): Promise<ValidationResult> {
  const errors: string[] = []

  try {
    // Check if file exists
    if (!configPath || !(await fileExists(configPath))) {
      errors.push('Config file not found')
      return { valid: false, errors }
    }

    // Read config content
    const content = await readFileContent(configPath)

    // Check required fields
    if (!content.includes('reporter:')) {
      errors.push('Config missing required "reporter" field')
    }

    if (!content.includes('screenshot:')) {
      errors.push('Config missing required "use.screenshot" field')
    }

    if (!content.includes('video:')) {
      errors.push('Config missing required "use.video" field')
    }

    if (!content.includes('trace:')) {
      errors.push('Config missing required "use.trace" field')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  } catch (error) {
    errors.push(`Config validation failed: ${(error as Error).message}`)
    return { valid: false, errors }
  }
}

/**
 * Validates TypeScript compilation of config file
 *
 * Runs `npx tsc --noEmit` to check for TypeScript errors
 *
 * @param configPath - Path to playwright.config.ts
 * @returns Validation result
 *
 * @example
 * ```ts
 * const result = await validateTypeScriptCompilation('playwright.config.ts')
 * if (!result.valid) {
 *   console.error('TypeScript errors:', result.errors)
 * }
 * ```
 */
export async function validateTypeScriptCompilation(
  configPath: string
): Promise<ValidationResult> {
  const errors: string[] = []

  try {
    // Run TypeScript compiler in noEmit mode
    await execAsync('npx tsc --noEmit', {
      cwd: process.cwd(),
      timeout: 30000 // 30 seconds
    })

    return { valid: true, errors: [] }
  } catch (error: any) {
    // TypeScript compilation failed
    if (error.stdout) {
      errors.push(`TypeScript compilation errors:\n${error.stdout}`)
    }
    if (error.stderr) {
      errors.push(`TypeScript compiler error:\n${error.stderr}`)
    }
    if (!error.stdout && !error.stderr) {
      errors.push('TypeScript compiler not found or compilation failed')
    }

    return { valid: false, errors }
  }
}

/**
 * Validates Playwright can load and parse the config
 *
 * Runs `npx playwright test --list` to verify runtime config validity
 *
 * @param configPath - Path to playwright.config.ts
 * @returns Validation result
 *
 * @example
 * ```ts
 * const result = await validatePlaywrightRuntime('playwright.config.ts')
 * if (!result.valid) {
 *   console.error('Playwright runtime errors:', result.errors)
 * }
 * ```
 */
export async function validatePlaywrightRuntime(
  configPath: string
): Promise<ValidationResult> {
  const errors: string[] = []

  try {
    // Run Playwright test --list to verify config can be loaded
    await execAsync('npx playwright test --list', {
      cwd: process.cwd(),
      timeout: 30000 // 30 seconds
    })

    return { valid: true, errors: [] }
  } catch (error: any) {
    // Playwright runtime validation failed
    if (error.stdout) {
      errors.push(`Playwright runtime error:\n${error.stdout}`)
    }
    if (error.stderr) {
      errors.push(`Playwright error:\n${error.stderr}`)
    }
    if (!error.stdout && !error.stderr) {
      errors.push('Playwright not found or failed to load config')
    }

    return { valid: false, errors }
  }
}

/**
 * Validates directory permissions
 *
 * Checks:
 * - Directories exist
 * - Directories are writable
 *
 * @param directories - Array of directory paths to validate
 * @returns Validation result
 *
 * @example
 * ```ts
 * const result = await validateDirectoryPermissions([
 *   'reports/e2e/html',
 *   'reports/e2e/json'
 * ])
 * if (!result.valid) {
 *   console.error('Permission errors:', result.errors)
 * }
 * ```
 */
export async function validateDirectoryPermissions(
  directories: string[]
): Promise<ValidationResult> {
  const errors: string[] = []

  if (!directories || directories.length === 0) {
    return { valid: true, errors: [] }
  }

  for (const dir of directories) {
    try {
      // Check if directory exists
      await access(dir, constants.F_OK)

      // Check if directory is writable
      await access(dir, constants.W_OK)
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        errors.push(`Directory does not exist: ${dir}`)
      } else if ((error as any).code === 'EACCES') {
        errors.push(`Directory not writable: ${dir}`)
      } else {
        errors.push(`Directory permission error: ${dir}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates reporter output paths are unique
 *
 * Checks for duplicate output folders or files across reporters
 *
 * @param reporters - Array of reporter configurations
 * @returns Validation result
 *
 * @example
 * ```ts
 * const reporters = [
 *   ['html', { outputFolder: 'reports/html' }],
 *   ['json', { outputFile: 'reports/json/results.json' }]
 * ]
 * const result = validateReporterPathsUniqueness(reporters)
 * if (!result.valid) {
 *   console.error('Path conflicts:', result.errors)
 * }
 * ```
 */
export function validateReporterPathsUniqueness(
  reporters: Array<[string, any?]>
): ValidationResult {
  const errors: string[] = []

  if (!reporters) {
    errors.push('Reporters array is required')
    return { valid: false, errors }
  }

  if (reporters.length === 0) {
    return { valid: true, errors: [] }
  }

  const paths = new Set<string>()

  for (const [reporterType, config] of reporters) {
    let outputPath: string | undefined

    // Extract output path based on reporter type
    if (config?.outputFolder) {
      outputPath = config.outputFolder
    } else if (config?.outputFile) {
      outputPath = config.outputFile
    }

    // Skip reporters without output paths (e.g., 'list', 'dot')
    if (!outputPath) {
      continue
    }

    // Normalize path (remove trailing slash)
    const normalizedPath = outputPath.replace(/\/$/, '')

    // Check for duplicates BEFORE adding to set
    if (paths.has(normalizedPath)) {
      errors.push(`Duplicate output path detected: ${normalizedPath}`)
      continue // Skip conflict check if already duplicate
    }

    // Check for directory conflicts (e.g., 'reports/html' vs 'reports/html/results.json')
    for (const existingPath of paths) {
      // Check if one path is a prefix of another
      if (
        normalizedPath.startsWith(existingPath + '/') ||
        existingPath.startsWith(normalizedPath + '/')
      ) {
        errors.push(
          `Output path conflict: ${normalizedPath} overlaps with ${existingPath}`
        )
      }
    }

    // Add path to set AFTER checking conflicts
    paths.add(normalizedPath)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Runs comprehensive validation checks
 *
 * Combines all validation checks into a single result
 *
 * @param configPath - Path to playwright.config.ts
 * @param reporters - Array of reporter configurations
 * @param directories - Array of directory paths
 * @returns Combined validation result
 *
 * @example
 * ```ts
 * const result = await validateAll(
 *   'playwright.config.ts',
 *   [['html', { outputFolder: 'reports/html' }]],
 *   ['reports/html', 'reports/artifacts']
 * )
 * if (!result.valid) {
 *   console.error('Validation failed:', result.errors)
 * }
 * ```
 */
export async function validateAll(
  configPath: string,
  reporters: Array<[string, any?]>,
  directories: string[]
): Promise<ValidationResult> {
  const allErrors: string[] = []
  const allWarnings: string[] = []

  // 1. Config structure validation
  const structureResult = await validateConfigStructure(configPath)
  if (!structureResult.valid) {
    allErrors.push(...structureResult.errors)
  }

  // 2. TypeScript compilation validation
  const tsResult = await validateTypeScriptCompilation(configPath)
  if (!tsResult.valid) {
    allErrors.push(...tsResult.errors)
  }

  // 3. Playwright runtime validation (optional, may warn instead of error)
  const runtimeResult = await validatePlaywrightRuntime(configPath)
  if (!runtimeResult.valid) {
    // Runtime validation can be a warning if other checks pass
    if (structureResult.valid && tsResult.valid) {
      allWarnings.push(...runtimeResult.errors)
    } else {
      allErrors.push(...runtimeResult.errors)
    }
  }

  // 4. Reporter paths uniqueness validation
  const pathsResult = validateReporterPathsUniqueness(reporters)
  if (!pathsResult.valid) {
    allErrors.push(...pathsResult.errors)
  }

  // 5. Directory permissions validation
  const permsResult = await validateDirectoryPermissions(directories)
  if (!permsResult.valid) {
    allErrors.push(...permsResult.errors)
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  }
}
