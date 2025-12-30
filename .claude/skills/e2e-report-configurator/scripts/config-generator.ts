/**
 * @spec T006-e2e-report-configurator
 * Reporter configuration generator
 */

import type {
  HTMLReporterConfig,
  JSONReporterConfig,
  JUnitReporterConfig,
  ReporterConfig,
  ArtifactRetentionPolicy
} from './types'
import { DEFAULT_ARTIFACT_POLICIES } from './types'

/**
 * Generates HTML reporter configuration
 *
 * @param outputFolder - Output folder path (e.g., 'reports/e2e/html')
 * @param open - When to open the HTML report ('always', 'never', 'on-failure')
 * @returns HTML reporter config object
 * @throws Error if outputFolder is invalid
 *
 * @example
 * ```ts
 * const config = generateHTMLReporterConfig('reports/e2e/html')
 * // => { type: 'html', outputFolder: 'reports/e2e/html', open: 'never' }
 * ```
 */
export function generateHTMLReporterConfig(
  outputFolder: string,
  open: 'always' | 'never' | 'on-failure' = 'never'
): HTMLReporterConfig {
  // Validate output folder
  const normalized = outputFolder.replace(/\/$/, '')

  if (!normalized || normalized.trim() === '') {
    throw new Error('Output folder cannot be empty')
  }

  if (normalized.startsWith('/')) {
    throw new Error('Output folder must be relative (not an absolute path)')
  }

  return {
    type: 'html',
    outputFolder: normalized,
    open
  }
}

/**
 * Generates JSON reporter configuration
 *
 * @param outputFile - Output file path (e.g., 'reports/e2e/json/results.json')
 * @returns JSON reporter config object
 * @throws Error if outputFile is invalid
 *
 * @example
 * ```ts
 * const config = generateJSONReporterConfig('reports/e2e/json/results.json')
 * // => { type: 'json', outputFile: 'reports/e2e/json/results.json' }
 * ```
 */
export function generateJSONReporterConfig(outputFile: string): JSONReporterConfig {
  if (!outputFile || outputFile.trim() === '') {
    throw new Error('Output file cannot be empty')
  }

  if (outputFile.startsWith('/')) {
    throw new Error('Output file must be relative (not an absolute path)')
  }

  return {
    type: 'json',
    outputFile
  }
}

/**
 * Generates JUnit XML reporter configuration
 *
 * @param outputFile - Output file path (e.g., 'reports/e2e/junit/results.xml')
 * @returns JUnit reporter config object
 * @throws Error if outputFile is invalid
 *
 * @example
 * ```ts
 * const config = generateJUnitReporterConfig('reports/e2e/junit/results.xml')
 * // => { type: 'junit', outputFile: 'reports/e2e/junit/results.xml' }
 * ```
 */
export function generateJUnitReporterConfig(outputFile: string): JUnitReporterConfig {
  if (!outputFile || outputFile.trim() === '') {
    throw new Error('Output file cannot be empty')
  }

  if (outputFile.startsWith('/')) {
    throw new Error('Output file must be relative (not an absolute path)')
  }

  return {
    type: 'junit',
    outputFile
  }
}

/**
 * Reporter paths configuration
 */
export interface ReporterPaths {
  html: string
  json?: string
  junit?: string
  htmlOpen?: 'always' | 'never' | 'on-failure'
}

/**
 * Generates Playwright-compatible reporter array
 *
 * Creates an array of reporter configurations in Playwright format:
 * ```ts
 * [
 *   ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
 *   ['json', { outputFile: 'reports/e2e/json/results.json' }],
 *   ['list']
 * ]
 * ```
 *
 * @param paths - Reporter paths configuration
 * @returns Reporter array for Playwright config
 * @throws Error if HTML reporter is missing
 *
 * @example
 * ```ts
 * const reporters = generateReporterArray({
 *   html: 'reports/e2e/html',
 *   json: 'reports/e2e/json/results.json'
 * })
 * ```
 */
export function generateReporterArray(
  paths: ReporterPaths
): Array<[string, any?]> {
  // HTML is mandatory
  if (!paths.html) {
    throw new Error('HTML reporter is mandatory. Provide paths.html')
  }

  const reporters: Array<[string, any?]> = []

  // HTML reporter (always first)
  const htmlConfig = generateHTMLReporterConfig(paths.html, paths.htmlOpen)
  reporters.push(['html', {
    outputFolder: htmlConfig.outputFolder,
    open: htmlConfig.open
  }])

  // JSON reporter (optional)
  if (paths.json) {
    const jsonConfig = generateJSONReporterConfig(paths.json)
    reporters.push(['json', {
      outputFile: jsonConfig.outputFile
    }])
  }

  // JUnit reporter (optional)
  if (paths.junit) {
    const junitConfig = generateJUnitReporterConfig(paths.junit)
    reporters.push(['junit', {
      outputFile: junitConfig.outputFile
    }])
  }

  // Always add list reporter at the end
  reporters.push(['list'])

  return reporters
}

/**
 * Generates artifact retention policy configuration
 *
 * Maps high-level policy names to specific Playwright artifact settings:
 * - `on-failure`: Capture artifacts only when tests fail (default)
 * - `always`: Always capture all artifacts
 * - `never`: Never capture artifacts
 *
 * @param policy - Artifact capture policy
 * @returns Artifact retention policy object
 * @throws Error if policy is invalid
 *
 * @example
 * ```ts
 * const policy = generateArtifactRetentionPolicy('on-failure')
 * // => {
 * //   screenshot: 'only-on-failure',
 * //   video: 'retain-on-failure',
 * //   trace: 'on-first-retry'
 * // }
 * ```
 */
export function generateArtifactRetentionPolicy(
  policy: 'on-failure' | 'always' | 'never'
): ArtifactRetentionPolicy {
  // Map policy to predefined configurations
  const policyMap: Record<string, ArtifactRetentionPolicy> = {
    'on-failure': DEFAULT_ARTIFACT_POLICIES.development,
    'always': DEFAULT_ARTIFACT_POLICIES.debug,
    'never': DEFAULT_ARTIFACT_POLICIES.minimal
  }

  if (!policy || !policyMap[policy]) {
    throw new Error(
      'Invalid artifacts policy. Must be one of: on-failure, always, never'
    )
  }

  return policyMap[policy]
}

/**
 * Formats reporter array as TypeScript code string
 *
 * @param reporters - Reporter array
 * @returns Formatted TypeScript code string
 *
 * @example
 * ```ts
 * const code = formatReporterArray([
 *   ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
 *   ['list']
 * ])
 * // => "[\n  ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],\n  ['list']\n]"
 * ```
 */
export function formatReporterArray(reporters: Array<[string, any?]>): string {
  const lines = reporters.map((reporter) => {
    const [type, config] = reporter

    if (!config) {
      return `    ['${type}']`
    }

    const configStr = JSON.stringify(config)
      .replace(/"/g, "'")
      .replace(/:/g, ': ')
    return `    ['${type}', ${configStr}]`
  })

  return `[\n${lines.join(',\n')}\n  ]`
}

/**
 * Formats artifact retention policy as TypeScript code
 *
 * @param policy - Artifact retention policy object
 * @returns Formatted TypeScript code string
 *
 * @example
 * ```ts
 * const code = formatArtifactPolicy({
 *   screenshot: 'only-on-failure',
 *   video: 'retain-on-failure',
 *   trace: 'on-first-retry'
 * })
 * // => "screenshot: 'only-on-failure',\n    video: 'retain-on-failure',\n    trace: 'on-first-retry'"
 * ```
 */
export function formatArtifactPolicy(policy: ArtifactRetentionPolicy): {
  screenshot: string
  video: string
  trace: string
} {
  return {
    screenshot: policy.screenshot,
    video: policy.video,
    trace: policy.trace
  }
}
