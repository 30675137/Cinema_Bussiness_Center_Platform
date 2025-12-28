/**
 * 活动类型管理 - TanStack Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ActivityType,
  ActivityTypeQueryParams,
  CreateActivityTypePayload,
  UpdateActivityTypePayload,
} from '../types/activity-type.types';
import { ActivityTypeStatus } from '../types/activity-type.types';
import {
  createActivityType,
  deleteActivityType,
  getActivityType,
  getActivityTypes,
  getEnabledActivityTypes,
  toggleActivityTypeStatus,
  updateActivityType,
} from '../services/activityTypeService';

/**
 * 查询活动类型列表（运营后台）
 */
export function useActivityTypesQuery(params?: ActivityTypeQueryParams) {
  return useQuery({
    queryKey: ['activityTypes', params],
    queryFn: () => getActivityTypes(params),
  });
}

/**
 * 查询启用状态的活动类型列表（小程序端）
 */
export function useEnabledActivityTypesQuery() {
  return useQuery({
    queryKey: ['activityTypes', 'enabled'],
    queryFn: () => getEnabledActivityTypes(),
  });
}

/**
 * 查询单个活动类型
 */
export function useActivityTypeQuery(id: string | null) {
  return useQuery({
    queryKey: ['activityTypes', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Activity type ID is required');
      }
      return getActivityType(id);
    },
    enabled: !!id,
  });
}

/**
 * 创建活动类型 Mutation
 */
export function useCreateActivityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateActivityTypePayload) => createActivityType(payload),
    onSuccess: () => {
      // 使活动类型列表查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['activityTypes'] });
    },
  });
}

/**
 * 更新活动类型 Mutation
 */
export function useUpdateActivityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateActivityTypePayload }) =>
      updateActivityType(id, payload),
    onSuccess: (_, variables) => {
      // 使活动类型列表和单个活动类型查询失效
      queryClient.invalidateQueries({ queryKey: ['activityTypes'] });
      queryClient.invalidateQueries({ queryKey: ['activityTypes', variables.id] });
    },
  });
}

/**
 * 删除活动类型 Mutation
 */
export function useDeleteActivityType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteActivityType(id),
    onSuccess: (_, id) => {
      // 使活动类型列表和单个活动类型查询失效
      queryClient.invalidateQueries({ queryKey: ['activityTypes'] });
      queryClient.invalidateQueries({ queryKey: ['activityTypes', id] });
    },
  });
}

/**
 * 切换活动类型状态 Mutation
 */
export function useToggleActivityTypeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActivityTypeStatus }) =>
      toggleActivityTypeStatus(id, status as 'ENABLED' | 'DISABLED'),
    onSuccess: (_, variables) => {
      // 使活动类型列表和单个活动类型查询失效
      queryClient.invalidateQueries({ queryKey: ['activityTypes'] });
      queryClient.invalidateQueries({ queryKey: ['activityTypes', variables.id] });
    },
  });
}

