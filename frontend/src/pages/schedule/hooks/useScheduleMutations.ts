import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../services/scheduleService';
import { scheduleKeys } from './useScheduleQueries';
import type {
  CreateScheduleEventRequest,
  UpdateScheduleEventRequest,
} from '../types/schedule.types';

export function useScheduleMutations(date: string) {
  const queryClient = useQueryClient();

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: scheduleKeys.list({ date }) });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateScheduleEventRequest) => scheduleService.createSchedule(payload),
    onSuccess: () => {
      invalidateList();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateScheduleEventRequest) => scheduleService.updateSchedule(payload),
    onSuccess: (_, variables) => {
      invalidateList();
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(variables.id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduleService.deleteSchedule(id),
    onSuccess: (_, id) => {
      invalidateList();
      queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(id) });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
