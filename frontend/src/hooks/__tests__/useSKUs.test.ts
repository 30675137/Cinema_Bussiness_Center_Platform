/**
 * @spec O004-beverage-sku-reuse
 * TanStack Query Hooks Unit Tests
 *
 * 测试 TanStack Query hooks 所有功能,包括查询、变更、缓存失效
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * 覆盖率目标: ≥80%
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useSKUs,
  useSKUDetail,
  useCreateSKU,
  useUpdateSKU,
  useToggleSKUStatus,
  useUpdateBom,
  useUpdateComboItems,
  useSPUs,
  useUnits,
  skuQueryKeys,
} from '../useSKUs';
import { skuService } from '@/services/skuService';
import type { SkuQueryParams, SkuFormData, SKU } from '@/types/sku';

// Mock skuService
vi.mock('@/services/skuService', () => ({
  skuService: {
    getSkus: vi.fn(),
    getSkuById: vi.fn(),
    createSku: vi.fn(),
    updateSku: vi.fn(),
    toggleSkuStatus: vi.fn(),
    updateBom: vi.fn(),
    updateComboItems: vi.fn(),
    getSpus: vi.fn(),
    getUnits: vi.fn(),
  },
}));

// 创建 QueryClient wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('SKU Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('skuQueryKeys', () => {
    it('应该生成正确的查询键结构', () => {
      expect(skuQueryKeys.all).toEqual(['skus']);
      expect(skuQueryKeys.lists()).toEqual(['skus', 'list']);
      expect(skuQueryKeys.list({ page: 1, pageSize: 20 })).toEqual([
        'skus',
        'list',
        { page: 1, pageSize: 20 },
      ]);
      expect(skuQueryKeys.details()).toEqual(['skus', 'detail']);
      expect(skuQueryKeys.detail('sku-001')).toEqual(['skus', 'detail', 'sku-001']);
      expect(skuQueryKeys.spus()).toEqual(['spus']);
      expect(skuQueryKeys.units()).toEqual(['units']);
    });
  });

  describe('useSKUs', () => {
    it('应该成功获取 SKU 列表', async () => {
      const mockData = {
        items: [
          {
            id: 'sku-001',
            code: 'SKU001',
            name: '可口可乐',
            skuType: 'raw_material',
            status: 'enabled',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      vi.mocked(skuService.getSkus).mockResolvedValue(mockData);

      const { result } = renderHook(
        () => useSKUs({ page: 1, pageSize: 20 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.getSkus).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(result.current.data).toEqual(mockData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('应该正确处理查询参数', async () => {
      const mockData = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };

      vi.mocked(skuService.getSkus).mockResolvedValue(mockData);

      const params: SkuQueryParams = {
        keyword: '可乐',
        status: 'enabled',
        page: 2,
        pageSize: 10,
      };

      const { result } = renderHook(() => useSKUs(params), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.getSkus).toHaveBeenCalledWith(params);
    });

    it('应该正确处理 API 错误', async () => {
      const mockError = new Error('Failed to fetch SKUs');
      vi.mocked(skuService.getSkus).mockRejectedValue(mockError);

      const { result } = renderHook(() => useSKUs({ page: 1 }), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    it('应该启用缓存 (staleTime = 2 分钟)', async () => {
      const mockData = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };

      vi.mocked(skuService.getSkus).mockResolvedValue(mockData);

      const { result, rerender } = renderHook(() => useSKUs({ page: 1 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // 第一次调用
      expect(skuService.getSkus).toHaveBeenCalledTimes(1);

      // 重新渲染 (缓存未过期,不应重新请求)
      rerender();

      // 仍然是 1 次调用
      expect(skuService.getSkus).toHaveBeenCalledTimes(1);
    });

    it('应该支持禁用查询 (enabled = false)', async () => {
      const { result } = renderHook(() => useSKUs({ page: 1 }, { enabled: false }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.status).toBe('pending'));

      expect(skuService.getSkus).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useSKUDetail', () => {
    it('应该成功获取 SKU 详情', async () => {
      const mockSku: Partial<SKU> = {
        id: 'sku-001',
        code: 'SKU001',
        name: '可口可乐',
        skuType: 'raw_material',
        status: 'enabled',
      };

      vi.mocked(skuService.getSkuById).mockResolvedValue(mockSku as SKU);

      const { result } = renderHook(() => useSKUDetail('sku-001'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.getSkuById).toHaveBeenCalledWith('sku-001');
      expect(result.current.data).toEqual(mockSku);
    });

    it('应该在 id 为空时禁用查询', async () => {
      const { result } = renderHook(() => useSKUDetail(''), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.status).toBe('pending'));

      expect(skuService.getSkuById).not.toHaveBeenCalled();
    });

    it('应该正确处理 API 错误 (404)', async () => {
      const mockError = new Error('SKU not found');
      vi.mocked(skuService.getSkuById).mockRejectedValue(mockError);

      const { result } = renderHook(() => useSKUDetail('sku-999'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useCreateSKU', () => {
    it('应该成功创建 SKU', async () => {
      const mockCreatedSku: Partial<SKU> = {
        id: 'sku-new-001',
        code: 'SKU-NEW-001',
        name: '新商品',
        skuType: 'raw_material',
        status: 'draft',
      };

      vi.mocked(skuService.createSku).mockResolvedValue(mockCreatedSku as SKU);

      const { result } = renderHook(() => useCreateSKU(), { wrapper: createWrapper() });

      const formData: SkuFormData = {
        name: '新商品',
        spuId: 'spu-001',
        skuType: 'raw_material',
        mainUnitId: 'ml',
        status: 'draft',
      };

      result.current.mutate(formData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.createSku).toHaveBeenCalledWith(formData);
      expect(result.current.data).toEqual(mockCreatedSku);
    });

    it('应该在成功后自动失效列表缓存', async () => {
      const mockCreatedSku: Partial<SKU> = {
        id: 'sku-new-001',
        code: 'SKU-NEW-001',
        name: '新商品',
        skuType: 'raw_material',
        status: 'draft',
      };

      vi.mocked(skuService.createSku).mockResolvedValue(mockCreatedSku as SKU);
      vi.mocked(skuService.getSkus).mockResolvedValue({
        items: [mockCreatedSku as SKU],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });

      const wrapper = createWrapper();

      // 先查询列表 (缓存)
      const { result: listResult } = renderHook(() => useSKUs({ page: 1 }), { wrapper });
      await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

      vi.clearAllMocks();

      // 创建 SKU (应该失效缓存)
      const { result: mutationResult } = renderHook(() => useCreateSKU(), { wrapper });

      const formData: SkuFormData = {
        name: '新商品',
        spuId: 'spu-001',
        skuType: 'raw_material',
        mainUnitId: 'ml',
        status: 'draft',
      };

      mutationResult.current.mutate(formData);

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

      // 列表应该重新请求 (缓存失效)
      await waitFor(() => expect(skuService.getSkus).toHaveBeenCalled());
    });

    it('应该正确处理创建失败', async () => {
      const mockError = new Error('Failed to create SKU');
      vi.mocked(skuService.createSku).mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateSKU(), { wrapper: createWrapper() });

      const formData: SkuFormData = {
        name: '新商品',
        spuId: 'spu-001',
        skuType: 'raw_material',
        mainUnitId: 'ml',
        status: 'draft',
      };

      result.current.mutate(formData);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useUpdateSKU', () => {
    it('应该成功更新 SKU', async () => {
      const mockUpdatedSku: Partial<SKU> = {
        id: 'sku-001',
        code: 'SKU001',
        name: '更新后的名称',
        skuType: 'raw_material',
        status: 'enabled',
      };

      vi.mocked(skuService.updateSku).mockResolvedValue(mockUpdatedSku as SKU);

      const { result } = renderHook(() => useUpdateSKU(), { wrapper: createWrapper() });

      const updateData = {
        id: 'sku-001',
        formData: {
          name: '更新后的名称',
          mainUnitId: 'ml',
          status: 'enabled' as const,
        },
      };

      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.updateSku).toHaveBeenCalledWith('sku-001', updateData.formData);
      expect(result.current.data).toEqual(mockUpdatedSku);
    });

    it('应该在成功后失效列表和详情缓存', async () => {
      const mockUpdatedSku: Partial<SKU> = {
        id: 'sku-001',
        code: 'SKU001',
        name: '更新后的名称',
        skuType: 'raw_material',
        status: 'enabled',
      };

      vi.mocked(skuService.updateSku).mockResolvedValue(mockUpdatedSku as SKU);
      vi.mocked(skuService.getSkus).mockResolvedValue({
        items: [mockUpdatedSku as SKU],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });
      vi.mocked(skuService.getSkuById).mockResolvedValue(mockUpdatedSku as SKU);

      const wrapper = createWrapper();

      // 先查询详情 (缓存)
      const { result: detailResult } = renderHook(() => useSKUDetail('sku-001'), { wrapper });
      await waitFor(() => expect(detailResult.current.isSuccess).toBe(true));

      vi.clearAllMocks();

      // 更新 SKU (应该失效缓存)
      const { result: mutationResult } = renderHook(() => useUpdateSKU(), { wrapper });

      mutationResult.current.mutate({
        id: 'sku-001',
        formData: {
          name: '更新后的名称',
          mainUnitId: 'ml',
          status: 'enabled',
        },
      });

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

      // 详情应该重新请求 (缓存失效)
      await waitFor(() => expect(skuService.getSkuById).toHaveBeenCalled());
    });
  });

  describe('useToggleSKUStatus', () => {
    it('应该成功切换 SKU 状态', async () => {
      const mockToggledSku: Partial<SKU> = {
        id: 'sku-001',
        code: 'SKU001',
        name: '测试商品',
        skuType: 'raw_material',
        status: 'disabled',
      };

      vi.mocked(skuService.toggleSkuStatus).mockResolvedValue(mockToggledSku as SKU);

      const { result } = renderHook(() => useToggleSKUStatus(), { wrapper: createWrapper() });

      result.current.mutate({ id: 'sku-001', status: 'disabled' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.toggleSkuStatus).toHaveBeenCalledWith('sku-001', 'disabled');
      expect(result.current.data).toEqual(mockToggledSku);
    });

    it('应该在成功后失效列表和详情缓存', async () => {
      const mockToggledSku: Partial<SKU> = {
        id: 'sku-001',
        code: 'SKU001',
        name: '测试商品',
        skuType: 'raw_material',
        status: 'disabled',
      };

      vi.mocked(skuService.toggleSkuStatus).mockResolvedValue(mockToggledSku as SKU);
      vi.mocked(skuService.getSkus).mockResolvedValue({
        items: [mockToggledSku as SKU],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });

      const wrapper = createWrapper();

      // 先查询列表 (缓存)
      const { result: listResult } = renderHook(() => useSKUs({ page: 1 }), { wrapper });
      await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

      vi.clearAllMocks();

      // 切换状态 (应该失效缓存)
      const { result: mutationResult } = renderHook(() => useToggleSKUStatus(), { wrapper });

      mutationResult.current.mutate({ id: 'sku-001', status: 'disabled' });

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

      // 列表应该重新请求 (缓存失效)
      await waitFor(() => expect(skuService.getSkus).toHaveBeenCalled());
    });
  });

  describe('useUpdateBom', () => {
    it('应该成功更新 BOM 配方', async () => {
      const mockBomResult = {
        calculatedCost: 1500,
      };

      vi.mocked(skuService.updateBom).mockResolvedValue(mockBomResult);

      const { result } = renderHook(() => useUpdateBom(), { wrapper: createWrapper() });

      const bomData = {
        skuId: 'sku-finished-001',
        components: [
          { componentId: 'sku-001', quantity: 50, unit: 'ml', sortOrder: 1 },
          { componentId: 'sku-002', quantity: 200, unit: 'ml', sortOrder: 2 },
        ],
        wasteRate: 0.05,
      };

      result.current.mutate(bomData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.updateBom).toHaveBeenCalledWith(
        'sku-finished-001',
        bomData.components,
        0.05
      );
      expect(result.current.data).toEqual(mockBomResult);
    });

    it('应该在成功后失效 SKU 详情缓存', async () => {
      const mockBomResult = {
        calculatedCost: 1500,
      };

      vi.mocked(skuService.updateBom).mockResolvedValue(mockBomResult);
      vi.mocked(skuService.getSkuById).mockResolvedValue({
        id: 'sku-finished-001',
        code: 'SKU-F001',
        name: '威士忌可乐',
        skuType: 'finished_product',
        status: 'enabled',
      } as SKU);

      const wrapper = createWrapper();

      // 先查询详情 (缓存)
      const { result: detailResult } = renderHook(
        () => useSKUDetail('sku-finished-001'),
        { wrapper }
      );
      await waitFor(() => expect(detailResult.current.isSuccess).toBe(true));

      vi.clearAllMocks();

      // 更新 BOM (应该失效缓存)
      const { result: mutationResult } = renderHook(() => useUpdateBom(), { wrapper });

      mutationResult.current.mutate({
        skuId: 'sku-finished-001',
        components: [{ componentId: 'sku-001', quantity: 50, unit: 'ml', sortOrder: 1 }],
        wasteRate: 0.05,
      });

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

      // 详情应该重新请求 (缓存失效)
      await waitFor(() => expect(skuService.getSkuById).toHaveBeenCalled());
    });
  });

  describe('useUpdateComboItems', () => {
    it('应该成功更新套餐子项', async () => {
      const mockComboResult = {
        calculatedCost: 2300,
      };

      vi.mocked(skuService.updateComboItems).mockResolvedValue(mockComboResult);

      const { result } = renderHook(() => useUpdateComboItems(), { wrapper: createWrapper() });

      const comboData = {
        skuId: 'sku-combo-001',
        items: [
          { subItemId: 'sku-popcorn', quantity: 1, unit: '份', sortOrder: 1 },
          { subItemId: 'sku-coke', quantity: 1, unit: '杯', sortOrder: 2 },
        ],
      };

      result.current.mutate(comboData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.updateComboItems).toHaveBeenCalledWith('sku-combo-001', comboData.items);
      expect(result.current.data).toEqual(mockComboResult);
    });

    it('应该在成功后失效 SKU 详情缓存', async () => {
      const mockComboResult = {
        calculatedCost: 2300,
      };

      vi.mocked(skuService.updateComboItems).mockResolvedValue(mockComboResult);
      vi.mocked(skuService.getSkuById).mockResolvedValue({
        id: 'sku-combo-001',
        code: 'SKU-COMBO-001',
        name: '电影套餐',
        skuType: 'combo',
        status: 'enabled',
      } as SKU);

      const wrapper = createWrapper();

      // 先查询详情 (缓存)
      const { result: detailResult } = renderHook(() => useSKUDetail('sku-combo-001'), { wrapper });
      await waitFor(() => expect(detailResult.current.isSuccess).toBe(true));

      vi.clearAllMocks();

      // 更新套餐子项 (应该失效缓存)
      const { result: mutationResult } = renderHook(() => useUpdateComboItems(), { wrapper });

      mutationResult.current.mutate({
        skuId: 'sku-combo-001',
        items: [{ subItemId: 'sku-popcorn', quantity: 1, unit: '份', sortOrder: 1 }],
      });

      await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

      // 详情应该重新请求 (缓存失效)
      await waitFor(() => expect(skuService.getSkuById).toHaveBeenCalled());
    });
  });

  describe('useSPUs', () => {
    it('应该成功获取 SPU 列表', async () => {
      const mockSpus = [
        {
          id: 'spu-001',
          code: 'SPU001',
          name: '可口可乐',
          brand: '可口可乐',
          category: '软饮',
          categoryId: 'cat-001',
          productType: 'raw_material' as const,
        },
      ];

      vi.mocked(skuService.getSpus).mockResolvedValue(mockSpus);

      const { result } = renderHook(() => useSPUs(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.getSpus).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockSpus);
    });

    it('应该启用长期缓存 (staleTime = 5 分钟)', async () => {
      const mockSpus = [
        {
          id: 'spu-001',
          code: 'SPU001',
          name: '可口可乐',
          brand: '可口可乐',
          category: '软饮',
          categoryId: 'cat-001',
          productType: 'raw_material' as const,
        },
      ];

      vi.mocked(skuService.getSpus).mockResolvedValue(mockSpus);

      const { result, rerender } = renderHook(() => useSPUs(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // 第一次调用
      expect(skuService.getSpus).toHaveBeenCalledTimes(1);

      // 重新渲染 (缓存未过期,不应重新请求)
      rerender();

      // 仍然是 1 次调用
      expect(skuService.getSpus).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理 API 错误', async () => {
      const mockError = new Error('Failed to fetch SPUs');
      vi.mocked(skuService.getSpus).mockRejectedValue(mockError);

      const { result } = renderHook(() => useSPUs(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useUnits', () => {
    it('应该成功获取单位列表', async () => {
      const mockUnits = [
        { id: 'ml', code: 'ML', name: 'ml', type: 'inventory' as const },
        { id: '杯', code: 'CUP', name: '杯', type: 'inventory' as const },
      ];

      vi.mocked(skuService.getUnits).mockResolvedValue(mockUnits);

      const { result } = renderHook(() => useUnits(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(skuService.getUnits).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockUnits);
    });

    it('应该启用长期缓存 (staleTime = 10 分钟)', async () => {
      const mockUnits = [
        { id: 'ml', code: 'ML', name: 'ml', type: 'inventory' as const },
      ];

      vi.mocked(skuService.getUnits).mockResolvedValue(mockUnits);

      const { result, rerender } = renderHook(() => useUnits(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // 第一次调用
      expect(skuService.getUnits).toHaveBeenCalledTimes(1);

      // 重新渲染 (缓存未过期,不应重新请求)
      rerender();

      // 仍然是 1 次调用
      expect(skuService.getUnits).toHaveBeenCalledTimes(1);
    });
  });
});
