import React, { useState, useEffect, useMemo } from 'react';
import { Cascader, Spin, TreeSelect } from 'antd';
import type { CascaderProps, TreeSelectProps } from 'antd';
import type { Category } from '@/types/spu';

interface CategorySelectorProps extends Omit<CascaderProps, 'options' | 'children'> {
  categories?: Category[];
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
    const buildOptions = (categories: Category[], level = 1): any[] => {
      return categories.map((category) => {
        const option: any = {
          [fieldNames.label!]: category.name,
          [fieldNames.value!]: category.id,
          isLeaf: level >= maxLevel || !category.children || category.children.length === 0,
        };

        // 添加额外信息
        option.disabled = category.status === 'inactive';
        option.category = category;

        if (category.children && category.children.length > 0 && level < maxLevel) {
          option[fieldNames.children!] = buildOptions(category.children, level + 1);
        }

        return option;
      });
    };

    return buildOptions(categories);
  }, [categories, maxLevel, fieldNames]);

  // 自定义显示渲染
  const displayRender = (labels: string[], selectedOptions: any[]) => {
    return labels.join(' / ');
  };

  // 处理值变化
  const handleChange = (value: (string | number)[], selectedOptions: any[]) => {
    if (onChange) {
      onChange(value, selectedOptions);
    }
  };

  // 自定义过滤函数
  const filter = (inputValue: string, path: any[]) => {
    return path.some((option) =>
      option[fieldNames.label].toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  return (
    <Cascader
      value={value}
      onChange={handleChange}
      options={cascaderOptions}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      changeOnSelect={changeOnSelect}
      displayRender={displayRender}
      filter={filter}
      loading={externalLoading || loading}
      notFoundContent={externalLoading || loading ? <Spin size="small" /> : '暂无分类数据'}
      expandIcon={(props) => {
        return <span {...props}>{props.isLeaf ? '' : '▶'}</span>;
      }}
      {...restProps}
    />
  );
};

/**
 * 分类树形选择器
 */
interface CategoryTreeSelectorProps extends Omit<TreeSelectProps, 'treeData' | 'children'> {
  categories?: Category[];
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
    const buildTreeData = (categories: Category[], level = 1): any[] => {
      return categories.map((category) => ({
        title: category.name,
        value: category.id,
        key: category.id,
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
      treeNodeValueProp="value"
      loading={externalLoading}
      notFoundContent={externalLoading ? <Spin size="small" /> : '暂无分类数据'}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      treeDefaultExpandAll={false}
      treeLine={{ showLeafIcon: false }}
      titleRender={treeNodeRender}
      {...restProps}
    />
  );
};

/**
 * 分类路径显示组件
 */
interface CategoryPathProps {
  categoryId?: string;
  categories?: Category[];
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
      categories: Category[],
      targetId: string,
      path: Category[] = []
    ): Category[] | null => {
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
      categories: Category[],
      targetId: string,
      path: Category[] = []
    ): Category[] | null => {
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
