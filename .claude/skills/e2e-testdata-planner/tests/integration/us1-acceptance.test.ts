/**
 * @spec T004-e2e-testdata-planner
 * User Story 1 Acceptance Tests - Define Testdata Blueprints
 *
 * Acceptance Scenarios:
 * 1. Load and validate blueprint structure (T019)
 * 2. Reference testdata_ref in test scenarios (T020)
 * 3. Detect dependency problems (circular, missing) (T021)
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { BlueprintLoader, BlueprintRegistry } from '../../scripts/blueprint-loader';
import { BlueprintValidator } from '../../scripts/validator';
import type { TestdataBlueprint } from '../../scripts/schemas';

const TEST_BLUEPRINTS_DIR = path.join(__dirname, '../fixtures/acceptance/blueprints');

describe('User Story 1 - Define Testdata Blueprints', () => {
  let loader: BlueprintLoader;
  let validator: BlueprintValidator;
  let registry: BlueprintRegistry;

  beforeEach(async () => {
    loader = new BlueprintLoader();
    validator = new BlueprintValidator();
    registry = new BlueprintRegistry();

    // Create test blueprints directory
    await fs.mkdir(TEST_BLUEPRINTS_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test blueprints
    await fs.rm(TEST_BLUEPRINTS_DIR, { recursive: true, force: true });
  });

  describe('Acceptance Scenario 1 - Load and validate blueprint structure (T019)', () => {
    it('should load blueprint from YAML file with pattern and dependencies, validate structure, and register data contract', async () => {
      // GIVEN: I have a blueprint file at testdata/blueprints/order.blueprint.yaml
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order.blueprint.yaml');
      const blueprintContent = `
id: TD-ORDER-001
description: "Sample order blueprint with dependencies for testing"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
dependencies:
  - TD-USER-001
  - TD-STORE-001
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      // WHEN: I define a testdata_ref TD-ORDER-001 with pattern and dependencies
      const blueprint = await loader.loadBlueprint(blueprintPath);

      // THEN: The planner validates blueprint structure
      const validationResult = validator.validateStructure(blueprint);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.issues).toHaveLength(0);

      // AND: Registers data contract
      registry.register(blueprint);
      expect(registry.has('TD-ORDER-001')).toBe(true);
      expect(registry.get('TD-ORDER-001')?.dependencies).toEqual(['TD-USER-001', 'TD-STORE-001']);
    });

    it('should reject blueprint with invalid structure during schema validation', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'invalid.blueprint.yaml');
      const blueprintContent = `
id: TD-ORDER-002
description: "short"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
scope: test
teardown: false
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      // Schema validation should fail (description too short)
      await expect(loader.loadBlueprint(blueprintPath)).rejects.toThrow('Blueprint validation failed');
    });
  });

  describe('Acceptance Scenario 2 - Reference testdata_ref in test scenarios (T020)', () => {
    it('should parse blueprint definition and validate all required fields when referencing testdata_ref', async () => {
      // GIVEN: I reference testdata_ref: TD-USER-ADMIN in a test scenario
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'user-admin.blueprint.yaml');
      const blueprintContent = `
id: TD-USER-ADMIN
description: "Admin user with elevated privileges for testing admin workflows"
version: "1.0.0"
strategy:
  type: api
  apiEndpoint: /api/test/users/admin
  method: POST
  requestBody:
    role: admin
    permissions: [read, write, delete]
scope: worker
teardown: false
timeout: 60000
environments:
  - staging
  - production
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      // WHEN: The planner loads the blueprint
      const blueprint = await loader.loadBlueprint(blueprintPath);

      // THEN: It parses blueprint definition and validates all required fields
      expect(blueprint.id).toBe('TD-USER-ADMIN');
      expect(blueprint.description.length).toBeGreaterThanOrEqual(10);
      expect(blueprint.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(blueprint.strategy.type).toBe('api');
      expect(blueprint.scope).toBe('worker');
      expect(blueprint.teardown).toBe(false);
      expect(blueprint.timeout).toBe(60000);
      expect(blueprint.environments).toEqual(['staging', 'production']);

      // Validate all fields are specified
      const validationResult = validator.validateAll(blueprint, registry, 'staging');
      expect(validationResult.valid).toBe(true);
    });

    it('should validate environment-specific blueprint availability', async () => {
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'payment.blueprint.yaml');
      const blueprintContent = `
id: TD-PAYMENT-PROD
description: "Payment blueprint only available in production environment"
version: "1.0.0"
strategy:
  type: api
  apiEndpoint: /api/test/payments
  method: POST
  requestBody: {}
environments:
  - production
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      const blueprint = await loader.loadBlueprint(blueprintPath);

      // Should pass in production environment
      const prodValidation = validator.validateEnvironmentConfig(blueprint, 'production');
      expect(prodValidation.valid).toBe(true);

      // Should fail in staging environment
      const stagingValidation = validator.validateEnvironmentConfig(blueprint, 'staging');
      expect(stagingValidation.valid).toBe(false);
      expect(stagingValidation.issues[0].code).toBe('ENVIRONMENT_MISMATCH');
    });
  });

  describe('Acceptance Scenario 3 - Detect dependency problems (T021)', () => {
    it('should detect and report circular dependencies', async () => {
      // GIVEN: Blueprint dependencies have circular reference (TD-ORDER-001 → TD-USER-001 → TD-ORDER-001)
      const orderPath = path.join(TEST_BLUEPRINTS_DIR, 'order-circular.blueprint.yaml');
      const orderContent = `
id: TD-ORDER-001
description: "Order blueprint with circular dependency for testing"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
dependencies:
  - TD-USER-001
scope: test
teardown: true
timeout: 30000
`;
      const userPath = path.join(TEST_BLUEPRINTS_DIR, 'user-circular.blueprint.yaml');
      const userContent = `
id: TD-USER-001
description: "User blueprint with circular dependency back to order"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/users.json
dependencies:
  - TD-ORDER-001
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(orderPath, orderContent, 'utf-8');
      await fs.writeFile(userPath, userContent, 'utf-8');

      // WHEN: The planner validates blueprints
      const orderBlueprint = await loader.loadBlueprint(orderPath);
      const userBlueprint = await loader.loadBlueprint(userPath);
      registry.register(orderBlueprint);
      registry.register(userBlueprint);

      const validationResult = validator.validateDependencyReferences(orderBlueprint, registry);

      // THEN: It detects and reports circular dependency
      expect(validationResult.valid).toBe(false);
      expect(
        validationResult.issues.some((issue) => issue.code === 'CIRCULAR_DEPENDENCY')
      ).toBe(true);
      expect(
        validationResult.issues.some((issue) =>
          issue.message.toLowerCase().includes('circular')
        )
      ).toBe(true);
    });

    it('should detect and report missing dependencies', async () => {
      // GIVEN: Blueprint depends on non-existent testdata_refs
      const blueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order-missing-deps.blueprint.yaml');
      const blueprintContent = `
id: TD-ORDER-002
description: "Order blueprint with missing dependencies for testing error handling"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
dependencies:
  - TD-USER-999
  - TD-STORE-999
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(blueprintPath, blueprintContent, 'utf-8');

      // WHEN: The planner validates the blueprint
      const blueprint = await loader.loadBlueprint(blueprintPath);
      const validationResult = validator.validateDependencyReferences(blueprint, registry);

      // THEN: It reports missing dependencies
      expect(validationResult.valid).toBe(false);
      expect(
        validationResult.issues.filter((issue) => issue.code === 'MISSING_DEPENDENCY')
      ).toHaveLength(2);
      expect(
        validationResult.issues.some((issue) => issue.message.includes('TD-USER-999'))
      ).toBe(true);
      expect(
        validationResult.issues.some((issue) => issue.message.includes('TD-STORE-999'))
      ).toBe(true);
    });

    it('should validate complete dependency chain and provide helpful error messages', async () => {
      // Create a valid dependency chain: TD-ORDER-003 → TD-USER-001, TD-STORE-001
      const userPath = path.join(TEST_BLUEPRINTS_DIR, 'user-valid.blueprint.yaml');
      const userContent = `
id: TD-USER-001
description: "Valid user blueprint for dependency testing"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/users.json
scope: worker
teardown: false
timeout: 30000
`;
      const storePath = path.join(TEST_BLUEPRINTS_DIR, 'store-valid.blueprint.yaml');
      const storeContent = `
id: TD-STORE-001
description: "Valid store blueprint for dependency testing"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/stores.json
scope: worker
teardown: false
timeout: 30000
`;
      const orderPath = path.join(TEST_BLUEPRINTS_DIR, 'order-valid.blueprint.yaml');
      const orderContent = `
id: TD-ORDER-003
description: "Order blueprint with valid dependencies"
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

      await fs.writeFile(userPath, userContent, 'utf-8');
      await fs.writeFile(storePath, storeContent, 'utf-8');
      await fs.writeFile(orderPath, orderContent, 'utf-8');

      // Load all blueprints
      const userBlueprint = await loader.loadBlueprint(userPath);
      const storeBlueprint = await loader.loadBlueprint(storePath);
      const orderBlueprint = await loader.loadBlueprint(orderPath);

      registry.register(userBlueprint);
      registry.register(storeBlueprint);
      registry.register(orderBlueprint);

      // Validate - should pass
      const validationResult = validator.validateDependencyReferences(orderBlueprint, registry);

      expect(validationResult.valid).toBe(true);
      expect(validationResult.issues).toHaveLength(0);
    });
  });
});
