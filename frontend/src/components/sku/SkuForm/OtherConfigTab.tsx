/**
 * SKU表单 - 其他配置步骤
 * 使用 React Hook Form Controller
 */
import React from 'react';
import { Form, Switch, InputNumber, Radio } from 'antd';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors } from 'react-hook-form';
import { SkuStatus } from '@/types/sku';
import type { SkuFormValues } from './schema';

interface OtherConfigTabProps {
  control: Control<SkuFormValues>;
  errors: FieldErrors<SkuFormValues>;
  mode: 'create' | 'edit';
  initialData?: any; // 保留以兼容现有调用
  setValue?: any; // 保留以兼容现有调用
  watch?: any; // 保留以兼容现有调用
}

/**
 * 其他配置步骤组件
 */
export const OtherConfigTab: React.FC<OtherConfigTabProps> = ({ control, errors, mode }) => {
  return (
    <div data-testid="sku-form-other-config-tab">
      <Form.Item
        label="是否管理库存"
        validateStatus={errors.manageInventory ? 'error' : undefined}
        help={errors.manageInventory?.message as string}
        id="field-manageInventory"
      >
        <Controller
          name="manageInventory"
          control={control}
          render={({ field }) => (
            <Switch
              {...field}
              checked={field.value ?? true}
              checkedChildren="是"
              unCheckedChildren="否"
              data-testid="sku-form-manage-inventory-switch"
              id="manageInventory"
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="是否允许负库存"
        validateStatus={errors.allowNegativeStock ? 'error' : undefined}
        help={errors.allowNegativeStock?.message as string}
        id="field-allowNegativeStock"
      >
        <Controller
          name="allowNegativeStock"
          control={control}
          render={({ field }) => (
            <Switch
              {...field}
              checked={field.value ?? false}
              checkedChildren="是"
              unCheckedChildren="否"
              data-testid="sku-form-allow-negative-stock-switch"
              id="allowNegativeStock"
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="最小起订量"
        validateStatus={errors.minOrderQty ? 'error' : undefined}
        help={errors.minOrderQty?.message as string}
        id="field-minOrderQty"
      >
        <Controller
          name="minOrderQty"
          control={control}
          rules={{
            validate: (value) => {
              if (value === undefined || value === null) return true;
              if (value <= 0) return '最小起订量必须大于0';
              return true;
            },
          }}
          render={({ field }) => (
            <InputNumber
              {...field}
              placeholder="请输入最小起订量"
              min={0}
              precision={0}
              style={{ width: '100%' }}
              data-testid="sku-form-min-order-qty-input"
              id="minOrderQty"
              onChange={(value) => field.onChange(value ?? undefined)}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="最小销售量"
        validateStatus={errors.minSaleQty ? 'error' : undefined}
        help={errors.minSaleQty?.message as string}
        id="field-minSaleQty"
      >
        <Controller
          name="minSaleQty"
          control={control}
          rules={{
            validate: (value) => {
              if (value === undefined || value === null) return true;
              if (value <= 0) return '最小销售量必须大于0';
              return true;
            },
          }}
          render={({ field }) => (
            <InputNumber
              {...field}
              placeholder="请输入最小销售量"
              min={0}
              precision={0}
              style={{ width: '100%' }}
              data-testid="sku-form-min-sale-qty-input"
              id="minSaleQty"
              onChange={(value) => field.onChange(value ?? undefined)}
            />
          )}
        />
      </Form.Item>
    </div>
  );
};
