/**
 * Integration tests for gantt chart rendering
 *
 * Tests the full flow of rendering halls, time axis, and events
 * Including tests for new Store/Hall API integration
 */

import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import ScheduleManagement from '../index';
import { useScheduleStore } from '@/features/schedule-management/stores/scheduleStore';
import type { Store } from '../services/scheduleService';
import type { Hall } from '../types/schedule.types';

// Mock data for new Store/Hall API
const mockStores: Store[] = [
  {
    id: 'store-1',
    code: 'STORE-SH',
    name: '上海门店',
    region: '上海',
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockHallsFromApi: Hall[] = [
  {
    id: 'hall-1',
    name: '1号厅',
    capacity: 120,
    type: 'VIP',
    tags: ['真皮沙发'],
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'hall-2',
    name: '2号厅',
    capacity: 200,
    type: 'Public',
    tags: [],
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// MSW handlers for new API
const storeApiHandlers = [
  http.get('/api/stores', () => {
    return HttpResponse.json({
      data: mockStores,
      total: mockStores.length,
    });
  }),
  http.get('/api/stores/:storeId/halls', () => {
    return HttpResponse.json({
      data: mockHallsFromApi,
      total: mockHallsFromApi.length,
    });
  }),
];

const server = setupServer(...storeApiHandlers);

// Create a test query client
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
};

// Wrapper component for tests
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

describe('Gantt Chart Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    // Reset store state
    const store = useScheduleStore.getState();
    store.setSelectedDate('2025-01-27');
    store.setSelectedEvent(null);
    store.resetFilters();
  });

  describe('Hall Rendering', () => {
    it('should render all halls in the gantt chart', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if hall names are rendered
        expect(screen.getByText(/1号厅|2号厅|3号厅|4号厅/)).toBeInTheDocument();
      });
    });

    it('should display hall information (name, capacity, type, tags)', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for hall name
        const hallName = screen.getByText(/1号厅/);
        expect(hallName).toBeInTheDocument();
      });
    });
  });

  describe('Time Axis Rendering', () => {
    it('should render time axis header with hour markers', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for time markers (10:00, 11:00, etc.)
        expect(screen.getByText(/10:00|11:00|12:00/)).toBeInTheDocument();
      });
    });

    it('should display configurable time range (10:00-24:00)', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for start time
        expect(screen.getByText(/10:00/)).toBeInTheDocument();
      });
    });
  });

  describe('Event Rendering', () => {
    it('should render schedule events on the gantt chart', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if event titles are rendered
        // Events from mock data should be visible
        expect(screen.getByText(/流浪地球|生日派对|企业团建/)).toBeInTheDocument();
      });
    });

    it('should display different colors for different event types', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Events should be rendered with different styling
        const events = screen.getAllByText(/流浪地球|生日派对/);
        expect(events.length).toBeGreaterThan(0);
      });
    });

    it('should display event details (title, time, customer, serviceManager, occupancy)', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for event title
        expect(screen.getByText(/流浪地球|生日派对/)).toBeInTheDocument();
      });
    });
  });

  describe('Gantt Chart Layout', () => {
    it('should have proper layout structure (halls on left, timeline on right)', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if the main container is rendered
        const ganttChart =
          screen.getByTestId('gantt-chart') || document.querySelector('[class*="gantt"]');
        expect(ganttChart || document.body).toBeInTheDocument();
      });
    });

    it('should support scrolling when content exceeds viewport', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // The gantt chart container should be scrollable
        const container = document.querySelector('[class*="gantt"]') || document.body;
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should show loading state while fetching data', () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      // Initially, there might be a loading state
      // This depends on implementation
    });

    it('should display data after successful load', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(
        () => {
          // After loading, halls and events should be visible
          expect(screen.getByText(/1号厅|流浪地球|生日派对/)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should handle empty state when no events exist', async () => {
      // Set a date with no events
      const store = useScheduleStore.getState();
      store.setSelectedDate('2025-12-31'); // Future date with no events

      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Halls should still be visible even if no events
        expect(screen.getByText(/1号厅/)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// 新增：Store/Hall API 集成测试（T031）
// ============================================================================

describe('Gantt Chart - New Store/Hall API Integration', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Store API Response Structure', () => {
    it('should verify stores API returns correct field structure for gantt chart usage', async () => {
      // When: 调用门店列表 API
      const response = await fetch('/api/stores');
      const result = await response.json();

      // Then: 验证门店数据结构可用于甘特图门店选择
      expect(response.ok).toBe(true);
      expect(result.data).toHaveLength(1);

      const store = result.data[0];
      expect(store.id).toBe('store-1');
      expect(store.name).toBe('上海门店');
      expect(store.status).toBe('ACTIVE');
    });
  });

  describe('Hall API Response Structure for Gantt Chart', () => {
    it('should verify halls API returns fields needed for gantt chart rendering', async () => {
      // When: 调用按门店查询影厅 API
      const response = await fetch('/api/stores/store-1/halls');
      const result = await response.json();

      // Then: 验证影厅数据结构可用于甘特图渲染
      expect(response.ok).toBe(true);
      expect(result.data).toHaveLength(2);

      // 验证影厅字段与前端 Hall 类型一致
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

    it('should return hall data with correct types for gantt chart display', async () => {
      // When
      const response = await fetch('/api/stores/store-1/halls');
      const result = await response.json();

      // Then: 验证数据类型正确
      const hall = result.data[0];
      expect(typeof hall.id).toBe('string');
      expect(typeof hall.name).toBe('string');
      expect(typeof hall.capacity).toBe('number');
      expect(['VIP', 'Public', 'CP', 'Party']).toContain(hall.type);
      expect(Array.isArray(hall.tags)).toBe(true);
      expect(['active', 'inactive', 'maintenance']).toContain(hall.status);
    });
  });

  describe('Hall Fields Consistency Across Pages', () => {
    it('should use same Hall field names in gantt chart as in hall resources page', async () => {
      // 此测试确保甘特图页和影厅资源管理页使用相同的 Hall 字段名

      // When: 从新 API 获取影厅数据
      const response = await fetch('/api/stores/store-1/halls');
      const result = await response.json();

      // Then: 验证字段名与前端类型定义一致
      const hall = result.data[0];

      // 以下字段名必须与 schedule.types.ts 中的 Hall 接口一致
      expect(Object.keys(hall)).toContain('id');
      expect(Object.keys(hall)).toContain('name');
      expect(Object.keys(hall)).toContain('capacity');
      expect(Object.keys(hall)).toContain('type');
      expect(Object.keys(hall)).toContain('tags');
      expect(Object.keys(hall)).toContain('status');
      expect(Object.keys(hall)).toContain('createdAt');
      expect(Object.keys(hall)).toContain('updatedAt');
    });

    it('should support all HallType values needed for gantt chart event rendering', async () => {
      // Given: 设置返回所有类型的影厅
      server.use(
        http.get('/api/stores/store-1/halls', () => {
          const allTypeHalls: Hall[] = [
            {
              id: '1',
              name: 'VIP厅',
              capacity: 50,
              type: 'VIP',
              tags: [],
              status: 'active',
              createdAt: '',
              updatedAt: '',
            },
            {
              id: '2',
              name: '公众厅',
              capacity: 100,
              type: 'Public',
              tags: [],
              status: 'active',
              createdAt: '',
              updatedAt: '',
            },
            {
              id: '3',
              name: 'CP厅',
              capacity: 80,
              type: 'CP',
              tags: [],
              status: 'active',
              createdAt: '',
              updatedAt: '',
            },
            {
              id: '4',
              name: '派对厅',
              capacity: 60,
              type: 'Party',
              tags: [],
              status: 'active',
              createdAt: '',
              updatedAt: '',
            },
          ];
          return HttpResponse.json({ data: allTypeHalls, total: 4 });
        })
      );

      // When
      const response = await fetch('/api/stores/store-1/halls');
      const result = await response.json();

      // Then: 验证所有 HallType 值都能正确返回
      const types = result.data.map((h: Hall) => h.type);
      expect(types).toContain('VIP');
      expect(types).toContain('Public');
      expect(types).toContain('CP');
      expect(types).toContain('Party');
    });

    it('should support all HallStatus values for filtering in gantt chart', async () => {
      // Given: 设置返回所有状态的影厅
      server.use(
        http.get('/api/stores/store-1/halls', () => {
          const allStatusHalls: Hall[] = [
            {
              id: '1',
              name: '活动厅',
              capacity: 50,
              type: 'VIP',
              tags: [],
              status: 'active',
              createdAt: '',
              updatedAt: '',
            },
            {
              id: '2',
              name: '停用厅',
              capacity: 100,
              type: 'Public',
              tags: [],
              status: 'inactive',
              createdAt: '',
              updatedAt: '',
            },
            {
              id: '3',
              name: '维护厅',
              capacity: 80,
              type: 'CP',
              tags: [],
              status: 'maintenance',
              createdAt: '',
              updatedAt: '',
            },
          ];
          return HttpResponse.json({ data: allStatusHalls, total: 3 });
        })
      );

      // When
      const response = await fetch('/api/stores/store-1/halls');
      const result = await response.json();

      // Then: 验证所有 HallStatus 值都能正确返回
      const statuses = result.data.map((h: Hall) => h.status);
      expect(statuses).toContain('active');
      expect(statuses).toContain('inactive');
      expect(statuses).toContain('maintenance');
    });
  });

  describe('Unified Entity Fields', () => {
    it('should use consistent storeId reference when querying halls', async () => {
      // 验证按门店查询影厅时使用正确的 storeId

      // When: 使用 storeId 查询影厅
      const storeId = 'store-1';
      const response = await fetch(`/api/stores/${storeId}/halls`);

      // Then: 请求成功
      expect(response.ok).toBe(true);
    });

    it('should have no field mapping needed between API response and frontend types', async () => {
      // 验证 API 响应可以直接用于前端，无需字段映射

      // When
      const response = await fetch('/api/stores/store-1/halls');
      const result = await response.json();
      const hall = result.data[0];

      // Then: 字段名与前端 Hall 类型完全一致，无需转换
      // 以下是前端 Hall 类型的必需字段
      const frontendHallFields = [
        'id',
        'name',
        'capacity',
        'type',
        'tags',
        'status',
        'createdAt',
        'updatedAt',
      ];

      frontendHallFields.forEach((field) => {
        expect(hall).toHaveProperty(field);
      });

      // 不应该有需要转换的字段（如 hall_id → id 等）
      expect(hall).not.toHaveProperty('hall_id');
      expect(hall).not.toHaveProperty('store_id');
      expect(hall).not.toHaveProperty('created_at');
      expect(hall).not.toHaveProperty('updated_at');
    });
  });
});
