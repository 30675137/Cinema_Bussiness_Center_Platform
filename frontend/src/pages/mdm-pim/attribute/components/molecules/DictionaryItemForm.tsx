/**
 * DictionaryItemForm Component (Molecule)
 *
 * Form for creating and editing dictionary items.
 * Features:
 * - Auto-generates code from name using pinyin
 * - Allows manual code override
 * - Validates duplicate names within the same type
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, InputNumber, Switch, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDictionaryItemSchema, updateDictionaryItemSchema } from '@/features/attribute-dictionary/utils/validators';
import { generateCode, generateUniqueCode } from '@/features/attribute-dictionary/utils/codeGenerator';
import type { DictionaryItem } from '@/features/attribute-dictionary/types';
import type { DictionaryItemFormValues, DrawerMode } from '../../types/attribute.types';
import { useDictionaryItemsQuery } from '../../hooks/useDictionaryQueries';

interface DictionaryItemFormProps {
  mode: DrawerMode;
  typeId: string;
  initialData?: DictionaryItem;
  onSubmit: (data: DictionaryItemFormValues) => void;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Form component for dictionary item create/edit
 */
const DictionaryItemForm: React.FC<DictionaryItemFormProps> = ({
  mode,
  typeId,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const [autoGenerateCode, setAutoGenerateCode] = useState(!isEditMode);

  // Fetch existing items to check for duplicate names and codes
  const { data: existingItems = [] } = useDictionaryItemsQuery(typeId, undefined, {
    enabled: !!typeId,
  });

  // Get existing codes and names for validation
  const existingCodes = useMemo(() => {
    return new Set(
      existingItems
        .filter(item => !initialData || item.id !== initialData.id)
        .map(item => item.code)
    );
  }, [existingItems, initialData]);

  const existingNames = useMemo(() => {
    return new Set(
      existingItems
        .filter(item => !initialData || item.id !== initialData.id)
        .map(item => item.name.toLowerCase())
    );
  }, [existingItems, initialData]);

  const schema = isEditMode ? updateDictionaryItemSchema : createDictionaryItemSchema.extend({
    typeId: createDictionaryItemSchema.shape.typeId,
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DictionaryItemFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: '',
      code: '',
      sort: 1,
      status: 'active',
      remark: '',
    },
  });

  const watchedName = watch('name');
  const watchedCode = watch('code');

  // Auto-generate code when name changes (only in create mode)
  useEffect(() => {
    if (autoGenerateCode && !isEditMode && watchedName) {
      const baseCode = generateCode(watchedName);
      const uniqueCode = generateUniqueCode(watchedName, existingCodes);
      setValue('code', uniqueCode, { shouldValidate: false });
    }
  }, [watchedName, autoGenerateCode, isEditMode, existingCodes, setValue]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        code: initialData.code,
        sort: initialData.sort,
        status: initialData.status,
        remark: initialData.remark || '',
      });
      setAutoGenerateCode(false); // Disable auto-generation in edit mode
    } else {
      reset({
        name: '',
        code: '',
        sort: 1,
        status: 'active',
        remark: '',
      });
      setAutoGenerateCode(true);
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: DictionaryItemFormValues) => {
    // Check for duplicate name
    if (existingNames.has(data.name.toLowerCase())) {
      message.error('该字典类型下名称已存在');
      return;
    }

    // Check for duplicate code (if code is provided)
    if (data.code && existingCodes.has(data.code.toUpperCase())) {
      message.error('该字典类型下编码已存在');
      return;
    }

    onSubmit(data);
  };

  const handleNameChange = (value: string) => {
    setValue('name', value);
    // If auto-generate is enabled, code will be updated by useEffect
  };

  const handleCodeChange = (value: string) => {
    setValue('code', value.toUpperCase().replace(/[^A-Z0-9_]/g, ''));
    // Disable auto-generation when user manually edits code
    if (value) {
      setAutoGenerateCode(false);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(handleFormSubmit)}
      disabled={isViewMode || loading}
      id="dictionary-item-form"
    >
      <Form.Item
        label="字典项名称"
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
              onChange={(e) => {
                field.onChange(e);
                handleNameChange(e.target.value);
              }}
              placeholder="请输入字典项名称（如：500毫升）"
              maxLength={50}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="字典项编码"
        required={!isEditMode}
        validateStatus={errors.code ? 'error' : undefined}
        help={
          errors.code?.message ||
          (autoGenerateCode && !isEditMode ? '编码将根据名称自动生成' : undefined)
        }
        extra={
          !isEditMode && autoGenerateCode
            ? '编码将根据名称自动生成，可手动修改'
            : undefined
        }
      >
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleCodeChange(e.target.value);
              }}
              placeholder="请输入字典项编码（如：500ML）"
              disabled={isEditMode || isViewMode}
              maxLength={50}
              suffix={
                !isEditMode && autoGenerateCode ? (
                  <span style={{ fontSize: 12, color: '#999' }}>自动生成</span>
                ) : null
              }
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
        label="状态"
        validateStatus={errors.status ? 'error' : undefined}
        help={errors.status?.message}
      >
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value === 'active'}
              onChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
              checkedChildren="启用"
              unCheckedChildren="停用"
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="备注"
        validateStatus={errors.remark ? 'error' : undefined}
        help={errors.remark?.message}
      >
        <Controller
          name="remark"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              placeholder="请输入备注（可选）"
              rows={3}
              maxLength={500}
              showCount
            />
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default DictionaryItemForm;

