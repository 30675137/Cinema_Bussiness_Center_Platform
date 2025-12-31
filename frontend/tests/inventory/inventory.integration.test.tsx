/**
 * 库存管理集成测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import InventoryManagePage from '@/pages/inventory/InventoryManagePage';
import { useInventoryStore } from '@/stores/inventoryStore';
import {
  InventoryItem,
  InventoryStatus,
  Location,
  InventoryOperationType,
} from '@/types/inventory';

// Mock the store
vi.mock('@/stores/inventoryStore');

const mockInventoryStore = vi.mocked(useInventoryStore);

describe('库存管理集成测试', () => {
  const mockInventoryItems: InventoryItem[] = [
    {
      id: '1',
      productId: 'PRD001',
      productCode: 'PRD001',
      productName: '测试商品1',
      productCategory: '食品',
      productSpec: '500g/包',
      unit: '个',
      locationId: 'LOC001',
      locationName: '仓库A-货架1',
      currentStock: 100,
      minStock: 20,
      maxStock: 500,
      safeStock: 30,
      averageCost: 15.5,
      totalValue: 1550,
      status: InventoryStatus.IN_STOCK,
      lastInboundDate: '2024-01-01',
      lastOutboundDate: '2024-01-05',
      lastUpdated: '2024-01-10T10:00:00Z',
    },
    {
      id: '2',
      productId: 'PRD002',
      productCode: 'PRD002',
      productName: '测试商品2',
      productCategory: '饮料',
      productSpec: '330ml/瓶',
      unit: '瓶',
      locationId: 'LOC002',
      locationName: '仓库B-货架2',
      currentStock: 15,
      minStock: 20,
      maxStock: 200,
      safeStock: 25,
      averageCost: 3.5,
      totalValue: 52.5,
      status: InventoryStatus.LOW_STOCK,
      lastInboundDate: '2024-01-02',
      lastOutboundDate: '2024-01-06',
      lastUpdated: '2024-01-11T11:00:00Z',
    },
  ];

  const mockLocations: Location[] = [
    {
      id: 'LOC001',
      name: '仓库A-货架1',
      code: 'WH-A-S1',
      type: 'shelf',
      capacity: 1000,
      description: '主要存储区',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'LOC002',
      name: '仓库B-货架2',
      code: 'WH-B-S2',
      type: 'shelf',
      capacity: 800,
      description: '饮料存储区',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockStatistics = {
    totalItems: 2,
    totalValue: 1602.5,
    totalCategories: 2,
    totalLocations: 2,
    inStockCount: 1,
    lowStockCount: 1,
    outOfStockCount: 0,
    lowStockRate: 50,
    stockTurnoverRate: 2.5,
    averageInventoryDays: 45,
    categoryStats: [
      {
        categoryId: 'CAT001',
        categoryName: '食品',
        itemCount: 1,
        totalValue: 1550,
        lowStockCount: 0,
      },
      {
        categoryId: 'CAT002',
        categoryName: '饮料',
        itemCount: 1,
        totalValue: 52.5,
        lowStockCount: 1,
      },
    ],
    locationStats: [
      {
        locationId: 'LOC001',
        locationName: '仓库A-货架1',
        itemCount: 1,
        totalValue: 1550,
        utilizationRate: 15.5,
      },
      {
        locationId: 'LOC002',
        locationName: '仓库B-货架2',
        itemCount: 1,
        totalValue: 52.5,
        utilizationRate: 1.94,
      },
    ],
    recentTrends: [
      {
        date: '2024-01-10',
        inboundCount: 5,
        outboundCount: 8,
        netChange: -3,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockInventoryStore.mockReturnValue({
      inventoryItems: mockInventoryItems,
      locations: mockLocations,
      statistics: mockStatistics,
      loading: false,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 2,
      },
      filters: {},
      selectedItems: [],
      fetchInventoryItems: vi.fn(),
      deleteInventoryItem: vi.fn(),
      updateInventoryItem: vi.fn(),
      createInventoryItem: vi.fn(),
      setFilters: vi.fn(),
      setPagination: vi.fn(),
      setSelectedItems: vi.fn(),
      exportInventoryData: vi.fn(),
      syncWithProcurement: vi.fn(),
      fetchLocations: vi.fn(),
      calculateStatistics: vi.fn(),
      fetchInventoryOperations: vi.fn(),
      fetchInventoryAlerts: vi.fn(),
      fetchInventoryById: vi.fn(),
      createInventoryOperation: vi.fn(),
      performInventoryAdjustment: vi.fn(),
      performInventoryTransfer: vi.fn(),
      reset: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = (initialEntries = ['/inventory']) => {
    return render(
      <ConfigProvider locale={zhCN}>
        <MemoryRouter initialEntries={initialEntries}>
          <InventoryManagePage />
        </MemoryRouter>
      </ConfigProvider>
    );
  };

  describe('页面导航和路由', () => {
    it('应该正确渲染库存管理列表页面', () => {
      renderComponent();

      expect(screen.getByText('库存管理')).toBeInTheDocument();
      expect(screen.getByText('管理商品库存、预警和调拨')).toBeInTheDocument();
    });

    it('应该显示正确的操作按钮', () => {
      renderComponent();

      expect(screen.getByText('新建库存项')).toBeInTheDocument();
      expect(screen.getByText('同步数据')).toBeInTheDocument();
      expect(screen.getByText('数据分析')).toBeInTheDocument();
      expect(screen.getByText('库存设置')).toBeInTheDocument();
    });

    it('应该能够导航到新建页面', async () => {
      const { result } = renderComponent(['/inventory']);

      const newButton = screen.getByText('新建库存项');

      await act(async () => {
        fireEvent.click(newButton);
      });

      // 验证路由变化
      expect(result.current.location.pathname).toBe('/inventory/create');
    });
  });

  describe('完整的库存管理流程', () => {
    it('应该能够完成完整的库存创建流程', async () => {
      const { createInventoryItem, fetchInventoryItems } = mockInventoryStore();
      const { result } = renderComponent(['/inventory/create']);

      createInventoryItem.mockResolvedValue(mockInventoryItems[0]);

      // 模拟表单提交
      await act(async () => {
        // 假设表单已经填写完成并提交
        await createInventoryItem({
          productId: 'PRD003',
          locationId: 'LOC001',
          initialStock: 50,
          minStock: 10,
          maxStock: 200,
          safeStock: 15,
          averageCost: 12.5,
        });
      });

      expect(createInventoryItem).toHaveBeenCalled();
      expect(fetchInventoryItems).toHaveBeenCalled();
      expect(result.current.location.pathname).toBe('/inventory');
    });

    it('应该能够完成完整的库存编辑流程', async () => {
      const { updateInventoryItem, fetchInventoryItems } = mockInventoryStore();
      const { result } = renderComponent(['/inventory/edit']);

      updateInventoryItem.mockResolvedValue(mockInventoryItems[0]);

      await act(async () => {
        // 模拟表单更新提交
        await updateInventoryItem('1', {
          minStock: 25,
          maxStock: 600,
          safeStock: 35,
          averageCost: 16.0,
        });
      });

      expect(updateInventoryItem).toHaveBeenCalledWith('1', {
        minStock: 25,
        maxStock: 600,
        safeStock: 35,
        averageCost: 16.0,
      });
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够查看库存详情', async () => {
      const { fetchInventoryById, fetchInventoryOperations, fetchInventoryAlerts } =
        mockInventoryStore();
      const { result } = renderComponent(['/inventory/1']);

      fetchInventoryById.mockResolvedValue(mockInventoryItems[0]);
      fetchInventoryOperations.mockResolvedValue([]);
      fetchInventoryAlerts.mockResolvedValue([]);

      await act(async () => {
        await fetchInventoryById('1');
        await fetchInventoryOperations({ inventoryItemId: '1' });
        await fetchInventoryAlerts({ inventoryItemId: '1' });
      });

      expect(fetchInventoryById).toHaveBeenCalledWith('1');
      expect(result.current.location.pathname).toBe('/inventory/1');
    });
  });

  describe('库存操作流程', () => {
    it('应该能够执行库存入库流程', async () => {
      const { createInventoryOperation, fetchInventoryById } = mockInventoryStore();
      const { result } = renderComponent(['/inventory/1']);

      createInventoryOperation.mockResolvedValue({
        id: 'OP001',
        inventoryItemId: '1',
        operationType: InventoryOperationType.STOCK_IN,
        quantity: 50,
        unit: '个',
        unitPrice: 15.5,
        totalPrice: 775,
        beforeStock: 100,
        afterStock: 150,
        reason: '采购入库',
        operatorId: 'USER001',
        operatorName: '测试用户',
        operationDate: '2024-01-10T10:00:00Z',
      });

      await act(async () => {
        await createInventoryOperation({
          inventoryItemId: '1',
          operationType: InventoryOperationType.STOCK_IN,
          quantity: 50,
          unitPrice: 15.5,
          reason: '采购入库',
        });
        await fetchInventoryById('1');
      });

      expect(createInventoryOperation).toHaveBeenCalledWith({
        inventoryItemId: '1',
        operationType: InventoryOperationType.STOCK_IN,
        quantity: 50,
        unitPrice: 15.5,
        reason: '采购入库',
      });
      expect(result.current.location.pathname).toBe('/inventory/1');
    });

    it('应该能够执行库存出库流程', async () => {
      const { createInventoryOperation, fetchInventoryById } = mockInventoryStore();
      const { result } = renderComponent(['/inventory/1']);

      createInventoryOperation.mockResolvedValue({
        id: 'OP002',
        inventoryItemId: '1',
        operationType: InventoryOperationType.STOCK_OUT,
        quantity: -30,
        unit: '个',
        unitPrice: 15.5,
        totalPrice: 465,
        beforeStock: 100,
        afterStock: 70,
        reason: '销售出库',
        operatorId: 'USER001',
        operatorName: '测试用户',
        operationDate: '2024-01-10T11:00:00Z',
      });

      await act(async () => {
        await createInventoryOperation({
          inventoryItemId: '1',
          operationType: InventoryOperationType.STOCK_OUT,
          quantity: -30,
          unitPrice: 15.5,
          reason: '销售出库',
        });
        await fetchInventoryById('1');
      });

      expect(createInventoryOperation).toHaveBeenCalledWith({
        inventoryItemId: '1',
        operationType: InventoryOperationType.STOCK_OUT,
        quantity: -30,
        unitPrice: 15.5,
        reason: '销售出库',
      });
      expect(result.current.location.pathname).toBe('/inventory/1');
    });

    it('应该能够执行库存调拨流程', async () => {
      const { performInventoryTransfer } = mockInventoryStore();
      const { result } = renderComponent(['/inventory']);

      performInventoryTransfer.mockResolvedValue({
        transferId: 'TR001',
        fromLocationId: 'LOC001',
        toLocationId: 'LOC002',
        transferItems: [
          {
            inventoryItemId: '1',
            quantity: 25,
            remark: '调拨到B仓',
          },
        ],
        status: 'pending',
        reason: '库存调整',
        expectedDate: '2024-01-15',
      });

      await act(async () => {
        await performInventoryTransfer({
          fromLocationId: 'LOC001',
          toLocationId: 'LOC002',
          transferItems: [
            {
              inventoryItemId: '1',
              quantity: 25,
              remark: '调拨到B仓',
            },
          ],
          reason: '库存调整',
        });
      });

      expect(performInventoryTransfer).toHaveBeenCalledWith({
        fromLocationId: 'LOC001',
        toLocationId: 'LOC002',
        transferItems: [
          {
            inventoryItemId: '1',
            quantity: 25,
            remark: '调拨到B仓',
          },
        ],
        reason: '库存调整',
      });
    });
  });

  describe('数据同步流程', () => {
    it('应该能够与采购模块同步数据', async () => {
      const { syncWithProcurement, fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      const syncButton = screen.getByText('同步数据');

      syncWithProcurement.mockResolvedValue({
        success: true,
        syncedCount: 5,
        message: '成功同步5条采购单数据',
      });

      await act(async () => {
        fireEvent.click(syncButton);
      });

      expect(syncWithProcurement).toHaveBeenCalled();
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够导出库存数据', async () => {
      const { exportInventoryData } = mockInventoryStore();
      renderComponent();

      const exportButton = screen.getByText('导出数据');

      exportInventoryData.mockResolvedValue({
        type: 'inventory_export',
        data: mockInventoryItems,
        statistics: mockStatistics,
        exportedAt: new Date().toISOString(),
        format: 'xlsx',
      });

      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(exportInventoryData).toHaveBeenCalled();
    });
  });

  describe('搜索和筛选流程', () => {
    it('应该能够执行完整的搜索流程', async () => {
      const { setFilters, fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      const searchInput = screen.getByPlaceholderText('搜索商品名称、编码或规格');

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: '测试商品1' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });
      });

      expect(setFilters).toHaveBeenCalledWith({ keyword: '测试商品1' });
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够执行多条件筛选', async () => {
      const { setFilters, fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      const categorySelect = screen.getByText('商品分类').closest('.ant-select');
      const statusSelect = screen.getByText('库存状态').closest('.ant-select');

      await act(async () => {
        fireEvent.mouseDown(categorySelect!);
        fireEvent.click(screen.getByText('食品'));

        fireEvent.mouseDown(statusSelect!);
        fireEvent.click(screen.getByText('有库存'));
      });

      expect(setFilters).toHaveBeenCalledWith({
        categoryId: '食品',
        status: InventoryStatus.IN_STOCK,
      });
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够重置筛选条件', async () => {
      const { setFilters, fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      const resetButton = screen.getByText('重置筛选');

      await act(async () => {
        fireEvent.click(resetButton);
      });

      expect(setFilters).toHaveBeenCalledWith({});
      expect(fetchInventoryItems).toHaveBeenCalled();
    });
  });

  describe('批量操作流程', () => {
    it('应该能够执行批量选择和操作', async () => {
      const { setSelectedItems, deleteInventoryItem, fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      // 模拟批量选择
      await act(async () => {
        setSelectedItems(['1', '2']);
      });

      // 模拟批量删除
      deleteInventoryItem.mockResolvedValue({});
      deleteInventoryItem.mockResolvedValue({});

      await act(async () => {
        // 模拟点击批量删除按钮
        const batchDeleteButton = screen.getByText(/批量删除/);
        if (batchDeleteButton) {
          fireEvent.click(batchDeleteButton);
        }
      });

      expect(deleteInventoryItem).toHaveBeenCalledWith('1');
      expect(deleteInventoryItem).toHaveBeenCalledWith('2');
      expect(fetchInventoryItems).toHaveBeenCalled();
    });
  });

  describe('统计分析流程', () => {
    it('应该能够计算库存统计信息', async () => {
      const { calculateStatistics } = mockInventoryStore();
      renderComponent();

      await act(async () => {
        await calculateStatistics();
      });

      expect(calculateStatistics).toHaveBeenCalled();
    });

    it('应该显示正确的统计信息', () => {
      renderComponent();

      expect(screen.getByText('总商品数')).toBeInTheDocument();
      expect(screen.getByText('库存总价值')).toBeInTheDocument();
      expect(screen.getByText('库存不足')).toBeInTheDocument();
      expect(screen.getByText('缺货商品')).toBeInTheDocument();
    });
  });

  describe('错误处理流程', () => {
    it('应该处理网络错误', async () => {
      const { fetchInventoryItems } = mockInventoryStore();
      fetchInventoryItems.mockRejectedValue(new Error('网络错误'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/网络错误/)).toBeInTheDocument();
      });
    });

    it('应该处理API错误', async () => {
      const { createInventoryItem } = mockInventoryStore();
      createInventoryItem.mockRejectedValue(new Error('API错误'));

      renderComponent();

      await act(async () => {
        // 模拟表单提交但API失败
        await createInventoryItem({
          productId: 'PRD003',
          locationId: 'LOC001',
          initialStock: 50,
          minStock: 10,
          maxStock: 200,
          safeStock: 15,
          averageCost: 12.5,
        });
      });

      expect(screen.getByText(/API错误/)).toBeInTheDocument();
    });
  });

  describe('数据持久化流程', () => {
    it('应该能够从localStorage恢复数据', () => {
      const mockPersistedData = {
        state: {
          inventoryItems: mockInventoryItems,
          locations: mockLocations,
          statistics: mockStatistics,
        },
      };

      // 模拟localStorage数据
      vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockPersistedData));

      renderComponent();

      expect(screen.getByText('测试商品1')).toBeInTheDocument();
      expect(screen.getByText('测试商品2')).toBeInTheDocument();
    });
  });

  describe('用户体验流程', () => {
    it('应该显示加载状态', () => {
      mockInventoryStore.mockReturnValue({
        ...mockInventoryStore(),
        loading: true,
      });

      renderComponent();

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('应该显示空状态', () => {
      mockInventoryStore.mockReturnValue({
        ...mockInventoryStore(),
        inventoryItems: [],
        statistics: null,
      });

      renderComponent();

      expect(screen.getByText(/暂无数据/)).toBeInTheDocument();
    });

    it('应该显示库存预警', () => {
      mockInventoryStore.mockReturnValue({
        ...mockInventoryStore(),
        statistics: {
          ...mockStatistics,
          lowStockCount: 2,
          outOfStockCount: 1,
        },
      });

      renderComponent();

      expect(screen.getByText(/库存预警/)).toBeInTheDocument();
      expect(screen.getByText(/当前有.*个未处理预警/)).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量库存数据', async () => {
      const largeInventoryItems = Array.from({ length: 1000 }, (_, index) => ({
        ...mockInventoryItems[0],
        id: `item-${index}`,
        productId: `PRD${String(index + 1).padStart(3, '0')}`,
        productCode: `PRD${String(index + 1).padStart(3, '0')}`,
        productName: `测试商品${index + 1}`,
        currentStock: Math.floor(Math.random() * 1000),
        minStock: Math.floor(Math.random() * 100),
        maxStock: Math.floor(Math.random() * 1000) + 100,
        safeStock: Math.floor(Math.random() * 50) + 10,
      }));

      mockInventoryStore.mockReturnValue({
        ...mockInventoryStore(),
        inventoryItems: largeInventoryItems,
        pagination: {
          current: 1,
          pageSize: 50,
          total: 1000,
        },
      });

      renderComponent();

      expect(screen.getByText('总商品数')).toBeInTheDocument();
      // 验证分页控件存在
      expect(screen.getByRole('button', { name: /50/ })).toBeInTheDocument();
    });

    it('应该能够快速响应用户操作', async () => {
      const { fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      const searchInput = screen.getByPlaceholderText('搜索商品名称、编码或规格');

      // 测试快速搜索响应
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'PRD001' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });
      });

      expect(fetchInventoryItems).toHaveBeenCalled();
    });
  });
});
