import React, { useState, useEffect, useMemo } from 'react';
import { Cascader, Spin, TreeSelect } from 'antd';
import type { CascaderProps, TreeSelectProps } from 'antd';
import type { CategoryItem } from '@/types/category';

type DefaultOptionType = Record<string, any>;

interface CategorySelectorProps extends Omit<CascaderProps, 'options' | 'children'> {
  categories?: CategoryItem[];
  loading?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  changeOnSelect?: boolean;
  maxLevel?: number;
  fieldNames?: {
    label?: string;
    value?: string;
    children?: string;
  };
}

/**
 * 分类级联选择器
 */
export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories = [],
  loading: externalLoading = false,
  placeholder = '请选择分类',
  allowClear = true,
  showSearch = true,
  changeOnSelect = false,
  maxLevel = 3,
  fieldNames = {
    label: 'name',
    value: 'id',
    children: 'children',
  },
  value,
  onChange,
  ...restProps
}) => {
  const [loading, setLoading] = useState(false);

  // 构建级联数据结构
  const cascaderOptions = useMemo(() => {
    const buildOptions = (categories: CategoryItem[], level = 1): any[] => {
      return categories
        .filter((category) => {
          // 更严格的过滤：确保 id 和 name 都是有效的非空字符串
          const isValid = category && 
                         category.id && 
                         category.name && 
                         typeof category.id === 'string' && 
                         typeof category.name === 'string' &&
                         category.id.trim() !== '' && 
                         category.name.trim() !== '';
          
          if (!isValid) {
            console.warn('过滤无效分类:', category);
          }
          
          return isValid;
        })
        .map((category) => {
          const option: any = {
            // 使用 Cascader 标准字段名，避免 fieldNames 配置冲突
            label: category.name,
            value: category.id,
            key: category.id,
            isLeaf: level >= maxLevel || !category.children || category.children.length === 0,
          };

          // 添加额外信息
          option.disabled = category.status === 'inactive';
          option.category = category;

          if (category.children && category.children.length > 0 && level < maxLevel) {
            option.children = buildOptions(category.children, level + 1);
          }

          return option;
        });
    };

    return buildOptions(categories);
  }, [categories, maxLevel]);

  // 自定义显示渲染
  const displayRender = (labels: string[], selectedOptions?: DefaultOptionType[]) => {
    return labels.join(' / ');
  };

  // 处理值变化
  const handleChange = (value: (string | number | null)[] | null, selectedOptions: DefaultOptionType[]) => {
    if (onChange) {
      // 返回选中的最后一级 ID（叶子节点）
      const leafValue = value && value.length > 0 ? value[value.length - 1] : undefined;
      onChange(leafValue as any, selectedOptions as any);
    }
  };

  // 自定义过滤函数
  const filter = (inputValue: string, path: DefaultOptionType[]) => {
    return path.some((option) =>
      option.label?.toString().toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  // 将单个 ID 值转换为路径数组
  const cascaderValue = useMemo(() => {
    if (!value) return undefined;
    
    // 如果已经是数组，直接返回
    if (Array.isArray(value)) return value;
    
    // 如果是字符串 ID，需要找到完整路径
    const findPath = (categories: CategoryItem[], targetId: string, path: string[] = []): string[] | null => {
      for (const category of categories) {
        if (category.id === targetId) {
          return [...path, category.id];
        }
        if (category.children && category.children.length > 0) {
          const result = findPath(category.children, targetId, [...path, category.id]);
          if (result) return result;
        }
      }
      return null;
    };
    
    return findPath(categories, value as string) || undefined;
  }, [value, categories]);

  return (
    <Cascader
      value={cascaderValue}
      onChange={handleChange}
      options={cascaderOptions}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      changeOnSelect={changeOnSelect}
      displayRender={displayRender}
      loading={externalLoading || loading}
      notFoundContent={externalLoading || loading ? <Spin size="small" /> : '暂无分类数据'}
    />
  );
};

/**
 * 分类树形选择器
 */
interface CategoryTreeSelectorProps extends Omit<TreeSelectProps, 'treeData' | 'children'> {
  categories?: CategoryItem[];
  loading?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  multiple?: boolean;
  maxLevel?: number;
  checkStrictly?: boolean;
}

export const CategoryTreeSelector: React.FC<CategoryTreeSelectorProps> = ({
  categories = [],
  loading: externalLoading = false,
  placeholder = '请选择分类',
  allowClear = true,
  showSearch = true,
  multiple = false,
  maxLevel = 3,
  checkStrictly = false,
  value,
  onChange,
  ...restProps
}) => {
  // 构建树形数据结构
  const treeData = useMemo(() => {
    const buildTreeData = (categories: CategoryItem[], level = 1): any[] => {
      return categories
        .filter((category) => {
          // 更严格的过滤：确保 id 和 name 都是有效的非空字符串
          const isValid = category && 
                         category.id && 
                         category.name && 
                         typeof category.id === 'string' && 
                         typeof category.name === 'string' &&
                         category.id.trim() !== '' && 
                         category.name.trim() !== '';
          
          if (!isValid) {
            console.warn('过滤无效分类(树形选择器):', category);
          }
          
          return isValid;
        })
        .map((category) => ({
          title: category.name,
          value: category.id,
          key: category.id, // 确保 key 是唯一的
          disabled: category.status === 'inactive',
          isLeaf: level >= maxLevel || !category.children || category.children.length === 0,
          category,
          children:
            category.children && category.children.length > 0 && level < maxLevel
              ? buildTreeData(category.children, level + 1)
              : undefined,
        }));
    };

    return buildTreeData(categories);
  }, [categories, maxLevel]);

  // 处理值变化
  const handleChange = (value: any, label: any, extra: any) => {
    if (onChange) {
      onChange(value, label, extra);
    }
  };

  // 自定义节点渲染
  const treeNodeRender = (nodeData: any) => {
    const category = nodeData.category;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{nodeData.title}</span>
        {category && (
          <span
            style={{
              fontSize: '12px',
              color: category.status === 'active' ? '#52c41a' : '#999',
              backgroundColor: category.status === 'active' ? '#f6ffed' : '#f5f5f5',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {category.status === 'active' ? '启用' : '停用'}
          </span>
        )}
      </div>
    );
  };

  return (
    <TreeSelect
      value={value}
      onChange={handleChange}
      treeData={treeData}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      multiple={multiple}
      treeCheckStrictly={checkStrictly}
      treeNodeLabelProp="title"
      loading={externalLoading}
      notFoundContent={externalLoading ? <Spin size="small" /> : '暂无分类数据'}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      treeDefaultExpandAll={false}
      treeLine={{ showLeafIcon: false }}
      {...restProps}
    />
  );
};

/**
 * 分类路径显示组件
 */
interface CategoryPathProps {
  categoryId?: string;
  categories?: CategoryItem[];
  separator?: string;
  showCode?: boolean;
  maxLength?: number;
}

export const CategoryPath: React.FC<CategoryPathProps> = ({
  categoryId,
  categories = [],
  separator = ' / ',
  showCode = false,
  maxLength,
}) => {
  const categoryPath = useMemo(() => {
    const findPath = (
      categories: CategoryItem[],
      targetId: string,
      path: CategoryItem[] = []
    ): CategoryItem[] | null => {
      for (const category of categories) {
        if (category.id === targetId) {
          return [...path, category];
        }
        if (category.children && category.children.length > 0) {
          const result = findPath(category.children, targetId, [...path, category]);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };

    return findPath(categories, categoryId!);
  }, [categories, categoryId]);

  if (!categoryId || !categoryPath || categoryPath.length === 0) {
    return <span style={{ color: '#999' }}>未选择分类</span>;
  }

  const pathText = categoryPath
    .map((category, index) => {
      let text = category.name;
      if (showCode && category.code) {
        text += ` (${category.code})`;
      }
      return text;
    })
    .join(separator);

  if (maxLength && pathText.length > maxLength) {
    return <span title={pathText}>{pathText.substring(0, maxLength - 3)}...</span>;
  }

  return <span>{pathText}</span>;
};

/**
 * 分类面包屑组件
 */
export const CategoryBreadcrumb: React.FC<CategoryPathProps> = (props) => {
  const { categoryId, categories = [], separator = ' / ' } = props;

  const categoryPath = useMemo(() => {
    const findPath = (
      categories: CategoryItem[],
      targetId: string,
      path: CategoryItem[] = []
    ): CategoryItem[] | null => {
      for (const category of categories) {
        if (category.id === targetId) {
          return [...path, category];
        }
        if (category.children && category.children.length > 0) {
          const result = findPath(category.children, targetId, [...path, category]);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };

    return categoryId ? findPath(categories, categoryId) : null;
  }, [categories, categoryId]);

  if (!categoryPath || categoryPath.length === 0) {
    return <span style={{ color: '#999' }}>未选择分类</span>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {categoryPath.map((category, index) => (
        <React.Fragment key={category.id}>
          <span
            style={{
              cursor: 'pointer',
              color: category.status === 'active' ? '#1890ff' : '#999',
              textDecoration: category.status === 'active' ? 'underline' : 'none',
            }}
            title={`ID: ${category.id}${category.code ? `\n编码: ${category.code}` : ''}`}
          >
            {category.name}
          </span>
          {index < categoryPath.length - 1 && (
            <span style={{ margin: '0 8px', color: '#d9d9d9' }}>{separator}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CategorySelector;
