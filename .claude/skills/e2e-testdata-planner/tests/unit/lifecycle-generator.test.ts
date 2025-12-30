/**
 * @spec T004-e2e-testdata-planner
 * Unit tests for Lifecycle Generator
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { LifecycleGenerator } from '../../scripts/lifecycle-generator';
import type { TestdataBlueprint, LifecyclePlan, Step } from '../../scripts/schemas';

describe('LifecycleGenerator', () => {
  let generator: LifecycleGenerator;

  beforeEach(() => {
    generator = new LifecycleGenerator();
  });

  describe('generateLifecyclePlan', () => {
    it('should generate lifecycle plan with setup and teardown steps', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'users.json' },
        scope: 'worker',
        teardown: true,
        timeout: 30000,
      };

      const dependencyOrder = ['TD-USER-001'];

      const plan = generator.generateLifecyclePlan(blueprint, dependencyOrder, new Map());

      expect(plan.testdataRef).toBe('TD-USER-001');
      expect(plan.version).toBe('1.0.0');
      expect(plan.scope).toBe('worker');
      expect(plan.setupSteps).toHaveLength(1);
      expect(plan.teardownSteps).toHaveLength(1);
      expect(plan.totalTimeout).toBeGreaterThan(0);
      expect(plan.generatedAt).toBeDefined();
    });

    it('should handle different fixture scopes (test, worker, global)', () => {
      const testScope: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'orders.json' },
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const plan = generator.generateLifecyclePlan(testScope, ['TD-ORDER-001'], new Map());

      expect(plan.scope).toBe('test');
    });

    it('should calculate total timeout from all steps', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'users.json' },
        scope: 'worker',
        teardown: true,
        timeout: 30000,
      };

      const plan = generator.generateLifecyclePlan(blueprint, ['TD-USER-001'], new Map());

      // totalTimeout should be sum of setup + teardown timeouts
      const setupTimeout = plan.setupSteps.reduce((sum, step) => sum + step.timeout, 0);
      const teardownTimeout = plan.teardownSteps.reduce((sum, step) => sum + step.timeout, 0);

      expect(plan.totalTimeout).toBe(setupTimeout + teardownTimeout);
    });

    it('should include dependencies in setup steps (按依赖顺序)', () => {
      const userBlueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'users.json' },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
      };

      const storeBlueprint: TestdataBlueprint = {
        id: 'TD-STORE-001',
        description: 'Store blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'stores.json' },
        dependencies: ['TD-USER-001'],
        scope: 'worker',
        teardown: true,
        timeout: 30000,
      };

      const blueprints = new Map([
        ['TD-USER-001', userBlueprint],
        ['TD-STORE-001', storeBlueprint],
      ]);

      const dependencyOrder = ['TD-USER-001', 'TD-STORE-001'];
      const plan = generator.generateLifecyclePlan(storeBlueprint, dependencyOrder, blueprints);

      // Should have setup steps for both TD-USER-001 and TD-STORE-001
      expect(plan.setupSteps.length).toBeGreaterThanOrEqual(2);

      // Order should match dependency order
      const userStepIndex = plan.setupSteps.findIndex((s) => s.id.includes('TD-USER-001'));
      const storeStepIndex = plan.setupSteps.findIndex((s) => s.id.includes('TD-STORE-001'));

      expect(userStepIndex).toBeLessThan(storeStepIndex);
    });
  });

  describe('generateSetupSteps', () => {
    it('should generate setup steps in dependency order', () => {
      const userBlueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'users.json' },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
      };

      const orderBlueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'orders.json' },
        dependencies: ['TD-USER-001'],
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const dependencies = [userBlueprint];

      const steps = generator.generateSetupSteps(orderBlueprint, dependencies);

      // Should generate steps for dependency + target blueprint
      expect(steps.length).toBeGreaterThanOrEqual(2);

      // First step should be for TD-USER-001
      expect(steps[0].id).toContain('TD-USER-001');
      // Last step should be for TD-ORDER-001
      expect(steps[steps.length - 1].id).toContain('TD-ORDER-001');
    });

    it('should create step with correct strategy type', () => {
      const seedBlueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'users.json' },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
      };

      const steps = generator.generateSetupSteps(seedBlueprint, []);

      expect(steps).toHaveLength(1);
      expect(steps[0].action).toBe('load-seed');
      expect(steps[0].config.seedFilePath).toBe('users.json');
    });

    it('should assign step dependencies (dependsOn field)', () => {
      const userBlueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'users.json' },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
      };

      const orderBlueprint: TestdataBlueprint = {
        id: 'TD-ORDER-001',
        description: 'Order blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'orders.json' },
        dependencies: ['TD-USER-001'],
        scope: 'test',
        teardown: true,
        timeout: 30000,
      };

      const steps = generator.generateSetupSteps(orderBlueprint, [userBlueprint]);

      // Order step should depend on user step
      const orderStep = steps.find((s) => s.id.includes('TD-ORDER-001'));
      const userStep = steps.find((s) => s.id.includes('TD-USER-001'));

      expect(orderStep?.dependsOn).toContain(userStep?.id);
    });

    it('should set correct timeout for each step', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'users.json' },
        scope: 'worker',
        teardown: false,
        timeout: 45000,
      };

      const steps = generator.generateSetupSteps(blueprint, []);

      expect(steps).toHaveLength(1);
      expect(steps[0].timeout).toBe(45000);
    });

    it('should handle optional steps (optional: true)', () => {
      const blueprint: TestdataBlueprint = {
        id: 'TD-USER-001',
        description: 'User blueprint',
        version: '1.0.0',
        strategy: { type: 'seed', seedFilePath: 'users.json' },
        scope: 'worker',
        teardown: false,
        timeout: 30000,
        optional: true,
      };

      const steps = generator.generateSetupSteps(blueprint, []);

      expect(steps).toHaveLength(1);
      expect(steps[0].optional).toBe(true);
    });
  });

  describe('generateTeardownSteps', () => {
    it('should generate teardown steps in reverse order', () => {
      const setupSteps: Step[] = [
        {
          id: 'setup-TD-USER-001',
          action: 'load-seed',
          testdataRef: 'TD-USER-001',
          timeout: 30000,
          dependsOn: [],
          config: { seedFilePath: 'users.json', teardown: true },
        },
        {
          id: 'setup-TD-STORE-001',
          action: 'load-seed',
          testdataRef: 'TD-STORE-001',
          timeout: 30000,
          dependsOn: ['setup-TD-USER-001'],
          config: { seedFilePath: 'stores.json', teardown: true },
        },
        {
          id: 'setup-TD-ORDER-001',
          action: 'load-seed',
          testdataRef: 'TD-ORDER-001',
          timeout: 30000,
          dependsOn: ['setup-TD-STORE-001'],
          config: { seedFilePath: 'orders.json', teardown: true },
        },
      ];

      const teardownSteps = generator.generateTeardownSteps(setupSteps);

      expect(teardownSteps).toHaveLength(3);

      // Teardown should be in reverse order
      expect(teardownSteps[0].testdataRef).toBe('TD-ORDER-001');
      expect(teardownSteps[1].testdataRef).toBe('TD-STORE-001');
      expect(teardownSteps[2].testdataRef).toBe('TD-USER-001');

      // Teardown actions should be cleanup-*
      expect(teardownSteps[0].action).toContain('cleanup');
    });

    it('should only generate teardown for blueprints with teardown: true', () => {
      const setupSteps: Step[] = [
        {
          id: 'setup-TD-USER-001',
          action: 'load-seed',
          testdataRef: 'TD-USER-001',
          timeout: 30000,
          dependsOn: [],
          config: { seedFilePath: 'users.json', teardown: false },
        },
        {
          id: 'setup-TD-ORDER-001',
          action: 'load-seed',
          testdataRef: 'TD-ORDER-001',
          timeout: 30000,
          dependsOn: ['setup-TD-USER-001'],
          config: { seedFilePath: 'orders.json', teardown: true },
        },
      ];

      const teardownSteps = generator.generateTeardownSteps(setupSteps);

      // Only TD-ORDER-001 should have teardown step
      expect(teardownSteps).toHaveLength(1);
      expect(teardownSteps[0].testdataRef).toBe('TD-ORDER-001');
    });

    it('should return empty array if no teardown steps needed', () => {
      const setupSteps: Step[] = [
        {
          id: 'setup-TD-USER-001',
          action: 'load-seed',
          testdataRef: 'TD-USER-001',
          timeout: 30000,
          dependsOn: [],
          config: { seedFilePath: 'users.json', teardown: false },
        },
      ];

      const teardownSteps = generator.generateTeardownSteps(setupSteps);

      expect(teardownSteps).toEqual([]);
    });
  });

  describe('assignStepDependencies', () => {
    it('should assign dependsOn based on blueprint dependencies', () => {
      const steps: Step[] = [
        {
          id: 'setup-TD-USER-001',
          action: 'load-seed',
          testdataRef: 'TD-USER-001',
          timeout: 30000,
          dependsOn: [],
          config: {},
        },
        {
          id: 'setup-TD-ORDER-001',
          action: 'load-seed',
          testdataRef: 'TD-ORDER-001',
          timeout: 30000,
          dependsOn: [],
          config: {},
        },
      ];

      // TD-ORDER-001 depends on TD-USER-001
      const blueprintDeps = new Map([
        ['TD-ORDER-001', ['TD-USER-001']],
      ]);

      const result = generator.assignStepDependencies(steps, blueprintDeps);

      const orderStep = result.find((s) => s.testdataRef === 'TD-ORDER-001');
      const userStep = result.find((s) => s.testdataRef === 'TD-USER-001');

      expect(orderStep?.dependsOn).toContain(userStep?.id);
    });

    it('should handle steps with no dependencies', () => {
      const steps: Step[] = [
        {
          id: 'setup-TD-USER-001',
          action: 'load-seed',
          testdataRef: 'TD-USER-001',
          timeout: 30000,
          dependsOn: [],
          config: {},
        },
      ];

      const result = generator.assignStepDependencies(steps, new Map());

      expect(result[0].dependsOn).toEqual([]);
    });
  });
});
