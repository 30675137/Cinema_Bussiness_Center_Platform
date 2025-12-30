/**
 * @spec T003-e2e-runner
 * Unit tests for config-loader.ts (T014)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadConfig } from '@/config-loader';
import { ConfigValidationError } from '@/utils/error-handler';

const TEST_DIR = join(__dirname, 'fixtures', 'configs');

describe('config-loader', () => {
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

  describe('loadConfig', () => {
    it('should load valid minimal config', () => {
      const configPath = join(TEST_DIR, 'valid-minimal.json');
      const configData = {
        env_profile: 'staging',
        baseURL: 'https://staging.example.com',
        report_output_dir: './reports/staging',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      const result = loadConfig(configPath);

      expect(result.env_profile).toBe('staging');
      expect(result.baseURL).toBe('https://staging.example.com');
      expect(result.report_output_dir).toBe('./reports/staging');
      expect(result.retries).toBe(0); // default value
      expect(result.timeout).toBe(30000); // default value
      expect(result.testMatch).toBe('scenarios/**/*.spec.ts'); // default value
    });

    it('should load valid config with all fields', () => {
      const configPath = join(TEST_DIR, 'valid-full.json');
      const configData = {
        env_profile: 'production',
        baseURL: 'https://production.example.com',
        projects: [
          { name: 'chromium', use: { browserName: 'chromium' } },
          { name: 'firefox', use: { browserName: 'firefox' } },
        ],
        credentials_ref: 'production-creds',
        retries: 2,
        workers: 4,
        timeout: 60000,
        report_output_dir: './reports/prod',
        testMatch: 'tests/**/*.e2e.ts',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      const result = loadConfig(configPath);

      expect(result.env_profile).toBe('production');
      expect(result.baseURL).toBe('https://production.example.com');
      expect(result.projects).toHaveLength(2);
      expect(result.projects?.[0].name).toBe('chromium');
      expect(result.credentials_ref).toBe('production-creds');
      expect(result.retries).toBe(2);
      expect(result.workers).toBe(4);
      expect(result.timeout).toBe(60000);
      expect(result.report_output_dir).toBe('./reports/prod');
      expect(result.testMatch).toBe('tests/**/*.e2e.ts');
    });

    it('should throw ConfigValidationError for non-existing file', () => {
      const configPath = join(TEST_DIR, 'non-existing.json');

      expect(() => loadConfig(configPath)).toThrow();
    });

    it('should throw ConfigValidationError for invalid JSON', () => {
      const configPath = join(TEST_DIR, 'invalid-json.json');
      writeFileSync(configPath, '{ invalid json }');

      expect(() => loadConfig(configPath)).toThrow();
    });

    it('should throw ConfigValidationError for missing required field: env_profile', () => {
      const configPath = join(TEST_DIR, 'missing-env-profile.json');
      const configData = {
        baseURL: 'https://example.com',
        report_output_dir: './reports',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/env_profile/);
    });

    it('should throw ConfigValidationError for missing required field: baseURL', () => {
      const configPath = join(TEST_DIR, 'missing-baseurl.json');
      const configData = {
        env_profile: 'test',
        report_output_dir: './reports',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/baseURL/);
    });

    it('should throw ConfigValidationError for missing required field: report_output_dir', () => {
      const configPath = join(TEST_DIR, 'missing-report-dir.json');
      const configData = {
        env_profile: 'test',
        baseURL: 'https://example.com',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/report_output_dir/);
    });

    it('should throw ConfigValidationError for invalid env_profile format', () => {
      const configPath = join(TEST_DIR, 'invalid-env-profile.json');
      const configData = {
        env_profile: 'Invalid_Profile', // uppercase and underscore not allowed
        baseURL: 'https://example.com',
        report_output_dir: './reports',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/lowercase alphanumeric/);
    });

    it('should throw ConfigValidationError for invalid baseURL format', () => {
      const configPath = join(TEST_DIR, 'invalid-baseurl.json');
      const configData = {
        env_profile: 'test',
        baseURL: 'not-a-url', // invalid URL
        report_output_dir: './reports',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/URL/);
    });

    it('should throw ConfigValidationError for baseURL without http/https', () => {
      const configPath = join(TEST_DIR, 'baseurl-no-protocol.json');
      const configData = {
        env_profile: 'test',
        baseURL: 'ftp://example.com', // wrong protocol
        report_output_dir: './reports',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/http/);
    });

    it('should throw ConfigValidationError for retries out of range (negative)', () => {
      const configPath = join(TEST_DIR, 'invalid-retries-negative.json');
      const configData = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports',
        retries: -1,
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/retries/);
    });

    it('should throw ConfigValidationError for retries out of range (too high)', () => {
      const configPath = join(TEST_DIR, 'invalid-retries-high.json');
      const configData = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports',
        retries: 10,
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/retries/);
    });

    it('should throw ConfigValidationError for workers < 1', () => {
      const configPath = join(TEST_DIR, 'invalid-workers.json');
      const configData = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports',
        workers: 0,
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/workers/);
    });

    it('should throw ConfigValidationError for timeout < 1000ms', () => {
      const configPath = join(TEST_DIR, 'invalid-timeout.json');
      const configData = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports',
        timeout: 500,
      };
      writeFileSync(configPath, JSON.stringify(configData));

      expect(() => loadConfig(configPath)).toThrow(ConfigValidationError);
      expect(() => loadConfig(configPath)).toThrow(/timeout/);
    });

    it('should accept http baseURL (not just https)', () => {
      const configPath = join(TEST_DIR, 'http-baseurl.json');
      const configData = {
        env_profile: 'local',
        baseURL: 'http://localhost:3000',
        report_output_dir: './reports',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      const result = loadConfig(configPath);

      expect(result.baseURL).toBe('http://localhost:3000');
    });

    it('should accept valid env_profile with hyphens and numbers', () => {
      const configPath = join(TEST_DIR, 'valid-env-profile.json');
      const configData = {
        env_profile: 'saas-staging-v2',
        baseURL: 'https://example.com',
        report_output_dir: './reports',
      };
      writeFileSync(configPath, JSON.stringify(configData));

      const result = loadConfig(configPath);

      expect(result.env_profile).toBe('saas-staging-v2');
    });
  });
});
