/**
 * @spec T006-e2e-report-configurator
 * Shared file system utilities for the E2E Report Configurator skill
 */

import { readFile, writeFile, mkdir, access, constants } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname } from 'path'

/**
 * Reads file content as string
 *
 * @param filePath - Path to file to read
 * @returns File content as string
 * @throws Error if file doesn't exist or can't be read
 *
 * @example
 * ```ts
 * const content = await readFileContent('playwright.config.ts')
 * ```
 */
export async function readFileContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`)
    }
    throw new Error(`Failed to read file: ${filePath}. ${(error as Error).message}`)
  }
}

/**
 * Writes content to file, creating parent directories if needed
 *
 * @param filePath - Path to file to write
 * @param content - Content to write
 * @throws Error if write fails
 *
 * @example
 * ```ts
 * await writeFileContent('playwright.config.ts', configContent)
 * ```
 */
export async function writeFileContent(
  filePath: string,
  content: string
): Promise<void> {
  try {
    // Ensure parent directory exists
    const dir = dirname(filePath)
    if (dir && dir !== '.') {
      await ensureDirectory(dir)
    }

    await writeFile(filePath, content, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to write file: ${filePath}. ${(error as Error).message}`)
  }
}

/**
 * Checks if file exists
 *
 * @param filePath - Path to check
 * @returns True if file exists
 *
 * @example
 * ```ts
 * if (await fileExists('playwright.config.ts')) {
 *   // File exists
 * }
 * ```
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Checks if file exists (synchronous)
 *
 * @param filePath - Path to check
 * @returns True if file exists
 *
 * @example
 * ```ts
 * if (fileExistsSync('playwright.config.ts')) {
 *   // File exists
 * }
 * ```
 */
export function fileExistsSync(filePath: string): boolean {
  return existsSync(filePath)
}

/**
 * Checks if file is writable
 *
 * @param filePath - Path to check
 * @returns True if file is writable
 *
 * @example
 * ```ts
 * if (await isWritable('playwright.config.ts')) {
 *   // Can write to file
 * }
 * ```
 */
export async function isWritable(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.W_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Creates directory recursively (like mkdir -p)
 *
 * @param dirPath - Directory path to create
 * @throws Error if creation fails
 *
 * @example
 * ```ts
 * await ensureDirectory('reports/e2e/html')
 * ```
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true })
  } catch (error) {
    // Ignore if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw new Error(`Failed to create directory: ${dirPath}. ${(error as Error).message}`)
    }
  }
}

/**
 * Creates multiple directories recursively
 *
 * @param dirPaths - Array of directory paths to create
 * @returns Array of results (true if created, false if already existed)
 * @throws Error if any creation fails
 *
 * @example
 * ```ts
 * await ensureDirectories([
 *   'reports/e2e/html',
 *   'reports/e2e/json',
 *   'reports/e2e/artifacts'
 * ])
 * ```
 */
export async function ensureDirectories(dirPaths: string[]): Promise<boolean[]> {
  const results: boolean[] = []

  for (const dirPath of dirPaths) {
    const existed = await fileExists(dirPath)
    await ensureDirectory(dirPath)
    results.push(!existed) // true if newly created
  }

  return results
}

/**
 * Creates a backup of a file by appending .backup timestamp
 *
 * @param filePath - Path to file to backup
 * @returns Path to backup file
 * @throws Error if backup fails
 *
 * @example
 * ```ts
 * const backupPath = await createBackup('playwright.config.ts')
 * // => 'playwright.config.ts.backup.1735567200000'
 * ```
 */
export async function createBackup(filePath: string): Promise<string> {
  const timestamp = Date.now()
  const backupPath = `${filePath}.backup.${timestamp}`

  try {
    const content = await readFileContent(filePath)
    await writeFileContent(backupPath, content)
    return backupPath
  } catch (error) {
    throw new Error(`Failed to create backup of ${filePath}. ${(error as Error).message}`)
  }
}

/**
 * Restores file from backup
 *
 * @param originalPath - Path to original file
 * @param backupPath - Path to backup file
 * @throws Error if restore fails
 *
 * @example
 * ```ts
 * await restoreBackup('playwright.config.ts', 'playwright.config.ts.backup.1735567200000')
 * ```
 */
export async function restoreBackup(
  originalPath: string,
  backupPath: string
): Promise<void> {
  try {
    const content = await readFileContent(backupPath)
    await writeFileContent(originalPath, content)
  } catch (error) {
    throw new Error(
      `Failed to restore backup from ${backupPath} to ${originalPath}. ${(error as Error).message}`
    )
  }
}

/**
 * Appends content to file, creating it if it doesn't exist
 *
 * @param filePath - Path to file
 * @param content - Content to append
 * @param options - Append options
 * @throws Error if append fails
 *
 * @example
 * ```ts
 * await appendToFile('.gitignore', '\nreports/\n')
 * ```
 */
export async function appendToFile(
  filePath: string,
  content: string,
  options: { newlineBefore?: boolean; newlineAfter?: boolean } = {}
): Promise<void> {
  try {
    let existingContent = ''

    if (await fileExists(filePath)) {
      existingContent = await readFileContent(filePath)
    }

    // Add newlines as requested
    let appendContent = content
    if (options.newlineBefore && existingContent && !existingContent.endsWith('\n')) {
      appendContent = '\n' + appendContent
    }
    if (options.newlineAfter && !appendContent.endsWith('\n')) {
      appendContent = appendContent + '\n'
    }

    const newContent = existingContent + appendContent
    await writeFileContent(filePath, newContent)
  } catch (error) {
    throw new Error(`Failed to append to file: ${filePath}. ${(error as Error).message}`)
  }
}

/**
 * Checks if file contains specific content
 *
 * @param filePath - Path to file
 * @param searchString - String to search for
 * @returns True if file contains the search string
 *
 * @example
 * ```ts
 * const hasReportsEntry = await fileContains('.gitignore', 'reports/')
 * ```
 */
export async function fileContains(
  filePath: string,
  searchString: string
): Promise<boolean> {
  try {
    if (!(await fileExists(filePath))) {
      return false
    }

    const content = await readFileContent(filePath)
    return content.includes(searchString)
  } catch {
    return false
  }
}

/**
 * Replaces content in file using regex
 *
 * @param filePath - Path to file
 * @param searchPattern - Regex pattern to search for
 * @param replacement - Replacement string
 * @returns True if replacement was made
 * @throws Error if file doesn't exist or operation fails
 *
 * @example
 * ```ts
 * await replaceInFile(
 *   'playwright.config.ts',
 *   /reporter: \[.*?\]/s,
 *   "reporter: [['html', { outputFolder: 'reports/e2e/html' }]]"
 * )
 * ```
 */
export async function replaceInFile(
  filePath: string,
  searchPattern: RegExp,
  replacement: string
): Promise<boolean> {
  try {
    const content = await readFileContent(filePath)
    const newContent = content.replace(searchPattern, replacement)

    if (newContent === content) {
      return false // No replacement made
    }

    await writeFileContent(filePath, newContent)
    return true
  } catch (error) {
    throw new Error(
      `Failed to replace content in ${filePath}. ${(error as Error).message}`
    )
  }
}
