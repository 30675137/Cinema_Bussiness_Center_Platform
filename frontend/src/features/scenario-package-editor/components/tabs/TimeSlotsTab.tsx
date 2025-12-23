/**
 * TimeSlotsTab 组件
 * 时段模板配置标签页
 * Feature: 001-scenario-package-tabs
 */

import React, { useState } from 'react';
import {
  Empty,
  Button,
  Skeleton,
  message,
  Table,
  Switch,
  Space,
  Modal,
  Form,
  TimePicker,
  Select,
  InputNumber,
  Popconfirm,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { EditableCard } from '../';
import { useScenarioPackageStore } from '../../stores/useScenarioPackageStore';
import {
  useTimeSlotTemplates,
  useCreateTimeSlotTemplate,
  useUpdateTimeSlotTemplate,
  useDeleteTimeSlotTemplate,
} from '../../hooks/useScenarioPackageQueries';
import { DAY_OF_WEEK_LABELS, type TimeSlotTemplate, type DayOfWeek } from '../../types';

interface TimeSlotsTabProps {
  /** 场景包ID */
  packageId: string;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * 时段模板配置标签页
 */
const TimeSlotsTab: React.FC<TimeSlotsTabProps> = ({
  packageId,
  loading: parentLoading = false,
}) => {
  const isDirty = useScenarioPackageStore((state) => state.dirtyTabs.timeslots);

  // 模态框状态
  const [formOpen, setFormOpen] = useState(false);
  const [form] = Form.useForm();

  // 查询数据
  const { data: templates = [], isLoading } = useTimeSlotTemplates(packageId);
  const createMutation = useCreateTimeSlotTemplate(packageId);
  const updateMutation = useUpdateTimeSlotTemplate(packageId);
  const deleteMutation = useDeleteTimeSlotTemplate(packageId);

  // 添加时段
  const handleAdd = () => {
    form.resetFields();
    setFormOpen(true);
  };

  // 保存时段
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await createMutation.mutateAsync({
        dayOfWeek: values.dayOfWeek,
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        capacity: values.capacity || null,
        isEnabled: true,
      });
      message.success('时段已添加');
      setFormOpen(false);
    } catch (error) {
      if ((error as any).errorFields) return;
      message.error('添加失败');
    }
  };

  // 切换启用状态
  const handleToggle = async (template: TimeSlotTemplate, enabled: boolean) => {
    try {
      await updateMutation.mutateAsync({
        templateId: template.id,
        data: { isEnabled: enabled },
      });
      message.success(enabled ? '已启用' : '已禁用');
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 删除时段
  const handleDelete = async (templateId: string) => {
    try {
      await deleteMutation.mutateAsync(templateId);
      message.success('已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const loading = parentLoading || isLoading;

  const columns = [
    {
      title: '星期',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day: DayOfWeek) => DAY_OF_WEEK_LABELS[day],
    },
    {
      title: '时段',
      key: 'time',
      render: (_: unknown, record: TimeSlotTemplate) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (v: number | null) => v ?? '不限',
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (enabled: boolean, record: TimeSlotTemplate) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggle(record, checked)}
          loading={updateMutation.isPending}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TimeSlotTemplate) => (
        <Popconfirm
          title="确定删除这个时段吗？"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <EditableCard
        title="时段模板"
        description="配置可预订时段规则"
        isDirty={isDirty}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加时段
          </Button>
        }
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : templates.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无时段，请添加第一个时段"
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加时段
            </Button>
          </Empty>
        ) : (
          <Table
            dataSource={templates}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}
      </EditableCard>

      {/* 添加时段模态框 */}
      <Modal
        title="添加时段"
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={handleSave}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="dayOfWeek"
            label="星期"
            rules={[{ required: true, message: '请选择星期' }]}
          >
            <Select
              placeholder="选择星期"
              options={Object.entries(DAY_OF_WEEK_LABELS).map(([k, v]) => ({
                value: Number(k),
                label: v,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="timeRange"
            label="时间范围"
            rules={[{ required: true, message: '请选择时间' }]}
          >
            <TimePicker.RangePicker format="HH:mm" minuteStep={30} />
          </Form.Item>
          <Form.Item name="capacity" label="容量限制">
            <InputNumber min={1} placeholder="留空表示不限制" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TimeSlotsTab;
