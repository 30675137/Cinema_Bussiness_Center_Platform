import React from 'react';
import { Typography } from 'antd';

interface TimeSlotProps {
  label: string;
  widthPercent: number;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ label, widthPercent }) => {
  return (
    <div
      style={{
        flexBasis: `${widthPercent}%`,
        flexGrow: 1,
        borderLeft: '1px solid #e5e7eb',
        paddingLeft: 4,
        minWidth: 40,
        boxSizing: 'border-box',
      }}
    >
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Typography.Text>
    </div>
  );
};

export default TimeSlot;
