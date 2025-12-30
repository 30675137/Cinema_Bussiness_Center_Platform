/**
 * @spec T003-e2e-runner
 * Test report parsing and generation (T023, T024)
 */

import { readJsonFile } from './utils/file-utils';
import { join } from 'path';
import type { E2ERunConfig, TestReport, TestReportMetadata, TestReportStats, TestReportArtifacts, TestFailure } from './schemas';
import { ReportGenerationError } from './utils/error-handler';

/**
 * Playwright JSON report structure (subset we need)
 */
interface PlaywrightJsonReport {
  config?: {
    version?: string;
  };
  suites: Array<{
    specs: Array<{
      title: string;
      file: string;
      tests: Array<{
        status: string;
        results: Array<{
          status: string;
          duration: number;
          error?: {
            message: string;
            stack?: string;
          };
          attachments?: Array<{
            name: string;
            path?: string;
            contentType: string;
          }>;
        }>;
      }>;
    }>;
  }>;
  stats?: {
    startTime?: string;
    duration?: number;
  };
}

/**
 * Parse Playwright JSON report file (T023)
 * @param jsonPath - Path to Playwright results.json file
 * @returns Parsed Playwright report object
 * @throws ReportGenerationError if file cannot be read or parsed
 */
export function parsePlaywrightJsonReport(jsonPath: string): PlaywrightJsonReport {
  try {
    const report = readJsonFile<PlaywrightJsonReport>(jsonPath);
    return report;
  } catch (error) {
    if (error instanceof Error) {
      throw new ReportGenerationError(
        `Failed to parse Playwright JSON report: ${error.message}`,
        { jsonPath }
      );
    }
    throw new ReportGenerationError('Failed to parse Playwright JSON report', {
      jsonPath,
    });
  }
}

/**
 * Extract test statistics from Playwright report
 * @param playwrightReport - Parsed Playwright JSON report
 * @returns Test statistics
 */
function extractStats(playwrightReport: PlaywrightJsonReport): TestReportStats {
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let flaky = 0;

  for (const suite of playwrightReport.suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        total++;

        const status = test.status;
        if (status === 'passed' || status === 'expected') {
          passed++;
        } else if (status === 'failed' || status === 'unexpected') {
          failed++;
        } else if (status === 'skipped') {
          skipped++;
        } else if (status === 'flaky') {
          flaky++;
        }
      }
    }
  }

  return { total, passed, failed, skipped, flaky };
}

/**
 * Extract test failures from Playwright report
 * @param playwrightReport - Parsed Playwright JSON report
 * @returns Array of test failures
 */
function extractFailures(playwrightReport: PlaywrightJsonReport): TestFailure[] {
  const failures: TestFailure[] = [];

  for (const suite of playwrightReport.suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        if (test.status === 'failed' || test.status === 'unexpected') {
          for (const result of test.results || []) {
            if (result.error) {
              const failure: TestFailure = {
                file: spec.file,
                title: spec.title,
                error: result.error.message,
                stack: result.error.stack,
              };

              // Extract screenshot and video from attachments
              if (result.attachments) {
                for (const attachment of result.attachments) {
                  if (attachment.contentType.includes('image') && attachment.path) {
                    failure.screenshot = attachment.path;
                  }
                  if (attachment.contentType.includes('video') && attachment.path) {
                    failure.video = attachment.path;
                  }
                }
              }

              failures.push(failure);
            }
          }
        }
      }
    }
  }

  return failures;
}

/**
 * Generate structured TestReport from Playwright JSON report (T024)
 * @param playwrightReport - Parsed Playwright JSON report
 * @param config - E2ERunConfig used for test execution
 * @returns Structured TestReport object
 */
export function generateTestReport(
  playwrightReport: PlaywrightJsonReport,
  config: E2ERunConfig
): TestReport {
  // Extract metadata
  const metadata: TestReportMetadata = {
    env_profile: config.env_profile,
    timestamp: playwrightReport.stats?.startTime || new Date().toISOString(),
    duration: playwrightReport.stats?.duration || 0,
    playwright_version: playwrightReport.config?.version,
  };

  // Extract stats
  const stats = extractStats(playwrightReport);

  // Extract artifacts paths
  const artifacts: TestReportArtifacts = {
    html_report: join(config.report_output_dir, 'html-report'),
    json_results: join(config.report_output_dir, 'results.json'),
    traces_dir: join(config.report_output_dir, 'traces'),
    screenshots_dir: join(config.report_output_dir, 'screenshots'),
    videos_dir: join(config.report_output_dir, 'videos'),
  };

  // Extract failures
  const failures = extractFailures(playwrightReport);

  const report: TestReport = {
    metadata,
    stats,
    artifacts,
  };

  // Only include failures if there are any
  if (failures.length > 0) {
    report.failures = failures;
  }

  return report;
}
