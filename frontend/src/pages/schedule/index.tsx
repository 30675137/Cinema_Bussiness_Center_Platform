import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Space, Button, Tag } from 'antd';
import dayjs from 'dayjs';
import { useScheduleListQuery, useHallsListQuery } from './hooks/useScheduleQueries';
import { useScheduleStore } from '@/features/schedule-management/stores/scheduleStore';
import GanttChart from './components/organisms/GanttChart';
import DateNavigator from './components/molecules/DateNavigator';
import EventForm from './components/molecules/EventForm';
import EventDetailDrawer from './components/organisms/EventDetailDrawer';

const ScheduleManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedDate, setSelectedDate, selectedEvent, setSelectedEvent } = useScheduleStore();
  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create');
  const [prefill, setPrefill] = React.useState<{
    hallId?: string;
    startHour?: number;
    duration?: number;
    type?: 'maintenance' | 'cleaning';
  }>({});

  const schedulesQuery = useScheduleListQuery({ date: selectedDate });
  const hallsQuery = useHallsListQuery();

  const isLoading = schedulesQuery.isLoading || hallsQuery.isLoading;
  const isError = schedulesQuery.isError || hallsQuery.isError;

  React.useEffect(() => {
    if (location.pathname.startsWith('/schedule/create') && !formOpen) {
      setFormMode('create');
      setPrefill({});
      setFormOpen(true);
    }
  }, [location.pathname, formOpen]);

  const handlePrevDay = () => {
    const prev = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(next);
  };

  const handleToday = () => {
    const today = dayjs().format('YYYY-MM-DD');
    setSelectedDate(today);
  };

  const handleNew = () => {
    setFormMode('create');
    setPrefill({});
    setFormOpen(true);
  };

  const handleMaintenance = () => {
    setFormMode('create');
    setPrefill({ type: 'maintenance' });
    setFormOpen(true);
  };

  const handleEmptySlotClick = (payload: { hallId: string; startHour: number }) => {
    setFormMode('create');
    setPrefill({ hallId: payload.hallId, startHour: payload.startHour, duration: 1 });
    setFormOpen(true);
  };

  const handleEdit = () => {
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleDrawerClose = () => {
    setSelectedEvent(null);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setFormMode('create');
    setPrefill({});
    if (location.pathname.startsWith('/schedule/create')) {
      navigate('/schedule/gantt', { replace: true });
    }
  };

  return (
    <Card
      title="档期甘特图"
      bordered={false}
      extra={
        <Space>
          <DateNavigator
            date={selectedDate}
            onPrev={handlePrevDay}
            onNext={handleNextDay}
            onToday={handleToday}
          />
          <Button type="primary" onClick={handleNew}>
            新增预约
          </Button>
          <Button onClick={handleMaintenance}>锁座/维护</Button>
        </Space>
      }
    >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      )}

      {isError && (
        <Alert
          type="error"
          message="加载排期数据失败"
          description={schedulesQuery.error?.message || hallsQuery.error?.message}
        />
      )}

      {!isLoading && !isError && hallsQuery.data && schedulesQuery.data && (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, padding: '8px 0' }}>
            <Space size="small">
              <span style={{ fontSize: 12, color: '#666' }}>图例：</span>
              <Tag color="blue" style={{ margin: 0 }}>
                公映
              </Tag>
              <Tag color="green" style={{ margin: 0 }}>
                包场
              </Tag>
              <Tag
                style={{
                  margin: 0,
                  background:
                    'repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 6px, #e5e7eb 6px, #e5e7eb 12px)',
                  borderColor: '#d1d5db',
                }}
              >
                维护/保洁
              </Tag>
            </Space>
          </div>
          <GanttChart
            halls={hallsQuery.data}
            events={schedulesQuery.data}
            startHour={10}
            endHour={24}
            interval={1}
            onEmptySlotClick={handleEmptySlotClick}
          />
        </Space>
      )}

      <EventForm
        open={formOpen}
        onClose={handleFormClose}
        mode={formMode}
        event={formMode === 'edit' ? selectedEvent : undefined}
        defaultHallId={prefill.hallId}
        defaultStartHour={prefill.startHour}
        defaultDuration={prefill.duration}
        defaultType={prefill.type}
      />

      <EventDetailDrawer
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={handleDrawerClose}
        onEdit={handleEdit}
      />
    </Card>
  );
};

export default ScheduleManagement;
