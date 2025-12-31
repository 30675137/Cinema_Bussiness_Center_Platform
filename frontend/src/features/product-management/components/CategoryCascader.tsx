/**
 * @spec O004-beverage-sku-reuse
 * Category Cascader Component
 *
 * 类目级联选择器组件,提供层级类目的选择功能
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import React from 'react';
import { Cascader, type CascaderProps } from 'antd';

/**
 * 类目数据接口
 */
export interface CategoryOption {
  /** 类目 ID */
  value: string;

  /** 类目名称 */
  label: string;

  /** 子类目列表 */
  children?: CategoryOption[];
}

/**
 * Category Cascader Props
 */
export interface CategoryCascaderProps extends Omit<CascaderProps<CategoryOption>, 'options'> {
  /** 类目选项数据 */
  options: CategoryOption[];

  /** 是否加载中 */
  loading?: boolean;
}

/**
 * Category Cascader Component
 *
 * 提供层级类目选择功能,支持多级类目展开和搜索
 *
 * @example
 * ```tsx
 * // 基本用法
 * const categoryOptions: CategoryOption[] = [
 *   {
 *     value: 'beverage',
 *     label: '饮品',
 *     children: [
 *       { value: 'cocktail', label: '鸡尾酒' },
 *       { value: 'soft-drink', label: '软饮' },
 *     ],
 *   },
 *   {
 *     value: 'snack',
 *     label: '小食',
 *     children: [
 *       { value: 'popcorn', label: '爆米花' },
 *     ],
 *   },
 * ];
 *
 * <CategoryCascader
 *   options={categoryOptions}
 *   value={selectedCategory}
 *   onChange={(value) => setSelectedCategory(value)}
 *   placeholder="请选择类目"
 * />
 *
 * // 与 React Hook Form 集成
 * <Controller
 *   name="categoryId"
 *   control={form.control}
 *   render={({ field }) => (
 *     <CategoryCascader
 *       options={categoryOptions}
 *       value={field.value}
 *       onChange={field.onChange}
 *       placeholder="请选择类目"
 *       showSearch
 *     />
 *   )}
 * />
 * ```
 */
export const CategoryCascader: React.FC<CategoryCascaderProps> = ({
  options,
  loading = false,
  ...cascaderProps
}) => {
  /**
   * 搜索过滤函数
   */
  const filter: CascaderProps<CategoryOption>['showSearch'] = {
    filter: (inputValue, path) =>
      path.some((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      ),
  };

  return (
    <Cascader<CategoryOption>
      options={options}
      loading={loading}
      showSearch={cascaderProps.showSearch ? filter : undefined}
      placeholder={cascaderProps.placeholder || '请选择类目'}
      expandTrigger="hover" // 鼠标悬停展开子类目
      changeOnSelect // 允许选择任意级别的类目
      displayRender={(labels) => labels.join(' / ')} // 显示完整路径
      {...cascaderProps}
    />
  );
};
