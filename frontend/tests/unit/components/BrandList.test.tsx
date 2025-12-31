import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import BrandList from '../../../src/pages/mdm-pim/brand/components/organisms/BrandList';
import { Brand, BrandType, BrandStatus } from '../../../src/pages/mdm-pim/brand/types/brand.types';

// Mock MSW
jest.mock('msw/browser', () => ({
  setupWorker: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    listen: jest.fn(),
    close: jest.fn(),
  })),
}));

// Mock 数据
const mockBrands: Brand[] = [
  {
    id: '1',
    brandCode: 'BRAND001',
    name: '可口可乐',
    englishName: 'Coca-Cola',
    brandType: BrandType.AGENCY,
    primaryCategories: ['饮料', '食品'],
    company: '可口可乐公司',
    brandLevel: 'A',
    tags: ['国际品牌', '饮料'],
    description: '全球知名饮料品牌',
    logoUrl: 'https://example.com/coca-cola.png',
    status: BrandStatus.ENABLED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
    updatedBy: 'admin',
  },
  {
    id: '2',
    brandCode: 'BRAND002',
    name: '农夫山泉',
    englishName: 'Nongfu Spring',
    brandType: BrandType.OWN,
    primaryCategories: ['饮料'],
    company: '农夫山泉股份有限公司',
    brandLevel: 'A',
    tags: ['国内品牌', '饮料'],
    description: '中国领先的饮料品牌',
    logoUrl: 'https://example.com/nongfu.png',
    status: BrandStatus.ENABLED,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    createdBy: 'admin',
    updatedBy: 'admin',
  },
  {
    id: '3',
    brandCode: 'BRAND003',
    name: '百事可乐',
    englishName: 'Pepsi',
    brandType: BrandType.AGENCY,
    primaryCategories: ['饮料'],
    company: '百事公司',
    brandLevel: 'A',
    tags: ['国际品牌', '饮料'],
    description: '全球知名饮料品牌',
    status: BrandStatus.DISABLED,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    createdBy: 'admin',
    updatedBy: 'admin',
  },
];

// 创建测试用 QueryClient
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
        gcTime: 0,
      },
    },
  });
};

// 测试组件包装器
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();

  return render(
    <ConfigProvider locale={zhCN}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{component}</MemoryRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

// Mock API 服务
const mockBrandService = {
  getBrands: jest.fn(),
  createBrand: jest.fn(),
  updateBrand: jest.fn(),
  deleteBrand: jest.fn(),
  updateBrandStatus: jest.fn(),
  uploadLogo: jest.fn(),
};

jest.mock('../../../src/pages/mdm-pim/brand/services/brandService', () => ({
  brandService: mockBrandService,
}));

describe('BrandList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBrandService.getBrands.mockResolvedValue({
      success: true,
      data: mockBrands,
      pagination: {
        current: 1,
        pageSize: 20,
        total: mockBrands.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      message: '获取成功',
      timestamp: new Date().toISOString(),
    });
  });

  it('应该正确渲染品牌列表', async () => {
    renderWithProviders(<BrandList />);

    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByTestId('brand-table')).toBeInTheDocument();
    });

    // 验证品牌数据正确显示
    expect(screen.getByText('可口可乐')).toBeInTheDocument();
    expect(screen.getByText('农夫山泉')).toBeInTheDocument();
    expect(screen.getByText('百事可乐')).toBeInTheDocument();
  });

  it('应该显示页面标题和操作按钮', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('品牌管理');
    });

    expect(screen.getByTestId('new-brand-button')).toBeInTheDocument();
    expect(screen.getByTestId('new-brand-button')).toHaveTextContent('新建品牌');
  });

  it('应该显示搜索表单', async () => {
    renderWithProviders(<BrandList />);

    expect(screen.getByTestId('brand-search-form')).toBeInTheDocument();
    expect(screen.getByTestId('keyword-input')).toBeInTheDocument();
    expect(screen.getByTestId('brand-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('brand-status-select')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('应该显示正确的表格列头', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('header-brand-name')).toHaveTextContent('品牌名称');
      expect(screen.getByTestId('header-english-name')).toHaveTextContent('英文名');
      expect(screen.getByTestId('header-brand-code')).toHaveTextContent('品牌编码');
      expect(screen.getByTestId('header-brand-type')).toHaveTextContent('品牌类型');
      expect(screen.getByTestId('header-primary-category')).toHaveTextContent('主营类目');
      expect(screen.getByTestId('header-status')).toHaveTextContent('状态');
      expect(screen.getByTestId('header-created-time')).toHaveTextContent('创建时间');
      expect(screen.getByTestId('header-actions')).toHaveTextContent('操作');
    });
  });

  it('应该正确显示品牌状态标签', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      // 验证启用状态
      const enabledBrands = screen.getAllByTestId('brand-status');
      const enabledStatus = enabledBrands.find(
        (el) =>
          el.closest('[data-testid="brand-table-row"]')?.querySelector('[data-testid="brand-name"]')
            ?.textContent === '可口可乐'
      );
      expect(enabledStatus).toHaveTextContent('启用');
    });
  });

  it('应该正确显示品牌类型标签', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      // 验证代理品牌
      const agencyBrand = screen.getByText('可口可乐').closest('[data-testid="brand-table-row"]');
      expect(agencyBrand?.querySelector('[data-testid="brand-type"]')).toHaveTextContent(
        '代理品牌'
      );

      // 验证自有品牌
      const ownBrand = screen.getByText('农夫山泉').closest('[data-testid="brand-table-row"]');
      expect(ownBrand?.querySelector('[data-testid="brand-type"]')).toHaveTextContent('自有品牌');
    });
  });

  it('应该支持关键词搜索', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-table')).toBeInTheDocument();
    });

    // 输入搜索关键词
    const searchInput = screen.getByTestId('keyword-input');
    fireEvent.change(searchInput, { target: { value: '可口可乐' } });

    // 点击搜索按钮
    fireEvent.click(screen.getByTestId('search-button'));

    // 验证API调用
    await waitFor(() => {
      expect(mockBrandService.getBrands).toHaveBeenCalledWith(
        expect.objectContaining({
          keyword: '可口可乐',
        })
      );
    });
  });

  it('应该支持品牌类型筛选', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-table')).toBeInTheDocument();
    });

    // 选择品牌类型
    const typeSelect = screen.getByTestId('brand-type-select');
    fireEvent.change(typeSelect, { target: { value: 'own' } });

    // 点击搜索按钮
    fireEvent.click(screen.getByTestId('search-button'));

    // 验证API调用
    await waitFor(() => {
      expect(mockBrandService.getBrands).toHaveBeenCalledWith(
        expect.objectContaining({
          brandType: 'own',
        })
      );
    });
  });

  it('应该支持状态筛选', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-table')).toBeInTheDocument();
    });

    // 选择状态
    const statusSelect = screen.getByTestId('brand-status-select');
    fireEvent.change(statusSelect, { target: { value: 'enabled' } });

    // 点击搜索按钮
    fireEvent.click(screen.getByTestId('search-button'));

    // 验证API调用
    await waitFor(() => {
      expect(mockBrandService.getBrands).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'enabled',
        })
      );
    });
  });

  it('应该支持重置筛选条件', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-table')).toBeInTheDocument();
    });

    // 设置筛选条件
    const searchInput = screen.getByTestId('keyword-input');
    fireEvent.change(searchInput, { target: { value: '测试' } });

    const typeSelect = screen.getByTestId('brand-type-select');
    fireEvent.change(typeSelect, { target: { value: 'own' } });

    // 点击重置按钮
    fireEvent.click(screen.getByTestId('reset-button'));

    // 验证筛选条件被清空
    expect(searchInput).toHaveValue('');

    // 验证API调用不带筛选条件
    await waitFor(() => {
      expect(mockBrandService.getBrands).toHaveBeenCalledWith(
        expect.not.objectContaining({
          keyword: '测试',
          brandType: 'own',
        })
      );
    });
  });

  it('应该显示加载状态', async () => {
    // Mock 延迟加载
    mockBrandService.getBrands.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                success: true,
                data: mockBrands,
                pagination: {
                  current: 1,
                  pageSize: 20,
                  total: mockBrands.length,
                  totalPages: 1,
                  hasNext: false,
                  hasPrev: false,
                },
                message: '获取成功',
                timestamp: new Date().toISOString(),
              }),
            100
          );
        })
    );

    renderWithProviders(<BrandList />);

    // 应该显示加载状态
    expect(screen.getByTestId('brand-loading')).toBeInTheDocument();
    expect(screen.getByTestId('brand-loading')).toHaveTextContent('加载中...');

    // 等待加载完成
    await waitFor(() => {
      expect(screen.getByTestId('brand-table')).toBeInTheDocument();
    });
  });

  it('应该显示空状态', async () => {
    // Mock 空数据
    mockBrandService.getBrands.mockResolvedValue({
      success: true,
      data: [],
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      message: '获取成功',
      timestamp: new Date().toISOString(),
    });

    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-empty-state')).toBeInTheDocument();
    });

    expect(screen.getByTestId('brand-empty-state')).toHaveTextContent('暂无品牌数据');
  });

  it('应该显示操作按钮', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      const brandRows = screen.getAllByTestId('brand-table-row');
      expect(brandRows).toHaveLength(mockBrands.length);

      // 验证每行都有操作按钮
      brandRows.forEach((row) => {
        expect(row.querySelector('[data-testid="brand-actions"]')).toBeInTheDocument();
        expect(row.querySelector('[data-testid="view-button"]')).toBeInTheDocument();
        expect(row.querySelector('[data-testid="edit-button"]')).toBeInTheDocument();
      });
    });
  });

  it('应该支持点击查看按钮', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-table')).toBeInTheDocument();
    });

    // 点击第一个品牌的查看按钮
    const firstRow = screen.getAllByTestId('brand-table-row')[0];
    const viewButton = firstRow.querySelector('[data-testid="view-button"]');

    fireEvent.click(viewButton!);

    // 验证查看行为（这里需要根据实际实现来调整）
    // 可能是显示抽屉或跳转页面
  });

  it('应该支持点击编辑按钮', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-table')).toBeInTheDocument();
    });

    // 点击第一个品牌的编辑按钮
    const firstRow = screen.getAllByTestId('brand-table-row')[0];
    const editButton = firstRow.querySelector('[data-testid="edit-button"]');

    fireEvent.click(editButton!);

    // 验证编辑行为（这里需要根据实际实现来调整）
  });

  it('应该支持点击新建品牌按钮', async () => {
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('new-brand-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('new-brand-button'));

    // 验证新建品牌行为（这里需要根据实际实现来调整）
  });

  it('应该显示分页控件', async () => {
    // Mock 带分页的数据
    mockBrandService.getBrands.mockResolvedValue({
      success: true,
      data: mockBrands,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      },
      message: '获取成功',
      timestamp: new Date().toISOString(),
    });

    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-pagination')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-total')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-current')).toBeInTheDocument();
    });
  });

  it('应该支持分页操作', async () => {
    // Mock 带分页的数据
    mockBrandService.getBrands.mockResolvedValue({
      success: true,
      data: mockBrands,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      },
      message: '获取成功',
      timestamp: new Date().toISOString(),
    });

    renderWithProviders(<BrandList />);

    await waitFor(() => {
      const nextButton = screen.getByTestId('pagination-next');
      if (nextButton) {
        fireEvent.click(nextButton);

        // 验证API调用包含正确的分页参数
        expect(mockBrandService.getBrands).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      }
    });
  });

  it('应该处理错误状态', async () => {
    // Mock API 错误
    mockBrandService.getBrands.mockRejectedValue(new Error('网络错误'));

    renderWithProviders(<BrandList />);

    await waitFor(() => {
      // 验证错误状态显示
      expect(screen.getByTestId('brand-error')).toBeInTheDocument();
    });
  });

  it('应该支持响应式布局', async () => {
    // 测试桌面布局
    renderWithProviders(<BrandList />);

    await waitFor(() => {
      expect(screen.getByTestId('brand-list-container')).toBeInTheDocument();
    });

    // 测试移动端布局（如果适用）
    // 这里可以测试窗口大小变化时的布局调整
  });
});
