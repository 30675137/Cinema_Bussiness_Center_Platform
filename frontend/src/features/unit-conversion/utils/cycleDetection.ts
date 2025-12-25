/**
 * 循环依赖检测工具 (DFS + 路径追踪)
 * P002-unit-conversion
 *
 * FR-003: 创建/编辑换算规则时实时检测循环依赖
 */

import type { UnitConversion } from '../types';

/**
 * 构建有向图
 */
function buildGraph(
  conversions: UnitConversion[],
  excludeId?: string
): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const c of conversions) {
    if (excludeId && c.id === excludeId) continue;

    if (!graph.has(c.fromUnit)) {
      graph.set(c.fromUnit, []);
    }
    graph.get(c.fromUnit)!.push(c.toUnit);
  }

  return graph;
}

/**
 * DFS 检测循环
 *
 * @param node 当前节点
 * @param graph 邻接表
 * @param visited 已访问节点集合
 * @param path 当前路径
 * @returns 循环路径（如果有），否则返回 null
 */
function dfs(
  node: string,
  graph: Map<string, string[]>,
  visited: Set<string>,
  path: string[]
): string[] | null {
  // 如果当前节点在路径中，说明找到了循环
  if (path.includes(node)) {
    const cycleStart = path.indexOf(node);
    return [...path.slice(cycleStart), node];
  }

  // 如果已经访问过且不在路径中，跳过
  if (visited.has(node)) {
    return null;
  }

  visited.add(node);
  path.push(node);

  const neighbors = graph.get(node) || [];
  for (const neighbor of neighbors) {
    const cycle = dfs(neighbor, graph, visited, path);
    if (cycle) return cycle;
  }

  path.pop();
  return null;
}

/**
 * 检测循环依赖
 *
 * @param conversions 现有换算规则列表
 * @param fromUnit 新规则的源单位
 * @param toUnit 新规则的目标单位
 * @param excludeId 编辑时排除的规则 ID
 * @returns 循环路径（如果检测到循环），否则返回 null
 *
 * @example
 * ```typescript
 * const cycle = detectCycle(conversions, 'A', 'B');
 * if (cycle) {
 *   console.log(`检测到循环：${cycle.join('→')}`);
 * }
 * ```
 */
export function detectCycle(
  conversions: UnitConversion[],
  fromUnit: string,
  toUnit: string,
  excludeId?: string
): string[] | null {
  // 构建图
  const graph = buildGraph(conversions, excludeId);

  // 添加新边
  if (!graph.has(fromUnit)) {
    graph.set(fromUnit, []);
  }
  graph.get(fromUnit)!.push(toUnit);

  // 从新规则的源单位开始 DFS
  const visited = new Set<string>();
  const path: string[] = [];

  return dfs(fromUnit, graph, visited, path);
}

/**
 * 格式化循环路径为字符串
 *
 * @param cyclePath 循环路径数组
 * @returns 格式化的字符串，如 "A→B→C→A"
 */
export function formatCyclePath(cyclePath: string[]): string {
  return cyclePath.join('→');
}

/**
 * 验证新规则是否会产生循环
 *
 * @param conversions 现有换算规则列表
 * @param fromUnit 新规则的源单位
 * @param toUnit 新规则的目标单位
 * @param excludeId 编辑时排除的规则 ID
 * @returns 验证结果
 */
export function validateNoCycle(
  conversions: UnitConversion[],
  fromUnit: string,
  toUnit: string,
  excludeId?: string
): { valid: boolean; cyclePath?: string[]; message: string } {
  const cycle = detectCycle(conversions, fromUnit, toUnit, excludeId);

  if (cycle) {
    return {
      valid: false,
      cyclePath: cycle,
      message: `检测到循环：${formatCyclePath(cycle)}`,
    };
  }

  return {
    valid: true,
    message: '无循环依赖',
  };
}
