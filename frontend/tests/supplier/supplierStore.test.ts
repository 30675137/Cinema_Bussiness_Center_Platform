/**
 * 供应商管理 Store 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useSupplierStore } from '@/stores/supplierStore';

// Mock 日志函数
vi.mock('@/utils/helpers', () => ({
  generateId: () => 'test-id-1',
  generateOrderNumber: () => 'SUP-TEST001',
  formatDate: () => '2024-01-01',
}));

describe('SupplierStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    const { result } = renderHook(() => useSupplierStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('初始化状态', () => {
    it('应该具有正确的初始状态', () => {
      const { result } = renderHook(() => useSupplierStore());

      expect(result.current.suppliers).toEqual([]);
      expect(result.current.currentSupplier).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.filters).toEqual({});
      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(20);
      expect(result.current.selectedSupplierIds).toEqual([]);
    });
  });

  describe('fetchSuppliers', () => {
    it('应该能够获取供应商列表', async () => {
      const { result } = renderHook(() => useSupplierStore());

      await act(async () => {
        await result.current.fetchSuppliers();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.suppliers.length).toBeGreaterThan(0);
        expect(result.current.totalCount).toBeGreaterThan(0);
      });
    });

    it('应该支持搜索功能', async () => {
      const { result } = renderHook(() => useSupplierStore());

      await act(async () => {
        await result.current.fetchSuppliers({ search: '测试供应商' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('应该支持状态过滤', async () => {
      const { result } = renderHook(() => useSupplierStore());
      const { setActive } = result.current;

      await act(async () => {
        await setActive();
        await result.current.fetchSuppliers({ status: 'active' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.suppliers.every(supplier => supplier.status === 'active')).toBe(true);
      });
    });

    it('应该支持分页', async () => {
      const { result } = renderHook(() => useSupplierStore());

      await act(async () => {
        await result.current.fetchSuppliers({ page: 2, pageSize: 10 });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.currentPage).toBe(2);
        expect(result.current.pageSize).toBe(10);
      });
    });

    it('应该处理错误情况', async () => {
      const { result } = renderHook(() => useSupplierStore());

      // Mock 一个会失败的 fetchSuppliers 调用
      const originalFetch = result.current.fetchSuppliers;
      const failingFetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await act(async () => {
        try {
          await failingFetch();
        } catch (error) {
          // 预期会抛出错误
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('获取供应商列表失败');
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('createSupplier', () => {
    it('应该能够创建新供应商', async () => {
      const { result } = renderHook(() => useSupplierStore());
      const supplierData = {
        name: '新供应商',
        type: 'manufacturer' as const,
        level: 'standard' as const,
        contacts: [{
          id: 'contact-1',
          name: '张三',
          phone: '13800138000',
          position: '经理',
          email: 'zhangsan@example.com',
          isPrimary: true,
        }],
      };

      await act(async () => {
        const supplierId = await result.current.createSupplier(supplierData);
        expect(supplierId).toBeTruthy();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.suppliers.length).toBeGreaterThan(0);

        const newSupplier = result.current.suppliers.find(s => s.name === '新供应商');
        expect(newSupplier).toBeTruthy();
        expect(newSupplier?.name).toBe('新供应商');
        expect(newSupplier?.type).toBe('manufacturer');
        expect(newSupplier?.level).toBe('standard');
      });
    });

    it('创建失败时应该设置错误状态', async () => {
      const { result } = renderHook(() => useSupplierStore());

      const invalidData = {
        name: '', // 无效数据
        type: 'invalid' as any,
        level: 'invalid' as any,
      };

      await act(async () => {
        const supplierId = await result.current.createSupplier(invalidData);
        expect(supplierId).toBe(null);
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('updateSupplier', () => {
    it('应该能够更新供应商信息', async () => {
      const { result } = renderHook(() => useSupplierStore());

      // 首先获取一些供应商数据
      await act(async () => {
        await result.current.fetchSuppliers();
      });

      await waitFor(() => {
        expect(result.current.suppliers.length).toBeGreaterThan(0);
      });

      const firstSupplier = result.current.suppliers[0];
      const updateData = {
        name: '更新后的供应商名称',
        phone: '010-88888888',
      };

      await act(async () => {
        const success = await result.current.updateSupplier(firstSupplier.id, updateData);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const updatedSupplier = result.current.suppliers.find(s => s.id === firstSupplier.id);
        expect(updatedSupplier?.name).toBe('更新后的供应商名称');
        expect(updatedSupplier?.phone).toBe('010-88888888');
      });
    });

    it('更新不存在的供应商应该返回false', async () => {
      const { result } = renderHook(() => useSupplierStore());

      await act(async () => {
        const success = await result.current.updateSupplier('non-existent-id', {
          name: '测试',
        });
        expect(success).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('更新供应商失败');
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('deleteSupplier', () => {
    it('应该能够删除供应商', async () => {
      const { result } = renderHook(() => useSupplierStore());

      // 首先获取一些供应商数据
      await act(async () => {
        await result.current.fetchSuppliers();
      });

      await waitFor(() => {
        expect(result.current.suppliers.length).toBeGreaterThan(0);
      });

      const firstSupplier = result.current.suppliers[0];
      const initialCount = result.current.suppliers.length;

      await act(async () => {
        const success = await result.current.deleteSupplier(firstSupplier.id);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.suppliers.length).toBe(initialCount - 1);
        expect(result.current.suppliers.find(s => s.id === firstSupplier.id)).toBeFalsy();
      });
    });
  });

  describe('选择操作', () => {
    it('应该能够选择单个供应商', () => {
      const { result } = renderHook(() => useSupplierStore());

      act(() => {
        result.current.selectSupplier('supplier-1', true);
      });

      expect(result.current.selectedSupplierIds).toContain('supplier-1');

      act(() => {
        result.current.selectSupplier('supplier-1', false);
      });

      expect(result.current.selectedSupplierIds).not.toContain('supplier-1');
    });

    it('应该能够全选和取消全选', async () => {
      const { result } = renderHook(() => useSupplierStore());

      // 首先获取一些供应商数据
      await act(async () => {
        await result.current.fetchSuppliers();
      });

      await waitFor(() => {
        expect(result.current.suppliers.length).toBeGreaterThan(0);
      });

      const supplierIds = result.current.suppliers.map(s => s.id);

      act(() => {
        result.current.selectAllSuppliers(true);
      });

      expect(result.current.selectedSupplierIds).toEqual(supplierIds);

      act(() => {
        result.current.selectAllSuppliers(false);
      });

      expect(result.current.selectedSupplierIds).toEqual([]);
    });

    it('应该能够清除选择', () => {
      const { result } = renderHook(() => useSupplierStore());

      act(() => {
        result.current.selectSupplier('supplier-1', true);
        result.current.selectSupplier('supplier-2', true);
      });

      expect(result.current.selectedSupplierIds.length).toBe(2);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedSupplierIds).toEqual([]);
    });
  });

  describe('批量操作', () => {
    it('应该能够批量删除供应商', async () => {
      const { result } = renderHook(() => useSupplierStore());

      // 首先获取一些供应商数据
      await act(async () => {
        await result.current.fetchSuppliers();
      });

      await waitFor(() => {
        expect(result.current.suppliers.length).toBeGreaterThan(0);
      });

      const supplierIds = result.current.suppliers.slice(0, 2).map(s => s.id);
      const initialCount = result.current.suppliers.length;

      await act(async () => {
        const success = await result.current.batchDelete(supplierIds);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.suppliers.length).toBe(initialCount - supplierIds.length);
      });
    });

    it('应该能够批量更新供应商状态', async () => {
      const { result } = renderHook(() => useSupplierStore());

      // 首先获取一些供应商数据
      await act(async () => {
        await result.current.fetchSuppliers();
      });

      await waitFor(() => {
        expect(result.current.suppliers.length).toBeGreaterThan(0);
      });

      const supplierIds = result.current.suppliers.slice(0, 2).map(s => s.id);

      await act(async () => {
        const success = await result.current.batchUpdateStatus(supplierIds, 'suspended');
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const updatedSuppliers = result.current.suppliers.filter(s =>
          supplierIds.includes(s.id)
        );
        expect(updatedSuppliers.every(s => s.status === 'suspended')).toBe(true);
      });
    });
  });

  describe('UI 状态管理', () => {
    it('应该能够正确管理表单显示状态', () => {
      const { result } = renderHook(() => useSupplierStore());

      expect(result.current.isFormVisible).toBe(false);
      expect(result.current.editingSupplier).toBe(null);

      act(() => {
        result.current.showForm();
      });

      expect(result.current.isFormVisible).toBe(true);
      expect(result.current.editingSupplier).toBe(null);

      act(() => {
        result.current.hideForm();
      });

      expect(result.current.isFormVisible).toBe(false);
    });

    it('应该能够正确管理详情显示状态', () => {
      const { result } = renderHook(() => useSupplierStore());

      expect(result.current.isDetailVisible).toBe(false);
      expect(result.current.currentSupplier).toBe(null);

      const testSupplier = {
        id: 'test-1',
        name: '测试供应商',
        code: 'TEST001',
        type: 'manufacturer' as const,
        level: 'standard' as const,
        status: 'active' as const,
        contacts: [],
        bankAccounts: [],
        qualifications: [],
        evaluations: [],
        purchaseStats: {
          totalOrders: 0,
          totalAmount: 0,
          onTimeDeliveryRate: 0,
          qualityPassRate: 0,
          lastOrderDate: null,
        },
        productCategories: [],
        cooperationStartDate: '2024-01-01',
        creditLimit: 0,
        paymentTerms: '',
        createdById: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedById: 'user1',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      act(() => {
        result.current.showDetail(testSupplier);
      });

      expect(result.current.isDetailVisible).toBe(true);
      expect(result.current.currentSupplier).toBe(testSupplier);

      act(() => {
        result.current.hideDetail();
      });

      expect(result.current.isDetailVisible).toBe(false);
      expect(result.current.currentSupplier).toBe(null);
    });
  });

  describe('统计功能', () => {
    it('应该能够获取供应商统计信息', async () => {
      const { result } = renderHook(() => useSupplierStore());

      await act(async () => {
        await result.current.fetchStatistics();
      });

      await waitFor(() => {
        expect(result.current.statistics).toBeTruthy();
        expect(result.current.statistics?.totalSuppliers).toBeGreaterThan(0);
        expect(result.current.statistics?.activeSuppliers).toBeGreaterThanOrEqual(0);
        expect(result.current.statistics?.suspendedSuppliers).toBeGreaterThanOrEqual(0);
        expect(result.current.statistics?.totalAmount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('重置功能', () => {
    it('应该能够重置所有状态', () => {
      const { result } = renderHook(() => useSupplierStore());

      // 修改一些状态
      act(() => {
        result.current.selectSupplier('test-1', true);
        result.current.setFilters({ status: 'active' });
        result.current.setCurrentPage(2);
      });

      expect(result.current.selectedSupplierIds).toContain('test-1');
      expect(result.current.filters).toEqual({ status: 'active' });
      expect(result.current.currentPage).toBe(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.selectedSupplierIds).toEqual([]);
      expect(result.current.filters).toEqual({});
      expect(result.current.currentPage).toBe(1);
      expect(result.current.suppliers).toEqual([]);
      expect(result.current.currentSupplier).toBe(null);
    });
  });

  describe('持久化', () => {
    it('应该持久化过滤和分页状态', () => {
      const { result } = renderHook(() => useSupplierStore());

      act(() => {
        result.current.setFilters({ status: 'active', type: 'manufacturer' });
        result.current.setCurrentPage(3);
        result.current.setPageSize(50);
      });

      expect(result.current.filters.status).toBe('active');
      expect(result.current.filters.type).toBe('manufacturer');
      expect(result.current.currentPage).toBe(3);
      expect(result.current.pageSize).toBe(50);
    });
  });
});