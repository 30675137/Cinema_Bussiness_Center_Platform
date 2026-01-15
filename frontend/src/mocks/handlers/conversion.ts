/**
 * MSW Mock Handlers for Unit Conversion API
 * P002-unit-conversion
 */

import { http, HttpResponse, delay } from 'msw';
import type {
  UnitConversion,
  CreateConversionRequest,
  ConversionStats,
  DbUnitCategory,
} from '../../features/unit-conversion/types';
import { DB_TO_DISPLAY } from '../../features/unit-conversion/utils/categoryMapping';

// Mock 数据存储
const STORAGE_KEY = 'mock_unit_conversions';

// 初始化 Mock 数据
const initialConversions: UnitConversion[] = [
  {
    id: '1',
    fromUnit: 'ml',
    toUnit: 'L',
    conversionRate: 0.001,
    category: 'volume',
    categoryDisplay: 'VOLUME',
  },
  {
    id: '2',
    fromUnit: '瓶',
    toUnit: 'ml',
    conversionRate: 750,
    category: 'volume',
    categoryDisplay: 'VOLUME',
  },
  {
    id: '3',
    fromUnit: '杯',
    toUnit: 'ml',
    conversionRate: 150,
    category: 'volume',
    categoryDisplay: 'VOLUME',
  },
  {
    id: '4',
    fromUnit: 'g',
    toUnit: 'kg',
    conversionRate: 0.001,
    category: 'weight',
    categoryDisplay: 'WEIGHT',
  },
  {
    id: '5',
    fromUnit: '份',
    toUnit: 'g',
    conversionRate: 100,
    category: 'weight',
    categoryDisplay: 'WEIGHT',
  },
  {
    id: '6',
    fromUnit: '个',
    toUnit: '打',
    conversionRate: 0.0833,
    category: 'quantity',
    categoryDisplay: 'COUNT',
  },
];

// 获取存储的数据
function getConversions(): UnitConversion[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // 初始化默认数据
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialConversions));
  return initialConversions;
}

// 保存数据
function saveConversions(conversions: UnitConversion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversions));
}

// 生成 UUID
function generateId(): string {
  return crypto.randomUUID();
}

// 检测循环依赖 (DFS)
function detectCycle(
  conversions: UnitConversion[],
  fromUnit: string,
  toUnit: string,
  excludeId?: string
): string[] | null {
  // 构建图
  const graph = new Map<string, string[]>();
  for (const c of conversions) {
    if (excludeId && c.id === excludeId) continue;
    if (!graph.has(c.fromUnit)) {
      graph.set(c.fromUnit, []);
    }
    graph.get(c.fromUnit)!.push(c.toUnit);
  }

  // 添加新边
  if (!graph.has(fromUnit)) {
    graph.set(fromUnit, []);
  }
  graph.get(fromUnit)!.push(toUnit);

  // DFS 检测循环
  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): string[] | null {
    if (path.includes(node)) {
      const cycleStart = path.indexOf(node);
      return [...path.slice(cycleStart), node];
    }
    if (visited.has(node)) return null;

    visited.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      const cycle = dfs(neighbor);
      if (cycle) return cycle;
    }

    path.pop();
    return null;
  }

  return dfs(fromUnit);
}

// API 响应包装
function wrapResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message: message || 'success',
    timestamp: new Date().toISOString(),
  };
}

function errorResponse(error: string, message: string, status: number, extra?: object) {
  return HttpResponse.json(
    {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
      ...extra,
    },
    { status }
  );
}

export const conversionHandlers = [
  // GET /api/unit-conversions - 获取所有换算规则
  http.get('/api/unit-conversions', async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const category = url.searchParams.get('category') as DbUnitCategory | null;
    const search = url.searchParams.get('search');

    let conversions = getConversions();

    if (category) {
      conversions = conversions.filter((c) => c.category === category);
    }

    if (search) {
      const keyword = search.toLowerCase();
      conversions = conversions.filter(
        (c) =>
          c.fromUnit.toLowerCase().includes(keyword) || c.toUnit.toLowerCase().includes(keyword)
      );
    }

    return HttpResponse.json(wrapResponse(conversions));
  }),

  // GET /api/unit-conversions/stats - 获取统计信息
  http.get('/api/unit-conversions/stats', async () => {
    await delay(50);
    const conversions = getConversions();

    const stats: ConversionStats = {
      volumeCount: conversions.filter((c) => c.category === 'volume').length,
      weightCount: conversions.filter((c) => c.category === 'weight').length,
      countCount: conversions.filter((c) => c.category === 'quantity').length,
      totalCount: conversions.length,
    };

    return HttpResponse.json(wrapResponse(stats));
  }),

  // GET /api/unit-conversions/:id - 获取单个换算规则
  http.get('/api/unit-conversions/:id', async ({ params }) => {
    await delay(50);
    const { id } = params;
    const conversions = getConversions();
    const conversion = conversions.find((c) => c.id === id);

    if (!conversion) {
      return errorResponse('NOT_FOUND', '换算规则不存在', 404);
    }

    return HttpResponse.json(wrapResponse(conversion));
  }),

  // POST /api/unit-conversions - 创建换算规则
  http.post('/api/unit-conversions', async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as CreateConversionRequest;
    const conversions = getConversions();

    // 验证源单位和目标单位不能相同
    if (body.fromUnit === body.toUnit) {
      return errorResponse('VALIDATION_ERROR', '源单位和目标单位不能相同', 400);
    }

    // 检查唯一约束
    const exists = conversions.some(
      (c) => c.fromUnit === body.fromUnit && c.toUnit === body.toUnit
    );
    if (exists) {
      return errorResponse(
        'DUPLICATE_RULE',
        `换算规则 '${body.fromUnit}' → '${body.toUnit}' 已存在`,
        409
      );
    }

    // 检测循环依赖
    const cycle = detectCycle(conversions, body.fromUnit, body.toUnit);
    if (cycle) {
      return errorResponse('CYCLE_DETECTED', `检测到循环：${cycle.join('→')}`, 409, {
        cyclePath: cycle,
      });
    }

    const newConversion: UnitConversion = {
      id: generateId(),
      fromUnit: body.fromUnit,
      toUnit: body.toUnit,
      conversionRate: body.conversionRate,
      category: body.category,
      categoryDisplay: DB_TO_DISPLAY[body.category],
    };

    conversions.push(newConversion);
    saveConversions(conversions);

    return HttpResponse.json(wrapResponse(newConversion, '创建成功'), { status: 201 });
  }),

  // PUT /api/unit-conversions/:id - 更新换算规则
  http.put('/api/unit-conversions/:id', async ({ params, request }) => {
    await delay(100);
    const { id } = params;
    const body = (await request.json()) as CreateConversionRequest;
    const conversions = getConversions();

    const index = conversions.findIndex((c) => c.id === id);
    if (index === -1) {
      return errorResponse('NOT_FOUND', '换算规则不存在', 404);
    }

    // 验证源单位和目标单位不能相同
    if (body.fromUnit === body.toUnit) {
      return errorResponse('VALIDATION_ERROR', '源单位和目标单位不能相同', 400);
    }

    // 检查唯一约束（排除当前记录）
    const exists = conversions.some(
      (c) => c.id !== id && c.fromUnit === body.fromUnit && c.toUnit === body.toUnit
    );
    if (exists) {
      return errorResponse(
        'DUPLICATE_RULE',
        `换算规则 '${body.fromUnit}' → '${body.toUnit}' 已存在`,
        409
      );
    }

    // 检测循环依赖（排除当前记录）
    const cycle = detectCycle(conversions, body.fromUnit, body.toUnit, id as string);
    if (cycle) {
      return errorResponse('CYCLE_DETECTED', `检测到循环：${cycle.join('→')}`, 409, {
        cyclePath: cycle,
      });
    }

    const updatedConversion: UnitConversion = {
      id: id as string,
      fromUnit: body.fromUnit,
      toUnit: body.toUnit,
      conversionRate: body.conversionRate,
      category: body.category,
      categoryDisplay: DB_TO_DISPLAY[body.category],
    };

    conversions[index] = updatedConversion;
    saveConversions(conversions);

    return HttpResponse.json(wrapResponse(updatedConversion, '更新成功'));
  }),

  // DELETE /api/unit-conversions/:id - 删除换算规则
  http.delete('/api/unit-conversions/:id', async ({ params }) => {
    await delay(100);
    const { id } = params;
    const conversions = getConversions();

    const index = conversions.findIndex((c) => c.id === id);
    if (index === -1) {
      return errorResponse('NOT_FOUND', '换算规则不存在', 404);
    }

    // TODO: 检查 BOM 引用（当前 Mock 简化处理，不做检查）

    conversions.splice(index, 1);
    saveConversions(conversions);

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/unit-conversions/validate-cycle - 验证循环依赖
  http.post('/api/unit-conversions/validate-cycle', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as {
      fromUnit: string;
      toUnit: string;
      excludeId?: string;
    };
    const conversions = getConversions();

    const cycle = detectCycle(conversions, body.fromUnit, body.toUnit, body.excludeId);

    if (cycle) {
      return HttpResponse.json(
        wrapResponse({
          valid: false,
          cyclePath: cycle,
          message: `检测到循环：${cycle.join('→')}`,
        })
      );
    }

    return HttpResponse.json(
      wrapResponse({
        valid: true,
        message: '无循环依赖',
      })
    );
  }),

  // POST /api/unit-conversions/calculate-path - 计算换算路径
  http.post('/api/unit-conversions/calculate-path', async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as { fromUnit: string; toUnit: string };
    const conversions = getConversions();

    // BFS 查找最短路径
    const graph = new Map<string, Array<{ toUnit: string; rate: number }>>();

    // 构建双向图
    for (const c of conversions) {
      // 正向
      if (!graph.has(c.fromUnit)) {
        graph.set(c.fromUnit, []);
      }
      graph.get(c.fromUnit)!.push({ toUnit: c.toUnit, rate: c.conversionRate });

      // 反向
      if (!graph.has(c.toUnit)) {
        graph.set(c.toUnit, []);
      }
      graph.get(c.toUnit)!.push({ toUnit: c.fromUnit, rate: 1 / c.conversionRate });
    }

    // BFS
    const queue: Array<{ unit: string; path: string[]; rate: number }> = [
      { unit: body.fromUnit, path: [body.fromUnit], rate: 1 },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { unit, path, rate } = queue.shift()!;

      if (unit === body.toUnit) {
        return HttpResponse.json(
          wrapResponse({
            fromUnit: body.fromUnit,
            toUnit: body.toUnit,
            path,
            totalRate: rate,
            steps: path.length - 1,
            found: true,
          })
        );
      }

      if (visited.has(unit)) continue;
      visited.add(unit);

      const neighbors = graph.get(unit) || [];
      for (const { toUnit, rate: edgeRate } of neighbors) {
        if (!visited.has(toUnit)) {
          queue.push({
            unit: toUnit,
            path: [...path, toUnit],
            rate: rate * edgeRate,
          });
        }
      }
    }

    return HttpResponse.json(
      wrapResponse({
        fromUnit: body.fromUnit,
        toUnit: body.toUnit,
        path: [],
        totalRate: 0,
        steps: 0,
        found: false,
        message: `找不到从 '${body.fromUnit}' 到 '${body.toUnit}' 的换算路径`,
      })
    );
  }),
];
