/**
 * 预约单操作 Mutation Hooks
 *
 * 包含确认、取消、修改预约单的操作
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  ReservationOrder,
  ConfirmReservationRequest,
  CancelReservationRequest,
  UpdateReservationRequest,
  CreateReservationRequest,
} from '../types/reservation-order.types';
import {
  confirmReservation,
  cancelReservation,
  updateReservation,
  createReservation,
} from '../services/reservationOrderService';
import { RESERVATION_QUERY_KEY } from './useReservationOrders';

/**
 * 确认预约 Hook
 */
export function useConfirmReservation() {
  const queryClient = useQueryClient();

  return useMutation<ReservationOrder, Error, { id: string; request: ConfirmReservationRequest }>({
    mutationFn: ({ id, request }) => confirmReservation(id, request),
    onSuccess: (data, variables) => {
      // 根据 requiresPayment 显示不同的成功消息
      if (variables.request.requiresPayment) {
        message.success('预约已确认，等待客户支付');
      } else {
        message.success('预约已确认并完成');
      }

      // 使列表和详情查询失效，触发重新获取
      queryClient.invalidateQueries({
        queryKey: [RESERVATION_QUERY_KEY, 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: [RESERVATION_QUERY_KEY, 'detail', variables.id],
      });
    },
    onError: (error) => {
      message.error(`确认失败: ${error.message}`);
    },
  });
}

/**
 * 取消预约 Hook
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation<ReservationOrder, Error, { id: string; request: CancelReservationRequest }>({
    mutationFn: ({ id, request }) => cancelReservation(id, request),
    onSuccess: (_, variables) => {
      message.success('预约已取消');

      // 使列表和详情查询失效
      queryClient.invalidateQueries({
        queryKey: [RESERVATION_QUERY_KEY, 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: [RESERVATION_QUERY_KEY, 'detail', variables.id],
      });
    },
    onError: (error) => {
      message.error(`取消失败: ${error.message}`);
    },
  });
}

/**
 * 修改预约信息 Hook
 */
export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation<ReservationOrder, Error, { id: string; request: UpdateReservationRequest }>({
    mutationFn: ({ id, request }) => updateReservation(id, request),
    onSuccess: (_, variables) => {
      message.success('预约信息已更新');

      // 使列表和详情查询失效
      queryClient.invalidateQueries({
        queryKey: [RESERVATION_QUERY_KEY, 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: [RESERVATION_QUERY_KEY, 'detail', variables.id],
      });
    },
    onError: (error) => {
      if (error.message.includes('冲突') || error.message.includes('已被修改')) {
        message.error('该预约单已被他人修改，请刷新后重试');
        // 刷新数据
        queryClient.invalidateQueries({
          queryKey: [RESERVATION_QUERY_KEY],
        });
      } else {
        message.error(`更新失败: ${error.message}`);
      }
    },
  });
}

/**
 * 创建预约 Hook (C端)
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation<ReservationOrder, Error, CreateReservationRequest>({
    mutationFn: (request) => createReservation(request),
    onSuccess: (data) => {
      message.success(`预约成功，预约单号: ${data.orderNumber}`);

      // 使列表查询失效
      queryClient.invalidateQueries({
        queryKey: [RESERVATION_QUERY_KEY, 'list'],
      });
    },
    onError: (error) => {
      if (error.message.includes('库存不足')) {
        message.error('该时段预约已满，请选择其他时段');
      } else {
        message.error(`预约失败: ${error.message}`);
      }
    },
  });
}

/**
 * 组合的预约单操作 Hook
 *
 * 提供便捷的操作方法
 */
export function useOrderOperations() {
  const confirmMutation = useConfirmReservation();
  const cancelMutation = useCancelReservation();
  const updateMutation = useUpdateReservation();
  const createMutation = useCreateReservation();

  return {
    // 确认预约
    confirm: (id: string, requiresPayment: boolean, remark?: string) =>
      confirmMutation.mutateAsync({ id, request: { requiresPayment, remark } }),

    // 取消预约
    cancel: (id: string, cancelReason: string, cancelReasonType?: string) =>
      cancelMutation.mutateAsync({
        id,
        request: {
          cancelReason,
          cancelReasonType: cancelReasonType as any,
        },
      }),

    // 修改预约信息
    update: (id: string, data: UpdateReservationRequest) =>
      updateMutation.mutateAsync({ id, request: data }),

    // 创建预约
    create: (data: CreateReservationRequest) => createMutation.mutateAsync(data),

    // 加载状态
    isConfirming: confirmMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCreating: createMutation.isPending,

    // 任意操作进行中
    isLoading:
      confirmMutation.isPending ||
      cancelMutation.isPending ||
      updateMutation.isPending ||
      createMutation.isPending,
  };
}

export default useOrderOperations;
