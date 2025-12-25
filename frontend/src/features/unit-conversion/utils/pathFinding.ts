/**
 * 换算路径查找工具 (BFS 最短路径)
 * P002-unit-conversion
 *
 * FR-012: 支持同一基础单位的多个换算路径，自动选择最短路径
 * SC-003: 支持最多5个中间步骤的换算链
 */

import type { UnitConversion, ConversionPath } from '../types';

interface Edge {
  toUnit: string;
  rate: number;
}

interface PathNode {
  unit: string;
  path: string[];
  rate: number;
}

/**
 * 构建双向图（支持反向换算 FR-008）
 */
function buildBidirectionalGraph(conversions: UnitConversion[]): Map<string, Edge[]> {
  const graph = new Map<string, Edge[]>();

  for (const c of conversions) {
    // 正向边
    if (!graph.has(c.fromUnit)) {
      graph.set(c.fromUnit, []);
    }
    graph.get(c.fromUnit)!.push({
      toUnit: c.toUnit,
      rate: c.conversionRate,
    });

    // 反向边 (1/rate)
    if (!graph.has(c.toUnit)) {
      graph.set(c.toUnit, []);
    }
    graph.get(c.toUnit)!.push({
      toUnit: c.fromUnit,
      rate: 1 / c.conversionRate,
    });
  }

  return graph;
}

/**
 * BFS 查找最短换算路径
 *
 * @param conversions 换算规则列表
 * @param fromUnit 源单位
 * @param toUnit 目标单位
 * @param maxSteps 最大中间步骤数（默认5）
 * @returns 换算路径结果
 *
 * @example
 * ```typescript
 * const result = findShortestPath(conversions, '瓶', 'L');
 * if (result.found) {
 *   console.log(`路径: ${result.path.join('→')}`);
 *   console.log(`换算率: ${result.totalRate}`);
 * }
 * ```
 */
export function findShortestPath(
  conversions: UnitConversion[],
  fromUnit: string,
  toUnit: string,
  maxSteps: number = 5
): ConversionPath {
  // 源和目标相同
  if (fromUnit === toUnit) {
    return {
      fromUnit,
      toUnit,
      path: [fromUnit],
      totalRate: 1,
      steps: 0,
      found: true,
    };
  }

  const graph = buildBidirectionalGraph(conversions);

  // BFS
  const queue: PathNode[] = [{ unit: fromUnit, path: [fromUnit], rate: 1 }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    // 找到目标
    if (current.unit === toUnit) {
      return {
        fromUnit,
        toUnit,
        path: current.path,
        totalRate: current.rate,
        steps: current.path.length - 1,
        found: true,
      };
    }

    // 已访问过
    if (visited.has(current.unit)) {
      continue;
    }
    visited.add(current.unit);

    // 超过最大步骤数
    if (current.path.length > maxSteps + 1) {
      continue;
    }

    // 遍历邻居
    const neighbors = graph.get(current.unit) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.toUnit)) {
        queue.push({
          unit: edge.toUnit,
          path: [...current.path, edge.toUnit],
          rate: current.rate * edge.rate,
        });
      }
    }
  }

  // 未找到路径
  return {
    fromUnit,
    toUnit,
    path: [],
    totalRate: 0,
    steps: 0,
    found: false,
  };
}

/**
 * 计算单位换算
 *
 * @param conversions 换算规则列表
 * @param value 原始数值
 * @param fromUnit 源单位
 * @param toUnit 目标单位
 * @returns 换算后的数值，如果无法换算则返回 null
 */
export function convert(
  conversions: UnitConversion[],
  value: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const path = findShortestPath(conversions, fromUnit, toUnit);

  if (!path.found) {
    return null;
  }

  return value * path.totalRate;
}

/**
 * 格式化路径为字符串
 */
export function formatPath(path: string[]): string {
  return path.join('→');
}

/**
 * 获取所有可达的单位
 *
 * @param conversions 换算规则列表
 * @param fromUnit 起始单位
 * @returns 所有可达的单位集合
 */
export function getReachableUnits(
  conversions: UnitConversion[],
  fromUnit: string
): Set<string> {
  const graph = buildBidirectionalGraph(conversions);
  const reachable = new Set<string>();
  const queue = [fromUnit];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (reachable.has(current)) {
      continue;
    }
    reachable.add(current);

    const neighbors = graph.get(current) || [];
    for (const edge of neighbors) {
      if (!reachable.has(edge.toUnit)) {
        queue.push(edge.toUnit);
      }
    }
  }

  return reachable;
}
