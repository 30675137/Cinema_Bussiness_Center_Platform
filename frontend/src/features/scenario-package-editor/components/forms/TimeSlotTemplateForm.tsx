/**
 * TimeSlotTemplateForm 组件
 * 时段模板添加/编辑表单
 * Feature: 001-scenario-package-tabs
 */

import React, { useEffect } from 'react';
import { Modal, Form, TimePicker, Select, InputNumber, Switch, Space, Radio, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { DAY_OF_WEEK_LABELS, type TimeSlotTemplate, type DayOfWeek } from '../../types';

interface TimeSlotTemplateFormProps {
  /** 是否可见 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 提交回调 */
  onSubmit: (values: TimeSlotTemplateFormValues) => Promise<void>;
  /** 编辑模式下的初始数据 */
  initialData?: TimeSlotTemplate;
  /** 默认星期几（添加模式） */
  defaultDayOfWeek?: DayOfWeek;
  /** 是否加载中 */
  loading?: boolean;
}

export interface TimeSlotTemplateFormValues {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm 格式
  endTime: string; // HH:mm 格式
  capacity?: number;
  priceAdjustmentType: 'none' | 'fixed' | 'percentage';
  priceAdjustmentValue?: number;
  isEnabled: boolean;
}

/**
 * 时段模板表单组件
 */
export const TimeSlotTemplateForm: React.FC<TimeSlotTemplateFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  defaultDayOfWeek = 1,
  loading = false,
}) => {
  const [form] = Form.useForm<{
    dayOfWeek: DayOfWeek;
    timeRange: [Dayjs, Dayjs];
    capacity?: number;
    priceAdjustmentType: 'none' | 'fixed' | 'percentage';
    priceAdjustmentValue?: number;
    isEnabled: boolean;
  }>();

  const isEdit = !!initialData;
  const priceAdjustmentType = Form.useWatch('priceAdjustmentType', form);

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (initialData) {
        // 编辑模式
        const priceAdj = initialData.priceAdjustment as
          | { type?: string; value?: number }
          | undefined;
        form.setFieldsValue({
          dayOfWeek: initialData.dayOfWeek as DayOfWeek,
          timeRange: [dayjs(initialData.startTime, 'HH:mm'), dayjs(initialData.endTime, 'HH:mm')],
          capacity: initialData.capacity,
          priceAdjustmentType:
            priceAdj?.type === 'percentage'
              ? 'percentage'
              : priceAdj?.type === 'fixed'
                ? 'fixed'
                : 'none',
          priceAdjustmentValue: priceAdj?.value,
          isEnabled: initialData.isEnabled ?? true,
        });
      } else {
        // 添加模式
        form.setFieldsValue({
          dayOfWeek: defaultDayOfWeek,
          timeRange: [dayjs('10:00', 'HH:mm'), dayjs('12:00', 'HH:mm')],
          capacity: 1,
          priceAdjustmentType: 'none',
          priceAdjustmentValue: undefined,
          isEnabled: true,
        });
      }
    }
  }, [visible, initialData, defaultDayOfWeek, form]);

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 验证时间范围
      const [start, end] = values.timeRange;
      if (end.isBefore(start) || end.isSame(start)) {
        message.error('结束时间必须晚于开始时间');
        return;
      }

      const formValues: TimeSlotTemplateFormValues = {
        dayOfWeek: values.dayOfWeek,
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
        capacity: values.capacity,
        priceAdjustmentType: values.priceAdjustmentType,
        priceAdjustmentValue:
          values.priceAdjustmentType !== 'none' ? values.priceAdjustmentValue : undefined,
        isEnabled: values.isEnabled,
      };

      await onSubmit(formValues);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? '编辑时段' : '添加时段'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      confirmLoading={loading}
      destroyOnClose
      width={480}
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="dayOfWeek"
          label="星期"
          rules={[{ required: true, message: '请选择星期' }]}
        >
          <Select placeholder="选择星期" disabled={isEdit}>
            {([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).map((day) => (
              <Select.Option key={day} value={day}>
                {DAY_OF_WEEK_LABELS[day]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="timeRange"
          label="时间段"
          rules={[{ required: true, message: '请选择时间段' }]}
        >
          <TimePicker.RangePicker
            format="HH:mm"
            minuteStep={15}
            style={{ width: '100%' }}
            placeholder={['开始时间', '结束时间']}
          />
        </Form.Item>

        <Form.Item name="capacity" label="可预约容量" tooltip="该时段最多可接受的预约数量">
          <InputNumber min={1} max={100} placeholder="不限制请留空" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="priceAdjustmentType" label="价格调整">
          <Radio.Group>
            <Radio value="none">不调整</Radio>
            <Radio value="fixed">固定金额</Radio>
            <Radio value="percentage">百分比</Radio>
          </Radio.Group>
        </Form.Item>

        {priceAdjustmentType && priceAdjustmentType !== 'none' && (
          <Form.Item
            name="priceAdjustmentValue"
            label={priceAdjustmentType === 'fixed' ? '调整金额 (元)' : '调整比例 (%)'}
            rules={[{ required: true, message: '请输入调整值' }]}
          >
            <InputNumber
              placeholder={
                priceAdjustmentType === 'fixed' ? '正数加价，负数减价' : '正数加价，负数减价'
              }
              style={{ width: '100%' }}
              addonAfter={priceAdjustmentType === 'percentage' ? '%' : '元'}
            />
          </Form.Item>
        )}

        <Form.Item name="isEnabled" label="启用状态" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TimeSlotTemplateForm;
