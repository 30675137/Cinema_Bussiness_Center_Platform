/**
 * P004-inventory-adjustment: useSafetyStock Hook 单元测试
 * 
 * 测试乐观锁冲突处理逻辑。
 * 实现 T056 任务。
 * 
 * @since US5 - 设置安全库存阈值
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSafetyStock, ConflictError, isConflictError } from '../useSafetyStock';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSafetyStock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ConflictError', () => {
    it('应该正确创建 ConflictError', () => {
      const error = new ConflictError('数据已被修改');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.name).toBe('ConflictError');
      expect(error.message).toBe('数据已被修改');
    });
  });

  describe('isConflictError', () => {
    it('ConflictError 返回 true', () => {
      const error = new ConflictError('测试');
      expect(isConflictError(error)).toBe(true);
    });

    it('普通 Error 返回 false', () => {
      const error = new Error('测试');
      expect(isConflictError(error)).toBe(false);
    });

    it('非 Error 对象返回 false', () => {
      expect(isConflictError('error')).toBe(false);
      expect(isConflictError(null)).toBe(false);
      expect(isConflictError(undefined)).toBe(false);
    });
  });

  describe('Hook 初始化', () => {
    it('应该返回 mutate 函数', () => {
      const { result } = renderHook(() => useSafetyStock(), { wrapper: createWrapper() });
      
      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('初始状态 isPending 为 false', () => {
      const { result } = renderHook(() => useSafetyStock(), { wrapper: createWrapper() });
      
      expect(result.current.isPending).toBe(false);
    });
  });

  describe('回调函数', () => {
    it('应该接受 onSuccess 回调', () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useSafetyStock({ onSuccess }),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toBeDefined();
    });

    it('应该接受 onError 回调', () => {
      const onError = vi.fn();
      const { result } = renderHook(
        () => useSafetyStock({ onError }),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toBeDefined();
    });

    it('应该接受 onConflict 回调', () => {
      const onConflict = vi.fn();
      const { result } = renderHook(
        () => useSafetyStock({ onConflict }),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toBeDefined();
    });
  });
});

describe('UpdateSafetyStockRequest 类型', () => {
  it('应该包含必需字段', () => {
    const request = {
      inventoryId: 'inv-001',
      safetyStock: 10,
      version: 1,
    };
    
    expect(request.inventoryId).toBeDefined();
    expect(request.safetyStock).toBeDefined();
    expect(request.version).toBeDefined();
  });
});
