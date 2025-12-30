/**
 * @spec T004-e2e-testdata-planner
 * Dependency resolver - builds dependency graphs and performs topological sorting
 */
import type { TestdataBlueprint, DependencyGraph, DependencyNode } from './schemas';
import * as logger from './utils/logger';

/**
 * Dependency resolver class
 * Responsible for building dependency graphs and resolving execution order
 */
export class DependencyResolver {
  /**
   * Build dependency graph from blueprints
   * @param blueprints - Map of blueprint ID to blueprint
   * @returns Dependency graph
   * @throws Error if missing dependency references are found
   */
  buildDependencyGraph(blueprints: Map<string, TestdataBlueprint>): DependencyGraph {
    logger.debug(`Building dependency graph for ${blueprints.size} blueprint(s)`);

    const nodes: DependencyNode[] = [];
    const edges = new Map<string, string[]>();

    // Build nodes and validate dependencies
    for (const [id, blueprint] of blueprints) {
      nodes.push({ id, blueprint });

      const dependencies = blueprint.dependencies || [];

      // Validate all dependencies exist
      for (const depId of dependencies) {
        if (!blueprints.has(depId)) {
          throw new Error(`Missing dependency: ${depId}`);
        }
      }

      edges.set(id, dependencies);
    }

    logger.debug(`Built graph with ${nodes.length} nodes and ${edges.size} edge sets`);

    return { nodes, edges };
  }

  /**
   * Perform topological sort using Kahn's algorithm
   * @param graph - Dependency graph
   * @returns Sorted array of blueprint IDs (dependencies first)
   * @throws Error if circular dependency is detected
   */
  topologicalSort(graph: DependencyGraph): string[] {
    logger.debug('Performing topological sort');

    // Calculate in-degrees (number of incoming edges)
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // Initialize in-degrees
    for (const node of graph.nodes) {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    }

    // Build reverse adjacency list (dependents) and calculate in-degrees
    for (const [nodeId, dependencies] of graph.edges) {
      for (const depId of dependencies) {
        // Add edge from dependency to dependent
        adjList.get(depId)!.push(nodeId);
        // Increment in-degree of dependent
        inDegree.set(nodeId, (inDegree.get(nodeId) || 0) + 1);
      }
    }

    // Find all nodes with in-degree 0 (no dependencies)
    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const sorted: string[] = [];

    // Process nodes in queue
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      sorted.push(nodeId);

      // Reduce in-degree of dependents
      const dependents = adjList.get(nodeId) || [];
      for (const depNodeId of dependents) {
        const newDegree = inDegree.get(depNodeId)! - 1;
        inDegree.set(depNodeId, newDegree);

        if (newDegree === 0) {
          queue.push(depNodeId);
        }
      }
    }

    // If we haven't processed all nodes, there's a cycle
    if (sorted.length !== graph.nodes.length) {
      const cycle = this.detectCycle(graph);
      throw new Error(
        `Circular dependency detected: ${cycle ? cycle.join(' → ') : 'unknown cycle'}`
      );
    }

    logger.debug(`Topological sort complete: ${sorted.join(' → ')}`);

    return sorted;
  }

  /**
   * Detect cycles in the dependency graph using DFS with three colors
   * @param graph - Dependency graph
   * @returns Array of node IDs in the cycle, or null if no cycle
   */
  detectCycle(graph: DependencyGraph): string[] | null {
    logger.debug('Detecting cycles in dependency graph');

    // Three colors: white (unvisited), gray (visiting), black (visited)
    const color = new Map<string, 'white' | 'gray' | 'black'>();
    const parent = new Map<string, string | null>();

    // Initialize all nodes as white
    for (const node of graph.nodes) {
      color.set(node.id, 'white');
      parent.set(node.id, null);
    }

    // DFS visit function
    const dfsVisit = (nodeId: string): string[] | null => {
      color.set(nodeId, 'gray');

      const dependencies = graph.edges.get(nodeId) || [];
      for (const depId of dependencies) {
        const depColor = color.get(depId);

        if (depColor === 'gray') {
          // Found a back edge (cycle)
          const cycle: string[] = [depId];
          let current = nodeId;
          while (current !== depId) {
            cycle.unshift(current);
            current = parent.get(current)!;
          }
          return cycle;
        }

        if (depColor === 'white') {
          parent.set(depId, nodeId);
          const cycle = dfsVisit(depId);
          if (cycle) {
            return cycle;
          }
        }
      }

      color.set(nodeId, 'black');
      return null;
    };

    // Run DFS from all unvisited nodes
    for (const node of graph.nodes) {
      if (color.get(node.id) === 'white') {
        const cycle = dfsVisit(node.id);
        if (cycle) {
          logger.debug(`Cycle detected: ${cycle.join(' → ')}`);
          return cycle;
        }
      }
    }

    logger.debug('No cycles detected');
    return null;
  }

  /**
   * Calculate depth of a node in the dependency graph
   * Depth is the maximum distance from any root node (node with no dependencies)
   * @param graph - Dependency graph
   * @param nodeId - Node to calculate depth for
   * @returns Depth (0 for root nodes)
   * @throws Error if node not found
   */
  calculateDepth(graph: DependencyGraph, nodeId: string): number {
    // Verify node exists
    if (!graph.edges.has(nodeId)) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    const memo = new Map<string, number>();

    const calcDepth = (id: string): number => {
      // Check memo
      if (memo.has(id)) {
        return memo.get(id)!;
      }

      const dependencies = graph.edges.get(id) || [];

      // Base case: no dependencies = depth 0
      if (dependencies.length === 0) {
        memo.set(id, 0);
        return 0;
      }

      // Recursive case: depth = max(dependency depths) + 1
      let maxDepth = 0;
      for (const depId of dependencies) {
        const depDepth = calcDepth(depId);
        maxDepth = Math.max(maxDepth, depDepth);
      }

      const depth = maxDepth + 1;
      memo.set(id, depth);
      return depth;
    };

    const depth = calcDepth(nodeId);
    logger.debug(`Calculated depth for ${nodeId}: ${depth}`);
    return depth;
  }
}
