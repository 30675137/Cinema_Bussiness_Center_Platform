/**
 * @spec O004-beverage-sku-reuse
 * SKU Type Select Component
 *
 * SKU 类型选择器组件,提供 SKU 类型的下拉选择功能
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import React from 'react';
import { Select, type SelectProps } from 'antd';
import { SkuType } from '@/types/sku';

/**
 * SKU 类型选项配置
 */
const SKU_TYPE_OPTIONS = [
  {
    label: '原料',
    value: SkuType.RAW_MATERIAL,
    description: '用于生产的原材料(如威士忌、可乐、冰块等)',
  },
  {
    label: '包材',
    value: SkuType.PACKAGING,
    description: '包装材料(如杯子、吸管、包装袋等)',
  },
  {
    label: '成品',
    value: SkuType.FINISHED_PRODUCT,
    description: '可直接销售的成品饮品(需配置 BOM 配方)',
  },
  {
    label: '套餐',
    value: SkuType.COMBO,
    description: '多个商品的组合套餐(需配置套餐子项)',
  },
];

/**
 * SKU Type Select Props
 */
export interface SKUTypeSelectProps extends Omit<SelectProps, 'options'> {
  /** 是否显示描述信息 */
  showDescription?: boolean;
}

/**
 * SKU Type Select Component
 *
 * @example
 * ```tsx
 * // 基本用法
 * <SKUTypeSelect
 *   value={skuType}
 *   onChange={(value) => setSkuType(value)}
 *   placeholder="请选择 SKU 类型"
 * />
 *
 * // 显示描述信息
 * <SKUTypeSelect
 *   value={skuType}
 *   onChange={(value) => setSkuType(value)}
 *   showDescription
 * />
 *
 * // 与 React Hook Form 集成
 * <Controller
 *   name="skuType"
 *   control={form.control}
 *   render={({ field }) => (
 *     <SKUTypeSelect
 *       {...field}
 *       placeholder="请选择 SKU 类型"
 *       showDescription
 *     />
 *   )}
 * />
 * ```
 */
export const SKUTypeSelect: React.FC<SKUTypeSelectProps> = ({
  showDescription = false,
  ...selectProps
}) => {
  return (
    <Select
      {...selectProps}
      options={SKU_TYPE_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
        // 使用 Select.Option 的 title 属性显示描述
        title: showDescription ? option.description : undefined,
      }))}
      optionRender={
        showDescription
          ? (option) => {
              const typeOption = SKU_TYPE_OPTIONS.find((o) => o.value === option.value);
              return typeOption ? (
                <div>
                  <div style={{ fontWeight: 500 }}>{typeOption.label}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {typeOption.description}
                  </div>
                </div>
              ) : (
                option.label
              );
            }
          : undefined
      }
    />
  );
};
