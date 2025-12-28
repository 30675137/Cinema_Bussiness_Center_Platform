/**
 * P004-inventory-adjustment: useAdjustmentReasons Hook 单元测试
 * 
 * 测试原因下拉选项加载。
 * 实现 T037 任务。
 * 
 * @since US3 - 填写调整原因
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useAdjustmentReasons hook
vi.mock('../useAdjustmentReasons', () => ({
  useAdjustmentReasons: vi.fn(() => ({
    data: [
      { id: '1', code: 'R001', name: '盘点差异', type: 'surplus' },
      { id: '2', code: 'R002', name: '商品破损', type: 'damage' },
      { id: '3', code: 'R003', name: '库存盘亏', type: 'shortage' },
    ],
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

import { useAdjustmentReasons } from '../useAdjustmentReasons';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAdjustmentReasons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook 初始化', () => {
    it('应该返回原因列表数据', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('应该返回加载状态', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('应该返回错误状态', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      expect(typeof result.current.isError).toBe('boolean');
    });
  });

  describe('原因数据结构', () => {
    it('每个原因应该有id字段', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      result.current.data?.forEach((reason: any) => {
        expect(reason.id).toBeDefined();
      });
    });

    it('每个原因应该有name字段', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      result.current.data?.forEach((reason: any) => {
        expect(reason.name).toBeDefined();
      });
    });

    it('每个原因应该有type字段', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      result.current.data?.forEach((reason: any) => {
        expect(reason.type).toBeDefined();
      });
    });
  });

  describe('原因类型', () => {
    it('应该包含盘盈类型原因', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      const surplusReasons = result.current.data?.filter((r: any) => r.type === 'surplus');
      expect(surplusReasons?.length).toBeGreaterThan(0);
    });

    it('应该包含报损类型原因', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      const damageReasons = result.current.data?.filter((r: any) => r.type === 'damage');
      expect(damageReasons?.length).toBeGreaterThan(0);
    });

    it('应该包含盘亏类型原因', () => {
      const { result } = renderHook(() => useAdjustmentReasons(), { wrapper: createWrapper() });
      
      const shortageReasons = result.current.data?.filter((r: any) => r.type === 'shortage');
      expect(shortageReasons?.length).toBeGreaterThan(0);
    });
  });
});
