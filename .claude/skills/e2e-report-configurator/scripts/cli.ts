#!/usr/bin/env node
/**
 * @spec T006-e2e-report-configurator
 * CLI entry point for E2E Report Configurator skill
 */

import { setupCommand, validateCommand, docsCommand } from './index'
import type { SkillCommandOptions } from './types'
import type { DocsOptions } from './docs-generator'

/**
 * Parsed CLI arguments
 */
interface CLIArgs {
  command: 'setup' | 'validate' | 'docs'
  options: Record<string, string | boolean>
}

/**
 * Parses command-line arguments
 *
 * @param args - Process arguments (default: process.argv.slice(2))
 * @returns Parsed command and options
 *
 * @example
 * ```ts
 * // node cli.ts setup --format html,json --output reports
 * const args = parseArgs(['setup', '--format', 'html,json', '--output', 'reports'])
 * // => { command: 'setup', options: { format: 'html,json', output: 'reports' } }
 * ```
 */
export function parseArgs(args: string[] = process.argv.slice(2)): CLIArgs {
  if (args.length === 0) {
    throw new Error('No command specified. Use: setup, validate, or docs')
  }

  const command = args[0] as 'setup' | 'validate' | 'docs'
  const validCommands = ['setup', 'validate', 'docs']

  if (!validCommands.includes(command)) {
    throw new Error(
      `Invalid command: ${command}. Valid commands: ${validCommands.join(', ')}`
    )
  }

  const options: Record<string, string | boolean> = {}
  let i = 1

  while (i < args.length) {
    const arg = args[i]

    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const nextArg = args[i + 1]

      // Check if next argument is a value (not another flag)
      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg
        i += 2
      } else {
        // Boolean flag
        options[key] = true
        i += 1
      }
    } else {
      i += 1
    }
  }

  return { command, options }
}

/**
 * Executes CLI command
 *
 * @param args - Command-line arguments
 */
export async function executeCLI(args: string[] = process.argv.slice(2)): Promise<void> {
  try {
    const { command, options } = parseArgs(args)

    switch (command) {
      case 'setup': {
        const setupOptions: Partial<SkillCommandOptions> = {
          format: options.format as string,
          output: options.output as string,
          artifacts: options.artifacts as 'on-failure' | 'always' | 'never'
        }

        const configPath = (options.config as string) || 'playwright.config.ts'
        const gitignorePath = (options.gitignore as string) || '.gitignore'

        console.log('🚀 Running setup command...\n')
        const result = await setupCommand(setupOptions, configPath, gitignorePath)

        if (result.success) {
          console.log(result.message)
          process.exit(0)
        } else {
          console.error('❌ Setup failed:\n')
          console.error(result.error || result.message)
          process.exit(1)
        }
      }

      case 'validate': {
        const configPath = (options.config as string) || 'playwright.config.ts'

        console.log('🔍 Running validation...\n')
        const result = await validateCommand(configPath)

        console.log(result.summary)

        if (!result.valid) {
          process.exit(1)
        }

        process.exit(0)
      }

      case 'docs': {
        const docsOptions: DocsOptions = {
          formats: options.formats
            ? (options.formats as string).split(',')
            : undefined,
          reportDir: options['report-dir'] as string,
          outputDir: options['output-dir'] as string
        }

        const outputPath = (options.output as string) || 'docs/e2e-reports.md'

        console.log('📝 Generating CI/CD documentation...\n')
        const result = await docsCommand(docsOptions, outputPath)

        if (result.success) {
          console.log(result.message)
          process.exit(0)
        } else {
          console.error('❌ Documentation generation failed:\n')
          console.error(result.error || result.message)
          process.exit(1)
        }
      }

      default: {
        throw new Error(`Unknown command: ${command}`)
      }
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message)
    console.error('\nUsage:')
    console.error('  e2e-report-configurator setup [options]')
    console.error('  e2e-report-configurator validate [options]')
    console.error('  e2e-report-configurator docs [options]')
    console.error('\nRun with --help for more information')
    process.exit(1)
  }
}

/**
 * Displays help message
 */
export function showHelp(): void {
  console.log(`
E2E Report Configurator - Playwright test report configuration tool

USAGE:
  e2e-report-configurator <command> [options]

COMMANDS:
  setup       Configure Playwright reporters and directories
  validate    Validate Playwright configuration
  docs        Generate CI/CD integration documentation

SETUP OPTIONS:
  --format <formats>       Reporter formats (html, html,json, html,json,junit)
                          Default: html
  --output <path>         Output directory for reports
                          Default: reports/e2e
  --artifacts <policy>    Artifact retention policy (on-failure, always, never)
                          Default: on-failure
  --config <path>         Path to playwright.config.ts
                          Default: playwright.config.ts
  --gitignore <path>      Path to .gitignore
                          Default: .gitignore

VALIDATE OPTIONS:
  --config <path>         Path to playwright.config.ts
                          Default: playwright.config.ts

DOCS OPTIONS:
  --formats <formats>     Reporter formats configured
                          Default: html
  --report-dir <path>     Report directory path
                          Default: reports/e2e
  --output <path>         Output file path
                          Default: docs/e2e-reports.md

EXAMPLES:
  # Minimal setup (HTML only)
  e2e-report-configurator setup

  # Multi-format setup with custom output
  e2e-report-configurator setup --format html,json,junit --output test-reports

  # Always capture artifacts
  e2e-report-configurator setup --artifacts always

  # Validate configuration
  e2e-report-configurator validate

  # Generate CI/CD docs
  e2e-report-configurator docs --formats html,junit --report-dir test-reports

For more information, visit: https://github.com/anthropics/claude-code
`)
}

// Execute CLI if run directly
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  executeCLI(args)
}
