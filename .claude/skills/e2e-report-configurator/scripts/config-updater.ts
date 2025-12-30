/**
 * @spec T006-e2e-report-configurator
 * Playwright configuration file updater with backup/rollback
 */

import {
  readFileContent,
  writeFileContent,
  createBackup,
  restoreBackup,
  fileExists
} from './file-utils'
import { formatReporterArray, formatArtifactPolicy } from './config-generator'
import type { ArtifactRetentionPolicy } from './types'

/**
 * Result of config update operation
 */
export interface UpdateConfigResult {
  /** True if config was successfully updated */
  success: boolean
  /** Path to backup file (if created) */
  backupPath?: string
  /** Error message (if failed) */
  error?: string
  /** Whether config file was updated */
  updated: boolean
}

/**
 * Updates Playwright config file with reporter and artifact settings
 *
 * Uses regex-based replacement to update the reporter array and artifact
 * retention policy. Creates a backup before modification and supports rollback.
 *
 * @param configPath - Path to playwright.config.ts
 * @param reporters - Reporter array configuration
 * @param artifactPolicy - Artifact retention policy
 * @param options - Update options
 * @returns Update result with backup path
 * @throws Error if update fails
 *
 * @example
 * ```ts
 * const result = await updatePlaywrightConfig(
 *   'playwright.config.ts',
 *   [['html', { outputFolder: 'reports/e2e/html' }], ['list']],
 *   { screenshot: 'only-on-failure', video: 'retain-on-failure', trace: 'on-first-retry' }
 * )
 *
 * if (result.success) {
 *   console.log('Config updated, backup:', result.backupPath)
 * }
 * ```
 */
export async function updatePlaywrightConfig(
  configPath: string,
  reporters: Array<[string, any?]>,
  artifactPolicy: ArtifactRetentionPolicy,
  options: { createBackup?: boolean } = { createBackup: true }
): Promise<UpdateConfigResult> {
  try {
    // Check if config file exists
    if (!(await fileExists(configPath))) {
      throw new Error(`Config file not found: ${configPath}`)
    }

    // Read current config
    const content = await readFileContent(configPath)

    // Create backup if requested
    let backupPath: string | undefined
    if (options.createBackup !== false) {
      backupPath = await createBackup(configPath)
    }

    try {
      // Update reporter array
      const reporterCode = formatReporterArray(reporters)
      const updatedContent = content.replace(
        /reporter:\s*\[[\s\S]*?\]/,
        `reporter: ${reporterCode}`
      )

      // Check if reporter was replaced
      if (updatedContent === content) {
        throw new Error(
          'Failed to update reporter array. Pattern not found in config file.'
        )
      }

      // Update artifact retention policy
      const policyFormatted = formatArtifactPolicy(artifactPolicy)
      let finalContent = updatedContent

      // Replace screenshot
      finalContent = finalContent.replace(
        /screenshot:\s*['"].*?['"]/,
        `screenshot: '${policyFormatted.screenshot}'`
      )

      // Replace video
      finalContent = finalContent.replace(
        /video:\s*['"].*?['"]/,
        `video: '${policyFormatted.video}'`
      )

      // Replace trace
      finalContent = finalContent.replace(
        /trace:\s*['"].*?['"]/,
        `trace: '${policyFormatted.trace}'`
      )

      // Write updated config
      await writeFileContent(configPath, finalContent)

      return {
        success: true,
        updated: true,
        backupPath
      }
    } catch (error) {
      // Rollback on error
      if (backupPath) {
        await restoreBackup(configPath, backupPath)
      }

      throw error
    }
  } catch (error) {
    return {
      success: false,
      updated: false,
      error: (error as Error).message
    }
  }
}

/**
 * Rolls back config to backup
 *
 * @param configPath - Path to playwright.config.ts
 * @param backupPath - Path to backup file
 * @throws Error if rollback fails
 *
 * @example
 * ```ts
 * await rollbackConfig('playwright.config.ts', 'playwright.config.ts.backup.1735567200000')
 * ```
 */
export async function rollbackConfig(
  configPath: string,
  backupPath: string
): Promise<void> {
  try {
    await restoreBackup(configPath, backupPath)
  } catch (error) {
    throw new Error(
      `Failed to rollback config: ${(error as Error).message}`
    )
  }
}

/**
 * Validates that config file has required structure
 *
 * Checks for presence of:
 * - reporter array
 * - use.screenshot
 * - use.video
 * - use.trace
 *
 * @param configPath - Path to playwright.config.ts
 * @returns True if valid, false otherwise
 *
 * @example
 * ```ts
 * if (await validateConfigStructure('playwright.config.ts')) {
 *   console.log('Config has required structure')
 * }
 * ```
 */
export async function validateConfigStructure(
  configPath: string
): Promise<boolean> {
  try {
    const content = await readFileContent(configPath)

    // Check for required patterns
    const hasReporter = /reporter:\s*\[/.test(content)
    const hasScreenshot = /screenshot:\s*['"]/.test(content)
    const hasVideo = /video:\s*['"]/.test(content)
    const hasTrace = /trace:\s*['"]/.test(content)

    return hasReporter && hasScreenshot && hasVideo && hasTrace
  } catch {
    return false
  }
}

/**
 * Extracts current reporter array from config
 *
 * @param configPath - Path to playwright.config.ts
 * @returns Reporter array string or null if not found
 *
 * @example
 * ```ts
 * const reporters = await extractReporterArray('playwright.config.ts')
 * // => "[['html', { outputFolder: 'reports/e2e/html' }]]"
 * ```
 */
export async function extractReporterArray(
  configPath: string
): Promise<string | null> {
  try {
    const content = await readFileContent(configPath)
    const match = content.match(/reporter:\s*(\[[\s\S]*?\])/)

    return match ? match[1] : null
  } catch {
    return null
  }
}
