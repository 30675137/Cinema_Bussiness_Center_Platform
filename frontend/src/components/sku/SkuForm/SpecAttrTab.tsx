/**
 * SKU表单 - 规格属性步骤
 * 使用 React Hook Form Controller
 */
import React from 'react';
import { Form, Input, Select } from 'antd';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import type { SkuFormValues } from './schema';

const { Option } = Select;

interface SpecAttrTabProps {
  control: Control<SkuFormValues>;
  errors: FieldErrors<SkuFormValues>;
  mode: 'create' | 'edit';
  initialData?: any; // 保留以兼容现有调用
  setValue?: any; // 保留以兼容现有调用
  watch?: any; // 保留以兼容现有调用
}

/**
 * 规格属性步骤组件
 */
export const SpecAttrTab: React.FC<SpecAttrTabProps> = ({
  control,
  errors,
  mode,
}) => {
  // 口味选项
  const flavorOptions = [
    '原味',
    '柠檬味',
    '草莓味',
    '葡萄味',
    '橙子味',
    '苹果味',
    '香草味',
    '巧克力味',
  ];

  // 包装形式选项
  const packagingOptions = [
    '瓶装',
    '听装',
    '袋装',
    '盒装',
    '罐装',
    '杯装',
    '桶装',
  ];

  return (
    <div data-testid="sku-form-spec-attr-tab">
      <Form.Item
        label="规格/型号"
        validateStatus={errors.spec ? 'error' : undefined}
        help={errors.spec?.message as string}
        id="field-spec"
      >
        <Controller
          name="spec"
          control={control}
          rules={{ maxLength: { value: 200, message: '规格/型号不能超过200个字符' } }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入规格/型号（如：330ml、500ml、1L等）"
              maxLength={200}
              data-testid="sku-form-spec-input"
              id="spec"
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="口味"
        validateStatus={errors.flavor ? 'error' : undefined}
        help={errors.flavor?.message as string}
        id="field-flavor"
      >
        <Controller
          name="flavor"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="请选择口味"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              data-testid="sku-form-flavor-select"
              id="flavor"
            >
              {flavorOptions.map((flavor) => (
                <Option key={flavor} value={flavor}>
                  {flavor}
                </Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item
        label="包装形式"
        validateStatus={errors.packaging ? 'error' : undefined}
        help={errors.packaging?.message as string}
        id="field-packaging"
      >
        <Controller
          name="packaging"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="请选择包装形式"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              data-testid="sku-form-packaging-select"
              id="packaging"
            >
              {packagingOptions.map((packaging) => (
                <Option key={packaging} value={packaging}>
                  {packaging}
                </Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>
    </div>
  );
};
