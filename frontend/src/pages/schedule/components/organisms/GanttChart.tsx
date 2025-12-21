import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import type { Hall, ScheduleEvent } from '@/pages/schedule/types/schedule.types';
import TimelineHeader from '../molecules/TimelineHeader';
import GanttRow from '../molecules/GanttRow';
import { getLeftStyle } from '@/features/schedule-management/utils/timeCalculations';

interface GanttChartProps {
  halls: Hall[];
  events: ScheduleEvent[];
  startHour?: number;
  endHour?: number;
  interval?: number;
  onEventClick?: (event: ScheduleEvent) => void;
  onEmptySlotClick?: (payload: { hallId: string; startHour: number }) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({
  halls,
  events,
  startHour = 10,
  endHour = 24,
  interval = 1,
  onEventClick,
  onEmptySlotClick,
}) => {
  const sortedHalls = useMemo(
    () => [...halls].sort((a, b) => a.name.localeCompare(b.name)),
    [halls]
  );

  const totalHours = endHour - startHour;
  const currentDate = dayjs().format('YYYY-MM-DD');
  const currentHour = dayjs().hour() + dayjs().minute() / 60;
  const showCurrentTime = currentHour >= startHour && currentHour <= endHour;
  const currentTimeLeft = useMemo(() => {
    if (!showCurrentTime) return null;
    return getLeftStyle(currentHour, startHour, totalHours);
  }, [showCurrentTime, currentHour, startHour, totalHours]);

  return (
    <div
      data-testid="gantt-chart"
      style={{
        display: 'grid',
        gridTemplateRows: '48px 1fr',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', background: '#f8fafc' }}>
        <div style={{ borderRight: '1px solid #e5e7eb', padding: '12px', fontWeight: 600 }}>
          影厅资源 ({halls.length})
        </div>
        <TimelineHeader startHour={startHour} endHour={endHour} interval={interval} />
      </div>
      <div style={{ maxHeight: '70vh', overflow: 'auto', background: '#fff', position: 'relative' }}>
        {showCurrentTime && currentTimeLeft && (
          <div
            style={{
              position: 'absolute',
              left: currentTimeLeft,
              top: 0,
              bottom: 0,
              width: 2,
              background: '#ef4444',
              zIndex: 10,
              pointerEvents: 'none',
            }}
            aria-label="当前时间"
          >
            <div
              style={{
                position: 'absolute',
                top: -6,
                left: -4,
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '6px solid #ef4444',
              }}
            />
          </div>
        )}
        {sortedHalls.map((hall) => (
          <GanttRow
            key={hall.id}
            hall={hall}
            events={events}
            startHour={startHour}
            endHour={endHour}
            onEventClick={onEventClick}
            onEmptySlotClick={onEmptySlotClick}
          />
        ))}
      </div>
    </div>
  );
};

export default GanttChart;

