/**
 * EventDetailDrawer Component (Organism)
 *
 * Displays event details in a drawer with edit and delete actions
 */

import React from 'react';
import { Drawer, Descriptions, Button, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ScheduleEvent } from '@/pages/schedule/types/schedule.types';
import { useScheduleStore } from '@/features/schedule-management/stores/scheduleStore';
import { useScheduleMutations } from '@/pages/schedule/hooks/useScheduleMutations';
import { formatTimeRange } from '@/features/schedule-management/utils/timeCalculations';
import EventTypeTag from '../atoms/EventTypeTag';

interface EventDetailDrawerProps {
  event: ScheduleEvent | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ event, open, onClose, onEdit }) => {
  const { selectedDate } = useScheduleStore();
  const { deleteMutation } = useScheduleMutations(selectedDate);

  const handleDelete = async () => {
    if (!event) return;

    try {
      await deleteMutation.mutateAsync(event.id);
      message.success('删除成功');
      onClose();
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  if (!event) return null;

  const timeRange = formatTimeRange(event.startHour, event.duration, '24h');

  return (
    <Drawer
      title="排期详情"
      placement="right"
      onClose={onClose}
      open={open}
      width={480}
      extra={
        <Space>
          <Button icon={<EditOutlined />} onClick={onEdit}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个排期吗？"
            description="此操作不可恢复"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} danger loading={deleteMutation.isPending}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="标题">
          <Space>
            {event.title}
            <EventTypeTag type={event.type} size="small" />
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="时间">{timeRange}</Descriptions.Item>

        <Descriptions.Item label="影厅ID">{event.hallId}</Descriptions.Item>

        <Descriptions.Item label="日期">{event.date}</Descriptions.Item>

        {event.type === 'private' && (
          <>
            {event.customer && (
              <Descriptions.Item label="客户信息">{event.customer}</Descriptions.Item>
            )}

            {event.serviceManager && (
              <Descriptions.Item label="服务经理">{event.serviceManager}</Descriptions.Item>
            )}

            {event.status && (
              <Descriptions.Item label="状态">
                {event.status === 'confirmed' && '已确认'}
                {event.status === 'pending' && '待定'}
                {event.status === 'locked' && '锁定'}
              </Descriptions.Item>
            )}
          </>
        )}

        {event.type === 'public' && event.occupancy && (
          <Descriptions.Item label="上座率">{event.occupancy}</Descriptions.Item>
        )}

        {event.details && <Descriptions.Item label="备注">{event.details}</Descriptions.Item>}

        <Descriptions.Item label="创建时间">
          {new Date(event.createdAt).toLocaleString('zh-CN')}
        </Descriptions.Item>

        <Descriptions.Item label="更新时间">
          {new Date(event.updatedAt).toLocaleString('zh-CN')}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default EventDetailDrawer;
