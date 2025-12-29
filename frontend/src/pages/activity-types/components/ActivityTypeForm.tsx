/**
 * 活动类型管理 - 表单组件（新建/编辑）
 */

import React from 'react';
import { Form, Input, InputNumber, Button, Space, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createActivityTypeSchema,
  updateActivityTypeSchema,
} from '../types/activity-type.schema';
import type {
  CreateActivityTypeInput,
  UpdateActivityTypeInput,
} from '../types/activity-type.schema';
import type { ActivityType } from '../types/activity-type.types';

interface ActivityTypeFormProps {
  initialData?: ActivityType | null;
  onSubmit: (data: CreateActivityTypeInput | UpdateActivityTypeInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ActivityTypeForm: React.FC<ActivityTypeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateActivityTypeInput | UpdateActivityTypeInput>({
    resolver: zodResolver(initialData ? updateActivityTypeSchema : createActivityTypeSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || null,
          businessCategory: initialData.businessCategory ?? null,
          backgroundImageUrl: initialData.backgroundImageUrl ?? null,
          sort: initialData.sort,
        }
      : {
          name: '',
          description: null,
          businessCategory: null,
          backgroundImageUrl: null,
          sort: 0,
        },
  });

  const handleFormSubmit = async (data: CreateActivityTypeInput | UpdateActivityTypeInput) => {
    try {
      await onSubmit(data);
      // 成功消息在父组件中显示
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败，请重试';
      // 检查是否是名称唯一性错误
      if (errorMessage.includes('已存在') || errorMessage.includes('409') || errorMessage.includes('CONFLICT')) {
        // 提取具体的名称（如果有）
        const nameMatch = errorMessage.match(/已存在[：:]\s*([^，,。.]+)/);
        const existingName = nameMatch ? nameMatch[1] : data.name;
        message.error(`活动类型名称"${existingName}"已存在，请使用其他名称`);
      } else {
        message.error(errorMessage);
      }
      throw error; // Re-throw to let parent handle
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Form.Item
        label="活动类型名称"
        required
        validateStatus={errors.name ? 'error' : ''}
        help={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入活动类型名称（如：企业团建、订婚、生日Party）"
              maxLength={100}
              showCount
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="描述"
        validateStatus={errors.description ? 'error' : ''}
        help={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              value={field.value || ''}
              placeholder="请输入活动类型描述（可选）"
              rows={3}
              maxLength={500}
              showCount
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="业务分类"
        validateStatus={errors.businessCategory ? 'error' : ''}
        help={errors.businessCategory?.message}
      >
        <Controller
          name="businessCategory"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ''}
              placeholder="请输入业务分类（如：私人订制、商务团建、派对策划）"
              maxLength={100}
              showCount
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="背景图 URL"
        validateStatus={errors.backgroundImageUrl ? 'error' : ''}
        help={errors.backgroundImageUrl?.message}
      >
        <Controller
          name="backgroundImageUrl"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value || ''}
              placeholder="请输入场景背景图的完整 URL（可选）"
              maxLength={1000}
              showCount
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="排序号"
        required
        validateStatus={errors.sort ? 'error' : ''}
        help={errors.sort?.message}
      >
        <Controller
          name="sort"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              value={field.value}
              min={0}
              placeholder="请输入排序号（数字越大越靠后）"
              style={{ width: '100%' }}
            />
          )}
        />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={loading || isSubmitting}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading || isSubmitting}
          >
            {initialData ? '更新' : '创建'}
          </Button>
        </Space>
      </Form.Item>
    </form>
  );
};

