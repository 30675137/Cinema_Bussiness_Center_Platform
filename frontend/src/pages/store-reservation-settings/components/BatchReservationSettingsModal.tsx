/**
 * BatchReservationSettingsModal Component
 *
 * Modal component for batch updating reservation settings for multiple stores.
 * Uses React Hook Form with Zod validation.
 * 
 * @feature 016-store-reservation-settings
 * @updated 添加时长单位、押金配置支持
 */

import React, { useEffect } from 'react';
import { Modal, Form, Switch, InputNumber, Button, Space, message, Alert, List, Typography, Divider, Radio } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSettingsSchema } from '../types/reservation-settings.schema';
import type { ReservationSettingsFormData } from '../types/reservation-settings.schema';
import type { BatchUpdateResult } from '../types/reservation-settings.types';
import { generateDefaultTimeSlots } from '../types/reservation-settings.types';

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
      timeSlots: generateDefaultTimeSlots(),
      minAdvanceHours: 1,
      durationUnit: 1,
      depositRequired: false,
      depositAmount: undefined,
      depositPercentage: undefined,
      isActive: true,
    },
  });

  // Watch fields
  const isReservationEnabled = watch('isReservationEnabled');
  const depositRequired = watch('depositRequired');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      reset({
        isReservationEnabled: false,
        maxReservationDays: 0,
        timeSlots: generateDefaultTimeSlots(),
        minAdvanceHours: 1,
        durationUnit: 1,
        depositRequired: false,
        depositAmount: undefined,
        depositPercentage: undefined,
        isActive: true,
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

        {/* 时长单位 - US3 */}
        {isReservationEnabled && (
          <Form.Item
            label="预约时长单位"
            help={errors.durationUnit?.message || '设置预约的基本时长单位'}
            validateStatus={errors.durationUnit ? 'error' : ''}
          >
            <Controller
              name="durationUnit"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  {...field}
                  disabled={!isReservationEnabled}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value={1}>1 小时</Radio.Button>
                  <Radio.Button value={2}>2 小时</Radio.Button>
                  <Radio.Button value={4}>4 小时</Radio.Button>
                </Radio.Group>
              )}
            />
          </Form.Item>
        )}

        {/* 押金设置 - US4 */}
        {isReservationEnabled && (
          <>
            <Divider orientation="left" style={{ margin: '16px 0 8px' }}>押金设置</Divider>
            <Form.Item
              label="是否需要押金"
              help={errors.depositRequired?.message}
              validateStatus={errors.depositRequired ? 'error' : ''}
            >
              <Controller
                name="depositRequired"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={!isReservationEnabled}
                    checkedChildren="需要"
                    unCheckedChildren="不需要"
                  />
                )}
              />
            </Form.Item>

            {depositRequired && (
              <>
                <Form.Item
                  label="押金金额"
                  help={errors.depositAmount?.message || '固定押金金额（元）'}
                  validateStatus={errors.depositAmount ? 'error' : ''}
                >
                  <Controller
                    name="depositAmount"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        min={0}
                        max={100000}
                        precision={2}
                        disabled={!isReservationEnabled || !depositRequired}
                        style={{ width: '100%' }}
                        addonBefore="¥"
                        placeholder="输入固定押金金额"
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label="押金比例"
                  help={errors.depositPercentage?.message || '按订单金额的百分比收取押金'}
                  validateStatus={errors.depositPercentage ? 'error' : ''}
                >
                  <Controller
                    name="depositPercentage"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        min={0}
                        max={100}
                        precision={0}
                        disabled={!isReservationEnabled || !depositRequired}
                        style={{ width: '100%' }}
                        addonAfter="%"
                        placeholder="输入押金比例"
                      />
                    )}
                  />
                </Form.Item>
              </>
            )}
          </>
        )}

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

