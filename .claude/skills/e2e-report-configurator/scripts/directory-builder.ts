/**
 * @spec T006-e2e-report-configurator
 * Directory structure builder for E2E test reports and artifacts
 */

import type { DirectoryStructure } from './types'

/**
 * Builds standardized directory structure object from base path
 *
 * Creates a complete directory structure definition following the convention:
 * ```
 * basePath/
 * ├── html/
 * ├── json/
 * ├── junit/
 * └── artifacts/
 *     ├── screenshots/
 *     ├── videos/
 *     └── traces/
 * ```
 *
 * @param basePath - Root directory for all reports (e.g., 'reports/e2e')
 * @returns Complete directory structure object
 * @throws Error if basePath is invalid
 *
 * @example
 * ```ts
 * const structure = buildDirectoryStructure('reports/e2e')
 * // => {
 * //   basePath: 'reports/e2e',
 * //   htmlDir: 'reports/e2e/html',
 * //   jsonDir: 'reports/e2e/json',
 * //   ...
 * // }
 * ```
 */
export function buildDirectoryStructure(basePath: string): DirectoryStructure {
  // Validate base path
  if (!basePath || basePath.trim() === '') {
    throw new Error('Base path cannot be empty')
  }

  // Remove trailing slash
  const normalizedBasePath = basePath.replace(/\/$/, '')

  // Check for absolute path
  if (normalizedBasePath.startsWith('/')) {
    throw new Error('Base path must be relative (not an absolute path)')
  }

  // Build directory structure
  const artifactsDir = `${normalizedBasePath}/artifacts`

  return {
    basePath: normalizedBasePath,
    htmlDir: `${normalizedBasePath}/html`,
    jsonDir: `${normalizedBasePath}/json`,
    junitDir: `${normalizedBasePath}/junit`,
    artifactsDir,
    screenshotsDir: `${artifactsDir}/screenshots`,
    videosDir: `${artifactsDir}/videos`,
    tracesDir: `${artifactsDir}/traces`
  }
}

/**
 * Gets list of directories to create based on enabled reporter formats
 *
 * Returns directories in creation order (parent directories before children).
 * Always includes artifact subdirectories regardless of format.
 *
 * @param structure - Directory structure object
 * @param formatString - Comma-separated list of enabled formats (e.g., 'html,json,junit')
 * @returns Array of directory paths to create
 *
 * @example
 * ```ts
 * const structure = buildDirectoryStructure('reports/e2e')
 *
 * // All formats
 * getRequiredDirectories(structure, 'html,json,junit')
 * // => ['reports/e2e/html', 'reports/e2e/json', 'reports/e2e/junit',
 * //     'reports/e2e/artifacts', 'reports/e2e/artifacts/screenshots', ...]
 *
 * // HTML only
 * getRequiredDirectories(structure, 'html')
 * // => ['reports/e2e/html', 'reports/e2e/artifacts', ...]
 * ```
 */
export function getRequiredDirectories(
  structure: DirectoryStructure,
  formatString: string
): string[] {
  const directories: string[] = []

  // Parse format string
  const formats = formatString
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)

  // Add reporter-specific directories based on enabled formats
  if (formats.includes('html')) {
    directories.push(structure.htmlDir)
  }

  if (formats.includes('json')) {
    directories.push(structure.jsonDir)
  }

  if (formats.includes('junit')) {
    directories.push(structure.junitDir)
  }

  // Always add artifacts directories (regardless of format)
  directories.push(structure.artifactsDir)
  directories.push(structure.screenshotsDir)
  directories.push(structure.videosDir)
  directories.push(structure.tracesDir)

  return directories
}

/**
 * Checks if a directory exists in the structure
 *
 * @param structure - Directory structure object
 * @param dirType - Type of directory to check (e.g., 'html', 'json', 'screenshots')
 * @returns Directory path if it exists, undefined otherwise
 *
 * @example
 * ```ts
 * const structure = buildDirectoryStructure('reports/e2e')
 * getDirectory(structure, 'html') // => 'reports/e2e/html'
 * getDirectory(structure, 'screenshots') // => 'reports/e2e/artifacts/screenshots'
 * ```
 */
export function getDirectory(
  structure: DirectoryStructure,
  dirType: 'html' | 'json' | 'junit' | 'artifacts' | 'screenshots' | 'videos' | 'traces'
): string {
  const dirMap: Record<string, string> = {
    html: structure.htmlDir,
    json: structure.jsonDir,
    junit: structure.junitDir,
    artifacts: structure.artifactsDir,
    screenshots: structure.screenshotsDir,
    videos: structure.videosDir,
    traces: structure.tracesDir
  }

  return dirMap[dirType]
}

/**
 * Validates that directory structure follows naming conventions
 *
 * @param structure - Directory structure object
 * @returns True if valid, throws error otherwise
 * @throws Error if structure doesn't follow conventions
 *
 * @example
 * ```ts
 * const structure = buildDirectoryStructure('reports/e2e')
 * validateDirectoryStructure(structure) // => true
 * ```
 */
export function validateDirectoryStructure(structure: DirectoryStructure): boolean {
  const { basePath, htmlDir, jsonDir, junitDir, artifactsDir, screenshotsDir, videosDir, tracesDir } = structure

  // Check HTML directory
  if (htmlDir !== `${basePath}/html`) {
    throw new Error(`Invalid htmlDir: expected "${basePath}/html", got "${htmlDir}"`)
  }

  // Check JSON directory
  if (jsonDir !== `${basePath}/json`) {
    throw new Error(`Invalid jsonDir: expected "${basePath}/json", got "${jsonDir}"`)
  }

  // Check JUnit directory
  if (junitDir !== `${basePath}/junit`) {
    throw new Error(`Invalid junitDir: expected "${basePath}/junit", got "${junitDir}"`)
  }

  // Check artifacts directory
  if (artifactsDir !== `${basePath}/artifacts`) {
    throw new Error(`Invalid artifactsDir: expected "${basePath}/artifacts", got "${artifactsDir}"`)
  }

  // Check screenshots directory
  if (screenshotsDir !== `${artifactsDir}/screenshots`) {
    throw new Error(`Invalid screenshotsDir: expected "${artifactsDir}/screenshots", got "${screenshotsDir}"`)
  }

  // Check videos directory
  if (videosDir !== `${artifactsDir}/videos`) {
    throw new Error(`Invalid videosDir: expected "${artifactsDir}/videos", got "${videosDir}"`)
  }

  // Check traces directory
  if (tracesDir !== `${artifactsDir}/traces`) {
    throw new Error(`Invalid tracesDir: expected "${artifactsDir}/traces", got "${tracesDir}"`)
  }

  return true
}
