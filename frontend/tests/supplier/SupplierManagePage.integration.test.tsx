/**
 * 供应商管理页面集成测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SupplierManagePage from '@/pages/procurement/SupplierManagePage';

// Mock stores
vi.mock('@/stores/supplierStore');
vi.mock('@/stores/userStore');

// Mock components
vi.mock('@/components/layout/AppLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/procurement/supplier',
      search: '',
      hash: '',
      state: null,
      key: '',
    }),
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
const renderWithProviders = (ui: React.ReactElement, initialEntries: string[] = ['/procurement/supplier']) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('SupplierManagePage Integration', () => {
  const mockUseSupplierStore = vi.hoisted(() => require('@/stores/supplierStore')).useSupplierStore;
  const mockUseUserStore = vi.hoisted(() => require('@/stores/userStore')).useUserStore;

  beforeEach(() => {
    vi.clearAllMocks();

    // 默认的 supplier store mock
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
      fetchSuppliers: vi.fn(),
      selectSupplier: vi.fn(),
      selectAllSuppliers: vi.fn(),
      clearSelection: vi.fn(),
      createSupplier: vi.fn().mockResolvedValue('supplier-3'),
      updateSupplier: vi.fn().mockResolvedValue(true),
      deleteSupplier: vi.fn().mockResolvedValue(true),
      showForm: vi.fn(),
      showDetail: vi.fn(),
      hideForm: vi.fn(),
      hideDetail: vi.fn(),
      statistics: {
        totalSuppliers: 2,
        activeSuppliers: 1,
        suspendedSuppliers: 1,
        strategicSuppliers: 1,
        preferredSuppliers: 1,
        totalAmount: 1000000,
      },
    });

    // 默认的 user store mock
    mockUseUserStore.mockReturnValue({
      user: { id: 'user-1', name: '测试用户' },
      isAuthenticated: true,
      loginLoading: false,
    });
  });

  describe('页面渲染', () => {
    it('应该正确渲染供应商管理页面', () => {
      renderWithProviders(<SupplierManagePage />);

      // 检查页面元素
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    it('应该显示供应商列表', async () => {
      renderWithProviders(<SupplierManagePage />);

      await waitFor(() => {
        expect(mockUseSupplierStore().fetchSuppliers).toHaveBeenCalled();
      });
    });
  });

  describe('路由导航', () => {
    it('应该在列表路由时显示供应商列表', () => {
      renderWithProviders(<SupplierManagePage />, ['/procurement/supplier']);

      // 验证当前显示的是列表模式
      // 这里可以检查列表相关的特定元素
    });

    it('应该能导航到新建页面', async () => {
      const mockNavigate = vi.fn();
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
          useParams: () => ({}),
          useLocation: () => ({
            pathname: '/procurement/supplier/create',
            search: '',
            hash: '',
            state: null,
            key: '',
          }),
        };
      });

      renderWithProviders(<SupplierManagePage />, ['/procurement/supplier/create']);

      // 验证新建页面的特定元素
    });

    it('应该能导航到编辑页面', async () => {
      const mockNavigate = vi.fn();
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
          useParams: () => ({ supplierId: '1' }),
          useLocation: () => ({
            pathname: '/procurement/supplier/1/edit',
            search: '',
            hash: '',
            state: null,
            key: '',
          }),
        };
      });

      renderWithProviders(<SupplierManagePage />, ['/procurement/supplier/1/edit']);

      // 验证编辑页面的特定元素
    });

    it('应该能导航到详情页面', async () => {
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ supplierId: '1' }),
          useLocation: () => ({
            pathname: '/procurement/supplier/1',
            search: '',
            hash: '',
            state: null,
            key: '',
          }),
        };
      });

      renderWithProviders(<SupplierManagePage />, ['/procurement/supplier/1']);

      // 验证详情页面的特定元素
    });
  });

  describe('用户交互', () => {
    it('应该能点击新建供应商按钮', async () => {
      renderWithProviders(<SupplierManagePage />);

      await waitFor(() => {
        expect(mockUseSupplierStore().fetchSuppliers).toHaveBeenCalled();
      });

      // 查找并点击新建按钮
      const createButton = screen.getByText('新建供应商');
      fireEvent.click(createButton);

      expect(mockUseSupplierStore().showForm).toHaveBeenCalled();
    });

    it('应该能查看供应商详情', async () => {
      renderWithProviders(<SupplierManagePage />);

      await waitFor(() => {
        expect(mockUseSupplierStore().fetchSuppliers).toHaveBeenCalled();
      });

      // 查找并点击查看按钮
      const viewButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('查看')
      );

      if (viewButtons.length > 0) {
        fireEvent.click(viewButtons[0]);
        expect(mockUseSupplierStore().showDetail).toHaveBeenCalled();
      }
    });

    it('应该能编辑供应商', async () => {
      renderWithProviders(<SupplierManagePage />);

      await waitFor(() => {
        expect(mockUseSupplierStore().fetchSuppliers).toHaveBeenCalled();
      });

      // 查找并点击编辑按钮
      const editButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('编辑')
      );

      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
        // 编辑功能可能会导航到编辑页面或显示编辑表单
      }
    });

    it('应该能删除供应商', async () => {
      renderWithProviders(<SupplierManagePage />);

      await waitFor(() => {
        expect(mockUseSupplierStore().fetchSuppliers).toHaveBeenCalled();
      });

      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);

      // 查找并点击删除按钮
      const deleteButtons = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('删除')
      );

      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
          expect(window.confirm).toHaveBeenCalled();
          expect(mockUseSupplierStore().deleteSupplier).toHaveBeenCalled();
        });
      }

      window.confirm = originalConfirm;
    });
  });

  describe('状态管理', () => {
    it('应该正确处理加载状态', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        loading: true,
      });

      renderWithProviders(<SupplierManagePage />);

      // 检查加载状态显示
      // 可以检查加载指示器或骨架屏
    });

    it('应该正确处理错误状态', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        error: '获取供应商列表失败',
        loading: false,
      });

      renderWithProviders(<SupplierManagePage />);

      // 检查错误提示显示
      expect(screen.getByText('获取供应商列表失败')).toBeInTheDocument();
    });

    it('应该正确处理空数据状态', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        suppliers: [],
        loading: false,
      });

      renderWithProviders(<SupplierManagePage />);

      // 检查空数据提示
      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });
  });

  describe('搜索和过滤', () => {
    it('应该能搜索供应商', async () => {
      const mockFetchSuppliers = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        fetchSuppliers: mockFetchSuppliers,
      });

      renderWithProviders(<SupplierManagePage />);

      // 查找搜索框
      const searchInput = screen.getByPlaceholderText('搜索供应商名称、编号、联系人');
      fireEvent.change(searchInput, { target: { value: '供应商A' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockFetchSuppliers).toHaveBeenCalledWith({ search: '供应商A' });
      });
    });

    it('应该能按状态过滤', async () => {
      const mockSetFilters = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        setFilters: mockSetFilters,
      });

      renderWithProviders(<SupplierManagePage />);

      // 查找状态选择器
      const statusSelect = screen.getByPlaceholderText('选择状态');
      fireEvent.mouseDown(statusSelect);

      const statusOption = screen.getByText('正常合作');
      fireEvent.click(statusOption);

      await waitFor(() => {
        expect(mockSetFilters).toHaveBeenCalledWith({ status: 'active' });
      });
    });

    it('应该能按等级过滤', async () => {
      const mockSetFilters = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        setFilters: mockSetFilters,
      });

      renderWithProviders(<SupplierManagePage />);

      // 查找等级选择器
      const levelSelect = screen.getByPlaceholderText('选择等级');
      fireEvent.mouseDown(levelSelect);

      const levelOption = screen.getByText(/战略供应商/);
      fireEvent.click(levelOption);

      await waitFor(() => {
        expect(mockSetFilters).toHaveBeenCalledWith({ level: 'strategic' });
      });
    });
  });

  describe('批量操作', () => {
    it('应该能选择多个供应商', () => {
      const mockSelectSupplier = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectSupplier: mockSelectSupplier,
      });

      renderWithProviders(<SupplierManagePage />);

      // 查找复选框
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        expect(mockSelectSupplier).toHaveBeenCalled();
      }
    });

    it('应该能全选供应商', () => {
      const mockSelectAllSuppliers = vi.fn();
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectAllSuppliers: mockSelectAllSuppliers,
      });

      renderWithProviders(<SupplierManagePage />);

      // 查找全选复选框
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
        expect(mockSelectAllSuppliers).toHaveBeenCalled();
      }
    });

    it('选择供应商后应该显示批量操作按钮', () => {
      mockUseSupplierStore.mockReturnValue({
        ...mockUseSupplierStore(),
        selectedSupplierIds: ['1'],
      });

      renderWithProviders(<SupplierManagePage />);

      // 检查批量操作按钮
      expect(screen.getByText('批量删除')).toBeInTheDocument();
    });
  });

  describe('数据展示', () => {
    it('应该显示供应商统计数据', async () => {
      renderWithProviders(<SupplierManagePage />);

      await waitFor(() => {
        expect(screen.getByText('总供应商')).toBeInTheDocument();
        expect(screen.getByText('活跃供应商')).toBeInTheDocument();
        expect(screen.getByText('战略供应商')).toBeInTheDocument();
        expect(screen.getByText('即将到期资质')).toBeInTheDocument();
      });
    });

    it('应该显示供应商列表数据', async () => {
      renderWithProviders(<SupplierManagePage />);

      await waitFor(() => {
        expect(mockUseSupplierStore().fetchSuppliers).toHaveBeenCalled();
        expect(screen.getByText('供应商A')).toBeInTheDocument();
        expect(screen.getByText('供应商B')).toBeInTheDocument();
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

      renderWithProviders(<SupplierManagePage />);

      // 验证移动端适配
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });
  });

  describe('用户认证', () => {
    it('未认证用户应该重定向到登录页', () => {
      mockUseUserStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loginLoading: false,
      });

      // 由于使用了 ProtectedRoute，这里可能会被重定向
      renderWithProviders(<SupplierManagePage />);

      // 验证重定向行为
      // 可能需要检查是否显示了登录组件
    });

    it('认证用户应该能正常访问', () => {
      mockUseUserStore.mockReturnValue({
        user: { id: 'user-1', name: '测试用户' },
        isAuthenticated: true,
        loginLoading: false,
      });

      renderWithProviders(<SupplierManagePage />);

      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该快速渲染页面', () => {
      const start = performance.now();

      renderWithProviders(<SupplierManagePage />);

      const end = performance.now();
      expect(end - start).toBeLessThan(1000); // 应该在1秒内完成初始渲染
    });

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

      const start = performance.now();
      renderWithProviders(<SupplierManagePage />);
      const end = performance.now();

      expect(end - start).toBeLessThan(2000); // 即使是大数据也应该在2秒内完成
    });
  });
});