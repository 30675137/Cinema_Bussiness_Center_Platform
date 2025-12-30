/**
 * @spec T003-e2e-runner
 * Integration test for report generation (T026)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { validateReportDirectory } from '@/runner';
import { parsePlaywrightJsonReport, generateTestReport } from '@/reporter';
import type { E2ERunConfig } from '@/schemas';
import { FileOperationError } from '@/utils/error-handler';

const TEST_REPORT_DIR = join(__dirname, '..', 'fixtures', 'test-reports');

describe('Integration: Report Generation', () => {
  beforeEach(() => {
    if (existsSync(TEST_REPORT_DIR)) {
      rmSync(TEST_REPORT_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEST_REPORT_DIR)) {
      rmSync(TEST_REPORT_DIR, { recursive: true, force: true });
    }
  });

  describe('validateReportDirectory', () => {
    it('should pass validation if directory does not exist', () => {
      const reportDir = join(TEST_REPORT_DIR, 'new-report');

      expect(() => validateReportDirectory(reportDir, false)).not.toThrow();
    });

    it('should throw FileOperationError if directory exists and force=false', () => {
      const reportDir = join(TEST_REPORT_DIR, 'existing-report');
      mkdirSync(reportDir, { recursive: true });

      expect(() => validateReportDirectory(reportDir, false)).toThrow(
        FileOperationError
      );
      expect(() => validateReportDirectory(reportDir, false)).toThrow(
        /already exists/
      );
    });

    it('should pass validation if directory exists and force=true', () => {
      const reportDir = join(TEST_REPORT_DIR, 'existing-report');
      mkdirSync(reportDir, { recursive: true });

      expect(() => validateReportDirectory(reportDir, true)).not.toThrow();
    });
  });

  describe('parsePlaywrightJsonReport', () => {
    it('should parse valid Playwright JSON report', () => {
      const jsonPath = join(TEST_REPORT_DIR, 'results.json');
      mkdirSync(TEST_REPORT_DIR, { recursive: true });

      const mockReport = {
        config: { version: '1.40.0' },
        suites: [
          {
            specs: [
              {
                title: 'example test',
                file: 'example.spec.ts',
                tests: [
                  {
                    status: 'passed',
                    results: [{ status: 'passed', duration: 100 }],
                  },
                ],
              },
            ],
          },
        ],
        stats: {
          startTime: '2025-12-30T10:00:00Z',
          duration: 5000,
        },
      };

      writeFileSync(jsonPath, JSON.stringify(mockReport));

      const parsed = parsePlaywrightJsonReport(jsonPath);

      expect(parsed.config?.version).toBe('1.40.0');
      expect(parsed.suites).toHaveLength(1);
      expect(parsed.stats?.duration).toBe(5000);
    });

    it('should throw ReportGenerationError for non-existing file', () => {
      const jsonPath = join(TEST_REPORT_DIR, 'non-existing.json');

      expect(() => parsePlaywrightJsonReport(jsonPath)).toThrow(
        /Failed to parse Playwright JSON report/
      );
    });
  });

  describe('generateTestReport', () => {
    it('should generate TestReport with correct structure', () => {
      const mockPlaywrightReport = {
        config: { version: '1.40.0' },
        suites: [
          {
            specs: [
              {
                title: 'test 1',
                file: 'test1.spec.ts',
                tests: [
                  {
                    status: 'passed',
                    results: [{ status: 'passed', duration: 100 }],
                  },
                ],
              },
              {
                title: 'test 2',
                file: 'test2.spec.ts',
                tests: [
                  {
                    status: 'failed',
                    results: [
                      {
                        status: 'failed',
                        duration: 200,
                        error: {
                          message: 'Test failed',
                          stack: 'at test2.spec.ts:10',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        stats: {
          startTime: '2025-12-30T10:00:00Z',
          duration: 5000,
        },
      };

      const config: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://test.example.com',
        report_output_dir: './reports/test',
        retries: 0,
        timeout: 30000,
        testMatch: 'tests/**/*.spec.ts',
      };

      const testReport = generateTestReport(mockPlaywrightReport, config);

      // Verify metadata
      expect(testReport.metadata.env_profile).toBe('test');
      expect(testReport.metadata.timestamp).toBe('2025-12-30T10:00:00Z');
      expect(testReport.metadata.duration).toBe(5000);
      expect(testReport.metadata.playwright_version).toBe('1.40.0');

      // Verify stats
      expect(testReport.stats.total).toBe(2);
      expect(testReport.stats.passed).toBe(1);
      expect(testReport.stats.failed).toBe(1);
      expect(testReport.stats.skipped).toBe(0);

      // Verify artifacts
      expect(testReport.artifacts.html_report).toContain('html-report');
      expect(testReport.artifacts.json_results).toContain('results.json');

      // Verify failures
      expect(testReport.failures).toHaveLength(1);
      expect(testReport.failures?.[0].title).toBe('test 2');
      expect(testReport.failures?.[0].error).toBe('Test failed');
    });

    it('should handle reports with no failures', () => {
      const mockPlaywrightReport = {
        suites: [
          {
            specs: [
              {
                title: 'test 1',
                file: 'test1.spec.ts',
                tests: [
                  {
                    status: 'passed',
                    results: [{ status: 'passed', duration: 100 }],
                  },
                ],
              },
            ],
          },
        ],
        stats: {
          startTime: '2025-12-30T10:00:00Z',
          duration: 2000,
        },
      };

      const config: E2ERunConfig = {
        env_profile: 'staging',
        baseURL: 'https://staging.example.com',
        report_output_dir: './reports/staging',
        retries: 0,
        timeout: 30000,
        testMatch: 'tests/**/*.spec.ts',
      };

      const testReport = generateTestReport(mockPlaywrightReport, config);

      expect(testReport.stats.total).toBe(1);
      expect(testReport.stats.passed).toBe(1);
      expect(testReport.stats.failed).toBe(0);
      expect(testReport.failures).toBeUndefined();
    });

    it('should count skipped and flaky tests correctly', () => {
      const mockPlaywrightReport = {
        suites: [
          {
            specs: [
              {
                title: 'test 1',
                file: 'test1.spec.ts',
                tests: [
                  {
                    status: 'skipped',
                    results: [],
                  },
                ],
              },
              {
                title: 'test 2',
                file: 'test2.spec.ts',
                tests: [
                  {
                    status: 'flaky',
                    results: [{ status: 'flaky', duration: 100 }],
                  },
                ],
              },
            ],
          },
        ],
        stats: {},
      };

      const config: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://test.example.com',
        report_output_dir: './reports/test',
        retries: 0,
        timeout: 30000,
        testMatch: 'tests/**/*.spec.ts',
      };

      const testReport = generateTestReport(mockPlaywrightReport, config);

      expect(testReport.stats.total).toBe(2);
      expect(testReport.stats.skipped).toBe(1);
      expect(testReport.stats.flaky).toBe(1);
    });
  });
});
