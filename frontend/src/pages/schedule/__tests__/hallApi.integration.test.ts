/**
 * Hall API Integration Test
 *
 * 验证调用新后端 API 时 Hall 类型字段与期望一致
 * 覆盖：门店列表、按门店查询影厅列表、字段结构验证
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scheduleService, type Store } from '../services/scheduleService';
import type { Hall } from '../types/schedule.types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Hall API Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStoreList', () => {
    it('should return stores with correct field structure', async () => {
      // Given
      const mockStores: Store[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          code: 'STORE-A',
          name: '上海门店',
          region: '上海',
          status: 'ACTIVE',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          code: 'STORE-B',
          name: '北京门店',
          region: '北京',
          status: 'DISABLED',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockStores, total: 2 }),
      });

      // When
      const response = await scheduleService.getStoreList();

      // Then
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);

      // 验证字段结构
      const store = response.data[0];
      expect(store).toHaveProperty('id');
      expect(store).toHaveProperty('code');
      expect(store).toHaveProperty('name');
      expect(store).toHaveProperty('region');
      expect(store).toHaveProperty('status');
      expect(store).toHaveProperty('createdAt');
      expect(store).toHaveProperty('updatedAt');
    });

    it('should filter stores by status', async () => {
      // Given
      const mockActiveStores: Store[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          code: 'STORE-A',
          name: '活动门店',
          status: 'ACTIVE',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockActiveStores, total: 1 }),
      });

      // When
      const response = await scheduleService.getStoreList({ status: 'ACTIVE' });

      // Then
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(1);
      expect(response.data[0].status).toBe('ACTIVE');

      // 验证 API 调用包含状态参数
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('status=ACTIVE'));
    });
  });

  describe('getHallsByStore', () => {
    const storeId = '550e8400-e29b-41d4-a716-446655440001';

    it('should return halls with correct field structure matching frontend Hall type', async () => {
      // Given
      const mockHalls: Hall[] = [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          name: 'VIP影厅A',
          capacity: 120,
          type: 'VIP',
          tags: ['真皮沙发', 'KTV设备'],
          status: 'active',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: '660e8400-e29b-41d4-a716-446655440002',
          name: '公众厅B',
          capacity: 200,
          type: 'Public',
          tags: [],
          status: 'active',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockHalls, total: 2 }),
      });

      // When
      const response = await scheduleService.getHallsByStore(storeId);

      // Then
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);

      // 验证字段结构与前端 Hall 类型一致
      const hall = response.data[0];
      expect(hall).toHaveProperty('id');
      expect(hall).toHaveProperty('name');
      expect(hall).toHaveProperty('capacity');
      expect(hall).toHaveProperty('type');
      expect(hall).toHaveProperty('tags');
      expect(hall).toHaveProperty('status');
      expect(hall).toHaveProperty('createdAt');
      expect(hall).toHaveProperty('updatedAt');

      // 验证具体值
      expect(hall.id).toBe('660e8400-e29b-41d4-a716-446655440001');
      expect(hall.name).toBe('VIP影厅A');
      expect(hall.capacity).toBe(120);
      expect(hall.type).toBe('VIP');
      expect(hall.tags).toEqual(['真皮沙发', 'KTV设备']);
      expect(hall.status).toBe('active');
    });

    it('should call correct API endpoint with storeId', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      // When
      await scheduleService.getHallsByStore(storeId);

      // Then
      expect(mockFetch).toHaveBeenCalledWith(`/api/stores/${storeId}/halls`);
    });

    it('should filter halls by status', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      // When
      await scheduleService.getHallsByStore(storeId, { status: 'active' });

      // Then
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('status=ACTIVE'));
    });

    it('should filter halls by type', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      // When
      await scheduleService.getHallsByStore(storeId, { type: 'VIP' });

      // Then
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('type=VIP'));
    });

    it('should return empty array when store has no halls', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      });

      // When
      const response = await scheduleService.getHallsByStore(storeId);

      // Then
      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
    });

    it('should handle API error gracefully', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '门店不存在' }),
      });

      // When & Then
      await expect(scheduleService.getHallsByStore(storeId)).rejects.toThrow('门店不存在');
    });
  });

  describe('getStoreDetail', () => {
    const storeId = '550e8400-e29b-41d4-a716-446655440001';

    it('should return store detail with correct field structure', async () => {
      // Given
      const mockStore: Store = {
        id: storeId,
        code: 'STORE-A',
        name: '测试门店',
        region: '上海',
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockStore }),
      });

      // When
      const response = await scheduleService.getStoreDetail(storeId);

      // Then
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(storeId);
      expect(response.data.code).toBe('STORE-A');
      expect(response.data.name).toBe('测试门店');
    });

    it('should handle 404 when store not found', async () => {
      // Given
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '门店不存在' }),
      });

      // When & Then
      await expect(scheduleService.getStoreDetail(storeId)).rejects.toThrow('门店不存在');
    });
  });

  describe('Hall type compatibility', () => {
    it('should support all HallType values from frontend type definition', async () => {
      // Given
      const mockHalls: Hall[] = [
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockHalls, total: 4 }),
      });

      // When
      const response = await scheduleService.getHallsByStore('store-1');

      // Then
      const types = response.data.map((h) => h.type);
      expect(types).toContain('VIP');
      expect(types).toContain('Public');
      expect(types).toContain('CP');
      expect(types).toContain('Party');
    });

    it('should support all HallStatus values from frontend type definition', async () => {
      // Given
      const mockHalls: Hall[] = [
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockHalls, total: 3 }),
      });

      // When
      const response = await scheduleService.getHallsByStore('store-1');

      // Then
      const statuses = response.data.map((h) => h.status);
      expect(statuses).toContain('active');
      expect(statuses).toContain('inactive');
      expect(statuses).toContain('maintenance');
    });
  });
});
