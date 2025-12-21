/**
 * BatchReservationSettingsModal Component
 *
 * Modal component for batch updating reservation settings for multiple stores.
 * Uses React Hook Form with Zod validation.
 */

import React, { useEffect } from 'react';
import { Modal, Form, Switch, InputNumber, Button, Space, message, Alert, List, Typography } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSettingsSchema } from '../types/reservation-settings.schema';
import type { ReservationSettingsFormData } from '../types/reservation-settings.schema';
import type { BatchUpdateResult } from '../types/reservation-settings.types';

const { Text } = Typography;

interface BatchReservationSettingsModalProps {
  visible: boolean;
  selectedStoreIds: string[];
  selectedStoreNames?: string[];
  onSubmit: (data: ReservationSettingsFormData) => Promise<BatchUpdateResult>;
  onCancel: () => void;
  loading?: boolean;
  result?: BatchUpdateResult | null;
}

/**
 * Batch Reservation Settings Modal Component
 * Provides form for batch updating reservation settings with validation and result display
 */
const BatchReservationSettingsModal: React.FC<BatchReservationSettingsModalProps> = ({
  visible,
  selectedStoreIds,
  selectedStoreNames = [],
  onSubmit,
  onCancel,
  loading = false,
  result = null,
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
      isReservationEnabled: false,
      maxReservationDays: 0,
    },
  });

  // Watch isReservationEnabled to conditionally enable/disable maxReservationDays
  const isReservationEnabled = watch('isReservationEnabled');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      reset({
        isReservationEnabled: false,
        maxReservationDays: 0,
      });
    }
  }, [visible, reset]);

  // Handle form submission
  const onFormSubmit = async (data: ReservationSettingsFormData) => {
    try {
      await onSubmit(data);
      // Success message will be handled by parent component based on result
    } catch (error) {
      message.error(error instanceof Error ? error.message : '批量更新失败，请重试');
      throw error;
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

  // Display result summary
  const renderResult = () => {
    if (!result) return null;

    const { successCount, failureCount, failures } = result;

    if (failureCount === 0) {
      return (
        <Alert
          message={`批量更新成功：${successCount} 个门店已更新`}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }

    return (
      <Alert
        message={`批量更新完成：成功 ${successCount} 个，失败 ${failureCount} 个`}
        type={successCount > 0 ? 'warning' : 'error'}
        showIcon
        style={{ marginBottom: 16 }}
        description={
          failures.length > 0 && (
            <List
              size="small"
              dataSource={failures}
              renderItem={(failure) => (
                <List.Item>
                  <Text type="danger">
                    {failure.storeId}: {failure.message}
                  </Text>
                </List.Item>
              )}
            />
          )
        }
      />
    );
  };

  return (
    <Modal
      title={`批量设置预约配置 (${selectedStoreIds.length} 个门店)`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      {/* Selected Stores List */}
      {selectedStoreNames.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
          <Text type="secondary">已选择门店：</Text>
          <Text>{selectedStoreNames.join('、')}</Text>
        </div>
      )}

      {/* Result Display */}
      {renderResult()}

      <Form
        layout="vertical"
        onFinish={handleSubmit(onFormSubmit)}
        className="batch-reservation-settings-form"
      >
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
              批量保存
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BatchReservationSettingsModal;

