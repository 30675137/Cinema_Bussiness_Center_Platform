/**
 * @spec T004-e2e-testdata-planner
 * Unit tests for Strategy Selector
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { StrategySelector } from '../../scripts/strategy-selector';
import type { TestdataBlueprint } from '../../scripts/schemas';

describe('StrategySelector', () => {
  let selector: StrategySelector;

  beforeEach(() => {
    selector = new StrategySelector();
  });

  describe('selectStrategy', () => {
    it('should select seed strategy when blueprint has seed config', () => {
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
      };

      const strategy = selector.selectStrategy(blueprint);

      expect(strategy.type).toBe('seed');
      expect(strategy.seedFilePath).toBe('testdata/seeds/users.json');
    });

    it('should select api strategy when blueprint has api config', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order blueprint with API strategy',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: { status: 'pending' },
        },
        scope: 'test',
        teardown: true,
        timeout: 60000,
      };

      const strategy = selector.selectStrategy(blueprint);

      expect(strategy.type).toBe('api');
      expect(strategy.apiEndpoint).toBe('/api/test/orders');
      expect(strategy.method).toBe('POST');
      expect(strategy.requestBody).toEqual({ status: 'pending' });
    });

    it('should select db-script strategy when blueprint has db-script config', () => {
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
        timeout: 90000,
      };

      const strategy = selector.selectStrategy(blueprint);

      expect(strategy.type).toBe('db-script');
      expect(strategy.dbScriptPath).toBe('testdata/scripts/seed-stores.sql');
      expect(strategy.transactional).toBe(true);
    });

    it('should preserve optional retry policy in api strategy', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-PAYMENT-001',
        description: 'Payment blueprint with retry policy',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/payments',
          method: 'POST',
          requestBody: {},
          retryPolicy: {
            maxAttempts: 3,
            backoffMs: 1000,
          },
        },
        scope: 'test',
        teardown: true,
        timeout: 60000,
      };

      const strategy = selector.selectStrategy(blueprint);

      expect(strategy.type).toBe('api');
      expect(strategy.retryPolicy).toEqual({
        maxAttempts: 3,
        backoffMs: 1000,
      });
    });

    it('should preserve authentication headers in api strategy', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ADMIN-001',
        description: 'Admin blueprint with authentication',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/admin',
          method: 'POST',
          requestBody: {},
          headers: {
            Authorization: 'Bearer ${TEST_TOKEN}',
            'X-Test-Mode': 'enabled',
          },
        },
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const strategy = selector.selectStrategy(blueprint);

      expect(strategy.type).toBe('api');
      expect(strategy.headers).toEqual({
        Authorization: 'Bearer ${TEST_TOKEN}',
        'X-Test-Mode': 'enabled',
      });
    });
  });

  describe('validateStrategyConfig', () => {
    it('should validate seed strategy requires seedFilePath', () => {
      const strategy = {
        type: 'seed' as const,
        seedFilePath: 'testdata/seeds/users.json',
      };

      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();
    });

    it('should validate api strategy requires apiEndpoint and method', () => {
      const strategy = {
        type: 'api' as const,
        apiEndpoint: '/api/test/users',
        method: 'POST' as const,
        requestBody: {},
      };

      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();
    });

    it('should validate db-script strategy requires dbScriptPath', () => {
      const strategy = {
        type: 'db-script' as const,
        dbScriptPath: 'testdata/scripts/seed.sql',
        transactional: true,
      };

      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();
    });

    it('should validate api endpoint starts with /', () => {
      const strategy = {
        type: 'api' as const,
        apiEndpoint: '/api/test/users',
        method: 'POST' as const,
        requestBody: {},
      };

      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();
    });

    it('should validate db-script path ends with .sql', () => {
      const strategy = {
        type: 'db-script' as const,
        dbScriptPath: 'testdata/scripts/seed-stores.sql',
        transactional: true,
      };

      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();
    });
  });

  describe('getStrategyType', () => {
    it('should return correct strategy type for seed blueprint', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/users.json',
        },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
      };

      const type = selector.getStrategyType(blueprint);

      expect(type).toBe('seed');
    });

    it('should return correct strategy type for api blueprint', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order blueprint',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: {},
        },
        scope: 'test',
        teardown: true,
        timeout: 60000,
      };

      const type = selector.getStrategyType(blueprint);

      expect(type).toBe('api');
    });

    it('should return correct strategy type for db-script blueprint', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-STORE-001',
        description: 'Store blueprint',
        version: '1.0.0',
        strategy: {
          type: 'db-script',
          dbScriptPath: 'testdata/scripts/seed-stores.sql',
          transactional: true,
        },
        scope: 'worker',
        teardown: false,
        timeout: 90000,
      };

      const type = selector.getStrategyType(blueprint);

      expect(type).toBe('db-script');
    });
  });
});
