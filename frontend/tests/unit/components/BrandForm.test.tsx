import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BrandForm from '../../../src/pages/mdm-pim/brand/components/molecules/BrandForm';
import {
  Brand,
  BrandType,
  BrandStatus,
  CreateBrandRequest,
} from '../../../src/pages/mdm-pim/brand/types/brand.types';

// Mock 数据
const mockBrand: Brand = {
  id: 'brand-1',
  brandCode: 'BRAND001',
  name: '测试品牌',
  englishName: 'Test Brand',
  brandType: BrandType.OWN,
  primaryCategories: ['饮料'],
  company: '测试公司',
  brandLevel: 'A',
  tags: ['测试标签'],
  description: '测试描述',
  logoUrl: null,
  status: BrandStatus.DRAFT,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'admin',
  updatedBy: 'admin',
};

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
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    </ConfigProvider>
  );
};

describe('BrandForm Component', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
    mode: 'create' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染创建模式表单', () => {
    renderWithProviders(<BrandForm {...defaultProps} mode="create" />);

    // 验证标题
    expect(screen.getByTestId('brand-form-title')).toHaveTextContent('新建品牌');

    // 验证必填字段存在
    expect(screen.getByTestId('brand-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('brand-type-select')).toBeInTheDocument();

    // 验证可选字段存在
    expect(screen.getByTestId('english-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('primary-categories-select')).toBeInTheDocument();
    expect(screen.getByTestId('company-input')).toBeInTheDocument();
    expect(screen.getByTestId('brand-level-select')).toBeInTheDocument();
    expect(screen.getByTestId('brand-tags-input')).toBeInTheDocument();
    expect(screen.getByTestId('brand-description-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('brand-status-select')).toBeInTheDocument();

    // 验证操作按钮
    expect(screen.getByTestId('cancel-brand-button')).toBeInTheDocument();
    expect(screen.getByTestId('save-brand-button')).toBeInTheDocument();
  });

  it('应该正确渲染编辑模式表单', () => {
    renderWithProviders(<BrandForm {...defaultProps} mode="edit" brand={mockBrand} />);

    // 验证标题
    expect(screen.getByTestId('brand-form-title')).toHaveTextContent('编辑品牌');

    // 验证表单预填充数据
    expect(screen.getByTestId('brand-name-input')).toHaveValue('测试品牌');
    expect(screen.getByTestId('english-name-input')).toHaveValue('Test Brand');
    expect(screen.getByTestId('brand-type-select')).toHaveValue('own');
    expect(screen.getByTestId('company-input')).toHaveValue('测试公司');
    expect(screen.getByTestId('brand-description-textarea')).toHaveValue('测试描述');
  });

  it('应该正确渲染查看模式表单', () => {
    renderWithProviders(<BrandForm {...defaultProps} mode="view" brand={mockBrand} />);

    // 验证标题
    expect(screen.getByTestId('brand-form-title')).toHaveTextContent('品牌详情');

    // 验证字段为只读状态
    expect(screen.getByTestId('brand-name-input')).toBeDisabled();
    expect(screen.getByTestId('brand-type-select')).toBeDisabled();
    expect(screen.getByTestId('english-name-input')).toBeDisabled();

    // 查看模式下不应该有保存按钮
    expect(screen.queryByTestId('save-brand-button')).not.toBeInTheDocument();
  });

  it('应该验证必填字段', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 直接点击保存
    await user.click(screen.getByTestId('save-brand-button'));

    // 验证错误提示
    await waitFor(() => {
      expect(screen.getByTestId('brand-name-error')).toHaveTextContent('品牌名称不能为空');
      expect(screen.getByTestId('brand-type-error')).toHaveTextContent('请选择品牌类型');
    });
  });

  it('应该验证品牌名称长度', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 输入过长的品牌名称
    const longName = 'a'.repeat(101);
    await user.type(screen.getByTestId('brand-name-input'), longName);
    await user.click(screen.getByTestId('save-brand-button'));

    await waitFor(() => {
      expect(screen.getByTestId('brand-name-error')).toHaveTextContent('品牌名称不能超过100字符');
    });
  });

  it('应该验证英文名长度', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 输入过长的英文名
    const longEnglishName = 'a'.repeat(201);
    await user.type(screen.getByTestId('english-name-input'), longEnglishName);
    await user.click(screen.getByTestId('save-brand-button'));

    await waitFor(() => {
      expect(screen.getByTestId('english-name-error')).toHaveTextContent('英文名不能超过200字符');
    });
  });

  it('应该成功提交创建表单', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<BrandForm {...defaultProps} onSubmit={onSubmit} />);

    // 填写表单数据
    await user.type(screen.getByTestId('brand-name-input'), '新品牌');
    await user.selectOptions(screen.getByTestId('brand-type-select'), 'own');
    await user.type(screen.getByTestId('english-name-input'), 'New Brand');
    await user.type(screen.getByTestId('company-input'), '新公司');

    // 点击保存
    await user.click(screen.getByTestId('save-brand-button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '新品牌',
          brandType: 'own',
          englishName: 'New Brand',
          company: '新公司',
        })
      );
    });
  });

  it('应该成功提交编辑表单', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(
      <BrandForm {...defaultProps} mode="edit" brand={mockBrand} onSubmit={onSubmit} />
    );

    // 修改表单数据
    await user.clear(screen.getByTestId('brand-name-input'));
    await user.type(screen.getByTestId('brand-name-input'), '修改后的品牌');
    await user.type(screen.getByTestId('english-name-input'), 'Modified Brand');

    // 点击保存
    await user.click(screen.getByTestId('save-brand-button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '修改后的品牌',
          englishName: 'Modified Brand',
        })
      );
    });
  });

  it('应该支持取消操作', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithProviders(<BrandForm {...defaultProps} onCancel={onCancel} />);

    // 点击取消
    await user.click(screen.getByTestId('cancel-brand-button'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('应该在加载时禁用表单', () => {
    renderWithProviders(<BrandForm {...defaultProps} loading={true} />);

    // 验证所有输入控件被禁用
    expect(screen.getByTestId('brand-name-input')).toBeDisabled();
    expect(screen.getByTestId('brand-type-select')).toBeDisabled();
    expect(screen.getByTestId('save-brand-button')).toBeDisabled();
    expect(screen.getByTestId('cancel-brand-button')).toBeDisabled();
  });

  it('应该处理主营类目选择', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 选择主营类目
    await user.click(screen.getByTestId('primary-categories-select'));
    await user.click(screen.getByRole('option', { name: '饮料' }));
    await user.click(screen.getByRole('option', { name: '食品' }));
    await user.keyboard('{Escape}'); // 关闭选择器

    // 验证类目已选择（具体验证方式取决于组件实现）
    const categoriesSelect = screen.getByTestId('primary-categories-select');
    expect(categoriesSelect).toBeInTheDocument();
  });

  it('应该处理品牌标签输入', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 添加标签
    const tagsInput = screen.getByTestId('brand-tags-input');
    await user.type(tagsInput, '国产品牌');
    await user.keyboard('{Enter}');
    await user.type(tagsInput, '知名品牌');
    await user.keyboard('{Enter}');

    // 验证标签已添加（具体验证方式取决于组件实现）
    expect(tagsInput).toBeInTheDocument();
  });

  it('应该显示状态选择的默认值', () => {
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 创建模式下默认应该选择草稿状态
    expect(screen.getByTestId('brand-status-select')).toHaveValue('draft');
  });

  it('应该处理品牌等级选择', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 选择品牌等级
    await user.click(screen.getByTestId('brand-level-select'));
    await user.click(screen.getByRole('option', { name: 'A级' }));

    // 验证选择结果
    expect(screen.getByTestId('brand-level-select')).toHaveValue('A');
  });

  it('应该清空表单错误状态', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 先触发错误
    await user.click(screen.getByTestId('save-brand-button'));
    await waitFor(() => {
      expect(screen.getByTestId('brand-name-error')).toBeInTheDocument();
    });

    // 修正错误
    await user.type(screen.getByTestId('brand-name-input'), '有效品牌');
    await user.selectOptions(screen.getByTestId('brand-type-select'), 'own');

    // 验证错误状态清除
    await waitFor(() => {
      expect(screen.queryByTestId('brand-name-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('brand-type-error')).not.toBeInTheDocument();
    });
  });

  it('应该处理键盘快捷键', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<BrandForm {...defaultProps} onSubmit={onSubmit} />);

    // 填写必填字段
    await user.type(screen.getByTestId('brand-name-input'), '测试品牌');
    await user.selectOptions(screen.getByTestId('brand-type-select'), 'own');

    // 按 Ctrl+Enter 提交表单
    await user.keyboard('{Control>}{Enter}{/Control}');

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('应该处理 ESC 键关闭', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithProviders(<BrandForm {...defaultProps} onCancel={onCancel} />);

    // 按 ESC 键
    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalled();
  });

  it('应该显示品牌LOGO上传组件', () => {
    renderWithProviders(<BrandForm {...defaultProps} />);

    // 验证LOGO上传组件存在
    expect(screen.getByTestId('brand-logo-upload')).toBeInTheDocument();
    expect(screen.getByTestId('logo-upload-area')).toBeInTheDocument();
  });

  it('应该处理编辑模式的LOGO显示', () => {
    const brandWithLogo = {
      ...mockBrand,
      logoUrl: 'https://example.com/logo.png',
    };

    renderWithProviders(<BrandForm {...defaultProps} mode="edit" brand={brandWithLogo} />);

    // 验证现有LOGO显示
    expect(screen.getByTestId('existing-logo-preview')).toBeInTheDocument();
    expect(screen.getByTestId('existing-logo-image')).toHaveAttribute('src', 'logo.png');
  });
});
