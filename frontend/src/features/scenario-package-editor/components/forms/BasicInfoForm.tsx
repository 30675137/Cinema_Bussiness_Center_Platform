/**
 * BasicInfoForm 组件
 * 场景包基础信息表单
 * Feature: 001-scenario-package-tabs
 */

import React, { useEffect } from 'react';
import { Form, Input, Select, Space, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BasicInfoFormSchema, type BasicInfoFormData } from '../../schemas/validationSchemas';
import { useFormDirtyState } from '../../hooks/useFormDirtyState';
import { useUpdateBasicInfo } from '../../hooks/useScenarioPackageQueries';
import { useScenarioPackageStore } from '../../stores/useScenarioPackageStore';
import { SCENARIO_CATEGORIES } from '../../types';
import ImageUploader from './ImageUploader';

interface BasicInfoFormProps {
  /** 场景包ID */
  packageId: string;
  /** 初始数据 */
  initialData?: BasicInfoFormData;
  /** 保存成功回调 */
  onSaveSuccess?: () => void;
}

/**
 * 场景包基础信息表单
 */
const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ packageId, initialData, onSaveSuccess }) => {
  const setIsSaving = useScenarioPackageStore((state) => state.setIsSaving);
  const setDirty = useScenarioPackageStore((state) => state.setDirty);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(BasicInfoFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      category: '',
      mainImage: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = form;

  // 同步初始数据
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // 使用脏状态 hook
  useFormDirtyState({
    form,
    tabKey: 'basic',
    originalData: initialData,
  });

  // 更新 mutation
  const updateMutation = useUpdateBasicInfo(packageId);

  // 提交表单
  const onSubmit = async (data: BasicInfoFormData) => {
    try {
      setIsSaving(true);
      await updateMutation.mutateAsync(data);
      message.success('保存成功');
      setDirty('basic', false);
      reset(data); // 重置表单状态，清除 dirty
      onSaveSuccess?.();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)} style={{ maxWidth: 600 }}>
      {/* 场景包名称 */}
      <Form.Item
        label="场景包名称"
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
              placeholder="请输入场景包名称，如：商务团建豪华套餐"
              maxLength={100}
              showCount
            />
          )}
        />
      </Form.Item>

      {/* 场景包分类 */}
      <Form.Item
        label="场景包分类"
        required
        validateStatus={errors.category ? 'error' : undefined}
        help={errors.category?.message}
      >
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="请选择分类"
              options={SCENARIO_CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
            />
          )}
        />
      </Form.Item>

      {/* 场景包描述 */}
      <Form.Item
        label="场景包描述"
        validateStatus={errors.description ? 'error' : undefined}
        help={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              value={field.value || ''}
              placeholder="请输入场景包描述"
              maxLength={500}
              showCount
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          )}
        />
      </Form.Item>

      {/* 主图 */}
      <Form.Item
        label="场景包主图"
        required
        validateStatus={errors.mainImage ? 'error' : undefined}
        help={errors.mainImage?.message}
      >
        <Controller
          name="mainImage"
          control={control}
          render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} />}
        />
      </Form.Item>

      {/* 操作按钮 */}
      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={updateMutation.isPending}
            disabled={!isDirty || !isValid}
          >
            保存
          </Button>
          <Button onClick={() => reset(initialData)} disabled={!isDirty}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default BasicInfoForm;
