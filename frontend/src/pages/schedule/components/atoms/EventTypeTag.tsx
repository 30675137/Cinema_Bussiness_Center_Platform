import React from 'react';
import { Tag } from 'antd';
import type { EventType } from '@/pages/schedule/types/schedule.types';

interface EventTypeTagProps {
  type: EventType;
  size?: 'small' | 'default';
}

const TYPE_CONFIG: Record<EventType, { color: string; text: string }> = {
  public: { color: 'blue', text: '公映' },
  private: { color: 'green', text: '包场' },
  maintenance: { color: 'orange', text: '维护' },
  cleaning: { color: 'default', text: '保洁' },
};

const EventTypeTag: React.FC<EventTypeTagProps> = ({ type, size = 'default' }) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.public;

  return (
    <Tag color={config.color} style={size === 'small' ? { fontSize: 11 } : undefined}>
      {config.text}
    </Tag>
  );
};

export default EventTypeTag;
