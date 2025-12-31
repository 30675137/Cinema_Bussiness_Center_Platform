/**
 * StoreSelector 组件单元测试
 *
 * T011: 测试门店选择器渲染和交互
 * T025: 测试搜索过滤功能
 *
 * 测试覆盖：
 * - 门店列表渲染
 * - 门店选择/取消选择
 * - 搜索过滤功能
 * - 空数据状态
 * - 加载状态
 * - 错误状态
 * - 已停用门店警告显示
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoreSelector } from '../StoreSelector';
import type { StoreSummary } from '../../../types';

// Mock useStores hook
const mockUseStores = vi.fn();
vi.mock('../../../hooks/useStores', () => ({
  useActiveStores: () => mockUseStores(),
}));

// Mock test data
const mockStores: StoreSummary[] = [
  {
    id: '1',
    code: 'STORE001',
    name: '北京朝阳店',
    region: '北京',
    status: 'active',
  },
  {
    id: '2',
    code: 'STORE002',
    name: '上海浦东店',
    region: '上海',
    status: 'active',
  },
  {
    id: '3',
    code: 'STORE003',
    name: '广州天河店',
    region: '广州',
    status: 'active',
  },
  {
    id: '4',
    code: 'STORE004',
    name: '北京海淀店',
    region: '北京',
    status: 'disabled',
  },
];

// Create QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('StoreSelector Component', () => {
  const defaultProps = {
    value: [] as string[],
    onChange: vi.fn(),
    disabled: false,
    required: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStores.mockReturnValue({
      data: mockStores.filter((s) => s.status === 'active'),
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染门店列表', () => {
      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      // 应该显示所有激活门店
      expect(screen.getByText('北京朝阳店')).toBeInTheDocument();
      expect(screen.getByText('上海浦东店')).toBeInTheDocument();
      expect(screen.getByText('广州天河店')).toBeInTheDocument();
    });

    it('应该显示门店区域信息', () => {
      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      // 区域信息显示在括号中，使用 getAllByText 因为可能匹配多个
      expect(screen.getAllByText(/\(北京\)/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\(上海\)/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\(广州\)/).length).toBeGreaterThan(0);
    });

    it('应该显示搜索框', () => {
      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/搜索门店/i)).toBeInTheDocument();
    });
  });

  describe('加载状态', () => {
    it('应该在加载时显示 Spin 组件', () => {
      mockUseStores.mockReturnValue({
        data: [],
        isLoading: true,
        isError: false,
        error: null,
      });

      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText(/加载门店列表/i)).toBeInTheDocument();
    });
  });

  describe('错误状态', () => {
    it('应该在加载失败时显示错误提示', () => {
      mockUseStores.mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
        error: new Error('加载失败'),
      });

      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText(/加载门店列表失败/i)).toBeInTheDocument();
    });
  });

  describe('空数据状态', () => {
    it('应该在没有门店时显示空状态', () => {
      mockUseStores.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText(/暂无可用门店/i)).toBeInTheDocument();
    });
  });

  describe('门店选择', () => {
    it('应该能选择门店', async () => {
      const onChange = vi.fn();
      render(<StoreSelector {...defaultProps} onChange={onChange} />, {
        wrapper: createWrapper(),
      });

      const storeTag = screen.getByText('北京朝阳店');
      fireEvent.click(storeTag);

      expect(onChange).toHaveBeenCalledWith(['1']);
    });

    it('应该能取消选择已选门店', async () => {
      const onChange = vi.fn();
      render(<StoreSelector {...defaultProps} value={['1']} onChange={onChange} />, {
        wrapper: createWrapper(),
      });

      const storeTag = screen.getByText('北京朝阳店');
      fireEvent.click(storeTag);

      expect(onChange).toHaveBeenCalledWith([]);
    });

    it('应该能选择多个门店', async () => {
      const onChange = vi.fn();
      render(<StoreSelector {...defaultProps} value={['1']} onChange={onChange} />, {
        wrapper: createWrapper(),
      });

      const storeTag = screen.getByText('上海浦东店');
      fireEvent.click(storeTag);

      expect(onChange).toHaveBeenCalledWith(['1', '2']);
    });

    it('已选门店应该显示选中样式', () => {
      render(<StoreSelector {...defaultProps} value={['1']} />, {
        wrapper: createWrapper(),
      });

      const storeTag = screen.getByText('北京朝阳店').closest('[class*="ant-tag"]');
      expect(storeTag).toHaveClass('ant-tag-checkable-checked');
    });
  });

  describe('搜索功能 (T025)', () => {
    it('应该能按名称搜索门店', async () => {
      const user = userEvent.setup();
      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/搜索门店/i);
      await user.type(searchInput, '北京');

      expect(screen.getByText('北京朝阳店')).toBeInTheDocument();
      expect(screen.queryByText('上海浦东店')).not.toBeInTheDocument();
      expect(screen.queryByText('广州天河店')).not.toBeInTheDocument();
    });

    it('应该能按区域搜索门店', async () => {
      const user = userEvent.setup();
      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/搜索门店/i);
      await user.type(searchInput, '上海');

      expect(screen.queryByText('北京朝阳店')).not.toBeInTheDocument();
      expect(screen.getByText('上海浦东店')).toBeInTheDocument();
    });

    it('应该在无搜索结果时显示提示', async () => {
      const user = userEvent.setup();
      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/搜索门店/i);
      await user.type(searchInput, '不存在的门店');

      expect(screen.getByText(/未找到.*不存在的门店.*的门店/i)).toBeInTheDocument();
    });

    it('应该能清空搜索', async () => {
      const user = userEvent.setup();
      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/搜索门店/i);
      await user.type(searchInput, '北京');

      // 只有北京门店可见
      expect(screen.queryByText('上海浦东店')).not.toBeInTheDocument();

      // 清空搜索
      await user.clear(searchInput);

      // 所有门店应该可见
      expect(screen.getByText('北京朝阳店')).toBeInTheDocument();
      expect(screen.getByText('上海浦东店')).toBeInTheDocument();
      expect(screen.getByText('广州天河店')).toBeInTheDocument();
    });
  });

  describe('禁用状态', () => {
    it('禁用时不应响应点击事件', () => {
      const onChange = vi.fn();
      render(<StoreSelector {...defaultProps} disabled={true} onChange={onChange} />, {
        wrapper: createWrapper(),
      });

      const storeTag = screen.getByText('北京朝阳店');
      fireEvent.click(storeTag);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('已选择数量显示', () => {
    it('应该显示已选择门店数量', () => {
      render(<StoreSelector {...defaultProps} value={['1', '2']} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/已选择 2 个门店/i)).toBeInTheDocument();
    });

    it('未选择时应显示0个', () => {
      render(<StoreSelector {...defaultProps} value={[]} />, {
        wrapper: createWrapper(),
      });

      expect(screen.getByText(/已选择 0 个门店/i)).toBeInTheDocument();
    });
  });

  describe('无障碍性', () => {
    it('门店标签应该有 aria-label', () => {
      render(<StoreSelector {...defaultProps} />, { wrapper: createWrapper() });

      const storeTag = screen.getByLabelText(/选择门店.*北京朝阳店/i);
      expect(storeTag).toBeInTheDocument();
    });
  });
});
