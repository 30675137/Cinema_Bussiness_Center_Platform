/**
 * @spec T003-e2e-runner
 * Unit tests for credentials-loader.ts (T028, T030)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import {
  loadCredentials,
  validateEnvProfileMatch,
  injectCredentials,
  checkFilePermissions,
} from '@/credentials-loader';
import { CredentialsError } from '@/utils/error-handler';

const TEST_DIR = join(__dirname, 'fixtures', 'credentials');

describe('credentials-loader', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });

    // Clear environment variables before each test
    delete process.env.E2E_USER_ADMIN_USERNAME;
    delete process.env.E2E_USER_ADMIN_PASSWORD;
    delete process.env.E2E_USER_MANAGER_USERNAME;
    delete process.env.E2E_USER_MANAGER_PASSWORD;
    delete process.env.E2E_API_PAYMENT_KEY;
    delete process.env.E2E_API_PAYMENT_SECRET;
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }

    // Clean up environment variables after each test
    delete process.env.E2E_USER_ADMIN_USERNAME;
    delete process.env.E2E_USER_ADMIN_PASSWORD;
    delete process.env.E2E_USER_MANAGER_USERNAME;
    delete process.env.E2E_USER_MANAGER_PASSWORD;
    delete process.env.E2E_API_PAYMENT_KEY;
    delete process.env.E2E_API_PAYMENT_SECRET;
  });

  describe('loadCredentials', () => {
    it('should load valid credentials file', () => {
      const credPath = join(TEST_DIR, 'valid.json');
      const credData = {
        env_profile: 'staging',
        users: [
          {
            role: 'admin',
            username: 'admin@example.com',
            password: 'secret123',
          },
        ],
      };
      writeFileSync(credPath, JSON.stringify(credData));

      const result = loadCredentials(credPath);

      expect(result.env_profile).toBe('staging');
      expect(result.users).toHaveLength(1);
      expect(result.users?.[0].role).toBe('admin');
      expect(result.users?.[0].username).toBe('admin@example.com');
      expect(result.users?.[0].password).toBe('secret123');
    });

    it('should load credentials with users and api_keys', () => {
      const credPath = join(TEST_DIR, 'full.json');
      const credData = {
        env_profile: 'production',
        users: [
          {
            role: 'admin',
            username: 'admin@example.com',
            password: 'secret',
            display_name: 'Admin User',
          },
        ],
        api_keys: [
          {
            service: 'payment-gateway',
            api_key: 'pk_test_12345',
            api_secret: 'sk_test_67890',
          },
        ],
      };
      writeFileSync(credPath, JSON.stringify(credData));

      const result = loadCredentials(credPath);

      expect(result.env_profile).toBe('production');
      expect(result.users).toHaveLength(1);
      expect(result.api_keys).toHaveLength(1);
      expect(result.api_keys?.[0].service).toBe('payment-gateway');
      expect(result.api_keys?.[0].api_key).toBe('pk_test_12345');
    });

    it('should throw CredentialsError for non-existing file', () => {
      const credPath = join(TEST_DIR, 'non-existing.json');

      expect(() => loadCredentials(credPath)).toThrow(CredentialsError);
    });

    it('should throw CredentialsError for invalid JSON', () => {
      const credPath = join(TEST_DIR, 'invalid.json');
      writeFileSync(credPath, '{ invalid json }');

      expect(() => loadCredentials(credPath)).toThrow(CredentialsError);
    });

    it('should throw CredentialsError for missing env_profile', () => {
      const credPath = join(TEST_DIR, 'no-profile.json');
      const credData = {
        users: [{ role: 'admin', username: 'test', password: 'pass' }],
      };
      writeFileSync(credPath, JSON.stringify(credData));

      expect(() => loadCredentials(credPath)).toThrow(CredentialsError);
      expect(() => loadCredentials(credPath)).toThrow(/env_profile/);
    });

    it('should throw CredentialsError for empty password', () => {
      const credPath = join(TEST_DIR, 'empty-password.json');
      const credData = {
        env_profile: 'test',
        users: [{ role: 'admin', username: 'test', password: '' }],
      };
      writeFileSync(credPath, JSON.stringify(credData));

      expect(() => loadCredentials(credPath)).toThrow(CredentialsError);
      expect(() => loadCredentials(credPath)).toThrow(/password cannot be empty/);
    });

    it('should throw CredentialsError for empty api_key', () => {
      const credPath = join(TEST_DIR, 'empty-apikey.json');
      const credData = {
        env_profile: 'test',
        api_keys: [{ service: 'payment', api_key: '' }],
      };
      writeFileSync(credPath, JSON.stringify(credData));

      expect(() => loadCredentials(credPath)).toThrow(CredentialsError);
      expect(() => loadCredentials(credPath)).toThrow(/api_key cannot be empty/);
    });
  });

  describe('validateEnvProfileMatch', () => {
    it('should not throw when profiles match', () => {
      expect(() => validateEnvProfileMatch('staging', 'staging')).not.toThrow();
    });

    it('should throw CredentialsError when profiles do not match', () => {
      expect(() => validateEnvProfileMatch('staging', 'production')).toThrow(
        CredentialsError
      );
      expect(() => validateEnvProfileMatch('staging', 'production')).toThrow(
        /env_profile mismatch/
      );
    });
  });

  describe('injectCredentials', () => {
    it('should inject user credentials as environment variables', () => {
      const credentials = {
        env_profile: 'staging',
        users: [
          {
            role: 'admin',
            username: 'admin@example.com',
            password: 'secret123',
          },
          {
            role: 'manager',
            username: 'manager@example.com',
            password: 'pass456',
          },
        ],
      };

      injectCredentials(credentials);

      expect(process.env.E2E_USER_ADMIN_USERNAME).toBe('admin@example.com');
      expect(process.env.E2E_USER_ADMIN_PASSWORD).toBe('secret123');
      expect(process.env.E2E_USER_MANAGER_USERNAME).toBe('manager@example.com');
      expect(process.env.E2E_USER_MANAGER_PASSWORD).toBe('pass456');
    });

    it('should inject API key credentials as environment variables', () => {
      const credentials = {
        env_profile: 'production',
        api_keys: [
          {
            service: 'payment',
            api_key: 'pk_test_12345',
            api_secret: 'sk_test_67890',
          },
        ],
      };

      injectCredentials(credentials);

      expect(process.env.E2E_API_PAYMENT_KEY).toBe('pk_test_12345');
      expect(process.env.E2E_API_PAYMENT_SECRET).toBe('sk_test_67890');
    });

    it('should handle mixed users and api_keys', () => {
      const credentials = {
        env_profile: 'staging',
        users: [{ role: 'admin', username: 'admin', password: 'pass' }],
        api_keys: [{ service: 'payment', api_key: 'key123' }],
      };

      injectCredentials(credentials);

      expect(process.env.E2E_USER_ADMIN_USERNAME).toBe('admin');
      expect(process.env.E2E_USER_ADMIN_PASSWORD).toBe('pass');
      expect(process.env.E2E_API_PAYMENT_KEY).toBe('key123');
    });

    it('should uppercase role and service names', () => {
      const credentials = {
        env_profile: 'test',
        users: [{ role: 'super-admin', username: 'test', password: 'pass' }],
        api_keys: [{ service: 'payment-gateway', api_key: 'key' }],
      };

      injectCredentials(credentials);

      expect(process.env.E2E_USER_SUPER_ADMIN_USERNAME).toBe('test');
      expect(process.env.E2E_API_PAYMENT_GATEWAY_KEY).toBe('key');
    });

    it('should handle credentials with no users or api_keys', () => {
      const credentials = {
        env_profile: 'test',
      };

      expect(() => injectCredentials(credentials)).not.toThrow();
    });
  });

  describe('checkFilePermissions', () => {
    it('should not warn for file with 0600 permissions on Unix', () => {
      if (process.platform === 'win32') {
        // Skip on Windows
        return;
      }

      const credPath = join(TEST_DIR, 'secure.json');
      writeFileSync(credPath, '{}');
      chmodSync(credPath, 0o600);

      const consoleSpy = vi.spyOn(console, 'warn');

      checkFilePermissions(credPath);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should warn for file with loose permissions (0644) on Unix', () => {
      if (process.platform === 'win32') {
        // Skip on Windows
        return;
      }

      const credPath = join(TEST_DIR, 'insecure.json');
      writeFileSync(credPath, '{}');
      chmodSync(credPath, 0o644);

      const consoleSpy = vi.spyOn(console, 'warn');

      checkFilePermissions(credPath);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARNING')
      );

      consoleSpy.mockRestore();
    });

    it('should not throw on Windows (permissions check skipped)', () => {
      const credPath = join(TEST_DIR, 'test.json');
      writeFileSync(credPath, '{}');

      expect(() => checkFilePermissions(credPath)).not.toThrow();
    });
  });
});
