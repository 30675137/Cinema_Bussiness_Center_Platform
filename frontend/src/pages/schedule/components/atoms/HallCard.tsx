import React from 'react';
import { Tag, Space, Typography } from 'antd';
import type { Hall } from '@/pages/schedule/types/schedule.types';

interface HallCardProps {
  hall: Hall;
}

const typeColorMap: Record<string, string> = {
  VIP: 'gold',
  Public: 'blue',
  PUBLIC: 'blue',
  CP: 'purple',
  Party: 'magenta',
  PARTY: 'magenta',
};

// 类型显示名称映射（统一首字母大写显示）
const typeDisplayMap: Record<string, string> = {
  VIP: 'VIP',
  Public: 'Public',
  PUBLIC: 'Public',
  CP: 'CP',
  Party: 'Party',
  PARTY: 'Party',
};

const HallCard: React.FC<HallCardProps> = ({ hall }) => {
  const typeColor = typeColorMap[hall.type] || 'default';
  const typeDisplay = typeDisplayMap[hall.type] || hall.type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Text strong>{hall.name}</Typography.Text>
        <Tag color={typeColor} style={{ fontSize: 10 }}>
          {typeDisplay}
        </Tag>
      </div>
      <Space size={4} direction="horizontal" wrap>
        <Tag color="default" style={{ fontSize: 10 }}>
          座位 {hall.capacity}
        </Tag>
        {hall.tags?.map((tag) => (
          <Tag key={tag} color="default" style={{ fontSize: 10 }}>
            {tag}
          </Tag>
        ))}
      </Space>
    </div>
  );
};

export default HallCard;
