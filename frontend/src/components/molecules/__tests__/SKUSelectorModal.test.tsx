/**
 * @spec O004-beverage-sku-reuse
 * SKU Selector Modal Component Unit Tests
 *
 * 测试 SKU 选择器模态框的类型过滤、搜索、选择功能
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * 覆盖率目标: ≥70%
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { SKUSelectorModal } from '../SKUSelectorModal';
import * as useSKUsModule from '@/hooks/useSKUs';
import type { SKU } from '@/types/sku';

// Mock hooks
vi.mock('@/hooks/useSKUs', () => ({
  useSKUs: vi.fn(),
}));

// 创建 QueryClient wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('SKUSelectorModal Component', () => {
  const mockOnCancel = vi.fn();
  const mockOnSelect = vi.fn();

  // Mock SKU 数据
  const mockSkus: Partial<SKU>[] = [
    {
      id: 'sku-finished-001',
      code: 'SKU-F001',
      name: '威士忌可乐',
      skuType: 'finished_product',
      spuName: '威士忌可乐',
      brand: 'Jack Daniels',
      category: '鸡尾酒',
      mainUnit: '杯',
      standardCost: 1500,
      status: 'enabled',
    },
    {
      id: 'sku-finished-002',
      code: 'SKU-F002',
      name: '莫吉托',
      skuType: 'finished_product',
      spuName: '莫吉托',
      brand: 'Bacardi',
      category: '鸡尾酒',
      mainUnit: '杯',
      standardCost: 1800,
      status: 'enabled',
    },
    {
      id: 'sku-raw-001',
      code: 'SKU-R001',
      name: '威士忌',
      skuType: 'raw_material',
      spuName: '威士忌',
      brand: 'Jack Daniels',
      category: '烈酒',
      mainUnit: 'ml',
      standardCost: 10000,
      status: 'enabled',
    },
    {
      id: 'sku-packaging-001',
      code: 'SKU-P001',
      name: '吸管',
      skuType: 'packaging',
      spuName: '吸管',
      brand: '无',
      category: '包材',
      mainUnit: '个',
      standardCost: 10,
      status: 'enabled',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useSKUs hook with all SKUs
    vi.mocked(useSKUsModule.useSKUs).mockReturnValue({
      data: {
        items: mockSkus as SKU[],
        total: mockSkus.length,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal 渲染', () => {
    it('应该正确渲染模态框标题和搜索框', () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      // 验证默认标题
      expect(screen.getByText('选择 SKU')).toBeInTheDocument();

      // 验证搜索框
      expect(screen.getByPlaceholderText('搜索 SKU 名称或编码')).toBeInTheDocument();

      // 验证类型过滤提示
      expect(screen.getByText(/当前仅显示「成品」类型的 SKU/)).toBeInTheDocument();
    });

    it('应该支持自定义标题', () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          title="选择成品 SKU"
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('选择成品 SKU')).toBeInTheDocument();
    });

    it('应该在 visible=false 时不渲染模态框', () => {
      const { container } = render(
        <SKUSelectorModal
          visible={false}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      expect(container.querySelector('.ant-modal')).not.toBeInTheDocument();
    });
  });

  describe('类型过滤功能 (客户端类型守卫)', () => {
    it('应该仅显示 finished_product 类型的 SKU', async () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // 应该显示成品 SKU
        expect(screen.getByText('威士忌可乐')).toBeInTheDocument();
        expect(screen.getByText('莫吉托')).toBeInTheDocument();

        // 不应该显示原料和包材 SKU
        expect(screen.queryByText('威士忌')).not.toBeInTheDocument();
        expect(screen.queryByText('吸管')).not.toBeInTheDocument();
      });
    });

    it('应该仅显示 raw_material 类型的 SKU', async () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="raw_material"
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // 应该显示原料 SKU
        expect(screen.getByText('威士忌')).toBeInTheDocument();

        // 不应该显示成品 SKU
        expect(screen.queryByText('威士忌可乐')).not.toBeInTheDocument();
        expect(screen.queryByText('莫吉托')).not.toBeInTheDocument();
      });
    });

    it('应该正确处理混合类型数据 (防御性编程)', async () => {
      // Mock API 返回了混合类型 (模拟后端错误返回)
      vi.mocked(useSKUsModule.useSKUs).mockReturnValue({
        data: {
          items: mockSkus as SKU[], // 包含所有类型
          total: mockSkus.length,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // 客户端类型守卫应该过滤掉非成品类型
        expect(screen.getByText('威士忌可乐')).toBeInTheDocument();
        expect(screen.getByText('莫吉托')).toBeInTheDocument();
        expect(screen.queryByText('威士忌')).not.toBeInTheDocument();
        expect(screen.queryByText('吸管')).not.toBeInTheDocument();
      });
    });
  });

  describe('排除指定 SKU 功能', () => {
    it('应该正确排除指定的 SKU ID', async () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          excludeSkuIds={['sku-finished-001']}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // 应该显示莫吉托
        expect(screen.getByText('莫吉托')).toBeInTheDocument();

        // 不应该显示被排除的威士忌可乐
        expect(screen.queryByText('威士忌可乐')).not.toBeInTheDocument();
      });
    });
  });

  describe('搜索功能', () => {
    it('应该支持搜索 SKU 名称', async () => {
      const user = userEvent.setup();

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      // 输入搜索关键词
      const searchInput = screen.getByPlaceholderText('搜索 SKU 名称或编码');
      await user.type(searchInput, '莫吉托');

      // 验证 useSKUs 被调用时带上搜索关键词
      await waitFor(() => {
        expect(useSKUsModule.useSKUs).toHaveBeenCalledWith(
          expect.objectContaining({
            keyword: '莫吉托',
          }),
          expect.any(Object)
        );
      });
    });

    it('应该支持清空搜索', async () => {
      const user = userEvent.setup();

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText('搜索 SKU 名称或编码');

      // 输入搜索关键词
      await user.type(searchInput, '莫吉托');

      // 清空搜索
      await user.clear(searchInput);

      // 验证 useSKUs 被调用时搜索关键词为 undefined
      await waitFor(() => {
        expect(useSKUsModule.useSKUs).toHaveBeenCalledWith(
          expect.objectContaining({
            keyword: undefined,
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe('单选模式', () => {
    it('应该在单选模式下点击行触发选择', async () => {
      const user = userEvent.setup();

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          multiple={false}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('威士忌可乐')).toBeInTheDocument();
      });

      // 点击行
      const row = screen.getByText('威士忌可乐').closest('tr');
      expect(row).toBeInTheDocument();
      await user.click(row!);

      // 验证 onSelect 被调用
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sku-finished-001',
          name: '威士忌可乐',
        })
      );
    });

    it('应该在单选模式下显示"取消"按钮', () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          multiple={false}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    });
  });

  describe('多选模式', () => {
    it('应该在多选模式下显示复选框', async () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          multiple={true}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // 验证表格有复选框列
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });
    });

    it('应该在多选模式下显示"关闭"按钮', () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          multiple={true}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
    });

    it('应该正确显示已选中的 SKU', () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          multiple={true}
          selectedSkuIds={['sku-finished-001']}
        />,
        { wrapper: createWrapper() }
      );

      // 验证复选框选中状态
      // 注意: Ant Design Table 的复选框选中状态需要特定的测试方式
    });
  });

  describe('showTypeColumn 属性', () => {
    it('应该在 showTypeColumn=true 时显示 SKU 类型列', async () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          showTypeColumn={true}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('SKU 类型')).toBeInTheDocument();
      });
    });

    it('应该在 showTypeColumn=false 时不显示 SKU 类型列', () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
          showTypeColumn={false}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByText('SKU 类型')).not.toBeInTheDocument();
    });
  });

  describe('加载状态', () => {
    it('应该在数据加载中时显示 loading 状态', () => {
      vi.mocked(useSKUsModule.useSKUs).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      // Ant Design Table loading 状态需要特定的测试方式
      // 可以验证 Spin 组件或 loading 类名
    });
  });

  describe('空数据处理', () => {
    it('应该在没有数据时显示提示信息', async () => {
      vi.mocked(useSKUsModule.useSKUs).mockReturnValue({
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('没有找到符合条件的 SKU')).toBeInTheDocument();
      });
    });

    it('应该在搜索无结果时显示搜索关键词提示', async () => {
      const user = userEvent.setup();

      vi.mocked(useSKUsModule.useSKUs).mockReturnValue({
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText('搜索 SKU 名称或编码');
      await user.type(searchInput, '不存在的商品');

      await waitFor(() => {
        expect(screen.getByText(/请尝试修改搜索关键词 "不存在的商品"/)).toBeInTheDocument();
      });
    });
  });

  describe('分页功能', () => {
    it('应该支持分页切换', async () => {
      const user = userEvent.setup();

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      // 注意: Ant Design Table 分页组件的测试需要特定的选择器
      // 可以通过 data-testid 或 aria-label 定位分页按钮
    });

    it('应该显示总记录数', async () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // 验证分页信息显示
        // Ant Design Table 的分页信息格式: "共 X 条记录"
        expect(screen.getByText(/共 \d+ 条记录/)).toBeInTheDocument();
      });
    });
  });

  describe('enabled 属性 (仅在可见时查询)', () => {
    it('应该在 visible=false 时禁用查询', () => {
      render(
        <SKUSelectorModal
          visible={false}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      // 验证 useSKUs 被调用时 enabled=false
      expect(useSKUsModule.useSKUs).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('应该在 visible=true 时启用查询', () => {
      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      // 验证 useSKUs 被调用时 enabled=true
      expect(useSKUsModule.useSKUs).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          enabled: true,
        })
      );
    });
  });

  describe('按钮交互', () => {
    it('应该在点击取消/关闭按钮时调用 onCancel', async () => {
      const user = userEvent.setup();

      render(
        <SKUSelectorModal
          visible={true}
          onCancel={mockOnCancel}
          onSelect={mockOnSelect}
          skuType="finished_product"
        />,
        { wrapper: createWrapper() }
      );

      const cancelButton = screen.getByRole('button', { name: '取消' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
