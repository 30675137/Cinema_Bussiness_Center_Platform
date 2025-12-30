/**
 * @spec T006-e2e-report-configurator
 * Playwright reporter configuration types
 *
 * This file defines TypeScript types for the E2E Report Configurator skill,
 * including reporter configurations, artifact retention policies, directory
 * structures, and validation results.
 *
 * @see ../data-model.md for detailed schema documentation
 */

// ============================================================================
// Reporter Configuration Types
// ============================================================================

/**
 * Supported Playwright reporter formats
 */
export type ReporterFormat = 'html' | 'json' | 'junit';

/**
 * HTML reporter configuration
 *
 * @example
 * ```ts
 * const htmlReporter: HTMLReporterConfig = {
 *   type: 'html',
 *   outputFolder: 'reports/e2e/html',
 *   open: 'never'
 * }
 * ```
 */
export interface HTMLReporterConfig {
  type: 'html';
  outputFolder: string;
  open?: 'always' | 'never' | 'on-failure';
}

/**
 * JSON reporter configuration
 *
 * @example
 * ```ts
 * const jsonReporter: JSONReporterConfig = {
 *   type: 'json',
 *   outputFile: 'reports/e2e/json/results.json'
 * }
 * ```
 */
export interface JSONReporterConfig {
  type: 'json';
  outputFile: string;
}

/**
 * JUnit XML reporter configuration
 *
 * @example
 * ```ts
 * const junitReporter: JUnitReporterConfig = {
 *   type: 'junit',
 *   outputFile: 'reports/e2e/junit/results.xml'
 * }
 * ```
 */
export interface JUnitReporterConfig {
  type: 'junit';
  outputFile: string;
}

/**
 * Discriminated union of all reporter configuration types
 *
 * Use the `type` field to narrow the union type at runtime:
 *
 * @example
 * ```ts
 * function getOutputPath(reporter: ReporterConfig): string {
 *   if (reporter.type === 'html') {
 *     return reporter.outputFolder; // TypeScript knows this is HTMLReporterConfig
 *   } else {
 *     return reporter.outputFile; // TypeScript knows this is JSON or JUnit
 *   }
 * }
 * ```
 */
export type ReporterConfig =
  | HTMLReporterConfig
  | JSONReporterConfig
  | JUnitReporterConfig;

// ============================================================================
// Artifact Retention Policy Types
// ============================================================================

/**
 * Artifact capture options for screenshots, videos, and traces
 *
 * - `on`: Always capture
 * - `off`: Never capture
 * - `only-on-failure`: Capture only when test fails
 * - `retain-on-failure`: Capture all, delete on success (videos only)
 * - `on-first-retry`: Capture on first retry (traces only)
 */
export type ArtifactRetentionOption =
  | 'on'
  | 'off'
  | 'only-on-failure'
  | 'retain-on-failure'
  | 'on-first-retry';

/**
 * Artifact retention policy configuration
 *
 * Defines when to capture test artifacts during Playwright execution.
 *
 * @example
 * ```ts
 * // Development policy (debug failures)
 * const devPolicy: ArtifactRetentionPolicy = {
 *   screenshot: 'only-on-failure',
 *   video: 'retain-on-failure',
 *   trace: 'on-first-retry'
 * }
 *
 * // CI policy (cost-optimized)
 * const ciPolicy: ArtifactRetentionPolicy = {
 *   screenshot: 'only-on-failure',
 *   video: 'off',
 *   trace: 'on-first-retry'
 * }
 * ```
 */
export interface ArtifactRetentionPolicy {
  /**
   * Screenshot capture policy
   * All options are valid for screenshots
   */
  screenshot: ArtifactRetentionOption;

  /**
   * Video capture policy
   * Note: 'retain-on-failure' is only valid for videos
   */
  video: ArtifactRetentionOption;

  /**
   * Trace capture policy
   * Note: 'on-first-retry' is only valid for traces
   */
  trace: ArtifactRetentionOption;
}

// ============================================================================
// Directory Structure Types
// ============================================================================

/**
 * Standardized directory structure for E2E test reports and artifacts
 *
 * Follows the convention:
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
 * @example
 * ```ts
 * const structure: DirectoryStructure = {
 *   basePath: 'reports/e2e',
 *   htmlDir: 'reports/e2e/html',
 *   jsonDir: 'reports/e2e/json',
 *   junitDir: 'reports/e2e/junit',
 *   artifactsDir: 'reports/e2e/artifacts',
 *   screenshotsDir: 'reports/e2e/artifacts/screenshots',
 *   videosDir: 'reports/e2e/artifacts/videos',
 *   tracesDir: 'reports/e2e/artifacts/traces'
 * }
 * ```
 */
export interface DirectoryStructure {
  /**
   * Root directory for all reports (e.g., 'reports/e2e')
   * No trailing slash
   */
  basePath: string;

  /**
   * HTML report directory
   * Must be `${basePath}/html`
   */
  htmlDir: string;

  /**
   * JSON report directory
   * Must be `${basePath}/json`
   */
  jsonDir: string;

  /**
   * JUnit XML report directory
   * Must be `${basePath}/junit`
   */
  junitDir: string;

  /**
   * Base artifacts directory
   * Must be `${basePath}/artifacts`
   */
  artifactsDir: string;

  /**
   * Screenshots directory
   * Must be `${artifactsDir}/screenshots`
   */
  screenshotsDir: string;

  /**
   * Videos directory
   * Must be `${artifactsDir}/videos`
   */
  videosDir: string;

  /**
   * Traces directory
   * Must be `${artifactsDir}/traces`
   */
  tracesDir: string;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Individual validation check result
 *
 * @example
 * ```ts
 * const passedCheck: ValidationCheck = {
 *   name: 'TypeScript validation',
 *   status: 'passed',
 *   message: 'Config compiles without errors'
 * }
 *
 * const failedCheck: ValidationCheck = {
 *   name: 'TypeScript validation',
 *   status: 'failed',
 *   message: 'error TS2322: Type "number" is not assignable to type "string"',
 *   suggestion: 'Fix type errors in playwright.config.ts'
 * }
 * ```
 */
export interface ValidationCheck {
  /**
   * Name of the validation check
   * @example 'File exists', 'TypeScript validation', 'Playwright runtime validation'
   */
  name: string;

  /**
   * Check status
   * - `passed`: Check succeeded
   * - `failed`: Check failed (blocks overall validation)
   * - `warning`: Non-critical issue detected
   */
  status: 'passed' | 'failed' | 'warning';

  /**
   * Human-readable result message
   * @example 'Config compiles without errors'
   */
  message: string;

  /**
   * Optional suggestion for fixing failures
   * Should only be present when status is 'failed' or 'warning'
   * @example 'Fix type errors in playwright.config.ts'
   */
  suggestion?: string;
}

/**
 * Overall validation result for a Playwright configuration
 *
 * @example
 * ```ts
 * const result: ValidationResult = {
 *   overall: 'passed',
 *   checks: [
 *     {
 *       name: 'File exists',
 *       status: 'passed',
 *       message: 'playwright.config.ts found'
 *     },
 *     {
 *       name: 'TypeScript validation',
 *       status: 'passed',
 *       message: 'Config compiles without errors'
 *     }
 *   ],
 *   timestamp: '2025-12-30T10:00:00Z'
 * }
 * ```
 */
export interface ValidationResult {
  /**
   * Overall validation status
   * - `passed`: All checks passed (no failures)
   * - `failed`: At least one check failed
   */
  overall: 'passed' | 'failed';

  /**
   * List of individual validation checks
   * Must contain at least 1 check
   */
  checks: ValidationCheck[];

  /**
   * ISO 8601 timestamp of validation
   * @example '2025-12-30T10:00:00Z'
   */
  timestamp: string;
}

// ============================================================================
// Skill Command Options
// ============================================================================

/**
 * Command-line options for the /e2e-report-configurator skill
 *
 * @example
 * ```ts
 * // Minimal (HTML only)
 * const minimalOptions: SkillCommandOptions = {
 *   format: 'html'
 * }
 *
 * // Multi-format with custom output
 * const multiFormatOptions: SkillCommandOptions = {
 *   format: 'html,json,junit',
 *   output: 'test-reports',
 *   artifacts: 'always'
 * }
 * ```
 */
export interface SkillCommandOptions {
  /**
   * Comma-separated list of reporter formats
   * Must include 'html' (HTML is mandatory)
   *
   * @example 'html' | 'html,json' | 'html,json,junit'
   */
  format?: string;

  /**
   * Custom base output directory
   * Overrides default 'reports/e2e'
   *
   * @example 'test-reports' | 'custom/reports/path'
   */
  output?: string;

  /**
   * Artifact capture policy
   * - `on-failure`: Capture only on test failure (default)
   * - `always`: Always capture artifacts
   * - `never`: Never capture artifacts
   */
  artifacts?: 'on-failure' | 'always' | 'never';
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type to extract output path from reporter config
 */
export type ReporterOutputPath<T extends ReporterConfig> = T extends HTMLReporterConfig
  ? string
  : string;

/**
 * Type guard to check if reporter is HTML type
 *
 * @example
 * ```ts
 * if (isHTMLReporter(reporter)) {
 *   console.log(reporter.outputFolder); // TypeScript knows this is HTMLReporterConfig
 * }
 * ```
 */
export function isHTMLReporter(reporter: ReporterConfig): reporter is HTMLReporterConfig {
  return reporter.type === 'html';
}

/**
 * Type guard to check if reporter is JSON type
 */
export function isJSONReporter(reporter: ReporterConfig): reporter is JSONReporterConfig {
  return reporter.type === 'json';
}

/**
 * Type guard to check if reporter is JUnit type
 */
export function isJUnitReporter(reporter: ReporterConfig): reporter is JUnitReporterConfig {
  return reporter.type === 'junit';
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default reporter configurations
 */
export const DEFAULT_REPORTERS: Record<ReporterFormat, ReporterConfig> = {
  html: {
    type: 'html',
    outputFolder: 'reports/e2e/html',
    open: 'never'
  },
  json: {
    type: 'json',
    outputFile: 'reports/e2e/json/results.json'
  },
  junit: {
    type: 'junit',
    outputFile: 'reports/e2e/junit/results.xml'
  }
};

/**
 * Default artifact retention policies
 */
export const DEFAULT_ARTIFACT_POLICIES: Record<string, ArtifactRetentionPolicy> = {
  development: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  ci: {
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'on-first-retry'
  },
  debug: {
    screenshot: 'on',
    video: 'on',
    trace: 'on'
  },
  minimal: {
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  }
};

/**
 * Default directory structure
 */
export const DEFAULT_DIRECTORY_STRUCTURE: DirectoryStructure = {
  basePath: 'reports/e2e',
  htmlDir: 'reports/e2e/html',
  jsonDir: 'reports/e2e/json',
  junitDir: 'reports/e2e/junit',
  artifactsDir: 'reports/e2e/artifacts',
  screenshotsDir: 'reports/e2e/artifacts/screenshots',
  videosDir: 'reports/e2e/artifacts/videos',
  tracesDir: 'reports/e2e/artifacts/traces'
};

/**
 * Default skill command options
 */
export const DEFAULT_SKILL_OPTIONS: Required<SkillCommandOptions> = {
  format: 'html',
  output: 'reports/e2e',
  artifacts: 'on-failure'
};
