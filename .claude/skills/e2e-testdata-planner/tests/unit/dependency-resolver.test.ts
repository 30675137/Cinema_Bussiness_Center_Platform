/**
 * @spec T004-e2e-testdata-planner
 * Unit tests for Dependency Resolver
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyResolver } from '../../scripts/dependency-resolver';
import type { TestdataBlueprint, DependencyGraph } from '../../scripts/schemas';

describe('DependencyResolver', () => {
  let resolver: DependencyResolver;

  beforeEach(() => {
    resolver = new DependencyResolver();
  });

  describe('buildDependencyGraph', () => {
    it('should build dependency graph with 3-layer dependency chain', () => {
      // TD-USER-001 (no deps) ← TD-STORE-001 ← TD-ORDER-001
      const blueprints = new Map<string, TestdataBlueprint>([
        [
          'TD-USER-001',
          {
            id: 'TD-USER-001',
            description: 'User blueprint',
            version: '1.0.0',
            strategy: { type: 'seed', seedFilePath: 'users.json' },
            scope: 'worker',
            teardown: false,
            timeout: 30000,
          },
        ],
        [
          'TD-STORE-001',
          {
            id: 'TD-STORE-001',
            description: 'Store blueprint',
            version: '1.0.0',
            strategy: { type: 'seed', seedFilePath: 'stores.json' },
            dependencies: ['TD-USER-001'],
            scope: 'worker',
            teardown: false,
            timeout: 30000,
          },
        ],
        [
          'TD-ORDER-001',
          {
            id: 'TD-ORDER-001',
            description: 'Order blueprint',
            version: '1.0.0',
            strategy: { type: 'seed', seedFilePath: 'orders.json' },
            dependencies: ['TD-STORE-001'],
            scope: 'test',
            teardown: true,
            timeout: 30000,
          },
        ],
      ]);

      const graph = resolver.buildDependencyGraph(blueprints);

      expect(graph.nodes).toHaveLength(3);
      expect(graph.nodes.map((n) => n.id)).toEqual([
        'TD-USER-001',
        'TD-STORE-001',
        'TD-ORDER-001',
      ]);
      expect(graph.edges.get('TD-ORDER-001')).toEqual(['TD-STORE-001']);
      expect(graph.edges.get('TD-STORE-001')).toEqual(['TD-USER-001']);
      expect(graph.edges.get('TD-USER-001')).toEqual([]);
    });

    it('should handle blueprints with no dependencies', () => {
      const blueprints = new Map<string, TestdataBlueprint>([
        [
          'TD-USER-001',
          {
            id: 'TD-USER-001',
            description: 'User blueprint',
            version: '1.0.0',
            strategy: { type: 'seed', seedFilePath: 'users.json' },
            scope: 'worker',
            teardown: false,
            timeout: 30000,
          },
        ],
      ]);

      const graph = resolver.buildDependencyGraph(blueprints);

      expect(graph.nodes).toHaveLength(1);
      expect(graph.edges.get('TD-USER-001')).toEqual([]);
    });

    it('should handle multiple root nodes (no dependencies)', () => {
      const blueprints = new Map<string, TestdataBlueprint>([
        [
          'TD-USER-001',
          {
            id: 'TD-USER-001',
            description: 'User blueprint',
            version: '1.0.0',
            strategy: { type: 'seed', seedFilePath: 'users.json' },
            scope: 'worker',
            teardown: false,
            timeout: 30000,
          },
        ],
        [
          'TD-PRODUCT-001',
          {
            id: 'TD-PRODUCT-001',
            description: 'Product blueprint',
            version: '1.0.0',
            strategy: { type: 'seed', seedFilePath: 'products.json' },
            scope: 'worker',
            teardown: false,
            timeout: 30000,
          },
        ],
      ]);

      const graph = resolver.buildDependencyGraph(blueprints);

      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges.get('TD-USER-001')).toEqual([]);
      expect(graph.edges.get('TD-PRODUCT-001')).toEqual([]);
    });

    it('should throw error for missing dependency references', () => {
      const blueprints = new Map<string, TestdataBlueprint>([
        [
          'TD-ORDER-001',
          {
            id: 'TD-ORDER-001',
            description: 'Order blueprint',
            version: '1.0.0',
            strategy: { type: 'seed', seedFilePath: 'orders.json' },
            dependencies: ['TD-USER-999'], // Missing dependency
            scope: 'test',
            teardown: true,
            timeout: 30000,
          },
        ],
      ]);

      expect(() => resolver.buildDependencyGraph(blueprints)).toThrow(
        'Missing dependency: TD-USER-999'
      );
    });
  });

  describe('topologicalSort', () => {
    it('should return correct execution order for 3-layer chain', () => {
      // TD-USER-001 ← TD-STORE-001 ← TD-ORDER-001
      const graph: DependencyGraph = {
        nodes: [
          { id: 'TD-USER-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-STORE-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-ORDER-001', blueprint: {} as TestdataBlueprint },
        ],
        edges: new Map([
          ['TD-USER-001', []],
          ['TD-STORE-001', ['TD-USER-001']],
          ['TD-ORDER-001', ['TD-STORE-001']],
        ]),
      };

      const sorted = resolver.topologicalSort(graph);

      expect(sorted).toEqual(['TD-USER-001', 'TD-STORE-001', 'TD-ORDER-001']);
    });

    it('should handle multiple root nodes correctly', () => {
      // TD-USER-001 ← TD-ORDER-001
      // TD-PRODUCT-001 ← TD-ORDER-001
      const graph: DependencyGraph = {
        nodes: [
          { id: 'TD-USER-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-PRODUCT-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-ORDER-001', blueprint: {} as TestdataBlueprint },
        ],
        edges: new Map([
          ['TD-USER-001', []],
          ['TD-PRODUCT-001', []],
          ['TD-ORDER-001', ['TD-USER-001', 'TD-PRODUCT-001']],
        ]),
      };

      const sorted = resolver.topologicalSort(graph);

      // TD-USER-001 and TD-PRODUCT-001 should come before TD-ORDER-001
      const userIndex = sorted.indexOf('TD-USER-001');
      const productIndex = sorted.indexOf('TD-PRODUCT-001');
      const orderIndex = sorted.indexOf('TD-ORDER-001');

      expect(userIndex).toBeLessThan(orderIndex);
      expect(productIndex).toBeLessThan(orderIndex);
      expect(sorted).toHaveLength(3);
    });

    it('should handle single node graph', () => {
      const graph: DependencyGraph = {
        nodes: [{ id: 'TD-USER-001', blueprint: {} as TestdataBlueprint }],
        edges: new Map([['TD-USER-001', []]]),
      };

      const sorted = resolver.topologicalSort(graph);

      expect(sorted).toEqual(['TD-USER-001']);
    });

    it('should throw error for circular dependency (A → B → C → A)', () => {
      const graph: DependencyGraph = {
        nodes: [
          { id: 'TD-A-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-B-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-C-001', blueprint: {} as TestdataBlueprint },
        ],
        edges: new Map([
          ['TD-A-001', ['TD-C-001']], // A depends on C
          ['TD-B-001', ['TD-A-001']], // B depends on A
          ['TD-C-001', ['TD-B-001']], // C depends on B -> cycle!
        ]),
      };

      expect(() => resolver.topologicalSort(graph)).toThrow(/circular dependency/i);
    });
  });

  describe('detectCycle', () => {
    it('should detect circular dependency (A → B → C → A)', () => {
      const graph: DependencyGraph = {
        nodes: [
          { id: 'TD-A-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-B-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-C-001', blueprint: {} as TestdataBlueprint },
        ],
        edges: new Map([
          ['TD-A-001', ['TD-C-001']],
          ['TD-B-001', ['TD-A-001']],
          ['TD-C-001', ['TD-B-001']],
        ]),
      };

      const cycle = resolver.detectCycle(graph);

      expect(cycle).not.toBeNull();
      expect(cycle).toHaveLength(3);
      // Cycle should contain A, B, C in some order
      expect(cycle).toContain('TD-A-001');
      expect(cycle).toContain('TD-B-001');
      expect(cycle).toContain('TD-C-001');
    });

    it('should return null for acyclic graph', () => {
      const graph: DependencyGraph = {
        nodes: [
          { id: 'TD-USER-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-STORE-001', blueprint: {} as TestdataBlueprint },
        ],
        edges: new Map([
          ['TD-USER-001', []],
          ['TD-STORE-001', ['TD-USER-001']],
        ]),
      };

      const cycle = resolver.detectCycle(graph);

      expect(cycle).toBeNull();
    });

    it('should detect self-referencing cycle (A → A)', () => {
      const graph: DependencyGraph = {
        nodes: [{ id: 'TD-A-001', blueprint: {} as TestdataBlueprint }],
        edges: new Map([['TD-A-001', ['TD-A-001']]], // Self-reference
        ),
      };

      const cycle = resolver.detectCycle(graph);

      expect(cycle).not.toBeNull();
      expect(cycle).toEqual(['TD-A-001']);
    });
  });

  describe('calculateDepth', () => {
    it('should calculate depth for 3-layer chain', () => {
      // TD-USER-001 (depth 0) ← TD-STORE-001 (depth 1) ← TD-ORDER-001 (depth 2)
      const graph: DependencyGraph = {
        nodes: [
          { id: 'TD-USER-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-STORE-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-ORDER-001', blueprint: {} as TestdataBlueprint },
        ],
        edges: new Map([
          ['TD-USER-001', []],
          ['TD-STORE-001', ['TD-USER-001']],
          ['TD-ORDER-001', ['TD-STORE-001']],
        ]),
      };

      expect(resolver.calculateDepth(graph, 'TD-USER-001')).toBe(0);
      expect(resolver.calculateDepth(graph, 'TD-STORE-001')).toBe(1);
      expect(resolver.calculateDepth(graph, 'TD-ORDER-001')).toBe(2);
    });

    it('should calculate depth for node with multiple dependencies', () => {
      // TD-USER-001 (depth 0)
      // TD-PRODUCT-001 (depth 0)
      // TD-ORDER-001 (depth 1) depends on both
      const graph: DependencyGraph = {
        nodes: [
          { id: 'TD-USER-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-PRODUCT-001', blueprint: {} as TestdataBlueprint },
          { id: 'TD-ORDER-001', blueprint: {} as TestdataBlueprint },
        ],
        edges: new Map([
          ['TD-USER-001', []],
          ['TD-PRODUCT-001', []],
          ['TD-ORDER-001', ['TD-USER-001', 'TD-PRODUCT-001']],
        ]),
      };

      expect(resolver.calculateDepth(graph, 'TD-USER-001')).toBe(0);
      expect(resolver.calculateDepth(graph, 'TD-PRODUCT-001')).toBe(0);
      expect(resolver.calculateDepth(graph, 'TD-ORDER-001')).toBe(1);
    });

    it('should return 0 for node with no dependencies', () => {
      const graph: DependencyGraph = {
        nodes: [{ id: 'TD-USER-001', blueprint: {} as TestdataBlueprint }],
        edges: new Map([['TD-USER-001', []]]),
      };

      expect(resolver.calculateDepth(graph, 'TD-USER-001')).toBe(0);
    });

    it('should throw error for non-existent node', () => {
      const graph: DependencyGraph = {
        nodes: [{ id: 'TD-USER-001', blueprint: {} as TestdataBlueprint }],
        edges: new Map([['TD-USER-001', []]]),
      };

      expect(() => resolver.calculateDepth(graph, 'TD-MISSING-001')).toThrow(
        'Node not found: TD-MISSING-001'
      );
    });
  });
});
