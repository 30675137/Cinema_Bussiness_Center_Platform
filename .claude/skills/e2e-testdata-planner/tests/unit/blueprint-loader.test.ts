/**
 * @spec T004-e2e-testdata-planner
 * Unit tests for Blueprint Loader
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { BlueprintLoader } from '../../scripts/blueprint-loader';
import { BlueprintValidationError } from '../../scripts/utils/error-handler';
import type { TestdataBlueprint } from '../../scripts/schemas';

const TEST_BLUEPRINTS_DIR = path.join(__dirname, '../fixtures/blueprints');

describe('BlueprintLoader', () => {
  let loader: BlueprintLoader;

  beforeEach(async () => {
    loader = new BlueprintLoader();
    // Create test blueprints directory
    await fs.mkdir(TEST_BLUEPRINTS_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test blueprints
    await fs.rm(TEST_BLUEPRINTS_DIR, { recursive: true, force: true });
  });

  describe('loadBlueprint', () => {
    it('should load a valid blueprint YAML file', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order.blueprint.yaml');
      const blueprintContent = `
id: TD-ORDER-001
description: "Test order blueprint"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      const blueprint = await loader.loadBlueprint(blueprintPath);

      expect(blueprint.id).toBe('TD-ORDER-001');
      expect(blueprint.description).toBe('Test order blueprint');
      expect(blueprint.version).toBe('1.0.0');
      expect(blueprint.strategy.type).toBe('seed');
      expect(blueprint.scope).toBe('test');
      expect(blueprint.teardown).toBe(true);
      expect(blueprint.timeout).toBe(30000);
    });

    it('should load blueprint with dependencies', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order-with-deps.blueprint.yaml');
      const blueprintContent = `
id: TD-ORDER-002
description: "Order with dependencies"
version: "1.0.0"
strategy:
  type: api
  apiEndpoint: /api/test/orders
  method: POST
  requestBody: {}
dependencies:
  - TD-USER-001
  - TD-STORE-001
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      const blueprint = await loader.loadBlueprint(blueprintPath);

      expect(blueprint.dependencies).toEqual(['TD-USER-001', 'TD-STORE-001']);
    });

    it('should load blueprint with environment constraints', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'payment.blueprint.yaml');
      const blueprintContent = `
id: TD-PAYMENT-001
description: "Payment test"
version: "1.0.0"
strategy:
  type: api
  apiEndpoint: /api/test/payments
  method: POST
  requestBody: {}
environments:
  - staging
  - production
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      const blueprint = await loader.loadBlueprint(blueprintPath);

      expect(blueprint.environments).toEqual(['staging', 'production']);
    });

    it('should throw error for non-existent file', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'nonexistent.blueprint.yaml');

      await expect(loader.loadBlueprint(blueprintPath)).rejects.toThrow();
    });

    it('should throw error for invalid YAML format', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'invalid.blueprint.yaml');
      const invalidYaml = `
id: TD-ORDER-001
  - invalid: [unclosed
`;
      await fs.writeFile(blueprintPath, invalidYaml, 'utf-8');

      await expect(loader.loadBlueprint(blueprintPath)).rejects.toThrow();
    });

    it('should throw BlueprintValidationError for schema validation failure', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'invalid-schema.blueprint.yaml');
      const invalidBlueprint = `
id: INVALID-ID
description: "Invalid ID format"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/test.json
scope: test
teardown: false
timeout: 30000
`;
      await fs.writeFile(blueprintPath, invalidBlueprint, 'utf-8');

      await expect(loader.loadBlueprint(blueprintPath)).rejects.toThrow(BlueprintValidationError);
    });
  });

  describe('loadAllBlueprints', () => {
    it('should load all blueprints from directory', async () => {
      // Create multiple blueprint files
      const blueprint1 = `
id: TD-USER-001
description: "User blueprint"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/users.json
scope: worker
teardown: false
timeout: 30000
`;
      const blueprint2 = `
id: TD-STORE-001
description: "Store blueprint"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/stores.json
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(
        path.join(TEST_BLUEPRINTS_DIR, 'user.blueprint.yaml'),
        blueprint1,
        'utf-8'
      );
      await fs.writeFile(
        path.join(TEST_BLUEPRINTS_DIR, 'store.blueprint.yaml'),
        blueprint2,
        'utf-8'
      );

      const blueprints = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);

      expect(blueprints.size).toBe(2);
      expect(blueprints.has('TD-USER-001')).toBe(true);
      expect(blueprints.has('TD-STORE-001')).toBe(true);
      expect(blueprints.get('TD-USER-001')?.description).toBe('User blueprint');
      expect(blueprints.get('TD-STORE-001')?.description).toBe('Store blueprint');
    });

    it('should skip non-blueprint files', async () => {
      const blueprint = `
id: TD-ORDER-001
description: "Order blueprint"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(
        path.join(TEST_BLUEPRINTS_DIR, 'order.blueprint.yaml'),
        blueprint,
        'utf-8'
      );
      await fs.writeFile(path.join(TEST_BLUEPRINTS_DIR, 'README.md'), '# Test', 'utf-8');
      await fs.writeFile(path.join(TEST_BLUEPRINTS_DIR, 'config.json'), '{}', 'utf-8');

      const blueprints = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);

      expect(blueprints.size).toBe(1);
      expect(blueprints.has('TD-ORDER-001')).toBe(true);
    });

    it('should throw error for empty directory', async () => {
      const blueprints = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);

      expect(blueprints.size).toBe(0);
    });

    it('should collect validation errors for invalid blueprints', async () => {
      const validBlueprint = `
id: TD-VALID-001
description: "Valid blueprint"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/valid.json
scope: test
teardown: false
timeout: 30000
`;
      const invalidBlueprint = `
id: INVALID-ID
description: "Invalid blueprint"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/invalid.json
scope: test
teardown: false
timeout: 30000
`;
      await fs.writeFile(
        path.join(TEST_BLUEPRINTS_DIR, 'valid.blueprint.yaml'),
        validBlueprint,
        'utf-8'
      );
      await fs.writeFile(
        path.join(TEST_BLUEPRINTS_DIR, 'invalid.blueprint.yaml'),
        invalidBlueprint,
        'utf-8'
      );

      // Should not throw, but should skip invalid blueprints
      const blueprints = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);

      expect(blueprints.size).toBe(1);
      expect(blueprints.has('TD-VALID-001')).toBe(true);
    });
  });

  describe('validateBlueprint', () => {
    it('should validate a valid blueprint object', () => {
      const blueprintData = {
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
      };

      const blueprint = loader.validateBlueprint(blueprintData);

      expect(blueprint.id).toBe('TD-ORDER-001');
    });

    it('should throw BlueprintValidationError for invalid blueprint', () => {
      const invalidData = {
        id: 'INVALID-ID',
        description: 'Test',
        version: '1.0.0',
        strategy: {
          type: 'seed',
          seedFilePath: 'test.json',
        },
        scope: 'test',
        teardown: false,
        timeout: 30000,
      };

      expect(() => loader.validateBlueprint(invalidData)).toThrow('Invalid testdata_ref format');
    });

    it('should throw BlueprintValidationError for missing required fields', () => {
      const invalidData = {
        id: 'TD-ORDER-001',
        // missing description, version, strategy, etc.
      };

      expect(() => loader.validateBlueprint(invalidData)).toThrow();
    });
  });
});
