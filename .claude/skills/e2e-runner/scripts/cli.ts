#!/usr/bin/env node

/**
 * @spec T003-e2e-runner
 * CLI entry point for e2e-runner skill (T019, T025, T031)
 */

import { resolve, join } from 'path';
import { loadConfig } from './config-loader';
import {
  generatePlaywrightConfig,
  writePlaywrightConfigFile,
  executePlaywrightTests,
  validateReportDirectory,
} from './runner';
import { parsePlaywrightJsonReport, generateTestReport } from './reporter';
import {
  loadCredentials,
  validateEnvProfileMatch,
  injectCredentials,
  checkFilePermissions,
} from './credentials-loader';
import { validateConfig, checkBaseUrlReachability } from './validator';
import * as logger from './utils/logger';
import { formatError } from './utils/error-handler';
import { existsSync } from 'fs';
import { deleteFile, writeJsonFile, fileExists } from './utils/file-utils';

/**
 * CLI arguments interface
 */
interface CLIArguments {
  command: 'run' | 'validate' | 'help';
  configPath?: string;
  cleanupTemp?: boolean;
  force?: boolean;
  checkReachability?: boolean;
}

/**
 * Parse command-line arguments
 * @param args - Process arguments (argv)
 * @returns Parsed CLI arguments
 */
export function parseArguments(args: string[]): CLIArguments {
  const command = args[2];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    return { command: 'help' };
  }

  if (command === 'run') {
    const configIndex = args.indexOf('--config');
    if (configIndex === -1 || !args[configIndex + 1]) {
      throw new Error('Missing required argument: --config <path>');
    }

    const configPath = args[configIndex + 1];
    const cleanupTemp = args.includes('--cleanup-temp');
    const force = args.includes('--force');

    return {
      command: 'run',
      configPath,
      cleanupTemp,
      force,
    };
  }

  if (command === 'validate') {
    const configIndex = args.indexOf('--config');
    if (configIndex === -1 || !args[configIndex + 1]) {
      throw new Error('Missing required argument: --config <path>');
    }

    const configPath = args[configIndex + 1];
    const checkReachability = args.includes('--check-reachability');

    return {
      command: 'validate',
      configPath,
      checkReachability,
    };
  }

  throw new Error(`Unknown command: ${command}`);
}

/**
 * Display help message
 */
export function displayHelp(): void {
  console.log(`
E2E Test Runner - Unified Playwright Test Execution

Usage:
  e2e-runner run --config <path>           Execute E2E tests with config file
  e2e-runner validate --config <path>      Validate config file before execution
  e2e-runner help                          Display this help message

Commands:
  run         Execute E2E tests using Playwright
  validate    Validate configuration file without executing tests
  help        Display this help message

Options:
  --config <path>          Path to E2ERunConfig JSON file (required)
  --cleanup-temp           Delete temporary Playwright config after execution (run only)
  --force                  Overwrite existing report directory if it exists (run only)
  --check-reachability     Check if baseURL is reachable (validate only)

Examples:
  e2e-runner run --config configs/staging.json
  e2e-runner run --config configs/production.json --cleanup-temp
  e2e-runner run --config configs/uat.json --force
  e2e-runner validate --config configs/staging.json
  e2e-runner validate --config configs/staging.json --check-reachability

Environment Variables:
  E2E_USER_<ROLE>_USERNAME   Username for role-based credentials
  E2E_USER_<ROLE>_PASSWORD   Password for role-based credentials
  DEBUG                      Enable debug logging

Report:
  Test results are saved to the directory specified in report_output_dir
  - results.json          JSON report from Playwright
  - html-report/          HTML report for viewing in browser
  `);
}

/**
 * Execute the 'run' command (T025)
 * @param configPath - Path to E2ERunConfig file
 * @param cleanupTemp - Whether to clean up temp config after execution
 * @param force - Whether to overwrite existing report directory
 */
export async function runCommand(
  configPath: string,
  cleanupTemp: boolean = false,
  force: boolean = false
): Promise<void> {
  const tempConfigPath = join(process.cwd(), 'temp-playwright-config.ts');

  try {
    logger.section('E2E Test Runner');

    // Step 1: Load and validate config
    logger.step(1, 6, `Loading configuration from ${configPath}`);
    const resolvedConfigPath = resolve(configPath);
    const e2eConfig = loadConfig(resolvedConfigPath);
    logger.success(
      `Configuration loaded: ${e2eConfig.env_profile} (${e2eConfig.baseURL})`
    );

    // Step 2: Load and inject credentials (if specified)
    if (e2eConfig.credentials_ref) {
      logger.step(2, 6, `Loading credentials from ${e2eConfig.credentials_ref}`);
      const credentialsPath = resolve(e2eConfig.credentials_ref);

      // Check file permissions (Unix only)
      checkFilePermissions(credentialsPath);

      // Load credentials
      const credentials = loadCredentials(credentialsPath);

      // Validate env_profile matches
      validateEnvProfileMatch(e2eConfig.env_profile, credentials.env_profile);

      // Inject credentials into environment
      injectCredentials(credentials);

      const userCount = credentials.users?.length || 0;
      const apiKeyCount = credentials.api_keys?.length || 0;
      logger.success(
        `Credentials loaded: ${userCount} users, ${apiKeyCount} API keys`
      );
    } else {
      logger.step(2, 6, 'No credentials specified, skipping credential injection');
    }

    // Step 3: Validate report directory
    logger.step(3, 6, 'Validating report directory');
    validateReportDirectory(e2eConfig.report_output_dir, force);
    logger.success('Report directory validated');

    // Step 4: Generate Playwright config
    logger.step(4, 6, 'Generating Playwright configuration');
    const playwrightConfig = generatePlaywrightConfig(e2eConfig);
    writePlaywrightConfigFile(playwrightConfig, tempConfigPath);
    logger.success(`Playwright config written to ${tempConfigPath}`);

    // Step 5: Execute tests
    logger.step(5, 6, `Executing Playwright tests (${e2eConfig.testMatch})`);
    const exitCode = await executePlaywrightTests(
      tempConfigPath,
      e2eConfig.testMatch
    );

    // Step 6: Generate and save test report
    logger.step(6, 6, 'Generating test report');
    const jsonReportPath = join(e2eConfig.report_output_dir, 'results.json');

    if (fileExists(jsonReportPath)) {
      const playwrightReport = parsePlaywrightJsonReport(jsonReportPath);
      const testReport = generateTestReport(playwrightReport, e2eConfig);

      // Save structured test report
      const testReportPath = join(e2eConfig.report_output_dir, 'test-report.json');
      writeJsonFile(testReportPath, testReport);

      logger.success(`Test report generated: ${testReportPath}`);
      logger.info(
        `Results: ${testReport.stats.passed}/${testReport.stats.total} passed, ${testReport.stats.failed} failed`
      );
    } else {
      logger.warn('Playwright JSON report not found, skipping test report generation');
    }

    // Cleanup temp config if requested
    if (cleanupTemp && existsSync(tempConfigPath)) {
      deleteFile(tempConfigPath);
      logger.info('Temporary config file cleaned up');
    }

    if (exitCode === 0) {
      logger.success(`All tests passed! Reports saved to ${e2eConfig.report_output_dir}`);
    } else {
      logger.warn(`Tests completed with exit code ${exitCode}`);
      logger.info(`Check reports in ${e2eConfig.report_output_dir}`);
    }

    process.exit(exitCode);
  } catch (error) {
    logger.error('Test execution failed');
    logger.error(formatError(error));

    // Cleanup temp config on error
    if (existsSync(tempConfigPath)) {
      deleteFile(tempConfigPath);
    }

    process.exit(1);
  }
}

/**
 * Execute the 'validate' command (T042)
 * @param configPath - Path to E2ERunConfig file
 * @param checkReachability - Whether to check baseURL reachability
 */
export async function validateCommand(
  configPath: string,
  checkReachability: boolean = false
): Promise<void> {
  try {
    logger.section('E2E Config Validator');

    // Step 1: Load config file
    logger.step(1, checkReachability ? 3 : 2, `Loading configuration from ${configPath}`);
    const resolvedConfigPath = resolve(configPath);

    if (!fileExists(resolvedConfigPath)) {
      logger.error(`Config file not found: ${resolvedConfigPath}`);
      process.exit(1);
    }

    const e2eConfig = loadConfig(resolvedConfigPath);
    logger.success('Configuration file loaded successfully');

    // Step 2: Validate config
    logger.step(2, checkReachability ? 3 : 2, 'Validating configuration');
    validateConfig(e2eConfig);
    logger.success('✓ Configuration is valid');

    // Display config summary
    logger.info('');
    logger.info('Configuration Summary:');
    logger.info(`  Environment: ${e2eConfig.env_profile}`);
    logger.info(`  Base URL: ${e2eConfig.baseURL}`);
    logger.info(`  Report Dir: ${e2eConfig.report_output_dir}`);
    logger.info(`  Test Match: ${e2eConfig.testMatch}`);
    logger.info(`  Retries: ${e2eConfig.retries}`);
    logger.info(`  Workers: ${e2eConfig.workers || 'default (CPU cores)'}`);
    logger.info(`  Timeout: ${e2eConfig.timeout}ms`);
    if (e2eConfig.credentials_ref) {
      logger.info(`  Credentials: ${e2eConfig.credentials_ref}`);
    }
    if (e2eConfig.projects && e2eConfig.projects.length > 0) {
      logger.info(`  Projects: ${e2eConfig.projects.map((p) => p.name).join(', ')}`);
    }

    // Step 3: Check baseURL reachability (optional)
    if (checkReachability) {
      logger.step(3, 3, `Checking baseURL reachability: ${e2eConfig.baseURL}`);
      const isReachable = await checkBaseUrlReachability(e2eConfig.baseURL);

      if (isReachable) {
        logger.success('✓ Base URL is reachable');
      } else {
        logger.warn('⚠ Base URL appears to be unreachable');
        logger.warn('Tests may fail due to connectivity issues');
      }
    }

    logger.info('');
    logger.success('Validation complete - configuration is ready for use');
    process.exit(0);
  } catch (error) {
    logger.error('Validation failed');
    logger.error(formatError(error));
    process.exit(1);
  }
}

/**
 * Main CLI entry point
 */
export async function main(): Promise<void> {
  try {
    const cliArgs = parseArguments(process.argv);

    if (cliArgs.command === 'help') {
      displayHelp();
      process.exit(0);
    }

    if (cliArgs.command === 'run' && cliArgs.configPath) {
      await runCommand(cliArgs.configPath, cliArgs.cleanupTemp, cliArgs.force);
    }

    if (cliArgs.command === 'validate' && cliArgs.configPath) {
      await validateCommand(cliArgs.configPath, cliArgs.checkReachability);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

// Execute main if running as CLI
if (require.main === module) {
  main();
}
