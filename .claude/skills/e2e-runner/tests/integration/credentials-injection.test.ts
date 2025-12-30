/**
 * @spec T003-e2e-runner
 * Integration test for credentials injection (T032)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import {
  loadCredentials,
  validateEnvProfileMatch,
  injectCredentials,
  checkFilePermissions,
} from '@/credentials-loader';
import type { CredentialsFile } from '@/schemas';

const TEST_DIR = join(__dirname, '..', 'fixtures', 'credentials-integration');

describe('Integration: Credentials Injection', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });

    // Clear environment variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('E2E_')) {
        delete process.env[key];
      }
    });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }

    // Clean up environment variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('E2E_')) {
        delete process.env[key];
      }
    });
  });

  it('should load credentials and inject into environment', () => {
    // Create credentials file
    const credPath = join(TEST_DIR, 'staging-creds.json');
    const credData: CredentialsFile = {
      env_profile: 'staging',
      users: [
        {
          role: 'admin',
          username: 'admin@staging.com',
          password: 'staging-secret-123',
          display_name: 'Staging Admin',
        },
        {
          role: 'tester',
          username: 'tester@staging.com',
          password: 'tester-pass',
        },
      ],
      api_keys: [
        {
          service: 'payment',
          api_key: 'pk_staging_12345',
          api_secret: 'sk_staging_67890',
        },
      ],
    };
    writeFileSync(credPath, JSON.stringify(credData, null, 2));

    // Load credentials
    const credentials = loadCredentials(credPath);

    expect(credentials.env_profile).toBe('staging');
    expect(credentials.users).toHaveLength(2);
    expect(credentials.api_keys).toHaveLength(1);

    // Inject credentials
    injectCredentials(credentials);

    // Verify environment variables are set
    expect(process.env.E2E_USER_ADMIN_USERNAME).toBe('admin@staging.com');
    expect(process.env.E2E_USER_ADMIN_PASSWORD).toBe('staging-secret-123');
    expect(process.env.E2E_USER_ADMIN_DISPLAY_NAME).toBe('Staging Admin');

    expect(process.env.E2E_USER_TESTER_USERNAME).toBe('tester@staging.com');
    expect(process.env.E2E_USER_TESTER_PASSWORD).toBe('tester-pass');

    expect(process.env.E2E_API_PAYMENT_KEY).toBe('pk_staging_12345');
    expect(process.env.E2E_API_PAYMENT_SECRET).toBe('sk_staging_67890');
  });

  it('should validate env_profile matches between config and credentials', () => {
    const credPath = join(TEST_DIR, 'production-creds.json');
    const credData: CredentialsFile = {
      env_profile: 'production',
      users: [
        {
          role: 'admin',
          username: 'admin@prod.com',
          password: 'prod-secret',
        },
      ],
    };
    writeFileSync(credPath, JSON.stringify(credData));

    const credentials = loadCredentials(credPath);

    // Should not throw when profiles match
    expect(() =>
      validateEnvProfileMatch('production', credentials.env_profile)
    ).not.toThrow();

    // Should throw when profiles don't match
    expect(() =>
      validateEnvProfileMatch('staging', credentials.env_profile)
    ).toThrow(/env_profile mismatch/);
  });

  it('should handle credentials with only API keys', () => {
    const credPath = join(TEST_DIR, 'api-only.json');
    const credData: CredentialsFile = {
      env_profile: 'test',
      api_keys: [
        {
          service: 'stripe',
          api_key: 'pk_test_abc123',
        },
        {
          service: 'sendgrid',
          api_key: 'SG.test.xyz789',
          api_secret: 'secret_token',
        },
      ],
    };
    writeFileSync(credPath, JSON.stringify(credData));

    const credentials = loadCredentials(credPath);
    injectCredentials(credentials);

    expect(process.env.E2E_API_STRIPE_KEY).toBe('pk_test_abc123');
    expect(process.env.E2E_API_SENDGRID_KEY).toBe('SG.test.xyz789');
    expect(process.env.E2E_API_SENDGRID_SECRET).toBe('secret_token');
  });

  it('should handle role names with hyphens correctly', () => {
    const credPath = join(TEST_DIR, 'hyphenated.json');
    const credData: CredentialsFile = {
      env_profile: 'test',
      users: [
        {
          role: 'super-admin',
          username: 'superadmin@test.com',
          password: 'pass123',
        },
      ],
      api_keys: [
        {
          service: 'payment-gateway',
          api_key: 'key123',
        },
      ],
    };
    writeFileSync(credPath, JSON.stringify(credData));

    const credentials = loadCredentials(credPath);
    injectCredentials(credentials);

    // Hyphens should be converted to underscores and uppercased
    expect(process.env.E2E_USER_SUPER_ADMIN_USERNAME).toBe('superadmin@test.com');
    expect(process.env.E2E_USER_SUPER_ADMIN_PASSWORD).toBe('pass123');
    expect(process.env.E2E_API_PAYMENT_GATEWAY_KEY).toBe('key123');
  });

  it('should warn for insecure file permissions on Unix', () => {
    if (process.platform === 'win32') {
      // Skip on Windows
      return;
    }

    const credPath = join(TEST_DIR, 'insecure.json');
    writeFileSync(credPath, '{}');
    chmodSync(credPath, 0o644); // Readable by others

    // Capture console.warn
    const originalWarn = console.warn;
    let warnCalled = false;
    let warnMessage = '';

    console.warn = (message: string) => {
      warnCalled = true;
      warnMessage = message;
    };

    checkFilePermissions(credPath);

    console.warn = originalWarn;

    expect(warnCalled).toBe(true);
    expect(warnMessage).toContain('WARNING');
    expect(warnMessage).toContain('insecure permissions');
  });

  it('should not warn for secure file permissions on Unix', () => {
    if (process.platform === 'win32') {
      // Skip on Windows
      return;
    }

    const credPath = join(TEST_DIR, 'secure.json');
    writeFileSync(credPath, '{}');
    chmodSync(credPath, 0o600); // Owner read/write only

    const originalWarn = console.warn;
    let warnCalled = false;

    console.warn = () => {
      warnCalled = true;
    };

    checkFilePermissions(credPath);

    console.warn = originalWarn;

    expect(warnCalled).toBe(false);
  });

  it('should handle end-to-end workflow: load -> validate -> inject', () => {
    // Simulate production environment workflow
    const configEnvProfile = 'production';
    const credPath = join(TEST_DIR, 'production-full.json');
    const credData: CredentialsFile = {
      env_profile: 'production',
      users: [
        {
          role: 'admin',
          username: 'prod-admin@company.com',
          password: 'secure-prod-password',
        },
        {
          role: 'qa',
          username: 'qa-user@company.com',
          password: 'qa-password',
        },
      ],
      api_keys: [
        {
          service: 'stripe',
          api_key: 'pk_live_abc123def456',
          api_secret: 'sk_live_xyz789ghi012',
        },
      ],
    };
    writeFileSync(credPath, JSON.stringify(credData));

    // Step 1: Load credentials
    const credentials = loadCredentials(credPath);
    expect(credentials.env_profile).toBe('production');

    // Step 2: Validate env_profile matches
    expect(() =>
      validateEnvProfileMatch(configEnvProfile, credentials.env_profile)
    ).not.toThrow();

    // Step 3: Inject credentials
    injectCredentials(credentials);

    // Step 4: Verify tests can access credentials
    expect(process.env.E2E_USER_ADMIN_USERNAME).toBe('prod-admin@company.com');
    expect(process.env.E2E_USER_ADMIN_PASSWORD).toBe('secure-prod-password');
    expect(process.env.E2E_USER_QA_USERNAME).toBe('qa-user@company.com');
    expect(process.env.E2E_USER_QA_PASSWORD).toBe('qa-password');
    expect(process.env.E2E_API_STRIPE_KEY).toBe('pk_live_abc123def456');
    expect(process.env.E2E_API_STRIPE_SECRET).toBe('sk_live_xyz789ghi012');
  });
});
