/**
 * SKU表单 - 基础信息步骤
 * 使用 React Hook Form Controller
 */
import React, { useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import { Controller, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { SPU } from '@/types/sku';
import { useSpusQuery } from '@/hooks/useSku';
import { SkuFormValues } from './schema';

const { Option } = Select;

interface BasicInfoTabProps {
  control: Control<SkuFormValues>;
  errors: FieldErrors<SkuFormValues>;
  mode: 'create' | 'edit';
  setValue: UseFormSetValue<SkuFormValues>;
  watch: UseFormWatch<SkuFormValues>;
  initialData?: any; // 保留以兼容现有调用
}

/**
 * 基础信息步骤组件
 */
export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  control,
  errors,
  mode,
  setValue,
  watch,
}) => {
  const { data: spus = [] } = useSpusQuery();
  const spuId = watch('spuId');

  // 监听SPU选择变化，自动填充品牌和类目（这些字段不在表单中，仅用于显示）
  // 注意：brand 和 category 不在 SkuFormValues 中，因为它们继承自 SPU
  // 这里我们只是获取 SPU 信息用于显示

  return (
    <div data-testid="sku-form-basic-info-tab">
      <Form.Item
        label="SKU编码"
        validateStatus={errors.code ? 'error' : undefined}
        help={errors.code?.message as string}
        id="field-code"
      >
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              disabled
              placeholder="系统自动生成"
              data-testid="sku-form-code-input"
              id="code"
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="所属SPU"
        required
        validateStatus={errors.spuId ? 'error' : undefined}
        help={errors.spuId?.message as string}
        id="field-spuId"
      >
        <Controller
          name="spuId"
          control={control}
          rules={{ required: '请选择所属SPU' }}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="请选择SPU"
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              disabled={mode === 'edit'}
              data-testid="sku-form-spu-select"
              id="spuId"
            >
              {spus.map((spu: SPU) => (
                <Option key={spu.id} value={spu.id}>
                  {spu.name}
                </Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      {/* 品牌和类目（只读显示，继承自SPU） */}
      {spuId && (
        <>
          <Form.Item label="品牌">
            <Input
              value={spus.find((spu: SPU) => spu.id === spuId)?.brand || ''}
              disabled
              placeholder="继承自SPU"
            />
          </Form.Item>
          <Form.Item label="类目">
            <Input
              value={spus.find((spu: SPU) => spu.id === spuId)?.category || ''}
              disabled
              placeholder="继承自SPU"
            />
          </Form.Item>
        </>
      )}

      <Form.Item
        label="SKU名称"
        required
        validateStatus={errors.name ? 'error' : undefined}
        help={errors.name?.message as string}
        id="field-name"
      >
        <Controller
          name="name"
          control={control}
          rules={{
            required: '请输入SKU名称',
            maxLength: { value: 200, message: 'SKU名称不能超过200个字符' },
          }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入SKU名称"
              maxLength={200}
              data-testid="sku-form-name-input"
              id="name"
            />
          )}
        />
      </Form.Item>
    </div>
  );
};
