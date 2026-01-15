import React, { useMemo, useCallback, useState } from 'react';
import type { Hall, ScheduleEvent } from '@/pages/schedule/types/schedule.types';
import HallCard from '../atoms/HallCard';
import EventBlock from '../atoms/EventBlock';

interface GanttRowProps {
  hall: Hall;
  events: ScheduleEvent[];
  startHour: number;
  endHour: number;
  onEventClick?: (event: ScheduleEvent) => void;
  onEmptySlotClick?: (payload: { hallId: string; startHour: number }) => void;
}

const GanttRow: React.FC<GanttRowProps> = ({
  hall,
  events,
  startHour,
  endHour,
  onEventClick,
  onEmptySlotClick,
}) => {
  const totalHours = endHour - startHour;
  const [isHovered, setIsHovered] = useState(false);

  const hallEvents = useMemo(
    () => events.filter((evt) => evt.hallId === hall.id),
    [events, hall.id]
  );

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onEmptySlotClick) return;
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = rect.width > 0 ? x / rect.width : 0;
      const rawStart = startHour + ratio * totalHours;
      // 四舍五入到最近的30分钟
      const rounded = Math.round(rawStart * 2) / 2;
      const clamped = Math.max(startHour, Math.min(endHour - 0.5, rounded));
      onEmptySlotClick({ hallId: hall.id, startHour: clamped });
    },
    [onEmptySlotClick, startHour, endHour, totalHours, hall.id]
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        borderBottom: '1px solid #e5e7eb',
        minHeight: 96,
      }}
    >
      <div style={{ padding: 12, borderRight: '1px solid #e5e7eb', background: '#fff' }}>
        <HallCard hall={hall} />
      </div>
      <div
        style={{
          position: 'relative',
          padding: '8px 0',
          background: isHovered ? '#f0f9ff' : '#fafafa',
          transition: 'background-color 0.2s',
          cursor: onEmptySlotClick ? 'pointer' : 'default',
        }}
        onClick={handleBackgroundClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={onEmptySlotClick ? '点击空闲时段添加排期' : undefined}
        aria-label={`${hall.name} 时间轴`}
      >
        {hallEvents.map((event) => (
          <EventBlock
            key={event.id}
            event={event}
            timelineStartHour={startHour}
            totalHours={totalHours}
            onClick={onEventClick}
          />
        ))}
        {/* Background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${totalHours}, 1fr)`,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: totalHours }).map((_, idx) => (
            <div key={idx} style={{ borderLeft: '1px solid #f1f5f9' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GanttRow;
