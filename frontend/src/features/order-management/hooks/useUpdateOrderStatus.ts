/**
 * @spec O001-product-order-list
 * 订单状态更新 Mutation Hook - User Story 4
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { updateOrderStatus } from '../services/orderService';
import type { UpdateStatusRequest, OrderDetailResponse, ProductOrder } from '../types/order';

interface UpdateStatusParams {
  orderId: string;
  request: UpdateStatusRequest;
}

/**
 * 订单状态更新 Mutation Hook
 *
 * @returns TanStack Query mutation result
 *
 * 特性:
 * - 乐观更新：立即更新本地缓存，提升用户体验
 * - 错误回滚：如果更新失败，自动恢复之前的数据
 * - 自动刷新：成功后刷新订单详情和列表缓存
 *
 * @example
 * ```tsx
 * const updateStatus = useUpdateOrderStatus()
 *
 * const handleShip = () => {
 *   updateStatus.mutate({
 *     orderId: order.id,
 *     request: { status: OrderStatus.SHIPPED, version: order.version }
 *   })
 * }
 * ```
 */
export const useUpdateOrderStatus = (): UseMutationResult<
  OrderDetailResponse,
  Error,
  UpdateStatusParams
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, request }: UpdateStatusParams) => updateOrderStatus(orderId, request),

    // 乐观更新：立即更新本地缓存
    onMutate: async ({ orderId, request }) => {
      // 取消所有正在进行的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });

      // 获取当前缓存的订单数据
      const previousOrder = queryClient.getQueryData<OrderDetailResponse>(['order', orderId]);

      // 乐观更新：立即更新状态
      if (previousOrder) {
        queryClient.setQueryData<OrderDetailResponse>(['order', orderId], {
          ...previousOrder,
          data: {
            ...previousOrder.data,
            status: request.status,
            version: previousOrder.data.version + 1,
            updatedAt: new Date().toISOString(),
            // 如果是取消操作，更新取消信息
            ...(request.cancelReason && {
              cancelledTime: new Date().toISOString(),
              cancelReason: request.cancelReason,
            }),
            // 如果是发货操作，更新发货时间
            ...(request.status === 'SHIPPED' && {
              shippedTime: new Date().toISOString(),
            }),
            // 如果是完成操作，更新完成时间
            ...(request.status === 'COMPLETED' && {
              completedTime: new Date().toISOString(),
            }),
          },
        });
      }

      // 返回上下文，用于错误回滚
      return { previousOrder };
    },

    // 错误处理：回滚乐观更新
    onError: (error, { orderId }, context) => {
      // 恢复之前的数据
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', orderId], context.previousOrder);
      }
    },

    // 成功后：刷新相关缓存
    onSuccess: (data, { orderId }) => {
      // 更新订单详情缓存
      queryClient.setQueryData(['order', orderId], data);

      // 刷新订单列表缓存（因为列表中也显示状态）
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export default useUpdateOrderStatus;
