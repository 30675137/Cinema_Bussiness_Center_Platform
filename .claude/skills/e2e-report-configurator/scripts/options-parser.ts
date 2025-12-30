/**
 * @spec T006-e2e-report-configurator
 * Command-line options parser with Zod validation
 */

import { z } from 'zod'
import type { SkillCommandOptions } from './types'
import { DEFAULT_SKILL_OPTIONS } from './types'

/**
 * Zod schema for skill command options validation
 */
const SkillCommandOptionsSchema = z
  .object({
    format: z.string().optional(),
    output: z.string().optional(),
    artifacts: z.enum(['on-failure', 'always', 'never']).optional()
  })
  .passthrough() // Allow additional properties

/**
 * Validates and normalizes reporter format string
 *
 * @param format - Comma-separated list of reporter formats
 * @returns Normalized format string
 * @throws Error if format is invalid or doesn't include HTML
 */
function validateFormat(format: string): string {
  // Trim spaces and split by comma
  const formats = format
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)

  // Remove duplicates
  const uniqueFormats = [...new Set(formats)]

  // Validate each format
  const validFormats = ['html', 'json', 'junit']
  for (const f of uniqueFormats) {
    if (!validFormats.includes(f)) {
      throw new Error(
        `Invalid reporter format: "${f}". Valid formats: ${validFormats.join(', ')}`
      )
    }
  }

  // Ensure HTML is included (mandatory)
  if (!uniqueFormats.includes('html')) {
    throw new Error('HTML reporter is mandatory. Format must include "html"')
  }

  return uniqueFormats.join(',')
}

/**
 * Validates and normalizes output directory path
 *
 * @param output - Base output directory path
 * @returns Normalized output path (no trailing slash)
 * @throws Error if output is invalid
 */
function validateOutput(output: string): string {
  // Check for empty string
  if (output.trim() === '') {
    throw new Error('Output directory cannot be empty')
  }

  // Remove trailing slash
  const normalized = output.replace(/\/$/, '')

  // Check for absolute path
  if (normalized.startsWith('/')) {
    throw new Error(
      'Output directory must be relative (not an absolute path)'
    )
  }

  // Check for invalid characters (allow alphanumeric, dash, underscore, slash)
  if (!/^[a-zA-Z0-9_\-\/]+$/.test(normalized)) {
    throw new Error(
      'Output directory contains invalid characters. Use only letters, numbers, dashes, underscores, and slashes'
    )
  }

  return normalized
}

/**
 * Parses and validates command-line options for the skill
 *
 * @param options - Raw command-line options (partial)
 * @returns Validated and normalized options with defaults applied
 * @throws Error if validation fails
 *
 * @example
 * ```ts
 * // Minimal options (uses defaults)
 * const opts1 = parseSkillOptions({})
 * // => { format: 'html', output: 'reports/e2e', artifacts: 'on-failure' }
 *
 * // Custom options
 * const opts2 = parseSkillOptions({
 *   format: 'html,json,junit',
 *   output: 'test-reports',
 *   artifacts: 'always'
 * })
 * // => { format: 'html,json,junit', output: 'test-reports', artifacts: 'always' }
 * ```
 */
export function parseSkillOptions(
  options: Partial<SkillCommandOptions> | null | undefined
): Required<SkillCommandOptions> {
  // Handle null/undefined input
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    if (options !== null && options !== undefined) {
      throw new Error('Options must be an object')
    }
    options = {}
  }

  // Validate schema
  const parseResult = SkillCommandOptionsSchema.safeParse(options)
  if (!parseResult.success) {
    throw new Error(
      `Invalid options: ${parseResult.error.errors.map((e) => e.message).join(', ')}`
    )
  }

  // Apply defaults
  const format = options.format ?? DEFAULT_SKILL_OPTIONS.format
  const output = options.output ?? DEFAULT_SKILL_OPTIONS.output
  const artifacts = options.artifacts ?? DEFAULT_SKILL_OPTIONS.artifacts

  // Validate and normalize
  const validatedFormat = validateFormat(format)
  const validatedOutput = validateOutput(output)

  // Validate artifacts (already constrained by Zod enum)
  if (!['on-failure', 'always', 'never'].includes(artifacts)) {
    throw new Error(
      'Invalid artifacts policy. Must be one of: on-failure, always, never'
    )
  }

  return {
    format: validatedFormat,
    output: validatedOutput,
    artifacts: artifacts as 'on-failure' | 'always' | 'never'
  }
}

/**
 * Splits format string into array of reporter formats
 *
 * @param formatString - Comma-separated format string (e.g., "html,json,junit")
 * @returns Array of format strings
 *
 * @example
 * ```ts
 * getFormatArray('html,json,junit')
 * // => ['html', 'json', 'junit']
 *
 * getFormatArray('html')
 * // => ['html']
 * ```
 */
export function getFormatArray(formatString: string): string[] {
  return formatString.split(',').filter(Boolean)
}

/**
 * Checks if a specific format is enabled
 *
 * @param formatString - Comma-separated format string
 * @param format - Format to check (e.g., 'json')
 * @returns True if format is enabled
 *
 * @example
 * ```ts
 * hasFormat('html,json,junit', 'json') // => true
 * hasFormat('html', 'json') // => false
 * ```
 */
export function hasFormat(formatString: string, format: string): boolean {
  return getFormatArray(formatString).includes(format)
}
