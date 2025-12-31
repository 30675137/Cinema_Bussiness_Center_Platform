import React, { useMemo, memo, useCallback } from 'react';
import { Typography, Tag, Tooltip, Badge } from 'antd';
import type { ScheduleEvent } from '@/pages/schedule/types/schedule.types';
import {
  getLeftStyle,
  getWidthStyle,
  formatTimeRange,
} from '@/features/schedule-management/utils/timeCalculations';
import { useScheduleStore } from '@/features/schedule-management/stores/scheduleStore';
import EventTypeTag from './EventTypeTag';

interface EventBlockProps {
  event: ScheduleEvent;
  timelineStartHour: number;
  totalHours: number;
  onClick?: (event: ScheduleEvent) => void;
}

const typeStyleMap: Record<string, React.CSSProperties> = {
  public: { background: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca' },
  private: { background: '#ecfdf3', borderColor: '#bbf7d0', color: '#166534' },
  maintenance: {
    background: 'repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 6px, #e5e7eb 6px, #e5e7eb 12px)',
    borderColor: '#d1d5db',
    color: '#6b7280',
  },
  cleaning: {
    background: 'repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 6px, #e5e7eb 6px, #e5e7eb 12px)',
    borderColor: '#d1d5db',
    color: '#6b7280',
  },
};

const EventBlock: React.FC<EventBlockProps> = ({
  event,
  timelineStartHour,
  totalHours,
  onClick,
}) => {
  const { setSelectedEvent } = useScheduleStore();

  const style = useMemo(() => {
    const left = getLeftStyle(event.startHour, timelineStartHour, totalHours);
    const width = getWidthStyle(event.duration, totalHours);
    return { left, width };
  }, [event.startHour, event.duration, timelineStartHour, totalHours]);

  const timeRange = useMemo(
    () => formatTimeRange(event.startHour, event.duration, '24h'),
    [event.startHour, event.duration]
  );

  const typeStyle = useMemo(() => typeStyleMap[event.type] || typeStyleMap.public, [event.type]);
  const isPending = event.status === 'pending';

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setSelectedEvent(event);
      onClick?.(event);
    },
    [event, setSelectedEvent, onClick]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelectedEvent(event);
        onClick?.(event);
      }
    },
    [event, setSelectedEvent, onClick]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${event.title}, ${timeRange}, ${event.type === 'public' ? '公映' : event.type === 'private' ? '包场' : event.type === 'maintenance' ? '维护' : '保洁'}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        top: 8,
        bottom: 8,
        ...typeStyle,
        border: `1px solid ${typeStyle.borderColor || '#e5e7eb'}`,
        borderRadius: 8,
        padding: 8,
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: 'pointer',
        ...style,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}
      >
        <Typography.Text strong ellipsis style={{ maxWidth: '70%' }}>
          {event.title}
        </Typography.Text>
        <EventTypeTag type={event.type} size="small" />
      </div>

      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {timeRange}
      </Typography.Text>

      {event.customer && (
        <Typography.Text style={{ fontSize: 12 }} ellipsis>
          {event.customer}
        </Typography.Text>
      )}

      {event.serviceManager && (
        <Tag color="default" style={{ fontSize: 11, alignSelf: 'flex-start' }}>
          {event.serviceManager}
        </Tag>
      )}

      {event.occupancy && (
        <Typography.Text style={{ fontSize: 12, color: '#4338ca' }}>
          上座率 {event.occupancy}
        </Typography.Text>
      )}

      {event.details && (
        <Tooltip title={event.details}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {event.details}
          </Typography.Text>
        </Tooltip>
      )}

      {isPending && (
        <Badge
          status="processing"
          style={{ position: 'absolute', top: 6, right: 6 }}
          title="待确认"
        />
      )}
    </div>
  );
};

export default memo(EventBlock);
