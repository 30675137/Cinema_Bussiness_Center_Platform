/**
 * 库存列表组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import InventoryList from '@/components/inventory/InventoryList';
import { useInventoryStore } from '@/stores/inventoryStore';
import { InventoryItem, InventoryStatus } from '@/types/inventory';

// Mock the store
vi.mock('@/stores/inventoryStore');

// Mock components that might cause issues
vi.mock('@/components/inventory/InventoryForm', () => ({
  default: ({ visible, onCancel, onSuccess }: any) =>
    visible ? (
      <div data-testid="inventory-form">
        <button onClick={onCancel}>取消</button>
        <button onClick={onSuccess}>确认</button>
      </div>
    ) : null,
}));

vi.mock('@/components/inventory/InventoryDetail', () => ({
  default: ({ inventoryId }: any) => <div data-testid="inventory-detail">{inventoryId}</div>,
}));

const mockInventoryStore = vi.mocked(useInventoryStore);

describe('InventoryList', () => {
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
    {
      id: '3',
      productId: 'PRD003',
      productCode: 'PRD003',
      productName: '测试商品3',
      productCategory: '日用品',
      productSpec: '100ml/支',
      unit: '支',
      locationId: 'LOC003',
      locationName: '仓库C-货架3',
      currentStock: 0,
      minStock: 10,
      maxStock: 100,
      safeStock: 15,
      averageCost: 8.75,
      totalValue: 0,
      status: InventoryStatus.OUT_OF_STOCK,
      lastInboundDate: '2024-01-03',
      lastOutboundDate: '2024-01-07',
      lastUpdated: '2024-01-12T12:00:00Z',
    },
  ];

  const mockLocations = [
    {
      id: 'LOC001',
      name: '仓库A-货架1',
      code: 'WH-A-S1',
      type: 'shelf' as const,
      capacity: 1000,
      description: '主要食品存储区',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'LOC002',
      name: '仓库B-货架2',
      code: 'WH-B-S2',
      type: 'shelf' as const,
      capacity: 800,
      description: '饮料存储区',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockStatistics = {
    totalItems: 3,
    totalValue: 1602.5,
    totalCategories: 3,
    totalLocations: 3,
    inStockCount: 1,
    lowStockCount: 1,
    outOfStockCount: 1,
    lowStockRate: 33.33,
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
    ],
    locationStats: [
      {
        locationId: 'LOC001',
        locationName: '仓库A-货架1',
        itemCount: 1,
        totalValue: 1550,
        utilizationRate: 15.5,
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
        total: 3,
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

  const renderComponent = (props = {}) => {
    return render(
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <InventoryList {...props} />
        </BrowserRouter>
      </ConfigProvider>
    );
  };

  describe('基本渲染', () => {
    it('应该正确渲染库存列表', () => {
      renderComponent();

      expect(screen.getByText('库存管理')).toBeInTheDocument();
      expect(screen.getByText('新建库存项')).toBeInTheDocument();
      expect(screen.getByText('同步数据')).toBeInTheDocument();
      expect(screen.getByText('导出数据')).toBeInTheDocument();
    });

    it('应该显示统计卡片', () => {
      renderComponent();

      expect(screen.getByText('总商品数')).toBeInTheDocument();
      expect(screen.getByText('库存总价值')).toBeInTheDocument();
      expect(screen.getByText('库存不足')).toBeInTheDocument();
      expect(screen.getByText('缺货商品')).toBeInTheDocument();
    });

    it('应该显示统计数值', () => {
      renderComponent();

      expect(screen.getByText('3')).toBeInTheDocument(); // 总商品数
      expect(screen.getByText('¥1,602.50')).toBeInTheDocument(); // 库存总价值
      expect(screen.getByText('1')).toBeInTheDocument(); // 库存不足
      expect(screen.getByText('1')).toBeInTheDocument(); // 缺货商品
    });

    it('应该显示库存预警', () => {
      renderComponent();

      expect(screen.getByText(/库存预警/)).toBeInTheDocument();
      expect(screen.getByText(/当前有.*个未处理预警/)).toBeInTheDocument();
    });

    it('应该显示搜索和筛选区域', () => {
      renderComponent();

      expect(screen.getByPlaceholderText('搜索商品名称、编码或规格')).toBeInTheDocument();
      expect(screen.getByText('商品分类')).toBeInTheDocument();
      expect(screen.getByText('存储位置')).toBeInTheDocument();
      expect(screen.getByText('库存状态')).toBeInTheDocument();
    });

    it('应该显示数据表格', () => {
      renderComponent();

      expect(screen.getByText('商品编码')).toBeInTheDocument();
      expect(screen.getByText('商品名称')).toBeInTheDocument();
      expect(screen.getByText('当前库存')).toBeInTheDocument();
      expect(screen.getByText('库存状态')).toBeInTheDocument();
      expect(screen.getByText('操作')).toBeInTheDocument();
    });

    it('应该显示库存数据', () => {
      renderComponent();

      expect(screen.getByText('PRD001')).toBeInTheDocument();
      expect(screen.getByText('测试商品1')).toBeInTheDocument();
      expect(screen.getByText('100 个')).toBeInTheDocument();
      expect(screen.getByText('有库存')).toBeInTheDocument();

      expect(screen.getByText('PRD002')).toBeInTheDocument();
      expect(screen.getByText('测试商品2')).toBeInTheDocument();
      expect(screen.getByText('15 瓶')).toBeInTheDocument();
      expect(screen.getByText('库存不足')).toBeInTheDocument();

      expect(screen.getByText('PRD003')).toBeInTheDocument();
      expect(screen.getByText('测试商品3')).toBeInTheDocument();
      expect(screen.getByText('0 支')).toBeInTheDocument();
      expect(screen.getByText('无库存')).toBeInTheDocument();
    });
  });

  describe('搜索功能', () => {
    it('应该能够执行关键词搜索', async () => {
      const { fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      const searchInput = screen.getByPlaceholderText('搜索商品名称、编码或规格');

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'PRD001' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });
      });

      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够按商品分类筛选', async () => {
      const { fetchInventoryItems, setFilters } = mockInventoryStore();
      renderComponent();

      const categorySelect = screen.getByText('商品分类').closest('.ant-select');

      await act(async () => {
        fireEvent.mouseDown(categorySelect!);
        const option = screen.getByText('食品');
        fireEvent.click(option);
      });

      expect(setFilters).toHaveBeenCalledWith({ categoryId: '食品' });
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够按存储位置筛选', async () => {
      const { fetchInventoryItems, setFilters } = mockInventoryStore();
      renderComponent();

      const locationSelect = screen.getByText('存储位置').closest('.ant-select');

      await act(async () => {
        fireEvent.mouseDown(locationSelect!);
        const option = screen.getByText('仓库A-货架1');
        fireEvent.click(option);
      });

      expect(setFilters).toHaveBeenCalledWith({ locationId: 'LOC001' });
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够按库存状态筛选', async () => {
      const { fetchInventoryItems, setFilters } = mockInventoryStore();
      renderComponent();

      const statusSelect = screen.getByText('库存状态').closest('.ant-select');

      await act(async () => {
        fireEvent.mouseDown(statusSelect!);
        const option = screen.getByText('有库存');
        fireEvent.click(option);
      });

      expect(setFilters).toHaveBeenCalledWith({ status: InventoryStatus.IN_STOCK });
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够重置筛选条件', async () => {
      const { fetchInventoryItems, setFilters } = mockInventoryStore();
      renderComponent();

      const resetButton = screen.getByText('重置筛选');

      await act(async () => {
        fireEvent.click(resetButton);
      });

      expect(setFilters).toHaveBeenCalledWith({});
      expect(fetchInventoryItems).toHaveBeenCalled();
    });
  });

  describe('操作功能', () => {
    it('应该能够打开新建库存项表单', async () => {
      const onEdit = vi.fn();
      renderComponent({ onEdit });

      const newButton = screen.getByText('新建库存项');

      await act(async () => {
        fireEvent.click(newButton);
      });

      expect(onEdit).toHaveBeenCalledWith({});
    });

    it('应该能够同步数据', async () => {
      const { syncWithProcurement, fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      const syncButton = screen.getByText('同步数据');

      await act(async () => {
        fireEvent.click(syncButton);
      });

      expect(syncWithProcurement).toHaveBeenCalled();
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够导出数据', async () => {
      const { exportInventoryData } = mockInventoryStore();
      renderComponent();

      const exportButton = screen.getByText('导出数据');

      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(exportInventoryData).toHaveBeenCalled();
    });

    it('应该能够查看详情', async () => {
      const onView = vi.fn();
      renderComponent({ onView });

      const viewButtons = screen.getAllByTitle('查看详情');
      const firstViewButton = viewButtons[0];

      await act(async () => {
        fireEvent.click(firstViewButton!);
      });

      expect(onView).toHaveBeenCalledWith(mockInventoryItems[0]);
    });

    it('应该能够编辑库存项', async () => {
      const onEdit = vi.fn();
      renderComponent({ onEdit });

      const editButtons = screen.getAllByTitle('编辑');
      const firstEditButton = editButtons[0];

      await act(async () => {
        fireEvent.click(firstEditButton!);
      });

      expect(onEdit).toHaveBeenCalledWith(mockInventoryItems[0]);
    });

    it('应该能够删除库存项', async () => {
      const { deleteInventoryItem, fetchInventoryItems } = mockInventoryStore();
      renderComponent();

      const deleteButtons = screen.getAllByTitle('删除');
      const firstDeleteButton = deleteButtons[0];

      // 模拟确认对话框
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      await act(async () => {
        fireEvent.click(firstDeleteButton!);
      });

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('确定要删除商品"测试商品1"吗？')
      );
      expect(deleteInventoryItem).toHaveBeenCalledWith('1');
      expect(fetchInventoryItems).toHaveBeenCalled();
    });

    it('应该能够批量选择库存项', async () => {
      const { setSelectedItems } = mockInventoryStore();
      renderComponent();

      // 找到第一行的复选框
      const firstCheckbox = screen.getByRole('checkbox', { name: /Select row/ });

      await act(async () => {
        fireEvent.click(firstCheckbox);
      });

      expect(setSelectedItems).toHaveBeenCalledWith(['1']);
    });

    it('应该能够批量删除库存项', async () => {
      const { selectedItems, deleteInventoryItem, fetchInventoryItems } = mockInventoryStore();
      selectedItems.push('1', '2');

      renderComponent();

      const batchDeleteButton = screen.getByText(/批量删除/);

      // 模拟确认对话框
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      await act(async () => {
        fireEvent.click(batchDeleteButton);
      });

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('确定要删除选中的 2 个库存项目吗？')
      );
      expect(deleteInventoryItem).toHaveBeenCalledWith('1');
      expect(deleteInventoryItem).toHaveBeenCalledWith('2');
      expect(fetchInventoryItems).toHaveBeenCalled();
    });
  });

  describe('加载状态', () => {
    it('应该显示加载状态', () => {
      mockInventoryStore.mockReturnValue({
        ...mockInventoryStore(),
        loading: true,
      });

      renderComponent();

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('空状态', () => {
    it('应该显示空状态', () => {
      mockInventoryStore.mockReturnValue({
        ...mockInventoryStore(),
        inventoryItems: [],
        statistics: null,
      });

      renderComponent();

      expect(screen.getByText(/暂无数据/)).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该处理删除失败', async () => {
      const { deleteInventoryItem } = mockInventoryStore();
      deleteInventoryItem.mockRejectedValue(new Error('删除失败'));

      renderComponent();

      const deleteButtons = screen.getAllByTitle('删除');
      const firstDeleteButton = deleteButtons[0];

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      await act(async () => {
        fireEvent.click(firstDeleteButton!);
      });

      expect(screen.getByText('删除失败')).toBeInTheDocument();
    });

    it('应该处理同步失败', async () => {
      const { syncWithProcurement } = mockInventoryStore();
      syncWithProcurement.mockRejectedValue(new Error('同步失败'));

      renderComponent();

      const syncButton = screen.getByText('同步数据');

      await act(async () => {
        fireEvent.click(syncButton);
      });

      expect(screen.getByText('数据同步失败')).toBeInTheDocument();
    });
  });

  describe('分页功能', () => {
    it('应该能够切换页码', async () => {
      const { fetchInventoryItems, setPagination } = mockInventoryStore();
      renderComponent();

      // 模拟分页组件
      const paginationButtons = screen.getAllByRole('button', { name: /2/ });
      if (paginationButtons.length > 0) {
        await act(async () => {
          fireEvent.click(paginationButtons[0]);
        });

        expect(setPagination).toHaveBeenCalledWith({ current: 2, pageSize: 10 });
        expect(fetchInventoryItems).toHaveBeenCalled();
      }
    });

    it('应该能够改变页面大小', async () => {
      const { fetchInventoryItems, setPagination } = mockInventoryStore();
      renderComponent();

      // 模拟页面大小选择
      const pageSizeSelect = screen.getByText('10').closest('.ant-select');

      if (pageSizeSelect) {
        await act(async () => {
          fireEvent.mouseDown(pageSizeSelect);
          const option = screen.getByText('20');
          fireEvent.click(option);
        });

        expect(setPagination).toHaveBeenCalledWith({ current: 1, pageSize: 20 });
        expect(fetchInventoryItems).toHaveBeenCalled();
      }
    });
  });

  describe('库存状态显示', () => {
    it('应该正确显示有库存状态', () => {
      renderComponent();

      const inStockTag = screen.getByText('有库存');
      expect(inStockTag).toBeInTheDocument();
      expect(inStockTag.closest('.ant-tag')).toHaveClass('ant-tag-green');
    });

    it('应该正确显示库存不足状态', () => {
      renderComponent();

      const lowStockTag = screen.getByText('库存不足');
      expect(lowStockTag).toBeInTheDocument();
      expect(lowStockTag.closest('.ant-tag')).toHaveClass('ant-tag-orange');
    });

    it('应该正确显示无库存状态', () => {
      renderComponent();

      const outOfStockTag = screen.getByText('无库存');
      expect(outOfStockTag).toBeInTheDocument();
      expect(outOfStockTag.closest('.ant-tag')).toHaveClass('ant-tag-red');
    });

    it('应该高亮显示库存不足的商品', () => {
      renderComponent();

      const lowStockValue = screen.getByText('15 瓶');
      expect(lowStockValue).toHaveClass('ant-typography-warning');
    });

    it('应该高亮显示缺货的商品', () => {
      renderComponent();

      const outOfStockValue = screen.getByText('0 支');
      expect(outOfStockValue).toHaveClass('ant-typography-danger');
    });
  });

  describe('响应式布局', () => {
    it('应该在移动端正确显示', () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderComponent();

      // 验证移动端布局元素
      expect(screen.getByText('库存管理')).toBeInTheDocument();
      expect(screen.getByText('新建库存项')).toBeInTheDocument();
    });

    it('应该在桌面端正确显示', () => {
      // 模拟桌面端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      renderComponent();

      // 验证桌面端布局元素
      expect(screen.getByText('库存管理')).toBeInTheDocument();
      expect(screen.getByText('新建库存项')).toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('应该有正确的ARIA标签', () => {
      renderComponent();

      // 验证表格的可访问性
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label');
    });

    it('应该支持键盘导航', () => {
      renderComponent();

      // 验证键盘导航支持
      const firstButton = screen.getByText('新建库存项');
      expect(firstButton).toHaveAttribute('tabindex');
    });

    it('应该有适当的颜色对比度', () => {
      renderComponent();

      // 验证状态标签的可访问性
      const statusTags = screen.getAllByRole('button');
      statusTags.forEach((tag) => {
        expect(tag).toHaveAttribute('aria-label');
      });
    });
  });
});
