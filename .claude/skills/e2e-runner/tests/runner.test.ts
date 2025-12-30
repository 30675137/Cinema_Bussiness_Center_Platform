/**
 * @spec T003-e2e-runner
 * Unit tests for runner.ts (T018)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  generatePlaywrightConfig,
  writePlaywrightConfigFile,
  executePlaywrightTests,
} from '@/runner';
import type { E2ERunConfig } from '@/schemas';

const TEST_DIR = join(__dirname, 'fixtures', 'runner-temp');

describe('runner', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('generatePlaywrightConfig', () => {
    it('should generate minimal Playwright config', () => {
      const e2eConfig: E2ERunConfig = {
        env_profile: 'staging',
        baseURL: 'https://staging.example.com',
        report_output_dir: './reports/staging',
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      const playwrightConfig = generatePlaywrightConfig(e2eConfig);

      expect(playwrightConfig.use?.baseURL).toBe('https://staging.example.com');
      expect(playwrightConfig.retries).toBe(0);
      expect(playwrightConfig.timeout).toBe(30000);
      expect(playwrightConfig.testMatch).toBe('scenarios/**/*.spec.ts');
      expect(playwrightConfig.reporter).toBeDefined();
    });

    it('should include workers if specified', () => {
      const e2eConfig: E2ERunConfig = {
        env_profile: 'production',
        baseURL: 'https://example.com',
        report_output_dir: './reports',
        workers: 4,
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      const playwrightConfig = generatePlaywrightConfig(e2eConfig);

      expect(playwrightConfig.workers).toBe(4);
    });

    it('should include projects if specified', () => {
      const e2eConfig: E2ERunConfig = {
        env_profile: 'staging',
        baseURL: 'https://staging.example.com',
        report_output_dir: './reports',
        projects: [
          { name: 'chromium', use: { browserName: 'chromium' } },
          { name: 'firefox', use: { browserName: 'firefox' } },
        ],
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      const playwrightConfig = generatePlaywrightConfig(e2eConfig);

      expect(playwrightConfig.projects).toHaveLength(2);
      expect(playwrightConfig.projects?.[0].name).toBe('chromium');
      expect(playwrightConfig.projects?.[1].name).toBe('firefox');
    });

    it('should configure JSON and HTML reporters', () => {
      const e2eConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://test.example.com',
        report_output_dir: './reports/test',
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      const playwrightConfig = generatePlaywrightConfig(e2eConfig);

      expect(playwrightConfig.reporter).toBeDefined();
      expect(Array.isArray(playwrightConfig.reporter)).toBe(true);

      const reporters = playwrightConfig.reporter as any[];
      const jsonReporter = reporters.find((r) => r[0] === 'json');
      const htmlReporter = reporters.find((r) => r[0] === 'html');

      expect(jsonReporter).toBeDefined();
      expect(jsonReporter[1].outputFile).toContain('results.json');
      expect(htmlReporter).toBeDefined();
      expect(htmlReporter[1].outputFolder).toContain('html-report');
    });

    it('should merge baseURL into projects if projects are specified', () => {
      const e2eConfig: E2ERunConfig = {
        env_profile: 'staging',
        baseURL: 'https://staging.example.com',
        report_output_dir: './reports',
        projects: [{ name: 'chromium' }],
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      const playwrightConfig = generatePlaywrightConfig(e2eConfig);

      expect(playwrightConfig.projects?.[0].use?.baseURL).toBe(
        'https://staging.example.com'
      );
    });
  });

  describe('writePlaywrightConfigFile', () => {
    it('should write Playwright config to TypeScript file', () => {
      const config = {
        use: { baseURL: 'https://example.com' },
        retries: 1,
        timeout: 30000,
        testMatch: 'tests/**/*.spec.ts',
      };
      const configPath = join(TEST_DIR, 'playwright.config.ts');

      writePlaywrightConfigFile(config, configPath);

      expect(existsSync(configPath)).toBe(true);
      const content = readFileSync(configPath, 'utf-8');
      expect(content).toContain('import { defineConfig }');
      expect(content).toContain('export default defineConfig');
      expect(content).toContain('https://example.com');
    });

    it('should create parent directories if they do not exist', () => {
      const config = {
        use: { baseURL: 'https://example.com' },
        retries: 0,
        timeout: 30000,
      };
      const configPath = join(TEST_DIR, 'nested', 'deep', 'playwright.config.ts');

      writePlaywrightConfigFile(config, configPath);

      expect(existsSync(configPath)).toBe(true);
    });

    it('should generate valid TypeScript syntax', () => {
      const config = {
        use: { baseURL: 'https://example.com' },
        retries: 2,
        workers: 4,
        timeout: 60000,
        testMatch: 'scenarios/**/*.spec.ts',
        reporter: [
          ['json', { outputFile: 'results.json' }],
          ['html', { outputFolder: 'html-report' }],
        ],
      };
      const configPath = join(TEST_DIR, 'playwright.config.ts');

      writePlaywrightConfigFile(config, configPath);

      const content = readFileSync(configPath, 'utf-8');
      // Verify TypeScript syntax patterns
      expect(content).toContain("from '@playwright/test'");
      expect(content).toContain('defineConfig(');
      expect(content).toContain('});');
    });
  });

  describe('executePlaywrightTests', () => {
    it('should throw TestExecutionError if config file does not exist', async () => {
      const configPath = join(TEST_DIR, 'non-existing-config.ts');
      const testMatch = 'scenarios/**/*.spec.ts';

      await expect(
        executePlaywrightTests(configPath, testMatch)
      ).rejects.toThrow(/does not exist/);
    });

    // Note: Full integration test with actual Playwright execution
    // is covered in T020 (integration test)
  });
});
