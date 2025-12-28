import React, { useMemo } from 'react';
import { generateTimeSlots } from '@/features/schedule-management/utils/timeCalculations';
import TimeSlot from '../atoms/TimeSlot';

interface TimelineHeaderProps {
  startHour: number;
  endHour: number;
  interval?: number;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  startHour,
  endHour,
  interval = 1,
}) => {
  const slots = useMemo(() => generateTimeSlots(startHour, endHour, interval), [startHour, endHour, interval]);
  const widthPercent = 100 / slots.length;

  return (
    <div
      style={{
        display: 'flex',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        background: '#f8fafc',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {slots.map((slot) => (
        <TimeSlot key={slot} label={`${Math.floor(slot)}:${slot % 1 === 0.5 ? '30' : '00'}`} widthPercent={widthPercent} />
      ))}
    </div>
  );
};

export default TimelineHeader;

