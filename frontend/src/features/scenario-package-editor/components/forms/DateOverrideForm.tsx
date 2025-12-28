/**
 * DateOverrideForm 组件
 * 日期覆盖规则添加/编辑表单
 * Feature: 001-scenario-package-tabs
 */

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Radio,
  InputNumber,
  Input,
  Alert,
  message,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { TimeSlotOverride } from '../../types';

const { TextArea } = Input;

interface DateOverrideFormProps {
  /** 是否可见 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 提交回调 */
  onSubmit: (values: DateOverrideFormValues) => Promise<void>;
  /** 编辑模式下的初始数据 */
  initialData?: TimeSlotOverride;
  /** 默认日期（添加模式） */
  defaultDate?: string;
  /** 是否加载中 */
  loading?: boolean;
}

export type OverrideType = 'ADD' | 'MODIFY' | 'CANCEL';

export interface DateOverrideFormValues {
  date: string; // YYYY-MM-DD 格式
  overrideType: OverrideType;
  startTime?: string; // HH:mm 格式
  endTime?: string;   // HH:mm 格式
  capacity?: number;
  reason?: string;
}

/**
 * 日期覆盖表单组件
 */
export const DateOverrideForm: React.FC<DateOverrideFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  defaultDate,
  loading = false,
}) => {
  const [form] = Form.useForm<{
    date: Dayjs;
    overrideType: OverrideType;
    timeRange?: [Dayjs, Dayjs];
    capacity?: number;
    reason?: string;
  }>();
  
  const isEdit = !!initialData;
  const overrideType = Form.useWatch('overrideType', form);
  
  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (initialData) {
        // 编辑模式
        form.setFieldsValue({
          date: dayjs(initialData.date),
          overrideType: initialData.overrideType as OverrideType,
          timeRange: initialData.startTime && initialData.endTime ? [
            dayjs(initialData.startTime, 'HH:mm'),
            dayjs(initialData.endTime, 'HH:mm'),
          ] : undefined,
          capacity: initialData.capacity,
          reason: initialData.reason,
        });
      } else {
        // 添加模式
        form.setFieldsValue({
          date: defaultDate ? dayjs(defaultDate) : dayjs(),
          overrideType: 'ADD',
          timeRange: [dayjs('10:00', 'HH:mm'), dayjs('12:00', 'HH:mm')],
          capacity: 1,
          reason: '',
        });
      }
    }
  }, [visible, initialData, defaultDate, form]);
  
  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 对于 ADD 和 MODIFY 类型，验证时间范围
      if (values.overrideType !== 'CANCEL') {
        if (!values.timeRange || values.timeRange.length !== 2) {
          message.error('请选择时间段');
          return;
        }
        const [start, end] = values.timeRange;
        if (end.isBefore(start) || end.isSame(start)) {
          message.error('结束时间必须晚于开始时间');
          return;
        }
      }
      
      const formValues: DateOverrideFormValues = {
        date: values.date.format('YYYY-MM-DD'),
        overrideType: values.overrideType,
        startTime: values.overrideType !== 'CANCEL' && values.timeRange 
          ? values.timeRange[0].format('HH:mm') 
          : undefined,
        endTime: values.overrideType !== 'CANCEL' && values.timeRange 
          ? values.timeRange[1].format('HH:mm') 
          : undefined,
        capacity: values.overrideType !== 'CANCEL' ? values.capacity : undefined,
        reason: values.reason,
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
  
  // 禁用过去的日期
  const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(dayjs(), 'day');
  };
  
  return (
    <Modal
      title={isEdit ? '编辑日期覆盖' : '添加日期覆盖'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      confirmLoading={loading}
      destroyOnClose
      width={520}
    >
      <Alert
        message="日期覆盖规则"
        description="覆盖规则优先于周模板。新增：在该日期增加时段；修改：替换周模板中的时段；取消：禁用该日期的所有时段。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
        <Form.Item
          name="date"
          label="日期"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={disabledDate}
            format="YYYY-MM-DD"
            placeholder="选择日期"
            disabled={isEdit}
          />
        </Form.Item>
        
        <Form.Item
          name="overrideType"
          label="覆盖类型"
          rules={[{ required: true, message: '请选择覆盖类型' }]}
        >
          <Radio.Group>
            <Radio.Button value="ADD">新增时段</Radio.Button>
            <Radio.Button value="MODIFY">修改时段</Radio.Button>
            <Radio.Button value="CANCEL">取消时段</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        {overrideType !== 'CANCEL' && (
          <>
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
            
            <Form.Item
              name="capacity"
              label="可预约容量"
              tooltip="该时段最多可接受的预约数量"
            >
              <InputNumber
                min={1}
                max={100}
                placeholder="不限制请留空"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}
        
        <Form.Item
          name="reason"
          label="备注说明"
          tooltip="记录覆盖规则的原因，如节假日调整、特殊活动等"
        >
          <TextArea
            rows={2}
            placeholder="如：元旦假期调整、周年庆活动等"
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DateOverrideForm;
