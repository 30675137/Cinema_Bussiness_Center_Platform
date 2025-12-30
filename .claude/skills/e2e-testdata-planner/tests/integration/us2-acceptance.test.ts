/**
 * @spec T004-e2e-testdata-planner
 * User Story 2 Acceptance Tests - Select Data Supply Strategies
 *
 * Acceptance Scenarios:
 * 1. Seed strategy - load data from seed file (T028)
 * 2. API strategy - verify configuration (T029 - preparation only)
 * 3. DB-Script strategy - verify configuration (T030 - preparation only)
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { BlueprintLoader } from '../../scripts/blueprint-loader';
import { StrategySelector } from '../../scripts/strategy-selector';
import { SeedProvider } from '../../scripts/providers/seed-provider';
import type { TestdataBlueprint } from '../../scripts/schemas';

const TEST_BLUEPRINTS_DIR = path.join(__dirname, '../fixtures/acceptance/us2-blueprints');
const TEST_SEEDS_DIR = path.join(__dirname, '../fixtures/acceptance/us2-seeds');

describe('User Story 2 - Select Data Supply Strategies', () => {
  let loader: BlueprintLoader;
  let selector: StrategySelector;
  let seedProvider: SeedProvider;

  beforeEach(async () => {
    loader = new BlueprintLoader();
    selector = new StrategySelector();
    seedProvider = new SeedProvider();

    // Create test directories
    await fs.mkdir(TEST_BLUEPRINTS_DIR, { recursive: true });
    await fs.mkdir(TEST_SEEDS_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directories
    await fs.rm(TEST_BLUEPRINTS_DIR, { recursive: true, force: true });
    await fs.rm(TEST_SEEDS_DIR, { recursive: true, force: true });
  });

  describe('Acceptance Scenario 1 - Seed Strategy (T028)', () => {
    it('should load data from JSON seed file when using seed strategy', async () => {
      // GIVEN: Blueprint configured with strategy: seed and seedFilePath: testdata/seeds/users.json
      const seedPath = path.join(TEST_SEEDS_DIR, 'users.json');
      const seedData = [
        { id: 1, username: 'alice', role: 'admin' },
        { id: 2, username: 'bob', role: 'user' },
        { id: 3, username: 'charlie', role: 'user' },
      ];
      await fs.writeFile(seedPath, JSON.stringify(seedData), 'utf-8');

      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'user-seed.blueprint.yaml');
      const blueprintContent = `
id: TD-USER-001
description: "User blueprint with seed strategy for acceptance testing"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: ${seedPath}
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      // WHEN: Planner generates supply plan
      const blueprint = await loader.loadBlueprint(blueprintPath);
      const strategy = selector.selectStrategy(blueprint);

      // THEN: It outputs a fixture that loads data from seed file
      expect(strategy.type).toBe('seed');
      expect(strategy.seedFilePath).toBe(seedPath);

      // Verify seed file can be loaded
      const loadedData = await seedProvider.loadSeed(strategy);
      expect(loadedData).toEqual(seedData);
      expect(loadedData).toHaveLength(3);
      expect(loadedData[0].username).toBe('alice');
    });

    it('should load data from YAML seed file when using seed strategy', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'stores.yaml');
      const seedContent = `
- id: 1
  name: "Cinema A"
  location: "Beijing"
  capacity: 200
- id: 2
  name: "Cinema B"
  location: "Shanghai"
  capacity: 150
`;
      await fs.writeFile(seedPath, seedContent, 'utf-8');

      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'store-seed.blueprint.yaml');
      const blueprintContent = `
id: TD-STORE-001
description: "Store blueprint with YAML seed strategy"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: ${seedPath}
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      const blueprint = await loader.loadBlueprint(blueprintPath);
      const strategy = selector.selectStrategy(blueprint);

      expect(strategy.type).toBe('seed');

      const loadedData = await seedProvider.loadSeed(strategy);
      expect(loadedData).toHaveLength(2);
      expect(loadedData[0].name).toBe('Cinema A');
      expect(loadedData[1].capacity).toBe(150);
    });

    it('should validate seed file path correctness in supply plan', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'products.json');
      await fs.writeFile(seedPath, '[]', 'utf-8');

      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'product-seed.blueprint.yaml');
      const blueprintContent = `
id: TD-PRODUCT-001
description: "Product blueprint with seed strategy"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: ${seedPath}
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      const blueprint = await loader.loadBlueprint(blueprintPath);
      const strategy = selector.selectStrategy(blueprint);

      // Validate strategy configuration
      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();

      // Verify correct seed file path is in the plan
      expect(strategy.seedFilePath).toBe(seedPath);
      expect(strategy.seedFilePath).toMatch(/products\.json$/);
    });
  });

  describe('Acceptance Scenario 2 - API Strategy (T029 - Preparation)', () => {
    it('should configure API strategy with authentication when blueprint specifies api strategy', async () => {
      // GIVEN: Blueprint configured with strategy: api and apiEndpoint: /api/test/orders
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order-api.blueprint.yaml');
      const blueprintContent = `
id: TD-ORDER-001
description: "Order blueprint with API strategy for acceptance testing"
version: "1.0.0"
strategy:
  type: api
  apiEndpoint: /api/test/orders
  method: POST
  requestBody:
    status: pending
    items: []
  requestHeaders:
    Authorization: "Bearer \${TEST_TOKEN}"
    Content-Type: "application/json"
scope: test
teardown: true
timeout: 60000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      // WHEN: Planner selects strategy
      const blueprint = await loader.loadBlueprint(blueprintPath);
      const strategy = selector.selectStrategy(blueprint);

      // THEN: Strategy configuration includes API endpoint and authentication headers
      expect(strategy.type).toBe('api');
      expect(strategy.apiEndpoint).toBe('/api/test/orders');
      expect(strategy.method).toBe('POST');
      expect(strategy.requestHeaders).toBeDefined();
      expect(strategy.requestHeaders?.Authorization).toContain('Bearer');
      expect(strategy.requestHeaders?.['Content-Type']).toBe('application/json');

      // Validate strategy configuration
      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();
    });

    it('should include timeout configuration in API strategy', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'payment-api.blueprint.yaml');
      const blueprintContent = `
id: TD-PAYMENT-001
description: "Payment blueprint with API timeout configuration"
version: "1.0.0"
strategy:
  type: api
  apiEndpoint: /api/test/payments
  method: POST
  requestBody: {}
  timeout: 45000
scope: test
teardown: true
timeout: 60000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      const blueprint = await loader.loadBlueprint(blueprintPath);
      const strategy = selector.selectStrategy(blueprint);

      expect(strategy.type).toBe('api');
      expect(strategy.timeout).toBe(45000);
      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();
    });
  });

  describe('Acceptance Scenario 3 - DB-Script Strategy (T030 - Preparation)', () => {
    it('should configure DB-Script strategy with script path when blueprint specifies db-script', async () => {
      // GIVEN: Blueprint configured with strategy: db-script and dbScriptPath: testdata/scripts/seed-stores.sql
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'store-db.blueprint.yaml');
      const blueprintContent = `
id: TD-STORE-002
description: "Store blueprint with DB script strategy for acceptance testing"
version: "1.0.0"
strategy:
  type: db-script
  dbScriptPath: testdata/scripts/seed-stores.sql
  transactional: true
scope: worker
teardown: false
timeout: 90000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      // WHEN: Planner selects strategy
      const blueprint = await loader.loadBlueprint(blueprintPath);
      const strategy = selector.selectStrategy(blueprint);

      // THEN: Strategy configuration includes correct SQL script path
      expect(strategy.type).toBe('db-script');
      expect(strategy.dbScriptPath).toBe('testdata/scripts/seed-stores.sql');
      expect(strategy.transactional).toBe(true);

      // Validate strategy configuration
      expect(() => selector.validateStrategyConfig(strategy)).not.toThrow();
    });

    it('should support non-transactional DB scripts', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'cinema-db.blueprint.yaml');
      const blueprintContent = `
id: TD-CINEMA-001
description: "Cinema blueprint with non-transactional DB script"
version: "1.0.0"
strategy:
  type: db-script
  dbScriptPath: testdata/scripts/seed-cinemas.sql
  transactional: false
scope: worker
teardown: false
timeout: 120000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      const blueprint = await loader.loadBlueprint(blueprintPath);
      const strategy = selector.selectStrategy(blueprint);

      expect(strategy.type).toBe('db-script');
      expect(strategy.dbScriptPath).toBe('testdata/scripts/seed-cinemas.sql');
      expect(strategy.transactional).toBe(false);
    });
  });

  describe('Cross-Strategy Validation', () => {
    it('should correctly identify and validate different strategy types', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'test.json');
      await fs.writeFile(seedPath, '[]', 'utf-8');

      // Create three blueprints with different strategies
      const seedBlueprint: TestdataBlueprint = {
        id: 'TD-TEST-SEED',
        description: 'Test seed blueprint for cross-strategy validation',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: seedPath },
        scope: 'test',
        teardown: false,
        timeout: 30000,
      };

      const apiBlueprint: TestdataBlueprint = {
        id: 'TD-TEST-API',
        description: 'Test API blueprint for cross-strategy validation',
        version: '1.0.0',
        strategy: {
          type: 'api',
          apiEndpoint: '/api/test',
          method: 'POST',
          requestBody: {},
        },
        scope: 'test',
        teardown: true,
        timeout: 60000,
      };

      const dbBlueprint: TestdataBlueprint = {
        id: 'TD-TEST-DB',
        description: 'Test DB blueprint for cross-strategy validation',
        version: '1.0.0',
        strategy: {
          type: 'db-script',
          dbScriptPath: 'test.sql',
          transactional: true,
        },
        scope: 'test',
        teardown: false,
        timeout: 90000,
      };

      // Verify each strategy type is correctly identified
      expect(selector.getStrategyType(seedBlueprint)).toBe('seed');
      expect(selector.getStrategyType(apiBlueprint)).toBe('api');
      expect(selector.getStrategyType(dbBlueprint)).toBe('db-script');

      // Verify each strategy configuration is valid
      expect(() => selector.validateStrategyConfig(seedBlueprint.strategy)).not.toThrow();
      expect(() => selector.validateStrategyConfig(apiBlueprint.strategy)).not.toThrow();
      expect(() => selector.validateStrategyConfig(dbBlueprint.strategy)).not.toThrow();
    });
  });
});
