/**
 * ReservationSettingsForm Component
 *
 * Form component for editing store reservation settings.
 * Uses React Hook Form with Zod validation.
 */

import React, { useEffect } from 'react';
import { Form, Switch, InputNumber, Button, Space, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSettingsSchema } from '../types/reservation-settings.schema';
import type { ReservationSettingsFormData } from '../types/reservation-settings.schema';
import type { StoreReservationSettings } from '../types/reservation-settings.types';

interface ReservationSettingsFormProps {
  storeId: string;
  storeName: string;
  initialData?: StoreReservationSettings;
  onSubmit: (data: ReservationSettingsFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Reservation Settings Form Component
 * Provides form for editing reservation settings with validation
 */
const ReservationSettingsForm: React.FC<ReservationSettingsFormProps> = ({
  storeId,
  storeName,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReservationSettingsFormData>({
    resolver: zodResolver(reservationSettingsSchema),
    defaultValues: {
      isReservationEnabled: initialData?.isReservationEnabled ?? false,
      maxReservationDays: initialData?.maxReservationDays ?? 0,
    },
  });

  // Watch isReservationEnabled to conditionally enable/disable maxReservationDays
  const isReservationEnabled = watch('isReservationEnabled');

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        isReservationEnabled: initialData.isReservationEnabled,
        maxReservationDays: initialData.maxReservationDays,
      });
    }
  }, [initialData, reset]);

  // Handle form submission
  const onFormSubmit = async (data: ReservationSettingsFormData) => {
    try {
      await onSubmit(data);
      message.success('预约设置更新成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新失败，请重试');
      throw error; // Re-throw to let form handle error state
    }
  };

  // Handle reservation enabled toggle
  const handleReservationEnabledChange = (checked: boolean) => {
    setValue('isReservationEnabled', checked);
    // If disabling, set maxReservationDays to 0
    if (!checked) {
      setValue('maxReservationDays', 0);
    } else if (watch('maxReservationDays') === 0) {
      // If enabling and days is 0, set to default 7
      setValue('maxReservationDays', 7);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onFormSubmit)}
      className="reservation-settings-form"
    >
      <Form.Item label="门店">
        <div style={{ padding: '4px 0', color: '#666' }}>{storeName}</div>
      </Form.Item>

      <Form.Item
        label="是否开放预约"
        required
        help={errors.isReservationEnabled?.message}
        validateStatus={errors.isReservationEnabled ? 'error' : ''}
      >
        <Controller
          name="isReservationEnabled"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={handleReservationEnabledChange}
              checkedChildren="已开放"
              unCheckedChildren="未开放"
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="可预约天数"
        required={isReservationEnabled}
        help={errors.maxReservationDays?.message || (isReservationEnabled ? '设置允许预约未来多少天（1-365天）' : '未开放预约时无需设置')}
        validateStatus={errors.maxReservationDays ? 'error' : ''}
      >
        <Controller
          name="maxReservationDays"
          control={control}
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              max={365}
              disabled={!isReservationEnabled}
              style={{ width: '100%' }}
              placeholder={isReservationEnabled ? '请输入1-365之间的数字' : '未开放预约'}
              parser={(value) => {
                const parsed = parseInt(value?.replace(/\D/g, '') || '0', 10);
                return isNaN(parsed) ? 0 : parsed;
              }}
            />
          )}
        />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={isSubmitting || loading}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || loading}
          >
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ReservationSettingsForm;

