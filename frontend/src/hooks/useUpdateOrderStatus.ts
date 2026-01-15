/**
 * @spec O003-beverage-order
 * B端订单状态更新 Hook
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { beverageOrderManagementService } from '../services/beverageOrderManagementService';
import type { BeverageOrderStatus } from '../types/beverageOrder';

/**
 * 订单状态更新 Hook
 *
 * @returns TanStack Query mutation result
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      targetStatus,
    }: {
      orderId: string;
      targetStatus: BeverageOrderStatus;
    }) => {
      return beverageOrderManagementService.updateOrderStatus(orderId, targetStatus);
    },
    onSuccess: () => {
      // 刷新订单列表缓存
      queryClient.invalidateQueries({ queryKey: ['beverage-orders'] });
      message.success('订单状态更新成功');
    },
    onError: (error: Error) => {
      message.error(`订单状态更新失败: ${error.message}`);
    },
  });
};

/**
 * 开始制作订单 Hook
 */
export const useStartProduction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => {
      return beverageOrderManagementService.startProduction(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beverage-orders'] });
      message.success('已开始制作');
    },
    onError: (error: Error) => {
      message.error(`操作失败: ${error.message}`);
    },
  });
};

/**
 * 完成订单 Hook
 */
export const useCompleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => {
      return beverageOrderManagementService.completeOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beverage-orders'] });
      message.success('订单已完成，请通知顾客取餐');
    },
    onError: (error: Error) => {
      message.error(`操作失败: ${error.message}`);
    },
  });
};

/**
 * 交付订单 Hook
 */
export const useDeliverOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => {
      return beverageOrderManagementService.deliverOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beverage-orders'] });
      message.success('订单已交付');
    },
    onError: (error: Error) => {
      message.error(`操作失败: ${error.message}`);
    },
  });
};

/**
 * 取消订单 Hook
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => {
      return beverageOrderManagementService.cancelOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beverage-orders'] });
      message.success('订单已取消');
    },
    onError: (error: Error) => {
      message.error(`操作失败: ${error.message}`);
    },
  });
};
