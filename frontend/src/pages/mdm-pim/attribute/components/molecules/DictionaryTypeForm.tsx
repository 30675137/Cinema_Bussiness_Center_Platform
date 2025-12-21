/**
 * DictionaryTypeForm Component (Molecule)
 *
 * Form for creating and editing dictionary types.
 * Uses React Hook Form with Zod validation.
 */

import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDictionaryTypeSchema } from '@/features/attribute-dictionary/utils/validators';
import type { DictionaryType } from '@/features/attribute-dictionary/types';
import type { DictionaryTypeFormValues, DrawerMode } from '../../types/attribute.types';

interface DictionaryTypeFormProps {
  mode: DrawerMode;
  initialData?: DictionaryType;
  onSubmit: (data: DictionaryTypeFormValues) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { label: '基础字典', value: 'basic' },
  { label: '业务字典', value: 'business' },
  { label: '自定义字典', value: 'custom' },
];

/**
 * Form component for dictionary type create/edit
 */
const DictionaryTypeForm: React.FC<DictionaryTypeFormProps> = ({
  mode,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DictionaryTypeFormValues>({
    resolver: zodResolver(createDictionaryTypeSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      category: 'custom',
      sort: 1,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description || '',
        category: initialData.category,
        sort: initialData.sort,
      });
    } else {
      reset({
        code: '',
        name: '',
        description: '',
        category: 'custom',
        sort: 1,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: DictionaryTypeFormValues) => {
    onSubmit(data);
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(handleFormSubmit)}
      disabled={isViewMode || loading}
      id="dictionary-type-form"
    >
      <Form.Item
        label="字典编码"
        required={!isEditMode}
        validateStatus={errors.code ? 'error' : undefined}
        help={errors.code?.message}
      >
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入字典编码（如：CAPACITY_UNIT）"
              disabled={isEditMode || isViewMode}
              maxLength={50}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="字典名称"
        required
        validateStatus={errors.name ? 'error' : undefined}
        help={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入字典名称（如：容量单位）"
              maxLength={50}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="字典分类"
        validateStatus={errors.category ? 'error' : undefined}
        help={errors.category?.message}
      >
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="请选择字典分类"
              options={CATEGORY_OPTIONS}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="显示顺序"
        validateStatus={errors.sort ? 'error' : undefined}
        help={errors.sort?.message}
      >
        <Controller
          name="sort"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={1}
              max={9999}
              placeholder="请输入显示顺序"
              style={{ width: '100%' }}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="描述"
        validateStatus={errors.description ? 'error' : undefined}
        help={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              placeholder="请输入字典描述（可选）"
              rows={3}
              maxLength={200}
              showCount
            />
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default DictionaryTypeForm;
