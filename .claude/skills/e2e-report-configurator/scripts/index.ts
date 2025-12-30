/**
 * @spec T006-e2e-report-configurator
 * Main entry point for E2E Report Configurator skill
 */

import { parseSkillOptions } from './options-parser'
import { buildDirectoryStructure, getRequiredDirectories } from './directory-builder'
import {
  createDirectories,
  verifyDirectoriesExist,
  createGitkeepFiles,
  getArtifactSubdirectories
} from './directory-manager'
import {
  generateReporterArray,
  generateArtifactRetentionPolicy,
  type ReporterPaths
} from './config-generator'
import { updatePlaywrightConfig, validateConfigStructure } from './config-updater'
import { updateGitignore } from './gitignore-updater'
import type { SkillCommandOptions } from './types'

/**
 * Setup command result
 */
export interface SetupResult {
  success: boolean
  message: string
  details: {
    directoriesCreated: number
    directoriesExisted: number
    configUpdated: boolean
    gitignoreUpdated: boolean
    backupPath?: string
  }
  error?: string
}

/**
 * Executes the setup command to configure Playwright reporters
 *
 * Main workflow:
 * 1. Parse and validate command-line options
 * 2. Build directory structure based on output path
 * 3. Create required directories
 * 4. Generate reporter configurations
 * 5. Update playwright.config.ts (with backup)
 * 6. Update .gitignore
 *
 * @param options - Command-line options (partial)
 * @param configPath - Path to playwright.config.ts (default: 'playwright.config.ts')
 * @param gitignorePath - Path to .gitignore (default: '.gitignore')
 * @returns Setup result with success status and details
 *
 * @example
 * ```ts
 * // Minimal setup (HTML only)
 * const result = await setupCommand({})
 *
 * // Multi-format setup
 * const result = await setupCommand({
 *   format: 'html,json,junit',
 *   output: 'test-reports',
 *   artifacts: 'always'
 * })
 * ```
 */
export async function setupCommand(
  options: Partial<SkillCommandOptions> = {},
  configPath: string = 'playwright.config.ts',
  gitignorePath: string = '.gitignore'
): Promise<SetupResult> {
  try {
    // Step 1: Parse and validate options
    const validatedOptions = parseSkillOptions(options)

    // Step 2: Build directory structure
    const structure = buildDirectoryStructure(validatedOptions.output)

    // Step 3: Get required directories based on enabled formats
    const requiredDirs = getRequiredDirectories(structure, validatedOptions.format)

    // Step 4: Create directories
    const createResult = await createDirectories(requiredDirs)

    // Step 4.5: Create .gitkeep files in artifact subdirectories
    const artifactDirs = getArtifactSubdirectories(requiredDirs)
    await createGitkeepFiles(artifactDirs)

    // Step 5: Build reporter paths
    const formats = validatedOptions.format.split(',').map((f) => f.trim())
    const reporterPaths: ReporterPaths = {
      html: structure.htmlDir
    }

    if (formats.includes('json')) {
      reporterPaths.json = `${structure.jsonDir}/results.json`
    }

    if (formats.includes('junit')) {
      reporterPaths.junit = `${structure.junitDir}/results.xml`
    }

    // Step 6: Generate reporter array
    const reporters = generateReporterArray(reporterPaths)

    // Step 7: Generate artifact retention policy
    const artifactPolicy = generateArtifactRetentionPolicy(validatedOptions.artifacts)

    // Step 8: Update Playwright config (with backup)
    const configResult = await updatePlaywrightConfig(
      configPath,
      reporters,
      artifactPolicy,
      { createBackup: true }
    )

    if (!configResult.success) {
      throw new Error(configResult.error || 'Failed to update Playwright config')
    }

    // Step 9: Update gitignore
    const gitignoreResult = await updateGitignore(
      validatedOptions.output,
      gitignorePath
    )

    // Step 10: Build success message
    const message = buildSuccessMessage(
      validatedOptions,
      createResult,
      gitignoreResult,
      configResult.backupPath
    )

    return {
      success: true,
      message,
      details: {
        directoriesCreated: createResult.created.length,
        directoriesExisted: createResult.alreadyExisted.length,
        configUpdated: configResult.updated,
        gitignoreUpdated: gitignoreResult.updated,
        backupPath: configResult.backupPath
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Setup failed: ${(error as Error).message}`,
      details: {
        directoriesCreated: 0,
        directoriesExisted: 0,
        configUpdated: false,
        gitignoreUpdated: false
      },
      error: (error as Error).message
    }
  }
}

/**
 * Validates setup prerequisites
 *
 * Checks:
 * - Playwright config file exists
 * - Config has required structure (reporter, use.screenshot, etc.)
 *
 * @param configPath - Path to playwright.config.ts
 * @returns Validation result with issues list
 *
 * @example
 * ```ts
 * const validation = await validatePrerequisites('playwright.config.ts')
 *
 * if (!validation.valid) {
 *   console.error('Issues:', validation.issues)
 * }
 * ```
 */
export async function validatePrerequisites(
  configPath: string = 'playwright.config.ts'
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = []

  // Check if config file exists
  const hasValidStructure = await validateConfigStructure(configPath)

  if (!hasValidStructure) {
    issues.push('playwright.config.ts not found or missing required structure')
    issues.push('Run "npm init playwright@latest" to initialize Playwright')
  }

  return {
    valid: issues.length === 0,
    issues
  }
}

/**
 * Verifies setup completion
 *
 * Checks:
 * - All required directories exist
 * - Playwright config has reporter configuration
 * - Gitignore has report directory entry
 *
 * @param options - Setup options used
 * @param configPath - Path to playwright.config.ts
 * @param gitignorePath - Path to .gitignore
 * @returns Verification result
 *
 * @example
 * ```ts
 * const verification = await verifySetup({ format: 'html' })
 *
 * if (verification.complete) {
 *   console.log('Setup verified successfully')
 * }
 * ```
 */
export async function verifySetup(
  options: Partial<SkillCommandOptions> = {},
  configPath: string = 'playwright.config.ts',
  gitignorePath: string = '.gitignore'
): Promise<{ complete: boolean; issues: string[] }> {
  const issues: string[] = []

  try {
    const validatedOptions = parseSkillOptions(options)
    const structure = buildDirectoryStructure(validatedOptions.output)
    const requiredDirs = getRequiredDirectories(structure, validatedOptions.format)

    // Verify directories exist
    const dirResult = await verifyDirectoriesExist(requiredDirs)
    if (!dirResult.allExist) {
      issues.push(`Missing directories: ${dirResult.missing.join(', ')}`)
    }

    // Verify config structure
    const hasValidConfig = await validateConfigStructure(configPath)
    if (!hasValidConfig) {
      issues.push('Playwright config missing required structure')
    }

    return {
      complete: issues.length === 0,
      issues
    }
  } catch (error) {
    issues.push(`Verification failed: ${(error as Error).message}`)
    return {
      complete: false,
      issues
    }
  }
}

/**
 * Builds human-readable success message
 *
 * @param options - Validated options
 * @param createResult - Directory creation result
 * @param gitignoreResult - Gitignore update result
 * @param backupPath - Config backup path
 * @returns Formatted success message
 */
function buildSuccessMessage(
  options: Required<SkillCommandOptions>,
  createResult: { created: string[]; alreadyExisted: string[] },
  gitignoreResult: { updated: boolean; alreadyPresent: boolean },
  backupPath?: string
): string {
  const lines: string[] = []

  lines.push('✅ E2E Report Configurator setup completed successfully')
  lines.push('')

  // Reporters configured
  const formats = options.format.split(',').map((f) => f.trim())
  lines.push(`📋 Reporters configured: ${formats.join(', ')}`)
  lines.push(`📁 Output directory: ${options.output}`)
  lines.push(`📸 Artifact policy: ${options.artifacts}`)
  lines.push('')

  // Directories
  if (createResult.created.length > 0) {
    lines.push(`✨ Created ${createResult.created.length} directories`)
  }
  if (createResult.alreadyExisted.length > 0) {
    lines.push(`ℹ️  ${createResult.alreadyExisted.length} directories already existed`)
  }

  // Config update
  if (backupPath) {
    lines.push(`💾 Config backup: ${backupPath}`)
  }

  // Gitignore
  if (gitignoreResult.updated) {
    lines.push('📝 Updated .gitignore')
  } else if (gitignoreResult.alreadyPresent) {
    lines.push('ℹ️  .gitignore already configured')
  }

  lines.push('')
  lines.push('Next steps:')
  lines.push('  1. Run: npx playwright test')
  lines.push(`  2. View reports: npx playwright show-report ${options.output}/html`)

  return lines.join('\n')
}

// Export all modules for advanced usage
export * from './options-parser'
export * from './directory-builder'
export * from './directory-manager'
export * from './config-generator'
export * from './config-updater'
export * from './gitignore-updater'
export * from './file-utils'
export * from './types'
