import React, { useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import type { CreateScheduleEventRequest, UpdateScheduleEventRequest, ScheduleEvent, EventType, EventStatus } from '@/pages/schedule/types/schedule.types';
import { createScheduleEventSchema, updateScheduleEventSchema } from '@/features/schedule-management/utils/validators';
import { useScheduleMutations } from '@/pages/schedule/hooks/useScheduleMutations';
import { useScheduleStore } from '@/features/schedule-management/stores/scheduleStore';
import { scheduleService } from '@/pages/schedule/services/scheduleService';
import { useScheduleListQuery } from '@/pages/schedule/hooks/useScheduleQueries';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  event?: ScheduleEvent | null;
  defaultHallId?: string;
  defaultStartHour?: number;
  defaultDuration?: number;
  defaultType?: EventType;
}

const EVENT_TYPE_OPTIONS: { label: string; value: EventType }[] = [
  { label: '公映', value: 'public' },
  { label: '包场', value: 'private' },
  { label: '维护', value: 'maintenance' },
  { label: '保洁', value: 'cleaning' },
];

const EVENT_STATUS_OPTIONS: { label: string; value: EventStatus }[] = [
  { label: '已确认', value: 'confirmed' },
  { label: '待定', value: 'pending' },
  { label: '锁定', value: 'locked' },
];

const EventForm: React.FC<EventFormProps> = ({
  open,
  onClose,
  mode = 'create',
  event,
  defaultHallId,
  defaultStartHour = 10,
  defaultDuration = 1,
  defaultType,
}) => {
  const { selectedDate } = useScheduleStore();
  const { createMutation, updateMutation } = useScheduleMutations(selectedDate);
  const { data: existingEvents } = useScheduleListQuery({ date: selectedDate });

  const isEditMode = mode === 'edit' && event;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateScheduleEventRequest | UpdateScheduleEventRequest>({
    resolver: zodResolver(isEditMode ? updateScheduleEventSchema : createScheduleEventSchema),
    defaultValues: isEditMode
      ? {
          id: event.id,
          hallId: event.hallId,
          date: event.date,
          startHour: event.startHour,
          duration: event.duration,
          title: event.title,
          type: event.type,
          status: event.status,
          customer: event.customer || '',
          serviceManager: event.serviceManager || '',
          occupancy: event.occupancy || '',
          details: event.details || '',
        }
      : {
          hallId: defaultHallId || 'h1',
          date: selectedDate,
          startHour: defaultStartHour,
          duration: defaultDuration,
          title: '',
          type: defaultType || 'public',
          status: undefined,
          customer: '',
          serviceManager: '',
          occupancy: '',
          details: '',
        },
  });

  // Reset form when event changes or mode changes
  useEffect(() => {
    if (isEditMode && event) {
      reset({
        id: event.id,
        hallId: event.hallId,
        date: event.date,
        startHour: event.startHour,
        duration: event.duration,
        title: event.title,
        type: event.type,
        status: event.status,
        customer: event.customer || '',
        serviceManager: event.serviceManager || '',
        occupancy: event.occupancy || '',
        details: event.details || '',
      });
    } else {
      reset({
        hallId: defaultHallId || 'h1',
        date: selectedDate,
        startHour: defaultStartHour,
        duration: defaultDuration,
        title: '',
        type: defaultType || 'public',
        status: undefined,
        customer: '',
        serviceManager: '',
        occupancy: '',
        details: '',
      });
    }
  }, [isEditMode, event, selectedDate, defaultHallId, defaultStartHour, defaultDuration, defaultType, reset]);

  const type = watch('type');
  const hallId = watch('hallId');
  const date = watch('date');
  const startHour = watch('startHour');
  const duration = watch('duration');

  const onSubmit = async (values: CreateScheduleEventRequest | UpdateScheduleEventRequest) => {
    try {
      // Client-side conflict detection
      if (existingEvents && existingEvents.length > 0) {
        const conflictResponse = await scheduleService.checkConflict({
          hallId: values.hallId!,
          date: values.date!,
          startHour: values.startHour!,
          duration: values.duration!,
          excludeEventId: isEditMode ? (values as UpdateScheduleEventRequest).id : undefined,
        });

        if (conflictResponse.success && conflictResponse.data.hasConflict) {
          message.error('该时间段已被占用，请选择其他时间');
          return;
        }
      }

      if (isEditMode) {
        await updateMutation.mutateAsync(values as UpdateScheduleEventRequest);
        message.success('更新成功');
      } else {
        await createMutation.mutateAsync(values as CreateScheduleEventRequest);
        message.success('创建成功');
      }
      onClose();
      reset();
    } catch (error: any) {
      message.error(error?.message || (isEditMode ? '更新失败' : '创建失败'));
    }
  };

  const isPrivate = type === 'private';
  const isMaintenance = type === 'maintenance' || type === 'cleaning';

  return (
    <Modal
      open={open}
      title={isEditMode ? '编辑排期' : '新增排期'}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      confirmLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
      destroyOnClose
      okText="保存"
      cancelText="取消"
    >
      <Form layout="vertical">
        <Form.Item label="影厅" validateStatus={errors.hallId ? 'error' : undefined} help={errors.hallId?.message}>
          <Controller
            name="hallId"
            control={control}
            render={({ field }) => (
              <Input placeholder="请输入影厅ID" {...field} />
            )}
          />
        </Form.Item>

        <Form.Item label="日期" validateStatus={errors.date ? 'error' : undefined} help={errors.date?.message}>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="YYYY-MM-DD" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="开始时间 (小时)"
          validateStatus={errors.startHour ? 'error' : undefined}
          help={errors.startHour?.message}
        >
          <Controller
            name="startHour"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={0} max={24} step={0.5} style={{ width: '100%' }} />
            )}
          />
        </Form.Item>

        <Form.Item
          label="持续时间 (小时)"
          validateStatus={errors.duration ? 'error' : undefined}
          help={errors.duration?.message}
        >
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={0.5} max={24} step={0.5} style={{ width: '100%' }} />
            )}
          />
        </Form.Item>

        <Form.Item label="标题" validateStatus={errors.title ? 'error' : undefined} help={errors.title?.message}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => <Input {...field} placeholder="请输入标题" />}
          />
        </Form.Item>

        <Form.Item label="类型" validateStatus={errors.type ? 'error' : undefined} help={errors.type?.message}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select {...field} options={EVENT_TYPE_OPTIONS} />
            )}
          />
        </Form.Item>

        {isPrivate && (
          <>
            <Form.Item
              label="客户信息"
              validateStatus={errors.customer ? 'error' : undefined}
              help={errors.customer?.message}
            >
              <Controller
                name="customer"
                control={control}
                render={({ field }) => <Input {...field} placeholder="客户姓名/联系方式" />}
              />
            </Form.Item>
            <Form.Item label="服务经理">
              <Controller
                name="serviceManager"
                control={control}
                render={({ field }) => <Input {...field} placeholder="服务经理" />}
              />
            </Form.Item>
            <Form.Item label="状态">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    allowClear
                    options={EVENT_STATUS_OPTIONS}
                    placeholder="选择状态"
                  />
                )}
              />
            </Form.Item>
          </>
        )}

        {type === 'public' && (
          <Form.Item label="上座率 (例如 85/120)" validateStatus={errors.occupancy ? 'error' : undefined} help={errors.occupancy?.message}>
            <Controller
              name="occupancy"
              control={control}
              render={({ field }) => <Input {...field} placeholder="上座率" />}
            />
          </Form.Item>
        )}

        {!isMaintenance && (
          <Form.Item label="备注">
            <Controller
              name="details"
              control={control}
              render={({ field }) => <Input.TextArea {...field} rows={3} placeholder="备注信息" />}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default EventForm;

