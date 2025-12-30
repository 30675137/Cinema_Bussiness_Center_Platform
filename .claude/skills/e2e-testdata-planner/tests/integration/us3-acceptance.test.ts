/**
 * @spec T004-e2e-testdata-planner
 * User Story 3 Acceptance Tests - Generate Lifecycle Plans
 *
 * Acceptance Scenarios:
 * 1. Generate setup steps in dependency order (T037)
 * 2. Generate reverse teardown sequence (T038)
 * 3. Generate test fixture with correct scope (T039)
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { BlueprintLoader } from '../../scripts/blueprint-loader';
import { DependencyResolver } from '../../scripts/dependency-resolver';
import { LifecycleGenerator } from '../../scripts/lifecycle-generator';
import type { TestdataBlueprint } from '../../scripts/schemas';

const TEST_BLUEPRINTS_DIR = path.join(__dirname, '../fixtures/acceptance/us3-blueprints');

describe('User Story 3 - Generate Lifecycle Plans', () => {
  let loader: BlueprintLoader;
  let resolver: DependencyResolver;
  let generator: LifecycleGenerator;

  beforeEach(async () => {
    loader = new BlueprintLoader();
    resolver = new DependencyResolver();
    generator = new LifecycleGenerator();

    // Create test directory
    await fs.mkdir(TEST_BLUEPRINTS_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(TEST_BLUEPRINTS_DIR, { recursive: true, force: true });
  });

  describe('Acceptance Scenario 1 - Generate Setup Steps in Dependency Order (T037)', () => {
    it('should generate setup steps in correct dependency order: TD-USER-001 → TD-STORE-001 → TD-ORDER-001', async () => {
      // GIVEN: Blueprint chain - TD-USER-001 ← TD-STORE-001 ← TD-ORDER-001

      // Create TD-USER-001 (no dependencies)
      const userBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'user.blueprint.yaml');
      const userBlueprintContent = `
id: TD-USER-001
description: "User blueprint for lifecycle test"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/users.json
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(userBlueprintPath, userBlueprintContent, 'utf-8');

      // Create TD-STORE-001 (depends on TD-USER-001)
      const storeBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'store.blueprint.yaml');
      const storeBlueprintContent = `
id: TD-STORE-001
description: "Store blueprint for lifecycle test"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/stores.json
dependencies:
  - TD-USER-001
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(storeBlueprintPath, storeBlueprintContent, 'utf-8');

      // Create TD-ORDER-001 (depends on TD-STORE-001)
      const orderBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order.blueprint.yaml');
      const orderBlueprintContent = `
id: TD-ORDER-001
description: "Order blueprint for lifecycle test"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
dependencies:
  - TD-STORE-001
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(orderBlueprintPath, orderBlueprintContent, 'utf-8');

      // WHEN: Load blueprints → Build dependency graph → Topological sort → Generate lifecycle plan
      const blueprintMap = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);

      const graph = resolver.buildDependencyGraph(blueprintMap);
      const dependencyOrder = resolver.topologicalSort(graph);

      const orderBlueprint = blueprintMap.get('TD-ORDER-001')!;
      const lifecyclePlan = generator.generateLifecyclePlan(
        orderBlueprint,
        dependencyOrder,
        blueprintMap
      );

      // THEN: Setup steps should be in dependency order
      expect(lifecyclePlan.setupSteps).toHaveLength(3);

      // Extract testdataRef from each step
      const setupOrder = lifecyclePlan.setupSteps.map((step) => step.testdataRef);

      // Verify dependency order: TD-USER-001 → TD-STORE-001 → TD-ORDER-001
      expect(setupOrder).toEqual(['TD-USER-001', 'TD-STORE-001', 'TD-ORDER-001']);

      // Verify step dependencies are correctly assigned
      const userStep = lifecyclePlan.setupSteps.find((s) => s.testdataRef === 'TD-USER-001');
      const storeStep = lifecyclePlan.setupSteps.find((s) => s.testdataRef === 'TD-STORE-001');
      const orderStep = lifecyclePlan.setupSteps.find((s) => s.testdataRef === 'TD-ORDER-001');

      expect(userStep?.dependsOn).toEqual([]); // No dependencies
      expect(storeStep?.dependsOn).toContain(userStep?.id); // Depends on user
      expect(orderStep?.dependsOn).toContain(storeStep?.id); // Depends on store
    });

    it('should handle multiple root nodes correctly', async () => {
      // GIVEN: Two independent blueprints + one that depends on both
      // TD-USER-001 (no deps) ← TD-ORDER-001
      // TD-PRODUCT-001 (no deps) ← TD-ORDER-001

      const userBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'user.blueprint.yaml');
      const userBlueprintContent = `
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
      await fs.writeFile(userBlueprintPath, userBlueprintContent, 'utf-8');

      const productBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'product.blueprint.yaml');
      const productBlueprintContent = `
id: TD-PRODUCT-001
description: "Product blueprint"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/products.json
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(productBlueprintPath, productBlueprintContent, 'utf-8');

      const orderBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order.blueprint.yaml');
      const orderBlueprintContent = `
id: TD-ORDER-001
description: "Order blueprint"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
dependencies:
  - TD-USER-001
  - TD-PRODUCT-001
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(orderBlueprintPath, orderBlueprintContent, 'utf-8');

      // WHEN: Generate lifecycle plan
      const blueprintMap = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);
      const graph = resolver.buildDependencyGraph(blueprintMap);
      const dependencyOrder = resolver.topologicalSort(graph);
      const orderBlueprint = blueprintMap.get('TD-ORDER-001')!;
      const lifecyclePlan = generator.generateLifecyclePlan(
        orderBlueprint,
        dependencyOrder,
        blueprintMap
      );

      // THEN: TD-USER-001 and TD-PRODUCT-001 should come before TD-ORDER-001
      const setupOrder = lifecyclePlan.setupSteps.map((step) => step.testdataRef);

      const userIndex = setupOrder.indexOf('TD-USER-001');
      const productIndex = setupOrder.indexOf('TD-PRODUCT-001');
      const orderIndex = setupOrder.indexOf('TD-ORDER-001');

      expect(userIndex).toBeLessThan(orderIndex);
      expect(productIndex).toBeLessThan(orderIndex);
      expect(lifecyclePlan.setupSteps).toHaveLength(3);
    });
  });

  describe('Acceptance Scenario 2 - Generate Reverse Teardown Sequence (T038)', () => {
    it('should generate teardown steps in reverse order: TD-ORDER-001 → TD-STORE-001 → TD-USER-001', async () => {
      // GIVEN: Blueprint chain with teardown: true

      const userBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'user.blueprint.yaml');
      const userBlueprintContent = `
id: TD-USER-001
description: "User blueprint with teardown"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/users.json
scope: worker
teardown: true
timeout: 30000
`;
      await fs.writeFile(userBlueprintPath, userBlueprintContent, 'utf-8');

      const storeBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'store.blueprint.yaml');
      const storeBlueprintContent = `
id: TD-STORE-001
description: "Store blueprint with teardown"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/stores.json
dependencies:
  - TD-USER-001
scope: worker
teardown: true
timeout: 30000
`;
      await fs.writeFile(storeBlueprintPath, storeBlueprintContent, 'utf-8');

      const orderBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order.blueprint.yaml');
      const orderBlueprintContent = `
id: TD-ORDER-001
description: "Order blueprint with teardown"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
dependencies:
  - TD-STORE-001
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(orderBlueprintPath, orderBlueprintContent, 'utf-8');

      // WHEN: Generate lifecycle plan
      const blueprintMap = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);
      const graph = resolver.buildDependencyGraph(blueprintMap);
      const dependencyOrder = resolver.topologicalSort(graph);
      const orderBlueprint = blueprintMap.get('TD-ORDER-001')!;
      const lifecyclePlan = generator.generateLifecyclePlan(
        orderBlueprint,
        dependencyOrder,
        blueprintMap
      );

      // THEN: Teardown steps should be in reverse order
      expect(lifecyclePlan.teardownSteps).toHaveLength(3);

      const teardownOrder = lifecyclePlan.teardownSteps.map((step) => step.testdataRef);

      // Reverse order: TD-ORDER-001 → TD-STORE-001 → TD-USER-001
      expect(teardownOrder).toEqual(['TD-ORDER-001', 'TD-STORE-001', 'TD-USER-001']);

      // Verify teardown actions
      for (const step of lifecyclePlan.teardownSteps) {
        expect(step.action).toContain('cleanup');
      }
    });

    it('should only generate teardown for blueprints with teardown: true', async () => {
      // GIVEN: Mixed teardown settings

      const userBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'user.blueprint.yaml');
      const userBlueprintContent = `
id: TD-USER-001
description: "User blueprint without teardown"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/users.json
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(userBlueprintPath, userBlueprintContent, 'utf-8');

      const orderBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order.blueprint.yaml');
      const orderBlueprintContent = `
id: TD-ORDER-001
description: "Order blueprint with teardown"
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
      await fs.writeFile(orderBlueprintPath, orderBlueprintContent, 'utf-8');

      // WHEN: Generate lifecycle plan
      const blueprintMap = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);
      const graph = resolver.buildDependencyGraph(blueprintMap);
      const dependencyOrder = resolver.topologicalSort(graph);
      const orderBlueprint = blueprintMap.get('TD-ORDER-001')!;
      const lifecyclePlan = generator.generateLifecyclePlan(
        orderBlueprint,
        dependencyOrder,
        blueprintMap
      );

      // THEN: Only TD-ORDER-001 should have teardown step
      expect(lifecyclePlan.teardownSteps).toHaveLength(1);
      expect(lifecyclePlan.teardownSteps[0].testdataRef).toBe('TD-ORDER-001');
    });
  });

  describe('Acceptance Scenario 3 - Generate Test Fixture with Correct Scope (T039)', () => {
    it('should generate lifecycle plan with scope: test', async () => {
      // GIVEN: Blueprint with scope: test

      const orderBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order-test-scope.blueprint.yaml');
      const orderBlueprintContent = `
id: TD-ORDER-001
description: "Order blueprint with test scope"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
scope: test
teardown: true
timeout: 30000
`;
      await fs.writeFile(orderBlueprintPath, orderBlueprintContent, 'utf-8');

      // WHEN: Generate lifecycle plan
      const blueprintMap = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);
      const graph = resolver.buildDependencyGraph(blueprintMap);
      const dependencyOrder = resolver.topologicalSort(graph);
      const orderBlueprint = blueprintMap.get('TD-ORDER-001')!;
      const lifecyclePlan = generator.generateLifecyclePlan(
        orderBlueprint,
        dependencyOrder,
        blueprintMap
      );

      // THEN: Lifecycle plan should have scope: test
      expect(lifecyclePlan.scope).toBe('test');
      expect(lifecyclePlan.testdataRef).toBe('TD-ORDER-001');
      expect(lifecyclePlan.version).toBe('1.0.0');
    });

    it('should generate lifecycle plan with scope: worker', async () => {
      // GIVEN: Blueprint with scope: worker

      const userBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'user-worker-scope.blueprint.yaml');
      const userBlueprintContent = `
id: TD-USER-001
description: "User blueprint with worker scope"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/users.json
scope: worker
teardown: false
timeout: 30000
`;
      await fs.writeFile(userBlueprintPath, userBlueprintContent, 'utf-8');

      // WHEN: Generate lifecycle plan
      const blueprintMap = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);
      const graph = resolver.buildDependencyGraph(blueprintMap);
      const dependencyOrder = resolver.topologicalSort(graph);
      const userBlueprint = blueprintMap.get('TD-USER-001')!;
      const lifecyclePlan = generator.generateLifecyclePlan(
        userBlueprint,
        dependencyOrder,
        blueprintMap
      );

      // THEN: Lifecycle plan should have scope: worker
      expect(lifecyclePlan.scope).toBe('worker');
    });

    it('should calculate total timeout correctly', async () => {
      // GIVEN: Blueprint with specific timeout

      const orderBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'order-timeout.blueprint.yaml');
      const orderBlueprintContent = `
id: TD-ORDER-001
description: "Order blueprint with custom timeout"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json
scope: test
teardown: true
timeout: 45000
`;
      await fs.writeFile(orderBlueprintPath, orderBlueprintContent, 'utf-8');

      // WHEN: Generate lifecycle plan
      const blueprintMap = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);
      const graph = resolver.buildDependencyGraph(blueprintMap);
      const dependencyOrder = resolver.topologicalSort(graph);
      const orderBlueprint = blueprintMap.get('TD-ORDER-001')!;
      const lifecyclePlan = generator.generateLifecyclePlan(
        orderBlueprint,
        dependencyOrder,
        blueprintMap
      );

      // THEN: Total timeout should be sum of setup + teardown timeouts
      const setupTimeout = lifecyclePlan.setupSteps.reduce((sum, step) => sum + step.timeout, 0);
      const teardownTimeout = lifecyclePlan.teardownSteps.reduce(
        (sum, step) => sum + step.timeout,
        0
      );

      expect(lifecyclePlan.totalTimeout).toBe(setupTimeout + teardownTimeout);
      expect(lifecyclePlan.totalTimeout).toBe(90000); // 45000 + 45000
    });

    it('should include generatedAt timestamp', async () => {
      // GIVEN: Any blueprint

      const userBlueprintPath = path.join(TEST_BLUEPRINTS_DIR, 'user.blueprint.yaml');
      const userBlueprintContent = `
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
      await fs.writeFile(userBlueprintPath, userBlueprintContent, 'utf-8');

      // WHEN: Generate lifecycle plan
      const blueprintMap = await loader.loadAllBlueprints(TEST_BLUEPRINTS_DIR);
      const graph = resolver.buildDependencyGraph(blueprintMap);
      const dependencyOrder = resolver.topologicalSort(graph);
      const userBlueprint = blueprintMap.get('TD-USER-001')!;

      const beforeGeneration = new Date();
      const lifecyclePlan = generator.generateLifecyclePlan(
        userBlueprint,
        dependencyOrder,
        blueprintMap
      );
      const afterGeneration = new Date();

      // THEN: generatedAt should be a valid ISO timestamp
      expect(lifecyclePlan.generatedAt).toBeDefined();
      expect(lifecyclePlan.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      const generatedAt = new Date(lifecyclePlan.generatedAt);
      expect(generatedAt.getTime()).toBeGreaterThanOrEqual(beforeGeneration.getTime());
      expect(generatedAt.getTime()).toBeLessThanOrEqual(afterGeneration.getTime());
    });
  });
});
