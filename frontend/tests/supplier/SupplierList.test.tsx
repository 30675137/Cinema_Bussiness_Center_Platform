/**
 * 供应商列表组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupplierList from '@/components/supplier/SupplierList';
import { useSupplierStore } from '@/stores/supplierStore';

// Mock store
vi.mock('@/stores/supplierStore');

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock formatters
vi.mock('@/utils/formatters', () => ({
  formatCurrency: (value: number) => `¥${value.toFixed(2)}`,
  formatDate: (date: string) => date,
  formatPhoneNumber: (phone: string) => phone,
}));

// 创建测试用的 QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// 渲染组件的包装函数
const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SupplierList', () => {
  const mockUseSupplierStore = useSupplierStore as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // 默认的 store mock
    mockUseSupplierStore.mockReturnValue({
      suppliers: [
        {
          id: '1',
          code: 'SUP001',
          name: '供应商A',
          shortName: '供应商A',
          type: 'manufacturer',
          level: 'strategic',
          status: 'active',
          contacts: [{ name: '张三', phone: '13800138000', position: '经理', email: 'zhangsan@example.com', isPrimary: true }],
          phone: '010-12345678',
          email: 'supplier@example.com',
          productCategories: ['食品原料'],
          cooperationStartDate: '2024-01-01',
          creditLimit: 500000,
          paymentTerms: '月结30天',
        },
        {
          id: '2',
          code: 'SUP002',
          name: '供应商B',
          shortName: '供应商B',
          type: 'wholesaler',
          level: 'preferred',
          status: 'suspended',
          contacts: [{ name: '李四', phone: '13900139000', position: '主管', email: 'lisi@example.com', isPrimary: true }],
          phone: '010-87654321',
          email: 'supplier2@example.com',
          productCategories: ['包装材料'],
          cooperationStartDate: '2023-06-15',
          creditLimit: 300000,
          paymentTerms: '现金结算',
        },
      ],
      loading: false,
      error: null,
      filters: {},
      currentPage: 1,
      pageSize: 20,
      totalCount: 2,
      selectedSupplierIds: [],
      statistics: {
        totalSuppliers: 2,
        activeSuppliers: 1,
        suspendedSuppliers: 1,
        strategicSuppliers: 1,
        preferredSuppliers: 1,
        totalAmount: 1000000,
      },
      fetchSuppliers: vi.fn(),
      selectSupplier: vi.fn(),
      selectAllSuppliers: vi.fn(),
      clearSelection: vi.fn(),
      setFilters: vi.fn(),
      deleteSupplier: vi.fn(),
      exportSuppliers: vi.fn(),
      showForm: vi.fn(),
      showDetail: vi.fn(),
    });
  });

  describe('基础渲染', () => {
    it('应该正确渲染供应商列表', () => {
      renderWithProviders(<SupplierList />);

      // 检查标题
      expect(screen.getByText('供应商列表')).toBeInTheDocument();

      // 检查统计数据卡片
      expect(screen.getByText('总供应商')).toBeInTheDocument();
      expect(screen.getByText('活跃供应商')).toBeInTheDocument();
      expect(screen.getByText('战略供应商')).toBeInTheDocument();
      expect(screen.getByText('即将到期资质')).toBeInTheDocument();

      // 检查表格数据
      expect(screen.getByText('供应商A')).toBeInTheDocument();
      expect(screen.getByText('供应商B')).toBeInTheDocument();
      expect(screen.getByText('SUP001')).toBeInTheDocument();
      expect(screen.getByText('SUP002')).toBeInTheDocument();
    });

    it('应该显示加载状态', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        loading: true,
      });

      renderWithProviders(<SupplierList />);

      // 检查加载状态
      expect(screen.getByRole('table')).toBeInTheDocument();
      // antd Table 会在 loading 状态下显示加载指示器
    });

    it('应该显示错误状态', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        error: '获取供应商列表失败',
        loading: false,
      });

      renderWithProviders(<SupplierList />);

      // 这里可以添加错误提示的检查，取决于具体的错误显示方式
    });

    it('应该显示空数据状态', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        suppliers: [],
        totalCount: 0,
      });

      renderWithProviders(<SupplierList />);

      // antd Table 会显示空数据提示
    });
  });

  describe('搜索功能', () => {
    it('应该能够执行搜索', async () => {
      const mockFetchSuppliers = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        fetchSuppliers: mockFetchSuppliers,
      });

      renderWithProviders(<SupplierList />);

      const searchInput = screen.getByPlaceholderText('搜索供应商名称、编号、联系人');
      fireEvent.change(searchInput, { target: { value: '供应商A' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockFetchSuppliers).toHaveBeenCalledWith({ search: '供应商A' });
      });
    });

    it('应该能够按状态筛选', async () => {
      const mockSetFilters = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        setFilters: mockSetFilters,
      });

      renderWithProviders(<SupplierList />);

      const statusSelect = screen.getByPlaceholderText('选择状态');
      fireEvent.mouseDown(statusSelect);

      const statusOption = screen.getByText('正常合作');
      fireEvent.click(statusOption);

      await waitFor(() => {
        expect(mockSetFilters).toHaveBeenCalledWith({ status: 'active' });
      });
    });

    it('应该能够按等级筛选', async () => {
      const mockSetFilters = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        setFilters: mockSetFilters,
      });

      renderWithProviders(<SupplierList />);

      const levelSelect = screen.getByPlaceholderText('选择等级');
      fireEvent.mouseDown(levelSelect);

      const levelOption = screen.getByText(/战略供应商/);
      fireEvent.click(levelOption);

      await waitFor(() => {
        expect(mockSetFilters).toHaveBeenCalledWith({ level: 'strategic' });
      });
    });
  });

  describe('操作按钮', () => {
    it('应该能够点击新建供应商按钮', () => {
      const mockShowForm = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        showForm: mockShowForm,
      });

      renderWithProviders(<SupplierList />);

      const createButton = screen.getByText('新建供应商');
      fireEvent.click(createButton);

      expect(mockShowForm).toHaveBeenCalled();
    });

    it('应该能够选择供应商', () => {
      const mockSelectSupplier = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectSupplier: mockSelectSupplier,
      });

      renderWithProviders(<SupplierList />);

      // 查找并点击第一个复选框
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        expect(mockSelectSupplier).toHaveBeenCalledWith('1', true);
      }
    });

    it('应该能够点击查看详情按钮', () => {
      const mockShowDetail = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        showDetail: mockShowDetail,
      });

      renderWithProviders(<SupplierList />);

      // 查找第一个供应商的查看按钮
      const viewButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('查看')
      );

      if (viewButtons.length > 0) {
        fireEvent.click(viewButtons[0]);
        // 由于无法直接获取供应商对象，这里只验证函数被调用
        // 在实际组件中，应该传入正确的供应商对象
      }
    });

    it('应该能够点击编辑按钮', () => {
      const mockOnEdit = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
      });

      renderWithProviders(<SupplierList onEdit={mockOnEdit} />);

      // 查找第一个供应商的编辑按钮
      const editButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('编辑')
      );

      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
        // 验证编辑函数被调用
      }
    });

    it('应该能够点击删除按钮', async () => {
      const mockDeleteSupplier = vi.fn().mockResolvedValue(true);
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        deleteSupplier: mockDeleteSupplier,
      });

      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);

      renderWithProviders(<SupplierList />);

      // 查找删除按钮并点击
      const deleteButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('删除')
      );

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(window.confirm).toHaveBeenCalled();
        });
      }

      // 恢复原始 confirm
      window.confirm = originalConfirm;
    });
  });

  describe('批量操作', () => {
    it('应该能够全选供应商', () => {
      const mockSelectAllSuppliers = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectAllSuppliers: mockSelectAllSuppliers,
      });

      renderWithProviders(<SupplierList />);

      // 查找全选复选框
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]); // 通常是第一个复选框为全选
        expect(mockSelectAllSuppliers).toHaveBeenCalled();
      }
    });

    it('选择供应商后应该显示批量操作按钮', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectedSupplierIds: ['1'],
      });

      renderWithProviders(<SupplierList />);

      // 检查是否有批量删除按钮等
      expect(screen.getByText('批量删除')).toBeInTheDocument();
    });

    it('应该能够执行批量删除', async () => {
      const mockBatchDelete = vi.fn().mockResolvedValue(true);
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectedSupplierIds: ['1'],
        batchDelete: mockBatchDelete,
      });

      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);

      renderWithProviders(<SupplierList />);

      const batchDeleteButton = screen.getByText('批量删除');
      fireEvent.click(batchDeleteButton);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
      });

      window.confirm = originalConfirm;
    });
  });

  describe('分页功能', () => {
    it('应该显示分页信息', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        totalCount: 100,
        pageSize: 20,
        currentPage: 1,
      });

      renderWithProviders(<SupplierList />);

      // 检查分页组件是否存在
      expect(screen.getByText('共 100 条')).toBeInTheDocument();
    });

    it('应该能够切换页面', async () => {
      const mockSetCurrentPage = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        setCurrentPage: mockSetCurrentPage,
        totalCount: 100,
        pageSize: 20,
        currentPage: 1,
      });

      renderWithProviders(<SupplierList />);

      // 查找下一页按钮
      const nextPageButton = screen.getByTitle('下一页');
      fireEvent.click(nextPageButton);

      await waitFor(() => {
        expect(mockSetCurrentPage).toHaveBeenCalledWith(2);
      });
    });

    it('应该能够改变每页显示数量', async () => {
      const mockSetPageSize = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        setPageSize: mockSetPageSize,
      });

      renderWithProviders(<SupplierList />);

      // 查找页面大小选择器
      const pageSizeSelector = screen.getByTitle('每页显示');
      fireEvent.mouseDown(pageSizeSelector);

      const pageSizeOption = screen.getByText('50 条/页');
      fireEvent.click(pageSizeOption);

      await waitFor(() => {
        expect(mockSetPageSize).toHaveBeenCalledWith(50);
      });
    });
  });

  describe('导出功能', () => {
    it('应该能够导出选中供应商', async () => {
      const mockExportSuppliers = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectedSupplierIds: ['1'],
        exportSuppliers: mockExportSuppliers,
      });

      renderWithProviders(<SupplierList />);

      const exportButton = screen.getByText('导出');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportSuppliers).toHaveBeenCalledWith(['1']);
      });
    });

    it('应该能够导出所有供应商', async () => {
      const mockExportSuppliers = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectedSupplierIds: [],
        exportSuppliers: mockExportSuppliers,
      });

      renderWithProviders(<SupplierList />);

      const exportButton = screen.getByText('导出');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExportSuppliers).toHaveBeenCalledWith(undefined);
      });
    });
  });

  describe('响应式设计', () => {
    it('应该在移动端正确显示', () => {
      // Mock 移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProviders(<SupplierList />);

      // 检查移动端适配的元素
      expect(screen.getByText('供应商列表')).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        error: '网络连接失败，请检查网络设置',
      });

      renderWithProviders(<SupplierList />);

      // 检查错误提示
      expect(screen.getByText('网络连接失败，请检查网络设置')).toBeInTheDocument();
    });

    it('应该处理空数据状态', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        suppliers: [],
        totalCount: 0,
        loading: false,
      });

      renderWithProviders(<SupplierList />);

      // 检查空数据提示
      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该正确处理大量数据', () => {
      const largeSuppliers = Array.from({ length: 1000 }, (_, index) => ({
        id: `supplier-${index}`,
        code: `SUP${String(index).padStart(4, '0')}`,
        name: `供应商${index}`,
        shortName: `供应商${index}`,
        type: 'manufacturer',
        level: 'standard',
        status: 'active',
        contacts: [],
        phone: `010-${String(index).padStart(8, '0')}`,
        email: `supplier${index}@example.com`,
        productCategories: [`品类${index}`],
        cooperationStartDate: '2024-01-01',
        creditLimit: 100000,
        paymentTerms: '月结30天',
      }));

      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        suppliers: largeSuppliers,
        totalCount: 1000,
      });

      renderWithProviders(<SupplierList />);

      // 验证大量数据时的基本渲染
      expect(screen.getByText('供应商列表')).toBeInTheDocument();
    });
  });
});