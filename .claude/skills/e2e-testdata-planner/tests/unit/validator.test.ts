/**
 * @spec T004-e2e-testdata-planner
 * Unit tests for Blueprint Validator
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { BlueprintValidator } from '../../scripts/validator';
import { BlueprintRegistry } from '../../scripts/blueprint-loader';
import type { TestdataBlueprint } from '../../scripts/schemas';
import { EnvironmentMismatchError } from '../../scripts/utils/error-handler';

describe('BlueprintValidator', () => {
  let validator: BlueprintValidator;
  let registry: BlueprintRegistry;

  beforeEach(() => {
    validator = new BlueprintValidator();
    registry = new BlueprintRegistry();
  });

  describe('validateStructure', () => {
    it('should validate a blueprint with all required fields', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Test order blueprint',
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/orders.json',
        },
        scope: 'test',
        teardown: true,
        timeout: 30000,
        dependencies: [],
      };

      const result = validator.validateStructure(blueprint);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should return validation issues for missing description', () => {
      const blueprint = {
        id: 'TD-ORDER-001',
        description: 'short', // Less than 10 characters
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/orders.json',
        },
        scope: 'test',
        teardown: true,
        timeout: 30000,
      } as TestdataBlueprint;

      const result = validator.validateStructure(blueprint);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].type).toBe('error');
    });

    it('should validate blueprint with dependencies', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order with dependencies',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: {},
        },
        dependencies: ['TD-USER-001', 'TD-STORE-001'],
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const result = validator.validateStructure(blueprint);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateDependencyReferences', () => {
    it('should pass when all dependencies exist in registry', () => {
      // Register dependencies
      registry.register({
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'testdata/seeds/users.json' },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
        dependencies: [],
      });
      registry.register({
        id: 'TD-STORE-001',
        description: 'Store blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'testdata/seeds/stores.json' },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
        dependencies: [],
      });

      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order with valid dependencies',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: {},
        },
        dependencies: ['TD-USER-001', 'TD-STORE-001'],
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const result = validator.validateDependencyReferences(blueprint, registry);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should fail when dependency does not exist', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order with missing dependency',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: {},
        },
        dependencies: ['TD-USER-999'], // Does not exist
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const result = validator.validateDependencyReferences(blueprint, registry);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].type).toBe('error');
      expect(result.issues[0].message).toContain('TD-USER-999');
    });

    it('should detect circular dependencies', () => {
      // Create circular dependency: A -> B -> A
      registry.register({
        id: 'TD-A-001',
        description: 'Blueprint A',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'a.json' },
        dependencies: ['TD-B-001'],
        scope: 'test',
        teardown: false,
        timeout: 30000,
      });
      registry.register({
        id: 'TD-B-001',
        description: 'Blueprint B',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'b.json' },
        dependencies: ['TD-A-001'],
        scope: 'test',
        teardown: false,
        timeout: 30000,
      });

      const blueprint = registry.get('TD-A-001')!;
      const result = validator.validateDependencyReferences(blueprint, registry);

      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.message.toLowerCase().includes('circular'))).toBe(true);
    });

    it('should allow blueprint with no dependencies', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint without dependencies',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'testdata/seeds/users.json' },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
        dependencies: [],
      };

      const result = validator.validateDependencyReferences(blueprint, registry);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateEnvironmentConfig', () => {
    it('should pass when blueprint has no environment constraints', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order blueprint',
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/orders.json',
        },
        scope: 'test',
        teardown: true,
        timeout: 30000,
        dependencies: [],
      };

      const result = validator.validateEnvironmentConfig(blueprint, 'staging');

      expect(result.valid).toBe(true);
    });

    it('should pass when current environment is in allowed list', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-PAYMENT-001',
        description: 'Payment blueprint',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/payments',
          method: 'POST',
          requestBody: {},
        },
        environments: ['staging', 'production'],
        scope: 'test',
        teardown: true,
        timeout: 30000,
        dependencies: [],
      };

      const result = validator.validateEnvironmentConfig(blueprint, 'staging');

      expect(result.valid).toBe(true);
    });

    it('should fail when current environment is not in allowed list', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-PAYMENT-001',
        description: 'Payment blueprint',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/payments',
          method: 'POST',
          requestBody: {},
        },
        environments: ['production'],
        scope: 'test',
        teardown: true,
        timeout: 30000,
        dependencies: [],
      };

      const result = validator.validateEnvironmentConfig(blueprint, 'staging');

      expect(result.valid).toBe(false);
      expect(result.issues[0].type).toBe('error');
      expect(result.issues[0].message).toContain('staging');
      expect(result.issues[0].message).toContain('production');
    });
  });

  describe('validateStrategyConfig', () => {
    it('should validate seed strategy config', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint with seed strategy',
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/users.json',
        },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
        dependencies: [],
      };

      const result = validator.validateStrategyConfig(blueprint);

      expect(result.valid).toBe(true);
    });

    it('should validate api strategy config', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order blueprint with API strategy',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: {},
        },
        scope: 'test',
        teardown: true,
        timeout: 30000,
        dependencies: [],
      };

      const result = validator.validateStrategyConfig(blueprint);

      expect(result.valid).toBe(true);
    });

    it('should validate db-script strategy config', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-STORE-001',
        description: 'Store blueprint with DB script strategy',
        version: '1.0.0',
        strategy: {
          type: 'db-script',
          dbScriptPath: 'testdata/scripts/seed-stores.sql',
          transactional: true,
        },
        scope: 'worker',
        teardown: false,
        timeout: 60000,
        dependencies: [],
      };

      const result = validator.validateStrategyConfig(blueprint);

      expect(result.valid).toBe(true);
    });

    it('should add warning for large timeout values', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order blueprint with large timeout',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: {},
        },
        scope: 'test',
        teardown: true,
        timeout: 180000, // 3 minutes
        dependencies: [],
      };

      const result = validator.validateStrategyConfig(blueprint);

      expect(result.valid).toBe(true);
      expect(result.issues.some((issue) => issue.type === 'warning')).toBe(true);
    });
  });
});
