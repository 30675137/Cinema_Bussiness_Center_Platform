/**
 * PackageTierForm 组件
 * 套餐编辑表单模态框
 * Feature: 001-scenario-package-tabs
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Space, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PackageTierFormSchema, type PackageTierFormData } from '../../schemas/validationSchemas';
import type { PackageTier } from '../../types';
import TagInput from '../atoms/TagInput';

interface PackageTierFormProps {
  /** 是否显示模态框 */
  open: boolean;
  /** 编辑的套餐（新建时为 null） */
  tier: PackageTier | null;
  /** 保存回调 */
  onSave: (data: PackageTierFormData) => Promise<void>;
  /** 关闭回调 */
  onClose: () => void;
  /** 是否正在保存 */
  saving?: boolean;
}

/**
 * 套餐编辑表单模态框
 */
const PackageTierForm: React.FC<PackageTierFormProps> = ({
  open,
  tier,
  onSave,
  onClose,
  saving = false,
}) => {
  const isEdit = !!tier;

  const form = useForm<PackageTierFormData>({
    resolver: zodResolver(PackageTierFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      originalPrice: null,
      tags: [],
      serviceDescription: '',
      sortOrder: 0,
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, reset, formState: { errors, isValid } } = form;

  // 编辑时同步数据
  useEffect(() => {
    if (tier) {
      reset({
        name: tier.name,
        price: tier.price,
        originalPrice: tier.originalPrice ?? null,
        tags: tier.tags || [],
        serviceDescription: tier.serviceDescription || '',
        sortOrder: tier.sortOrder,
      });
    } else {
      reset({
        name: '',
        price: 0,
        originalPrice: null,
        tags: [],
        serviceDescription: '',
        sortOrder: 0,
      });
    }
  }, [tier, reset]);

  // 提交表单
  const onSubmit = async (data: PackageTierFormData) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      // 错误由父组件处理
    }
  };

  // 关闭模态框
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? '编辑套餐' : '添加套餐'}
      open={open}
      onCancel={handleClose}
      width={600}
      footer={
        <Space>
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            onClick={handleSubmit(onSubmit)}
            loading={saving}
            disabled={!isValid}
          >
            {isEdit ? '保存' : '添加'}
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        {/* 套餐名称 */}
        <Form.Item
          label="套餐名称"
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
                placeholder="如：标准套餐、豪华套餐"
                maxLength={50}
              />
            )}
          />
        </Form.Item>

        {/* 价格 */}
        <Space style={{ display: 'flex' }} size="middle">
          <Form.Item
            label="售价（元）"
            required
            validateStatus={errors.price ? 'error' : undefined}
            help={errors.price?.message}
            style={{ marginBottom: 0, flex: 1 }}
          >
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="请输入售价"
                  addonAfter="元"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="原价（元）"
            validateStatus={errors.originalPrice ? 'error' : undefined}
            help={errors.originalPrice?.message}
            style={{ marginBottom: 0, flex: 1 }}
          >
            <Controller
              name="originalPrice"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  value={field.value ?? undefined}
                  onChange={(v) => field.onChange(v ?? null)}
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="可选，用于划线价"
                  addonAfter="元"
                />
              )}
            />
          </Form.Item>
        </Space>

        {/* 标签 */}
        <Form.Item
          label="标签"
          validateStatus={errors.tags ? 'error' : undefined}
          help={typeof errors.tags?.message === 'string' ? errors.tags.message : undefined}
          style={{ marginTop: 16 }}
        >
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput
                value={field.value || []}
                onChange={field.onChange}
                maxCount={5}
                placeholder="输入标签后按回车添加"
              />
            )}
          />
        </Form.Item>

        {/* 服务内容 */}
        <Form.Item
          label="服务内容描述"
          validateStatus={errors.serviceDescription ? 'error' : undefined}
          help={errors.serviceDescription?.message}
        >
          <Controller
            name="serviceDescription"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                value={field.value || ''}
                placeholder="描述套餐包含的服务内容，如：&#10;- 4小时影厅包场&#10;- 基础茶歇服务&#10;- 投影设备使用"
                autoSize={{ minRows: 4, maxRows: 8 }}
                maxLength={1000}
                showCount
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PackageTierForm;
