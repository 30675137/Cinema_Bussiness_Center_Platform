/**
 * ReservationSettingsForm Component
 *
 * Form component for editing store reservation settings.
 * Uses React Hook Form with Zod validation.
 *
 * @feature 016-store-reservation-settings
 * @updated 添加时间段配置支持
 */

import React, { useEffect } from 'react';
import {
  Form,
  Switch,
  InputNumber,
  Button,
  Space,
  message,
  Divider,
  Radio,
  Typography,
  Alert,
} from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSettingsSchema } from '../types/reservation-settings.schema';
import type { ReservationSettingsFormData } from '../types/reservation-settings.schema';
import type { StoreReservationSettings, DayOfWeek } from '../types/reservation-settings.types';
import { generateDefaultTimeSlots } from '../types/reservation-settings.types';
import { TimeSlotFormGroup } from './TimeSlotFormItem';

const { Text } = Typography;

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
      timeSlots: initialData?.timeSlots ?? generateDefaultTimeSlots(),
      minAdvanceHours: initialData?.minAdvanceHours ?? 1,
      durationUnit: initialData?.durationUnit ?? 1,
      depositRequired: initialData?.depositRequired ?? false,
      depositAmount: initialData?.depositAmount,
      depositPercentage: initialData?.depositPercentage,
      isActive: initialData?.isActive ?? true,
    },
  });

  // Watch isReservationEnabled to conditionally enable/disable fields
  const isReservationEnabled = watch('isReservationEnabled');
  const depositRequired = watch('depositRequired');

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        isReservationEnabled: initialData.isReservationEnabled,
        maxReservationDays: initialData.maxReservationDays,
        timeSlots: initialData.timeSlots ?? generateDefaultTimeSlots(),
        minAdvanceHours: initialData.minAdvanceHours ?? 1,
        durationUnit: initialData.durationUnit ?? 1,
        depositRequired: initialData.depositRequired ?? false,
        depositAmount: initialData.depositAmount,
        depositPercentage: initialData.depositPercentage,
        isActive: initialData.isActive ?? true,
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

  // Handle form validation errors
  const onFormError = (errors: any) => {
    console.error('表单验证失败:', errors);
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      message.error(`表单验证失败: ${firstError.message}`);
    } else {
      message.error('请检查表单填写是否正确');
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
      onFinish={handleSubmit(onFormSubmit, onFormError)}
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
        help={
          errors.maxReservationDays?.message ||
          (isReservationEnabled ? '设置允许预约未来多少天（1-365天）' : '未开放预约时无需设置')
        }
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

      {/* 时间段配置 - US1 */}
      {isReservationEnabled && (
        <>
          <Divider orientation="left">可预约时间段</Divider>
          <TimeSlotFormGroup
            control={control}
            errors={errors}
            disabled={!isReservationEnabled}
            setValue={setValue}
          />
        </>
      )}

      {/* 提前量配置 - US2 */}
      {isReservationEnabled && (
        <>
          <Divider orientation="left">提前量设置</Divider>
          <Form.Item
            label="最小提前小时数"
            help={errors.minAdvanceHours?.message || '预约时至少提前多少小时'}
            validateStatus={errors.minAdvanceHours ? 'error' : ''}
          >
            <Controller
              name="minAdvanceHours"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  max={720}
                  disabled={!isReservationEnabled}
                  style={{ width: '100%' }}
                  addonAfter="小时"
                />
              )}
            />
          </Form.Item>
        </>
      )}

      {/* 时长单位配置 - US3 */}
      {isReservationEnabled && (
        <>
          <Divider orientation="left">预约时长单位</Divider>
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
          <Alert
            message="时长说明"
            description="用户预约时，每次预约的时长必须是该单位的整数倍。例如选择2小时，用户可预约2/4/6小时等。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </>
      )}

      {/* 押金规则配置 - US4 */}
      {isReservationEnabled && (
        <>
          <Divider orientation="left">押金设置</Divider>
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

              <Text
                type="secondary"
                style={{ display: 'block', textAlign: 'center', margin: '8px 0' }}
              >
                或
              </Text>

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

              <Alert
                message="押金说明"
                description="可设置固定金额或比例，如两者都设置，系统将取较大值作为实际押金。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            </>
          )}
        </>
      )}

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={isSubmitting || loading}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting || loading}>
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ReservationSettingsForm;
