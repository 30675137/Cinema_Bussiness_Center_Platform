/**
 * 库存管理 Store 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInventoryStore } from '@/stores/inventoryStore';
import {
  InventoryItem,
  InventoryStatus,
  InventoryOperationType,
  Location,
  CreateInventoryItemParams,
  UpdateInventoryItemParams,
  InventoryOperationParams,
} from '@/types/inventory';

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 模拟 dayjs
vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-01'),
    extend: vi.fn(() => ({
      format: vi.fn(() => '2024-01-01'),
    })),
  })),
}));

describe('inventoryStore', () => {
  beforeEach(() => {
    // 清除所有 mock 调用记录
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    // 重置 store
    useInventoryStore.getState().reset();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useInventoryStore());
      const store = result.current;

      expect(store.inventoryItems).toEqual([]);
      expect(store.locations).toEqual([]);
      expect(store.operations).toEqual([]);
      expect(store.alerts).toEqual([]);
      expect(store.currentInventory).toBe(null);
      expect(store.statistics).toBe(null);
      expect(store.loading).toBe(false);
      expect(store.pagination).toEqual({
        current: 1,
        pageSize: 10,
        total: 0,
      });
      expect(store.filters).toEqual({});
      expect(store.selectedItems).toEqual([]);
    });
  });

  describe('库存项管理', () => {
    it('应该能够创建库存项', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem } = result.current;

      const newInventoryParams: CreateInventoryItemParams = {
        productId: 'PRD001',
        locationId: 'LOC001',
        initialStock: 100,
        minStock: 20,
        maxStock: 500,
        safeStock: 30,
        averageCost: 15.50,
        remark: '测试库存项',
      };

      await act(async () => {
        const newInventory = await createInventoryItem(newInventoryParams);
        expect(newInventory).toBeDefined();
        expect(newInventory.productCode).toBe('PRD001');
        expect(newInventory.currentStock).toBe(100);
      });

      const { inventoryItems } = result.current;
      expect(inventoryItems).toHaveLength(1);
      expect(inventoryItems[0].productId).toBe('PRD001');
    });

    it('应该能够更新库存项', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem, updateInventoryItem } = result.current;

      // 先创建一个库存项
      const newInventoryParams: CreateInventoryItemParams = {
        productId: 'PRD001',
        locationId: 'LOC001',
        initialStock: 100,
        minStock: 20,
        maxStock: 500,
        safeStock: 30,
        averageCost: 15.50,
      };

      const createdInventory = await act(async () => {
        return await createInventoryItem(newInventoryParams);
      });

      // 更新库存项
      const updateParams: UpdateInventoryItemParams = {
        minStock: 25,
        maxStock: 600,
        safeStock: 40,
        averageCost: 16.00,
      };

      await act(async () => {
        const updatedInventory = await updateInventoryItem(createdInventory.id, updateParams);
        expect(updatedInventory.minStock).toBe(25);
        expect(updatedInventory.maxStock).toBe(600);
        expect(updatedInventory.safeStock).toBe(40);
        expect(updatedInventory.averageCost).toBe(16.00);
      });

      const { inventoryItems } = result.current;
      const updatedItem = inventoryItems.find(item => item.id === createdInventory.id);
      expect(updatedItem.minStock).toBe(25);
    });

    it('应该能够删除库存项', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem, deleteInventoryItem } = result.current;

      // 先创建一个库存项
      const newInventoryParams: CreateInventoryItemParams = {
        productId: 'PRD001',
        locationId: 'LOC001',
        initialStock: 100,
        minStock: 20,
        maxStock: 500,
        safeStock: 30,
        averageCost: 15.50,
      };

      const createdInventory = await act(async () => {
        return await createInventoryItem(newInventoryParams);
      });

      // 确认库存项已创建
      expect(result.current.inventoryItems).toHaveLength(1);

      // 删除库存项
      await act(async () => {
        await deleteInventoryItem(createdInventory.id);
      });

      // 确认库存项已删除
      expect(result.current.inventoryItems).toHaveLength(0);
    });

    it('应该能够获取单个库存项', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem, fetchInventoryById } = result.current;

      // 先创建一个库存项
      const newInventoryParams: CreateInventoryItemParams = {
        productId: 'PRD001',
        locationId: 'LOC001',
        initialStock: 100,
        minStock: 20,
        maxStock: 500,
        safeStock: 30,
        averageCost: 15.50,
      };

      const createdInventory = await act(async () => {
        return await createInventoryItem(newInventoryParams);
      });

      // 获取库存项详情
      await act(async () => {
        await fetchInventoryById(createdInventory.id);
      });

      const { currentInventory } = result.current;
      expect(currentInventory).toBeDefined();
      expect(currentInventory.id).toBe(createdInventory.id);
      expect(currentInventory.productId).toBe('PRD001');
    });
  });

  describe('库存操作', () => {
    let testInventory: InventoryItem;

    beforeEach(async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem } = result.current;

      const newInventoryParams: CreateInventoryItemParams = {
        productId: 'PRD001',
        locationId: 'LOC001',
        initialStock: 100,
        minStock: 20,
        maxStock: 500,
        safeStock: 30,
        averageCost: 15.50,
      };

      testInventory = await act(async () => {
        return await createInventoryItem(newInventoryParams);
      });
    });

    it('应该能够执行入库操作', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryOperation, fetchInventoryById } = result.current;

      const operationParams: InventoryOperationParams = {
        inventoryItemId: testInventory.id,
        operationType: InventoryOperationType.STOCK_IN,
        quantity: 50,
        unitPrice: 15.50,
        reason: '采购入库',
      };

      await act(async () => {
        await createInventoryOperation(operationParams);
        await fetchInventoryById(testInventory.id);
      });

      const { currentInventory, operations } = result.current;
      expect(currentInventory.currentStock).toBe(150); // 100 + 50
      expect(operations).toHaveLength(1);
      expect(operations[0].operationType).toBe(InventoryOperationType.STOCK_IN);
      expect(operations[0].quantity).toBe(50);
    });

    it('应该能够执行出库操作', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryOperation, fetchInventoryById } = result.current;

      const operationParams: InventoryOperationParams = {
        inventoryItemId: testInventory.id,
        operationType: InventoryOperationType.STOCK_OUT,
        quantity: 30,
        unitPrice: 15.50,
        reason: '销售出库',
      };

      await act(async () => {
        await createInventoryOperation(operationParams);
        await fetchInventoryById(testInventory.id);
      });

      const { currentInventory } = result.current;
      expect(currentInventory.currentStock).toBe(70); // 100 - 30
      expect(currentInventory.status).toBe(InventoryStatus.IN_STOCK);
    });

    it('应该在库存不足时更新状态', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryOperation, fetchInventoryById } = result.current;

      // 将库存降到最小库存以下
      const operationParams: InventoryOperationParams = {
        inventoryItemId: testInventory.id,
        operationType: InventoryOperationType.STOCK_OUT,
        quantity: 85, // 100 - 85 = 15 < minStock(20)
        unitPrice: 15.50,
        reason: '大量出库',
      };

      await act(async () => {
        await createInventoryOperation(operationParams);
        await fetchInventoryById(testInventory.id);
      });

      const { currentInventory } = result.current;
      expect(currentInventory.currentStock).toBe(15);
      expect(currentInventory.status).toBe(InventoryStatus.LOW_STOCK);
    });

    it('应该在库存为0时更新状态', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryOperation, fetchInventoryById } = result.current;

      // 将库存清零
      const operationParams: InventoryOperationParams = {
        inventoryItemId: testInventory.id,
        operationType: InventoryOperationType.STOCK_OUT,
        quantity: 100, // 100 - 100 = 0
        unitPrice: 15.50,
        reason: '清空库存',
      };

      await act(async () => {
        await createInventoryOperation(operationParams);
        await fetchInventoryById(testInventory.id);
      });

      const { currentInventory } = result.current;
      expect(currentInventory.currentStock).toBe(0);
      expect(currentInventory.status).toBe(InventoryStatus.OUT_OF_STOCK);
    });

    it('应该能够执行盘点调整操作', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryOperation, fetchInventoryById } = result.current;

      const operationParams: InventoryOperationParams = {
        inventoryItemId: testInventory.id,
        operationType: InventoryOperationType.ADJUSTMENT,
        quantity: 10, // 盘盈10个
        unitPrice: 15.50,
        reason: '盘点调整',
      };

      await act(async () => {
        await createInventoryOperation(operationParams);
        await fetchInventoryById(testInventory.id);
      });

      const { currentInventory } = result.current;
      expect(currentInventory.currentStock).toBe(110); // 100 + 10
    });

    it('应该能够执行调拨入库操作', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryOperation, fetchInventoryById } = result.current;

      const operationParams: InventoryOperationParams = {
        inventoryItemId: testInventory.id,
        operationType: InventoryOperationType.TRANSFER_IN,
        quantity: 25,
        unitPrice: 15.50,
        reason: '从其他仓库调入',
      };

      await act(async () => {
        await createInventoryOperation(operationParams);
        await fetchInventoryById(testInventory.id);
      });

      const { currentInventory } = result.current;
      expect(currentInventory.currentStock).toBe(125); // 100 + 25
    });

    it('应该能够执行调拨出库操作', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryOperation, fetchInventoryById } = result.current;

      const operationParams: InventoryOperationParams = {
        inventoryItemId: testInventory.id,
        operationType: InventoryOperationType.TRANSFER_OUT,
        quantity: 20,
        unitPrice: 15.50,
        reason: '调拨到其他仓库',
      };

      await act(async () => {
        await createInventoryOperation(operationParams);
        await fetchInventoryById(testInventory.id);
      });

      const { currentInventory } = result.current;
      expect(currentInventory.currentStock).toBe(80); // 100 - 20
    });
  });

  describe('位置管理', () => {
    it('应该能够创建位置', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createLocation } = result.current;

      const newLocation = {
        name: '仓库A-货架1',
        code: 'WH-A-S1',
        type: 'shelf' as const,
        capacity: 1000,
        description: '主要存储区域',
      };

      await act(async () => {
        const createdLocation = await createLocation(newLocation);
        expect(createdLocation.name).toBe('仓库A-货架1');
        expect(createdLocation.code).toBe('WH-A-S1');
        expect(createdLocation.isActive).toBe(true);
      });

      const { locations } = result.current;
      expect(locations).toHaveLength(1);
      expect(locations[0].name).toBe('仓库A-货架1');
    });

    it('应该能够更新位置', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createLocation, updateLocation } = result.current;

      // 创建位置
      const newLocation = {
        name: '仓库A-货架1',
        code: 'WH-A-S1',
        type: 'shelf' as const,
        capacity: 1000,
      };

      const createdLocation = await act(async () => {
        return await createLocation(newLocation);
      });

      // 更新位置
      await act(async () => {
        const updatedLocation = await updateLocation(createdLocation.id, {
          capacity: 1500,
          description: '扩容后的货架',
        });
        expect(updatedLocation.capacity).toBe(1500);
        expect(updatedLocation.description).toBe('扩容后的货架');
      });

      const { locations } = result.current;
      const updatedLocation = locations.find(loc => loc.id === createdLocation.id);
      expect(updatedLocation.capacity).toBe(1500);
      expect(updatedLocation.description).toBe('扩容后的货架');
    });

    it('应该能够删除位置', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createLocation, deleteLocation } = result.current;

      // 创建位置
      const newLocation = {
        name: '仓库A-货架1',
        code: 'WH-A-S1',
        type: 'shelf' as const,
        capacity: 1000,
      };

      const createdLocation = await act(async () => {
        return await createLocation(newLocation);
      });

      // 确认位置已创建
      expect(result.current.locations).toHaveLength(1);

      // 删除位置
      await act(async () => {
        await deleteLocation(createdLocation.id);
      });

      // 确认位置已删除
      expect(result.current.locations).toHaveLength(0);
    });
  });

  describe('筛选和搜索', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem } = result.current;

      // 创建多个库存项用于测试
      const inventoryItems = [
        {
          productId: 'PRD001',
          locationId: 'LOC001',
          initialStock: 100,
          minStock: 20,
          maxStock: 500,
          safeStock: 30,
          averageCost: 15.50,
        },
        {
          productId: 'PRD002',
          locationId: 'LOC002',
          initialStock: 0,
          minStock: 10,
          maxStock: 200,
          safeStock: 15,
          averageCost: 25.00,
        },
        {
          productId: 'PRD003',
          locationId: 'LOC001',
          initialStock: 15,
          minStock: 20,
          maxStock: 300,
          safeStock: 25,
          averageCost: 8.75,
        },
      ];

      await act(async () => {
        for (const item of inventoryItems) {
          await createInventoryItem(item);
        }
      });
    });

    it('应该能够按关键词搜索', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { setFilters, fetchInventoryItems } = result.current;

      await act(async () => {
        setFilters({ keyword: 'PRD001' });
        await fetchInventoryItems();
      });

      const { inventoryItems } = result.current;
      expect(inventoryItems).toHaveLength(1);
      expect(inventoryItems[0].productCode).toBe('PRD001');
    });

    it('应该能够按状态筛选', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { setFilters, fetchInventoryItems } = result.current;

      await act(async () => {
        setFilters({ status: InventoryStatus.OUT_OF_STOCK });
        await fetchInventoryItems();
      });

      const { inventoryItems } = result.current;
      expect(inventoryItems).toHaveLength(1);
      expect(inventoryItems[0].status).toBe(InventoryStatus.OUT_OF_STOCK);
    });

    it('应该能够按库存不足筛选', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { setFilters, fetchInventoryItems } = result.current;

      await act(async () => {
        setFilters({ lowStock: true });
        await fetchInventoryItems();
      });

      const { inventoryItems } = result.current;
      expect(inventoryItems.length).toBeGreaterThan(0);
      expect(inventoryItems.every(item => item.status === InventoryStatus.LOW_STOCK || item.status === InventoryStatus.OUT_OF_STOCK)).toBe(true);
    });

    it('应该能够按位置筛选', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { setFilters, fetchInventoryItems } = result.current;

      await act(async () => {
        setFilters({ locationId: 'LOC001' });
        await fetchInventoryItems();
      });

      const { inventoryItems } = result.current;
      expect(inventoryItems.every(item => item.locationId === 'LOC001')).toBe(true);
    });
  });

  describe('统计信息', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem } = result.current;

      // 创建多个库存项用于统计
      const inventoryItems = [
        {
          productId: 'PRD001',
          locationId: 'LOC001',
          initialStock: 100,
          minStock: 20,
          maxStock: 500,
          safeStock: 30,
          averageCost: 15.50,
        },
        {
          productId: 'PRD002',
          locationId: 'LOC002',
          initialStock: 0,
          minStock: 10,
          maxStock: 200,
          safeStock: 15,
          averageCost: 25.00,
        },
        {
          productId: 'PRD003',
          locationId: 'LOC001',
          initialStock: 15,
          minStock: 20,
          maxStock: 300,
          safeStock: 25,
          averageCost: 8.75,
        },
      ];

      await act(async () => {
        for (const item of inventoryItems) {
          await createInventoryItem(item);
        }
      });
    });

    it('应该能够计算正确的统计信息', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { calculateStatistics } = result.current;

      await act(async () => {
        await calculateStatistics();
      });

      const { statistics } = result.current;
      expect(statistics).toBeDefined();
      expect(statistics.totalItems).toBe(3);
      expect(statistics.totalValue).toBe(100 * 15.50 + 0 * 25.00 + 15 * 8.75);
      expect(statistics.inStockCount).toBe(1); // 只有PRD001有库存
      expect(statistics.lowStockCount).toBe(1); // PRD003库存不足
      expect(statistics.outOfStockCount).toBe(1); // PRD002缺货
    });
  });

  describe('批量操作', () => {
    beforeEach(async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem } = result.current;

      // 创建多个库存项
      const inventoryItems = [
        {
          productId: 'PRD001',
          locationId: 'LOC001',
          initialStock: 100,
          minStock: 20,
          maxStock: 500,
          safeStock: 30,
          averageCost: 15.50,
        },
        {
          productId: 'PRD002',
          locationId: 'LOC002',
          initialStock: 50,
          minStock: 10,
          maxStock: 200,
          safeStock: 15,
          averageCost: 25.00,
        },
      ];

      await act(async () => {
        for (const item of inventoryItems) {
          await createInventoryItem(item);
        }
      });
    });

    it('应该能够批量选择库存项', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { inventoryItems, setSelectedItems } = result.current;

      await act(async () => {
        setSelectedItems([inventoryItems[0].id, inventoryItems[1].id]);
      });

      const { selectedItems } = result.current;
      expect(selectedItems).toHaveLength(2);
      expect(selectedItems).toContain(inventoryItems[0].id);
      expect(selectedItems).toContain(inventoryItems[1].id);
    });

    it('应该能够批量删除库存项', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { inventoryItems, setSelectedItems, deleteInventoryItem } = result.current;

      await act(async () => {
        setSelectedItems([inventoryItems[0].id, inventoryItems[1].id]);
      });

      // 批量删除
      await act(async () => {
        await Promise.all([
          deleteInventoryItem(inventoryItems[0].id),
          deleteInventoryItem(inventoryItems[1].id),
        ]);
      });

      const { inventoryItems: remainingItems } = result.current;
      expect(remainingItems).toHaveLength(0);
    });
  });

  describe('数据导出', () => {
    it('应该能够导出库存数据', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem, exportInventoryData } = result.current;

      // 先创建一些数据
      const newInventoryParams: CreateInventoryItemParams = {
        productId: 'PRD001',
        locationId: 'LOC001',
        initialStock: 100,
        minStock: 20,
        maxStock: 500,
        safeStock: 30,
        averageCost: 15.50,
      };

      await act(async () => {
        await createInventoryItem(newInventoryParams);
      });

      // 测试导出
      await act(async () => {
        const exportedData = await exportInventoryData();
        expect(exportedData).toBeDefined();
        expect(exportedData.type).toBe('inventory_export');
        expect(exportedData.data).toBeDefined();
        expect(exportedData.timestamp).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理不存在的库存项ID', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { fetchInventoryById } = result.current;

      await act(async () => {
        await expect(fetchInventoryById('non-existent-id')).rejects.toThrow();
      });
    });

    it('应该处理无效的操作参数', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryOperation } = result.current;

      const invalidParams = {
        inventoryItemId: 'non-existent-id',
        operationType: InventoryOperationType.STOCK_IN,
        quantity: 50,
        unitPrice: 15.50,
        reason: '测试',
      } as InventoryOperationParams;

      await act(async () => {
        await expect(createInventoryOperation(invalidParams)).rejects.toThrow();
      });
    });
  });

  describe('数据持久化', () => {
    it('应该能够持久化数据到 localStorage', async () => {
      const { result } = renderHook(() => useInventoryStore());
      const { createInventoryItem } = result.current;

      const newInventoryParams: CreateInventoryItemParams = {
        productId: 'PRD001',
        locationId: 'LOC001',
        initialStock: 100,
        minStock: 20,
        maxStock: 500,
        safeStock: 30,
        averageCost: 15.50,
      };

      await act(async () => {
        await createInventoryItem(newInventoryParams);
      });

      // 验证 localStorage.setItem 被调用
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('应该能够从 localStorage 恢复数据', () => {
      // 模拟 localStorage 中的数据
      const mockData = {
        state: {
          inventoryItems: [{
            id: 'test-id',
            productCode: 'PRD001',
            productId: 'PRD001',
            productName: '测试商品',
            currentStock: 100,
            minStock: 20,
            maxStock: 500,
            status: InventoryStatus.IN_STOCK,
          }],
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      // 重新初始化 store
      const { result } = renderHook(() => useInventoryStore());
      const { inventoryItems } = result.current;

      expect(inventoryItems).toHaveLength(1);
      expect(inventoryItems[0].productCode).toBe('PRD001');
    });
  });
});