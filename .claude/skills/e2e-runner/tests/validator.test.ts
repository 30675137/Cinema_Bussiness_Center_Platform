/**
 * @spec T003-e2e-runner
 * Unit tests for validator.ts (T043)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateConfig, checkBaseUrlReachability } from '@/validator';
import type { E2ERunConfig } from '@/schemas';

describe('validator', () => {
  describe('validateConfig', () => {
    it('should pass validation for a valid config', () => {
      const validConfig: E2ERunConfig = {
        env_profile: 'staging',
        baseURL: 'https://staging.example.com',
        report_output_dir: './reports/run-1',
        retries: 2,
        workers: 4,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(validConfig)).not.toThrow();
    });

    it('should pass validation for minimal config with defaults', () => {
      const minimalConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'http://localhost:3000',
        report_output_dir: './reports/test',
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(minimalConfig)).not.toThrow();
    });

    it('should reject config with invalid baseURL format', () => {
      const invalidConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'not-a-valid-url',
        report_output_dir: './reports/test',
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(invalidConfig)).toThrow(/baseURL must be a valid URL/);
    });

    it('should reject config with non-http(s) baseURL', () => {
      const invalidConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'ftp://example.com',
        report_output_dir: './reports/test',
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(invalidConfig)).toThrow(/baseURL must start with http/);
    });

    it('should reject config with invalid env_profile pattern', () => {
      const invalidConfig: E2ERunConfig = {
        env_profile: 'INVALID_UPPERCASE',
        baseURL: 'https://example.com',
        report_output_dir: './reports/test',
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(invalidConfig)).toThrow(/env_profile must be lowercase/);
    });

    it('should reject config with negative retries', () => {
      const invalidConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports/test',
        retries: -1,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(invalidConfig)).toThrow(/retries must be >= 0/);
    });

    it('should reject config with retries exceeding maximum', () => {
      const invalidConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports/test',
        retries: 10,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(invalidConfig)).toThrow(/retries must be <= 5/);
    });

    it('should reject config with workers <= 0', () => {
      const invalidConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports/test',
        retries: 0,
        workers: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(invalidConfig)).toThrow(/workers must be >= 1/);
    });

    it('should reject config with timeout less than minimum', () => {
      const invalidConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports/test',
        retries: 0,
        timeout: 500,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(invalidConfig)).toThrow(/timeout must be >= 1000ms/);
    });

    it('should reject config with empty report_output_dir', () => {
      const invalidConfig: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: '',
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(invalidConfig)).toThrow(/report_output_dir cannot be empty/);
    });

    it('should warn if credentials_ref file does not exist', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const configWithMissingCreds: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports/test',
        credentials_ref: './credentials/nonexistent.json',
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      validateConfig(configWithMissingCreds);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: credentials file not found')
      );

      warnSpy.mockRestore();
    });

    it('should not warn if credentials_ref file exists', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const configWithExistingCreds: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports/test',
        credentials_ref: './package.json', // Use a file we know exists
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      validateConfig(configWithExistingCreds);

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should validate config with optional projects array', () => {
      const configWithProjects: E2ERunConfig = {
        env_profile: 'test',
        baseURL: 'https://example.com',
        report_output_dir: './reports/test',
        projects: [
          { name: 'chromium' },
          { name: 'firefox', use: { viewport: { width: 1280, height: 720 } } },
        ],
        retries: 0,
        timeout: 30000,
        testMatch: 'scenarios/**/*.spec.ts',
      };

      expect(() => validateConfig(configWithProjects)).not.toThrow();
    });
  });

  describe('checkBaseUrlReachability', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true for reachable URL', async () => {
      // Mock successful HTTP request
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await checkBaseUrlReachability('https://example.com');

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com', {
        method: 'GET',
        signal: expect.any(AbortSignal),
      });
    });

    it('should return false for unreachable URL', async () => {
      // Mock failed HTTP request
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await checkBaseUrlReachability('https://nonexistent.invalid');

      expect(result).toBe(false);
    });

    it('should return false for URL that returns error status', async () => {
      // Mock HTTP request with error status
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await checkBaseUrlReachability('https://example.com/404');

      expect(result).toBe(false);
    });

    it('should timeout after 5 seconds', async () => {
      // Mock slow HTTP request
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true }), 10000);
          })
      );

      const result = await checkBaseUrlReachability('https://slow.example.com');

      expect(result).toBe(false);
    }, 6000); // Test timeout slightly longer than implementation timeout

    it('should handle redirect responses', async () => {
      // Mock redirect response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 301,
        redirected: true,
      });

      const result = await checkBaseUrlReachability('https://example.com');

      expect(result).toBe(true);
    });

    it('should warn if baseURL is unreachable', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      await checkBaseUrlReachability('https://unreachable.example.com');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: baseURL appears to be unreachable')
      );

      warnSpy.mockRestore();
    });
  });
});
