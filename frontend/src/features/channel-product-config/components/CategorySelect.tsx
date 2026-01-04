/**
 * @spec O008-channel-product-category-migration
 * 动态分类选择组件
 *
 * 用于商品配置表单中选择菜单分类，支持创建和编辑两种模式：
 * - 创建模式：仅显示可见分类
 * - 编辑模式：显示所有分类，隐藏分类标记 "(已隐藏)"
 */

import React, { useMemo } from 'react';
import { Select, Spin, Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useMenuCategories } from '@/features/menu-category/hooks/useMenuCategories';
import type { MenuCategoryDTO } from '@/features/menu-category/types';

export interface CategorySelectProps {
  /** 当前选中的分类 ID */
  value?: string;

  /** 选中变化回调 */
  onChange?: (categoryId: string | undefined) => void;

  /** 模式：创建（仅显示可见分类）或编辑（包含当前分类） */
  mode: 'create' | 'edit';

  /** 编辑模式下，当前商品关联的分类（可能已隐藏） */
  currentCategory?: MenuCategoryDTO;

  /** 是否禁用 */
  disabled?: boolean;

  /** 占位文本 */
  placeholder?: string;

  /** 是否允许清除选择（筛选场景使用） */
  allowClear?: boolean;
}

/**
 * 分类选择组件
 */
export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  mode,
  currentCategory,
  disabled = false,
  placeholder = '请选择商品分类',
  allowClear = false,
}) => {
  // 根据模式决定是否包含隐藏分类
  const includeHidden = mode === 'edit';

  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useMenuCategories({ includeHidden });

  // 构建选项列表
  const options = useMemo(() => {
    if (!categories) return [];

    // 按 sortOrder 排序
    const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

    // 在编辑模式下，如果当前分类已隐藏且不在列表中，需要手动添加
    let allCategories = sortedCategories;
    if (
      mode === 'edit' &&
      currentCategory &&
      !sortedCategories.some((c) => c.id === currentCategory.id)
    ) {
      allCategories = [currentCategory, ...sortedCategories];
    }

    return allCategories.map((category) => ({
      value: category.id,
      label: category.isVisible ? category.displayName : `${category.displayName} (已隐藏)`,
      disabled: !category.isVisible && category.id !== value,
      // 用于搜索过滤
      searchText: `${category.displayName} ${category.code}`,
    }));
  }, [categories, mode, currentCategory, value]);

  // 处理选择变化
  const handleChange = (selectedValue: string | undefined) => {
    onChange?.(selectedValue);
  };

  // 处理刷新
  const handleRefresh = () => {
    refetch();
  };

  // 加载状态
  if (isLoading) {
    return <Select placeholder={placeholder} disabled loading style={{ width: '100%' }} />;
  }

  // 错误状态
  if (isError) {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="无法加载分类列表"
          description={error instanceof Error ? error.message : '请刷新重试'}
          type="error"
          showIcon
        />
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="small">
          重试
        </Button>
      </Space>
    );
  }

  // 无分类时显示提示
  if (!options.length) {
    return <Select placeholder="暂无可用分类" disabled style={{ width: '100%' }} />;
  }

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      showSearch
      optionFilterProp="label"
      filterOption={(input, option) =>
        (option?.searchText ?? '').toLowerCase().includes(input.toLowerCase())
      }
      style={{ width: '100%' }}
      notFoundContent={isLoading ? <Spin size="small" /> : '未找到匹配分类'}
      allowClear={allowClear}
    />
  );
};

export default CategorySelect;
