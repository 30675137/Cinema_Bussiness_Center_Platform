/**
 * @spec T004-e2e-testdata-planner
 * Unit tests for Zod schemas
 */
import { describe, it, expect } from 'vitest';
import {
  TestdataBlueprintSchema,
  SeedStrategyConfigSchema,
  ApiStrategyConfigSchema,
  DbScriptStrategyConfigSchema,
} from '../../scripts/schemas';

describe('TestdataBlueprintSchema', () => {
  describe('valid blueprints', () => {
    it('should validate a minimal valid blueprint with seed strategy', () => {
      const blueprint = {
        id: 'TD-USER-001',
        description: 'Test user data',
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/users.json',
        },
        scope: 'test',
        teardown: false,
        timeout: 30000,
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(true);
    });

    it('should validate a blueprint with api strategy', () => {
      const blueprint = {
        id: 'TD-ORDER-001',
        description: 'Test order with API',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: {
            storeId: 'STORE-001',
            userId: 'USER-001',
          },
        },
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(true);
    });

    it('should validate a blueprint with db-script strategy', () => {
      const blueprint = {
        id: 'TD-STORE-001',
        description: 'Test store with DB script',
        version: '1.0.0',
        strategy: {
          type: 'db-script',
          dbScriptPath: 'testdata/scripts/seed-stores.sql',
          transactional: true,
        },
        scope: 'worker',
        teardown: false,
        timeout: 60000,
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(true);
    });

    it('should validate a blueprint with dependencies', () => {
      const blueprint = {
        id: 'TD-ORDER-002',
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

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(true);
    });

    it('should validate a blueprint with environment constraints', () => {
      const blueprint = {
        id: 'TD-PAYMENT-001',
        description: 'Payment test (staging/production only)',
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
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid blueprints', () => {
    it('should reject blueprint with invalid ID format', () => {
      const blueprint = {
        id: 'INVALID-ID',
        description: 'Invalid ID format',
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/users.json',
        },
        scope: 'test',
        teardown: false,
        timeout: 30000,
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
    });

    it('should reject blueprint with invalid version format', () => {
      const blueprint = {
        id: 'TD-USER-001',
        description: 'Invalid version',
        version: 'v1.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/users.json',
        },
        scope: 'test',
        teardown: false,
        timeout: 30000,
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
    });

    it('should reject blueprint with invalid scope', () => {
      const blueprint = {
        id: 'TD-USER-001',
        description: 'Invalid scope',
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'testdata/seeds/users.json',
        },
        scope: 'invalid',
        teardown: false,
        timeout: 30000,
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
    });

    it('should reject blueprint with missing required fields', () => {
      const blueprint = {
        id: 'TD-USER-001',
        // missing description, version, strategy, scope, teardown, timeout
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
    });

    it('should reject blueprint with invalid dependency format', () => {
      const blueprint = {
        id: 'TD-ORDER-001',
        description: 'Invalid dependency',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test/orders',
          method: 'POST',
          requestBody: {},
        },
        dependencies: ['INVALID-REF'],
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const result = TestdataBlueprintSchema.safeParse(blueprint);
      expect(result.success).toBe(false);
    });
  });
});

describe('SeedStrategyConfigSchema', () => {
  it('should validate valid seed config', () => {
    const config = {
      type: 'seed',
      seedFilePath: 'testdata/seeds/users.json',
    };

    const result = SeedStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should validate seed config with seedKey', () => {
    const config = {
      type: 'seed',
      seedFilePath: 'testdata/seeds/users.json',
      seedKey: 'admin',
    };

    const result = SeedStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should reject seed config without seedFilePath', () => {
    const config = {
      type: 'seed',
    };

    const result = SeedStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});

describe('ApiStrategyConfigSchema', () => {
  it('should validate valid api config', () => {
    const config = {
      type: 'api',
      apiEndpoint: '/api/test/orders',
      method: 'POST',
      requestBody: {
        userId: 'USER-001',
      },
    };

    const result = ApiStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should validate api config with authentication', () => {
    const config = {
      type: 'api',
      apiEndpoint: '/api/test/orders',
      method: 'POST',
      requestBody: {},
      authentication: {
        type: 'bearer',
        tokenEnvVar: 'E2E_API_TOKEN',
      },
    };

    const result = ApiStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should validate api config with response mapping', () => {
    const config = {
      type: 'api',
      apiEndpoint: '/api/test/orders',
      method: 'POST',
      requestBody: {},
      responseMapping: {
        orderId: 'data.id',
        orderNumber: 'data.orderNumber',
      },
    };

    const result = ApiStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should reject api config with invalid method', () => {
    const config = {
      type: 'api',
      apiEndpoint: '/api/test/orders',
      method: 'INVALID',
      requestBody: {},
    };

    const result = ApiStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});

describe('DbScriptStrategyConfigSchema', () => {
  it('should validate valid db-script config', () => {
    const config = {
      type: 'db-script',
      dbScriptPath: 'testdata/scripts/seed-stores.sql',
      transactional: true,
    };

    const result = DbScriptStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should validate db-script config with output mapping', () => {
    const config = {
      type: 'db-script',
      dbScriptPath: 'testdata/scripts/seed-stores.sql',
      transactional: true,
      outputMapping: {
        storeId: 'id',
        storeName: 'name',
      },
    };

    const result = DbScriptStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should reject db-script config without dbScriptPath', () => {
    const config = {
      type: 'db-script',
      transactional: true,
    };

    const result = DbScriptStrategyConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });
});
