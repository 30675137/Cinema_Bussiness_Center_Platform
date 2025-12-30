/**
 * @spec T004-e2e-testdata-planner
 * Unit tests for custom error classes
 */
import { describe, it, expect } from 'vitest';
import {
  BlueprintValidationError,
  CircularDependencyError,
  EnvironmentMismatchError,
  SeedFileNotFoundError,
  DbScriptError,
  ApiCallError,
} from '../../scripts/utils/error-handler';

describe('error-handler', () => {
  describe('BlueprintValidationError', () => {
    it('should create error with message and blueprint ID', () => {
      const error = new BlueprintValidationError('TD-ORDER-001', 'Missing required field: strategy');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BlueprintValidationError);
      expect(error.message).toContain('TD-ORDER-001');
      expect(error.message).toContain('Missing required field: strategy');
      expect(error.blueprintId).toBe('TD-ORDER-001');
      expect(error.name).toBe('BlueprintValidationError');
    });

    it('should include stack trace', () => {
      const error = new BlueprintValidationError('TD-USER-001', 'Invalid version format');

      expect(error.stack).toBeDefined();
    });
  });

  describe('CircularDependencyError', () => {
    it('should create error with dependency cycle information', () => {
      const cycle = ['TD-ORDER-001', 'TD-STORE-001', 'TD-ORDER-001'];
      const error = new CircularDependencyError(cycle);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CircularDependencyError);
      expect(error.message).toContain('TD-ORDER-001');
      expect(error.message).toContain('TD-STORE-001');
      expect(error.cycle).toEqual(cycle);
      expect(error.name).toBe('CircularDependencyError');
    });

    it('should format cycle path correctly', () => {
      const cycle = ['TD-A-001', 'TD-B-001', 'TD-C-001', 'TD-A-001'];
      const error = new CircularDependencyError(cycle);

      expect(error.message).toMatch(/TD-A-001.*→.*TD-B-001.*→.*TD-C-001.*→.*TD-A-001/);
    });
  });

  describe('EnvironmentMismatchError', () => {
    it('should create error with environment information', () => {
      const error = new EnvironmentMismatchError(
        'TD-PAYMENT-001',
        'staging',
        ['production']
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(EnvironmentMismatchError);
      expect(error.message).toContain('TD-PAYMENT-001');
      expect(error.message).toContain('staging');
      expect(error.message).toContain('production');
      expect(error.blueprintId).toBe('TD-PAYMENT-001');
      expect(error.currentEnv).toBe('staging');
      expect(error.allowedEnvs).toEqual(['production']);
      expect(error.name).toBe('EnvironmentMismatchError');
    });

    it('should format multiple allowed environments', () => {
      const error = new EnvironmentMismatchError(
        'TD-TEST-001',
        'local',
        ['staging', 'production']
      );

      expect(error.message).toContain('staging');
      expect(error.message).toContain('production');
    });
  });

  describe('SeedFileNotFoundError', () => {
    it('should create error with file path information', () => {
      const error = new SeedFileNotFoundError('testdata/seeds/users.json');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SeedFileNotFoundError);
      expect(error.message).toContain('testdata/seeds/users.json');
      expect(error.filePath).toBe('testdata/seeds/users.json');
      expect(error.name).toBe('SeedFileNotFoundError');
    });
  });

  describe('DbScriptError', () => {
    it('should create error with script path and SQL error message', () => {
      const error = new DbScriptError(
        'testdata/scripts/seed-orders.sql',
        'Syntax error at line 10: missing semicolon'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DbScriptError);
      expect(error.message).toContain('testdata/scripts/seed-orders.sql');
      expect(error.message).toContain('Syntax error at line 10');
      expect(error.scriptPath).toBe('testdata/scripts/seed-orders.sql');
      expect(error.sqlError).toBe('Syntax error at line 10: missing semicolon');
      expect(error.name).toBe('DbScriptError');
    });
  });

  describe('ApiCallError', () => {
    it('should create error with API endpoint and HTTP status', () => {
      const error = new ApiCallError('/api/test/orders', 404, 'Not Found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiCallError);
      expect(error.message).toContain('/api/test/orders');
      expect(error.message).toContain('404');
      expect(error.message).toContain('Not Found');
      expect(error.endpoint).toBe('/api/test/orders');
      expect(error.statusCode).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.name).toBe('ApiCallError');
    });

    it('should include response body if provided', () => {
      const responseBody = { error: 'Order not found', orderId: 'ORDER-999' };
      const error = new ApiCallError('/api/test/orders', 404, 'Not Found', responseBody);

      expect(error.message).toContain('Order not found');
      expect(error.responseBody).toEqual(responseBody);
    });
  });
});
