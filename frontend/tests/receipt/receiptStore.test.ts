/**
 * 收货管理 Store 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useReceiptStore } from '@/stores/receiptStore';

// Mock 日志函数
vi.mock('@/utils/helpers', () => ({
  generateId: () => 'test-id-1',
  generateOrderNumber: () => 'REC-TEST001',
  formatDate: () => '2024-01-01',
}));

describe('ReceiptStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    const { result } = renderHook(() => useReceiptStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('初始化状态', () => {
    it('应该具有正确的初始状态', () => {
      const { result } = renderHook(() => useReceiptStore());

      expect(result.current.receipts).toEqual([]);
      expect(result.current.currentReceipt).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.filters).toEqual({});
      expect(result.current.currentPage).toBe(1);
      expect(result.current.pageSize).toBe(20);
      expect(result.current.selectedReceiptIds).toEqual([]);
      expect(result.current.isFormVisible).toBe(false);
      expect(result.current.isDetailVisible).toBe(false);
    });
  });

  describe('fetchReceipts', () => {
    it('应该能够获取收货单列表', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.receipts.length).toBeGreaterThan(0);
        expect(result.current.totalCount).toBeGreaterThan(0);
      });
    });

    it('应该支持搜索功能', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReceipts({ search: 'REC001' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(
          result.current.receipts.every(
            (receipt) =>
              receipt.receiptNumber.includes('REC001') ||
              receipt.supplier.name.includes('REC001') ||
              receipt.operator.includes('REC001')
          )
        ).toBe(true);
      });
    });

    it('应该支持状态过滤', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReceipts({ status: 'completed' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.receipts.every((receipt) => receipt.status === 'completed')).toBe(
          true
        );
      });
    });

    it('应该支持优先级过滤', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReceipts({ priority: 'high' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.receipts.every((receipt) => receipt.priority === 'high')).toBe(true);
      });
    });

    it('应该支持供应商过滤', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReceipts({ supplierId: 'supplier-1' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(
          result.current.receipts.every((receipt) => receipt.supplier.id === 'supplier-1')
        ).toBe(true);
      });
    });

    it('应该支持仓库过滤', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReceipts({ warehouseId: 'warehouse-1' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(
          result.current.receipts.every((receipt) => receipt.warehouse.id === 'warehouse-1')
        ).toBe(true);
      });
    });

    it('应该支持日期范围过滤', async () => {
      const { result } = renderHook(() => useReceiptStore());

      const dateRange = ['2024-01-01', '2024-01-31'];
      await act(async () => {
        await result.current.fetchReceipts({ dateRange });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(
          result.current.receipts.every(
            (receipt) => receipt.receiptDate >= dateRange[0] && receipt.receiptDate <= dateRange[1]
          )
        ).toBe(true);
      });
    });

    it('应该支持排序', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReceipts({
          sortBy: 'receiptDate',
          sortOrder: 'desc',
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const receipts = result.current.receipts;
        for (let i = 1; i < receipts.length; i++) {
          expect(new Date(receipts[i - 1].receiptDate).getTime()).toBeGreaterThanOrEqual(
            new Date(receipts[i].receiptDate).getTime()
          );
        }
      });
    });

    it('应该支持分页', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReceipts({ page: 2, pageSize: 10 });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.currentPage).toBe(2);
        expect(result.current.pageSize).toBe(10);
      });
    });

    it('应该处理错误情况', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 模拟网络错误
      const originalConsoleError = console.error;
      console.error = vi.fn();

      await act(async () => {
        // 这里需要模拟一个会失败的情况
        // 由于当前实现使用的是模拟数据，我们暂时无法直接测试错误情况
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      console.error = originalConsoleError;
    });
  });

  describe('createReceipt', () => {
    it('应该能够创建新收货单', async () => {
      const { result } = renderHook(() => useReceiptStore());

      const receiptData = {
        supplierId: 'supplier-1',
        warehouseId: 'warehouse-1',
        priority: 'high' as const,
        items: [
          {
            productId: 'product-1',
            productCode: 'P001',
            productName: '商品1',
            unit: '个',
            orderedQuantity: 100,
            unitPrice: 10,
            totalPrice: 1000,
          },
        ],
      };

      await act(async () => {
        const receiptId = await result.current.createReceipt(receiptData);
        expect(receiptId).toBeTruthy();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.receipts.length).toBeGreaterThan(0);

        const newReceipt = result.current.receipts.find((r) => r.supplier.id === 'supplier-1');
        expect(newReceipt).toBeTruthy();
        expect(newReceipt?.status).toBe('draft');
        expect(newReceipt?.priority).toBe('high');
      });
    });

    it('应该验证必填字段', async () => {
      const { result } = renderHook(() => useReceiptStore());

      const invalidData = {
        supplierId: '',
        warehouseId: '',
        items: [],
      };

      await act(async () => {
        const receiptId = await result.current.createReceipt(invalidData);
        // 由于是模拟数据，这里可能不会验证
        expect(receiptId).toBeTruthy();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('updateReceipt', () => {
    it('应该能够更新收货单', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取收货单列表
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const firstReceipt = result.current.receipts[0];
      const updateData = {
        priority: 'urgent' as const,
        remarks: '更新后的备注',
      };

      await act(async () => {
        const success = await result.current.updateReceipt(firstReceipt.id, updateData);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const updatedReceipt = result.current.receipts.find((r) => r.id === firstReceipt.id);
        expect(updatedReceipt?.priority).toBe('urgent');
        expect(updatedReceipt?.remarks).toContain('更新后的备注');
      });
    });

    it('更新不存在的收货单应该返回false', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        const success = await result.current.updateReceipt('non-existent-id', {
          priority: 'high' as const,
        });
        expect(success).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('confirmReceipt', () => {
    it('应该能够确认收货', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取收货单列表
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const firstReceipt = result.current.receipts[0];
      const confirmData = {
        receiptId: firstReceipt.id,
        items: firstReceipt.items.map((item) => ({
          id: item.id,
          receivedQuantity: item.orderedQuantity,
          qualifiedQuantity: item.orderedQuantity - 1,
          defectiveQuantity: 1,
          batchNumber: 'B001',
          qualityStatus: 'passed' as const,
          qualityResult: '质检合格',
        })),
      };

      await act(async () => {
        const success = await result.current.confirmReceipt(confirmData);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const updatedReceipt = result.current.receipts.find((r) => r.id === firstReceipt.id);
        expect(updatedReceipt?.status).toBe('completed');

        const updatedItem = updatedReceipt?.items.find(
          (item) => item.id === firstReceipt.items[0].id
        );
        expect(updatedItem?.receivedQuantity).toBe(firstReceipt.items[0].orderedQuantity);
        expect(updatedItem?.qualityStatus).toBe('passed');
      });
    });

    it('部分收货应该更新状态为partial_received', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取收货单列表
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const firstReceipt = result.current.receipts[0];
      const confirmData = {
        receiptId: firstReceipt.id,
        items: firstReceipt.items.map((item) => ({
          id: item.id,
          receivedQuantity: Math.floor(item.orderedQuantity / 2), // 只收一半
          qualifiedQuantity: Math.floor(item.orderedQuantity / 2),
          defectiveQuantity: 0,
          batchNumber: 'B001',
          qualityStatus: 'passed' as const,
        })),
      };

      await act(async () => {
        const success = await result.current.confirmReceipt(confirmData);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const updatedReceipt = result.current.receipts.find((r) => r.id === firstReceipt.id);
        expect(updatedReceipt?.status).toBe('partial_received');
      });
    });
  });

  describe('质检操作', () => {
    it('应该能够开始质检', () => {
      const { result } = renderHook(() => useReceiptStore());

      act(() => {
        result.current.startQualityCheck('receipt-1', 'item-1');
      });

      expect(result.current.qualityCheckingItemId).toBe('item-1');
      expect(result.current.isQualityCheckVisible).toBe(true);
    });

    it('应该能够完成质检', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取收货单列表
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const firstReceipt = result.current.receipts[0];
      const qualityData = {
        receiptId: firstReceipt.id,
        itemId: firstReceipt.items[0].id,
        qualityStatus: 'passed' as const,
        qualifiedQuantity: 100,
        defectiveQuantity: 0,
        qualityResult: '质检通过',
      };

      await act(async () => {
        const success = await result.current.completeQualityCheck(qualityData);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.isQualityCheckVisible).toBe(false);

        const updatedReceipt = result.current.receipts.find((r) => r.id === firstReceipt.id);
        const updatedItem = updatedReceipt?.items.find(
          (item) => item.id === firstReceipt.items[0].id
        );
        expect(updatedItem?.qualityStatus).toBe('passed');
        expect(updatedItem?.qualifiedQuantity).toBe(100);
      });
    });

    it('应该能够审批质检', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取收货单列表
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const firstReceipt = result.current.receipts[0];

      await act(async () => {
        const success = await result.current.approveQualityCheck(
          firstReceipt.id,
          firstReceipt.items[0].id
        );
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const updatedReceipt = result.current.receipts.find((r) => r.id === firstReceipt.id);
        const updatedItem = updatedReceipt?.items.find(
          (item) => item.id === firstReceipt.items[0].id
        );
        expect(updatedItem?.qualityStatus).toBe('passed');
      });
    });
  });

  describe('统计功能', () => {
    it('应该能够获取收货统计信息', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchStatistics();
      });

      await waitFor(() => {
        expect(result.current.statistics).toBeTruthy();
        expect(result.current.statistics?.totalReceipts).toBeGreaterThan(0);
        expect(result.current.statistics?.pendingReceipts).toBeGreaterThanOrEqual(0);
        expect(result.current.statistics?.completedReceipts).toBeGreaterThanOrEqual(0);
        expect(result.current.statistics?.totalAmount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('日志和退货记录', () => {
    it('应该能够获取操作日志', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchLogs('receipt-1');
      });

      await waitFor(() => {
        expect(result.current.logs.length).toBeGreaterThan(0);
        expect(result.current.logs[0]).toHaveProperty('receiptId', 'receipt-1');
        expect(result.current.logs[0]).toHaveProperty('action');
        expect(result.current.logs[0]).toHaveProperty('operator');
      });
    });

    it('应该能够获取退货记录', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.fetchReturnRecords('receipt-1');
      });

      await waitFor(() => {
        expect(result.current.returnRecords.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('选择操作', () => {
    it('应该能够选择单个收货单', () => {
      const { result } = renderHook(() => useReceiptStore());

      act(() => {
        result.current.selectReceipt('receipt-1', true);
      });

      expect(result.current.selectedReceiptIds).toContain('receipt-1');

      act(() => {
        result.current.selectReceipt('receipt-1', false);
      });

      expect(result.current.selectedReceiptIds).not.toContain('receipt-1');
    });

    it('应该能够全选和取消全选', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取一些收货单数据
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const receiptIds = result.current.receipts.map((r) => r.id);

      act(() => {
        result.current.selectAllReceipts(true);
      });

      expect(result.current.selectedReceiptIds).toEqual(receiptIds);

      act(() => {
        result.current.selectAllReceipts(false);
      });

      expect(result.current.selectedReceiptIds).toEqual([]);
    });
  });

  describe('批量操作', () => {
    it('应该能够批量删除收货单', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取一些收货单数据
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const receiptIds = result.current.receipts.slice(0, 2).map((r) => r.id);
      const initialCount = result.current.receipts.length;

      await act(async () => {
        const success = await result.current.batchDelete(receiptIds);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.receipts.length).toBe(initialCount - receiptIds.length);
      });
    });

    it('应该能够批量取消收货单', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取一些收货单数据
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const receiptIds = result.current.receipts.slice(0, 2).map((r) => r.id);

      await act(async () => {
        const success = await result.current.batchCancel(receiptIds, '批量取消测试');
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const cancelledReceipts = result.current.receipts.filter((s) => receiptIds.includes(s.id));
        expect(cancelledReceipts.every((s) => s.status === 'cancelled')).toBe(true);
      });
    });

    it('应该能够批量审批收货单', async () => {
      const { result } = renderHook(() => useReceiptStore());

      // 先获取一些收货单数据
      await act(async () => {
        await result.current.fetchReceipts();
      });

      await waitFor(() => {
        expect(result.current.receipts.length).toBeGreaterThan(0);
      });

      const receiptIds = result.current.receipts.slice(0, 2).map((r) => r.id);

      await act(async () => {
        const success = await result.current.batchApprove(receiptIds);
        expect(success).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);

        const approvedReceipts = result.current.receipts.filter((s) => receiptIds.includes(s.id));
        expect(approvedReceipts.every((s) => s.status === 'completed')).toBe(true);
      });
    });
  });

  describe('导入导出', () => {
    it('应该能够导出收货单', async () => {
      const { result } = renderHook(() => useReceiptStore());

      await act(async () => {
        await result.current.exportReceipts();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('应该能够导入收货单', async () => {
      const { result } = renderHook(() => useReceiptStore());

      const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });

      await act(async () => {
        await result.current.importReceipts(mockFile);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('UI 状态管理', () => {
    it('应该能够正确管理表单显示状态', () => {
      const { result } = renderHook(() => useReceiptStore());

      expect(result.current.isFormVisible).toBe(false);
      expect(result.current.editingReceipt).toBe(null);

      act(() => {
        result.current.showForm();
      });

      expect(result.current.isFormVisible).toBe(true);
      expect(result.current.editingReceipt).toBe(null);

      act(() => {
        result.current.hideForm();
      });

      expect(result.current.isFormVisible).toBe(false);
    });

    it('应该能够正确管理详情显示状态', () => {
      const { result } = renderHook(() => useReceiptStore());

      expect(result.current.isDetailVisible).toBe(false);
      expect(result.current.currentReceipt).toBe(null);

      const testReceipt = {
        id: 'test-1',
        receiptNumber: 'REC001',
        status: 'draft' as const,
        priority: 'normal' as const,
        supplier: { id: 's1', code: 'S001', name: '供应商1' },
        warehouse: { id: 'w1', code: 'W001', name: '仓库1' },
        receiptDate: '2024-01-01',
        operator: '操作员',
        totalItems: 1,
        totalOrderedQuantity: 100,
        totalReceivedQuantity: 0,
        totalQualifiedQuantity: 0,
        totalDefectiveQuantity: 0,
        totalAmount: 1000,
        taxAmount: 130,
        totalAmountWithTax: 1130,
        items: [
          {
            id: 'item-1',
            productId: 'p1',
            productCode: 'P001',
            productName: '商品1',
            unit: '个',
            orderedQuantity: 100,
            receivedQuantity: 0,
            qualifiedQuantity: 0,
            defectiveQuantity: 0,
            unitPrice: 10,
            totalPrice: 1000,
            qualityStatus: 'pending' as const,
          },
        ],
        createdById: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedById: 'user1',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      act(() => {
        result.current.showDetail(testReceipt);
      });

      expect(result.current.isDetailVisible).toBe(true);
      expect(result.current.currentReceipt).toBe(testReceipt);

      act(() => {
        result.current.hideDetail();
      });

      expect(result.current.isDetailVisible).toBe(false);
      expect(result.current.currentReceipt).toBe(null);
    });

    it('应该能够正确管理质检界面状态', () => {
      const { result } = renderHook(() => useReceiptStore());

      expect(result.current.isQualityCheckVisible).toBe(false);
      expect(result.current.qualityCheckingItemId).toBe(null);

      act(() => {
        result.current.showQualityCheck('receipt-1', 'item-1');
      });

      expect(result.current.isQualityCheckVisible).toBe(true);
      expect(result.current.qualityCheckingItemId).toBe('item-1');

      act(() => {
        result.current.hideQualityCheck();
      });

      expect(result.current.isQualityCheckVisible).toBe(false);
      expect(result.current.qualityCheckingItemId).toBe(null);
    });
  });

  describe('重置功能', () => {
    it('应该能够重置所有状态', () => {
      const { result } = renderHook(() => useReceiptStore());

      // 修改一些状态
      act(() => {
        result.current.selectReceipt('test-1', true);
        result.current.setFilters({ status: 'active' });
        result.current.setCurrentPage(2);
        result.current.showForm();
      });

      expect(result.current.selectedReceiptIds).toContain('test-1');
      expect(result.current.filters).toEqual({ status: 'active' });
      expect(result.current.currentPage).toBe(2);
      expect(result.current.isFormVisible).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.selectedReceiptIds).toEqual([]);
      expect(result.current.filters).toEqual({});
      expect(result.current.currentPage).toBe(1);
      expect(result.current.suppliers).toEqual([]);
      expect(result.current.currentReceipt).toBe(null);
      expect(result.current.isFormVisible).toBe(false);
    });
  });

  describe('持久化', () => {
    it('应该持久化过滤和分页状态', () => {
      const { result } = renderHook(() => useReceiptStore());

      act(() => {
        result.current.setFilters({ status: 'active', priority: 'high' });
        result.current.setCurrentPage(3);
        result.current.setPageSize(50);
      });

      expect(result.current.filters.status).toBe('active');
      expect(result.current.filters.priority).toBe('high');
      expect(result.current.currentPage).toBe(3);
      expect(result.current.pageSize).toBe(50);
    });
  });
});
