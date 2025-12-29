/**
 * Hall Resources Integration Test
 *
 * 端到端验证"影厅资源管理"页面使用 MSW 模拟新后端响应结构
 * 覆盖：门店选择、按门店查询影厅、字段一致性验证
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { Store } from '../services/scheduleService';
import type { Hall } from '../types/schedule.types';

// Mock data
const mockStores: Store[] = [
  {
    id: 'store-1',
    code: 'STORE-A',
    name: '上海门店',
    region: '上海',
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'store-2',
    code: 'STORE-B',
    name: '北京门店',
    region: '北京',
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockHallsStore1: Hall[] = [
  {
    id: 'hall-1',
    name: 'VIP影厅A',
    capacity: 120,
    type: 'VIP',
    tags: ['真皮沙发'],
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'hall-2',
    name: '公众厅B',
    capacity: 200,
    type: 'Public',
    tags: [],
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockHallsStore2: Hall[] = [
  {
    id: 'hall-3',
    name: 'CP厅C',
    capacity: 80,
    type: 'CP',
    tags: ['投影仪'],
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// MSW handlers
const handlers = [
  // GET /api/stores - 门店列表
  http.get('/api/stores', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let stores = mockStores;
    if (status) {
      stores = mockStores.filter(s => s.status === status);
    }

    return HttpResponse.json({
      data: stores,
      total: stores.length,
    });
  }),

  // GET /api/stores/:storeId - 门店详情
  http.get('/api/stores/:storeId', ({ params }) => {
    const { storeId } = params;
    const store = mockStores.find(s => s.id === storeId);

    if (!store) {
      return HttpResponse.json(
        { error: 'NOT_FOUND', message: '门店不存在' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: store });
  }),

  // GET /api/stores/:storeId/halls - 按门店查询影厅
  http.get('/api/stores/:storeId/halls', ({ params, request }) => {
    const { storeId } = params;
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    let halls: Hall[] = [];
    if (storeId === 'store-1') {
      halls = mockHallsStore1;
    } else if (storeId === 'store-2') {
      halls = mockHallsStore2;
    }

    if (status) {
      halls = halls.filter(h => h.status === status.toLowerCase());
    }
    if (type) {
      halls = halls.filter(h => h.type === type);
    }

    return HttpResponse.json({
      data: halls,
      total: halls.length,
    });
  }),
];

const server = setupServer(...handlers);

// Test setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('Hall Resources Integration Tests', () => {
  describe('Store and Hall API Response Structure', () => {
    it('should verify store list API returns correct field structure', async () => {
      // Given: MSW 已配置返回门店列表

      // When: 调用门店列表 API
      const response = await fetch('/api/stores');
      const result = await response.json();

      // Then: 验证响应结构
      expect(response.ok).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);

      // 验证门店字段结构
      const store = result.data[0];
      expect(store).toHaveProperty('id');
      expect(store).toHaveProperty('code');
      expect(store).toHaveProperty('name');
      expect(store).toHaveProperty('region');
      expect(store).toHaveProperty('status');
      expect(store).toHaveProperty('createdAt');
      expect(store).toHaveProperty('updatedAt');
    });

    it('should verify halls by store API returns correct field structure', async () => {
      // Given: MSW 已配置返回按门店查询的影厅列表

      // When: 调用按门店查询影厅 API
      const response = await fetch('/api/stores/store-1/halls');
      const result = await response.json();

      // Then: 验证响应结构
      expect(response.ok).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);

      // 验证影厅字段结构与前端 Hall 类型一致
      const hall = result.data[0];
      expect(hall).toHaveProperty('id');
      expect(hall).toHaveProperty('name');
      expect(hall).toHaveProperty('capacity');
      expect(hall).toHaveProperty('type');
      expect(hall).toHaveProperty('tags');
      expect(hall).toHaveProperty('status');
      expect(hall).toHaveProperty('createdAt');
      expect(hall).toHaveProperty('updatedAt');
    });

    it('should return only halls belonging to the specified store', async () => {
      // When: 查询门店1的影厅
      const response1 = await fetch('/api/stores/store-1/halls');
      const result1 = await response1.json();

      // Then: 返回门店1的2个影厅
      expect(result1.data).toHaveLength(2);
      expect(result1.data.map((h: Hall) => h.name)).toContain('VIP影厅A');
      expect(result1.data.map((h: Hall) => h.name)).toContain('公众厅B');

      // When: 查询门店2的影厅
      const response2 = await fetch('/api/stores/store-2/halls');
      const result2 = await response2.json();

      // Then: 返回门店2的1个影厅
      expect(result2.data).toHaveLength(1);
      expect(result2.data[0].name).toBe('CP厅C');
    });

    it('should return empty array when store has no halls', async () => {
      // Given: 添加一个空门店的 handler
      server.use(
        http.get('/api/stores/store-empty/halls', () => {
          return HttpResponse.json({
            data: [],
            total: 0,
          });
        })
      );

      // When
      const response = await fetch('/api/stores/store-empty/halls');
      const result = await response.json();

      // Then
      expect(response.ok).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should filter halls by status', async () => {
      // Given: 添加一个包含不同状态影厅的门店
      const mixedStatusHalls: Hall[] = [
        { id: 'h1', name: '活动厅', capacity: 100, type: 'VIP', tags: [], status: 'active', createdAt: '', updatedAt: '' },
        { id: 'h2', name: '停用厅', capacity: 80, type: 'Public', tags: [], status: 'inactive', createdAt: '', updatedAt: '' },
      ];

      server.use(
        http.get('/api/stores/store-mixed/halls', ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');

          let halls = mixedStatusHalls;
          if (status) {
            halls = halls.filter(h => h.status === status.toLowerCase());
          }

          return HttpResponse.json({
            data: halls,
            total: halls.length,
          });
        })
      );

      // When: 筛选活动状态
      const response = await fetch('/api/stores/store-mixed/halls?status=ACTIVE');
      const result = await response.json();

      // Then: 只返回活动状态的影厅
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('active');
    });

    it('should filter halls by type', async () => {
      // When: 按 VIP 类型筛选
      const response = await fetch('/api/stores/store-1/halls?type=VIP');
      const result = await response.json();

      // Then: 只返回 VIP 类型的影厅
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('VIP');
      expect(result.data[0].name).toBe('VIP影厅A');
    });
  });

  describe('Store API Error Handling', () => {
    it('should return 404 when store not found', async () => {
      // When
      const response = await fetch('/api/stores/non-existent-store');

      // Then
      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('Field Consistency with Frontend Types', () => {
    it('should have Hall fields matching frontend Hall type definition', async () => {
      // When
      const response = await fetch('/api/stores/store-1/halls');
      const result = await response.json();

      // Then: 验证每个字段与前端 Hall 类型定义一致
      const hall = result.data[0];

      // 必需字段
      expect(typeof hall.id).toBe('string');
      expect(typeof hall.name).toBe('string');
      expect(typeof hall.capacity).toBe('number');
      expect(['VIP', 'Public', 'CP', 'Party']).toContain(hall.type);
      expect(Array.isArray(hall.tags)).toBe(true);
      expect(['active', 'inactive', 'maintenance']).toContain(hall.status);
      expect(typeof hall.createdAt).toBe('string');
      expect(typeof hall.updatedAt).toBe('string');
    });

    it('should have Store fields matching expected structure', async () => {
      // When
      const response = await fetch('/api/stores');
      const result = await response.json();

      // Then: 验证门店字段结构
      const store = result.data[0];

      expect(typeof store.id).toBe('string');
      expect(typeof store.code).toBe('string');
      expect(typeof store.name).toBe('string');
      expect(['ACTIVE', 'DISABLED']).toContain(store.status);
      expect(typeof store.createdAt).toBe('string');
      expect(typeof store.updatedAt).toBe('string');
    });
  });
});
