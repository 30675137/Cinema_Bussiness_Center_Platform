/**
 * @spec T006-e2e-report-configurator
 * Directory management for E2E test reports and artifacts
 */

import { ensureDirectories, fileExists } from './file-utils'

/**
 * Result of directory creation operation
 */
export interface CreateDirectoriesResult {
  /** Directories successfully created (newly created) */
  created: string[]
  /** Directories that already existed before operation */
  alreadyExisted: string[]
  /** Directories that failed to create */
  failed: string[]
}

/**
 * Result of directory verification operation
 */
export interface VerifyDirectoriesResult {
  /** True if all directories exist */
  allExist: boolean
  /** List of existing directories */
  existing: string[]
  /** List of missing directories */
  missing: string[]
}

/**
 * Creates multiple directories recursively
 *
 * @param directories - Array of directory paths to create
 * @returns Result object with created/existing/failed directories
 * @throws Error if directory creation fails critically
 *
 * @example
 * ```ts
 * const result = await createDirectories([
 *   'reports/e2e/html',
 *   'reports/e2e/json',
 *   'reports/e2e/artifacts'
 * ])
 *
 * console.log(result.created) // ['reports/e2e/html', 'reports/e2e/json', ...]
 * console.log(result.alreadyExisted) // []
 * ```
 */
export async function createDirectories(
  directories: string[]
): Promise<CreateDirectoriesResult> {
  const result: CreateDirectoriesResult = {
    created: [],
    alreadyExisted: [],
    failed: []
  }

  if (directories.length === 0) {
    return result
  }

  try {
    // ensureDirectories returns array of booleans:
    // true = newly created, false = already existed
    const creationResults = await ensureDirectories(directories)

    for (let i = 0; i < directories.length; i++) {
      const dir = directories[i]
      const wasCreated = creationResults[i]

      if (wasCreated) {
        result.created.push(dir)
      } else {
        result.alreadyExisted.push(dir)
      }
    }

    return result
  } catch (error) {
    throw new Error(
      `Failed to create directories: ${(error as Error).message}`
    )
  }
}

/**
 * Verifies that all directories exist
 *
 * @param directories - Array of directory paths to verify
 * @returns Result object with verification status
 *
 * @example
 * ```ts
 * const result = await verifyDirectoriesExist([
 *   'reports/e2e/html',
 *   'reports/e2e/json'
 * ])
 *
 * if (result.allExist) {
 *   console.log('All directories exist')
 * } else {
 *   console.log('Missing:', result.missing)
 * }
 * ```
 */
export async function verifyDirectoriesExist(
  directories: string[]
): Promise<VerifyDirectoriesResult> {
  const result: VerifyDirectoriesResult = {
    allExist: true,
    existing: [],
    missing: []
  }

  if (directories.length === 0) {
    return result
  }

  for (const dir of directories) {
    const exists = await fileExists(dir)

    if (exists) {
      result.existing.push(dir)
    } else {
      result.missing.push(dir)
      result.allExist = false
    }
  }

  return result
}

/**
 * Creates directories and returns summary message
 *
 * @param directories - Array of directory paths to create
 * @returns Human-readable summary message
 *
 * @example
 * ```ts
 * const message = await createDirectoriesWithMessage([
 *   'reports/e2e/html',
 *   'reports/e2e/json'
 * ])
 * // => "Created 2 directories: reports/e2e/html, reports/e2e/json"
 * ```
 */
export async function createDirectoriesWithMessage(
  directories: string[]
): Promise<string> {
  const result = await createDirectories(directories)

  const parts: string[] = []

  if (result.created.length > 0) {
    parts.push(
      `Created ${result.created.length} ${result.created.length === 1 ? 'directory' : 'directories'}: ${result.created.join(', ')}`
    )
  }

  if (result.alreadyExisted.length > 0) {
    parts.push(
      `${result.alreadyExisted.length} already existed: ${result.alreadyExisted.join(', ')}`
    )
  }

  if (result.failed.length > 0) {
    parts.push(
      `Failed to create ${result.failed.length}: ${result.failed.join(', ')}`
    )
  }

  return parts.join('; ')
}
