import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Brand, BrandStatus } from '../../../src/pages/mdm-pim/brand/types/brand.types';
import BrandDetail from '../../../src/pages/mdm-pim/brand/components/organisms/BrandDetail';

// Mock子组件
vi.mock('../../../src/pages/mdm-pim/brand/components/molecules/BrandStatusActions', () => ({
  default: ({ onStatusChange, brand }: any) => (
    <button
      data-testid="brand-status-actions"
      onClick={() => onStatusChange?.(brand, BrandStatus.DISABLED)}
    >
      状态操作
    </button>
  ),
}));

vi.mock('../../../src/pages/mdm-pim/brand/components/molecules/BrandStatusConfirm', () => ({
  default: ({ visible, onConfirm, onCancel }: any) =>
    visible ? (
      <div data-testid="brand-status-confirm">
        <button onClick={() => onConfirm?.('测试原因')}>确认</button>
        <button onClick={onCancel}>取消</button>
      </div>
    ) : null,
}));

describe('BrandDetail', () => {
  const mockBrand: Brand = {
    id: '1',
    brandCode: 'BRAND001',
    name: '测试品牌',
    englishName: 'Test Brand',
    brandType: 'own',
    primaryCategories: ['饮料', '食品'],
    company: '测试公司',
    brandLevel: 'A',
    tags: ['测试', '品牌'],
    description: '这是一个测试品牌的描述',
    logoUrl: 'https://example.com/logo.png',
    status: BrandStatus.ENABLED,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    createdBy: 'admin',
    updatedBy: 'admin',
  };

  const mockBrandWithUsage = {
    ...mockBrand,
    usageStats: {
      spuCount: 25,
      skuCount: 120,
      lastUsedAt: '2025-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染品牌基本信息', () => {
      render(<BrandDetail brand={mockBrand} />);

      expect(screen.getByTestId('brand-detail-name')).toHaveTextContent('测试品牌');
      expect(screen.getByTestId('brand-code')).toHaveTextContent('BRAND001');
      expect(screen.getByTestId('brand-english-name')).toHaveTextContent('Test Brand');
      expect(screen.getByTestId('brand-company')).toHaveTextContent('测试公司');
      expect(screen.getByTestId('brand-description')).toHaveTextContent('这是一个测试品牌的描述');
    });

    it('应该显示正确的品牌类型和等级标签', () => {
      render(<BrandDetail brand={mockBrand} />);

      expect(screen.getByText('自有品牌')).toBeInTheDocument();
      expect(screen.getByText('A级')).toBeInTheDocument();
    });

    it('应该显示正确的状态标签', () => {
      render(<BrandDetail brand={mockBrand} />);

      const statusTags = screen.getAllByText('启用');
      expect(statusTags.length).toBeGreaterThan(0);
      expect(statusTags[0].closest('.ant-tag')).toBeInTheDocument();
    });

    it('应该显示品牌Logo', () => {
      render(<BrandDetail brand={mockBrand} />);

      const logo = screen.getByAltText('测试品牌 Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
    });

    it('应该在没有Logo时显示占位符', () => {
      const brandWithoutLogo = { ...mockBrand, logoUrl: null };
      render(<BrandDetail brand={brandWithoutLogo} />);

      expect(screen.getByTestId('brand-logo-placeholder')).toBeInTheDocument();
      expect(screen.getByText('无Logo')).toBeInTheDocument();
    });

    it('应该显示主要类目', () => {
      render(<BrandDetail brand={mockBrand} />);

      expect(screen.getByTestId('brand-category-0')).toHaveTextContent('饮料');
      expect(screen.getByTestId('brand-category-1')).toHaveTextContent('食品');
    });

    it('应该显示品牌标签', () => {
      render(<BrandDetail brand={mockBrand} />);

      expect(screen.getByTestId('brand-tag-0')).toHaveTextContent('测试');
      expect(screen.getByTestId('brand-tag-1')).toHaveTextContent('品牌');
    });
  });

  describe('使用统计', () => {
    it('应该显示使用统计信息', () => {
      render(<BrandDetail brand={mockBrandWithUsage} />);

      expect(screen.getByTestId('brand-usage-stats')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument(); // SPU数量
      expect(screen.getByText('120')).toBeInTheDocument(); // SKU数量
    });

    it('应该在没有使用统计时不显示统计卡片', () => {
      render(<BrandDetail brand={mockBrand} />);

      expect(screen.queryByTestId('brand-usage-stats')).not.toBeInTheDocument();
    });
  });

  describe('操作功能', () => {
    it('应该显示编辑按钮（当editable=true时）', () => {
      const onEdit = vi.fn();
      render(<BrandDetail brand={mockBrand} onEdit={onEdit} />);

      expect(screen.getByTestId('brand-edit-button')).toBeInTheDocument();
    });

    it('应该在点击编辑按钮时调用onEdit', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<BrandDetail brand={mockBrand} onEdit={onEdit} />);

      await user.click(screen.getByTestId('brand-edit-button'));

      expect(onEdit).toHaveBeenCalledWith(mockBrand);
    });

    it('应该显示状态操作按钮（当有onStatusChange时）', () => {
      const onStatusChange = vi.fn();
      render(<BrandDetail brand={mockBrand} onStatusChange={onStatusChange} />);

      expect(screen.getByTestId('brand-status-actions')).toBeInTheDocument();
    });

    it('应该在点击状态操作时触发状态变更', async () => {
      const onStatusChange = vi.fn();
      const user = userEvent.setup();

      render(<BrandDetail brand={mockBrand} onStatusChange={onStatusChange} />);

      await user.click(screen.getByTestId('brand-status-actions'));

      expect(onStatusChange).toHaveBeenCalledWith(mockBrand, BrandStatus.DISABLED);
    });

    it('应该隐藏编辑按钮（当editable=false时）', () => {
      render(<BrandDetail brand={mockBrand} editable={false} />);

      expect(screen.queryByTestId('brand-edit-button')).not.toBeInTheDocument();
    });
  });

  describe('不同品牌类型和等级', () => {
    it('应该正确显示授权品牌', () => {
      const authorizedBrand = { ...mockBrand, brandType: 'authorized' };
      render(<BrandDetail brand={authorizedBrand} />);

      expect(screen.getByText('授权品牌')).toBeInTheDocument();
    });

    it('应该正确显示代理品牌', () => {
      const agentBrand = { ...mockBrand, brandType: 'agent' };
      render(<BrandDetail brand={agentBrand} />);

      expect(screen.getByText('代理品牌')).toBeInTheDocument();
    });

    it('应该正确显示B级品牌', () => {
      const bLevelBrand = { ...mockBrand, brandLevel: 'B' };
      render(<BrandDetail brand={bLevelBrand} />);

      expect(screen.getByText('B级')).toBeInTheDocument();
    });
  });

  describe('不同状态', () => {
    it('应该显示停用状态', () => {
      const disabledBrand = { ...mockBrand, status: BrandStatus.DISABLED };
      render(<BrandDetail brand={disabledBrand} />);

      const statusTags = screen.getAllByText('停用');
      expect(statusTags.length).toBeGreaterThan(0);
      expect(statusTags[0].closest('.ant-tag')).toBeInTheDocument();
    });

    it('应该显示草稿状态', () => {
      const draftBrand = { ...mockBrand, status: BrandStatus.DRAFT };
      render(<BrandDetail brand={draftBrand} />);

      const statusTags = screen.getAllByText('草稿');
      expect(statusTags.length).toBeGreaterThan(0);
      expect(statusTags[0].closest('.ant-tag')).toBeInTheDocument();
    });
  });

  describe('加载和错误状态', () => {
    it('应该显示加载状态', () => {
      render(<BrandDetail loading={true} />);

      expect(screen.getByTestId('brand-detail-loading')).toBeInTheDocument();
      expect(screen.getByText('加载品牌信息中...')).toBeInTheDocument();
    });

    it('应该显示错误状态', () => {
      render(<BrandDetail error="网络错误" />);

      expect(screen.getByTestId('brand-detail-error')).toBeInTheDocument();
      expect(screen.getByText('网络错误')).toBeInTheDocument();
    });

    it('应该显示空状态', () => {
      render(<BrandDetail />);

      expect(screen.getByTestId('brand-detail-empty')).toBeInTheDocument();
      expect(screen.getByText('暂无品牌信息')).toBeInTheDocument();
    });

    it('应该调用重试函数', async () => {
      const onRefresh = vi.fn();
      const user = userEvent.setup();

      render(<BrandDetail error="网络错误" onRefresh={onRefresh} />);

      const retryButton = screen.getByRole('button');
      await user.click(retryButton);

      expect(onRefresh).toHaveBeenCalled();
    });
  });

  describe('信息完整性', () => {
    it('应该处理缺失的英文名称', () => {
      const brandWithoutEnglishName = { ...mockBrand, englishName: null };
      render(<BrandDetail brand={brandWithoutEnglishName} />);

      expect(screen.getByTestId('brand-english-name')).toHaveTextContent('-');
    });

    it('应该处理缺失的公司信息', () => {
      const brandWithoutCompany = { ...mockBrand, company: null };
      render(<BrandDetail brand={brandWithoutCompany} />);

      expect(screen.getByTestId('brand-company')).toHaveTextContent('-');
    });

    it('应该处理缺失的创建信息', () => {
      const brandWithoutCreator = { ...mockBrand, createdBy: null };
      render(<BrandDetail brand={brandWithoutCreator} />);

      expect(screen.getByTestId('brand-created-by')).toHaveTextContent('-');
    });

    it('应该处理空的主要类目', () => {
      const brandWithoutCategories = { ...mockBrand, primaryCategories: [] };
      render(<BrandDetail brand={brandWithoutCategories} />);

      expect(screen.queryByTestId('brand-category-0')).not.toBeInTheDocument();
    });

    it('应该处理空的标签', () => {
      const brandWithoutTags = { ...mockBrand, tags: [] };
      render(<BrandDetail brand={brandWithoutTags} />);

      expect(screen.queryByTestId('brand-tag-0')).not.toBeInTheDocument();
    });
  });

  describe('日期格式化', () => {
    it('应该正确格式化创建时间', () => {
      render(<BrandDetail brand={mockBrand} />);

      const createdAtElement = screen.getByTestId('brand-created-at');
      expect(createdAtElement).toHaveTextContent('1/1/2025');
    });

    it('应该正确格式化更新时间', () => {
      render(<BrandDetail brand={mockBrand} />);

      const updatedAtElement = screen.getByTestId('brand-updated-at');
      expect(updatedAtElement).toHaveTextContent('1/1/2025');
    });

    it('应该处理缺失的时间信息', () => {
      const brandWithoutDates = { ...mockBrand, createdAt: null, updatedAt: null };
      render(<BrandDetail brand={brandWithoutDates} />);

      expect(screen.getByTestId('brand-created-at')).toHaveTextContent('-');
      expect(screen.getByTestId('brand-updated-at')).toHaveTextContent('-');
    });
  });

  describe('无障碍和属性', () => {
    it('应该正确设置data-testid属性', () => {
      render(<BrandDetail brand={mockBrand} />);

      expect(screen.getByTestId('brand-detail-container')).toBeInTheDocument();
      expect(screen.getByTestId('brand-detail-header')).toBeInTheDocument();
      expect(screen.getByTestId('brand-basic-info')).toBeInTheDocument();
    });

    it('应该显示状态管理说明', () => {
      render(<BrandDetail brand={mockBrand} />);

      expect(screen.getByText('状态管理说明')).toBeInTheDocument();

      // 使用更精确的查询来避免多个"启用"文本的冲突
      const all启用Texts = screen.getAllByText('启用');
      expect(all启用Texts.length).toBeGreaterThan(0);

      // 验证Alert组件存在
      const statusAlert = screen.getByText('状态管理说明').closest('.ant-alert');
      expect(statusAlert).toBeInTheDocument();
    });
  });
});
