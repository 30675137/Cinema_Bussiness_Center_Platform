/**
 * 场景包增删改 Mutation Hooks
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import packageService from '../services/packageService';
import type { CreatePackageRequest, UpdatePackageRequest } from '../types';

/**
 * 创建场景包 Hook
 */
export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: packageService.create,
    onSuccess: () => {
      message.success('场景包创建成功');
      queryClient.invalidateQueries({ queryKey: ['scenario-packages'] });
    },
    onError: (error: any) => {
      message.error(`创建失败: ${error.response?.data?.message || error.message}`);
    },
  });
};

/**
 * 更新场景包 Hook
 */
export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdatePackageRequest }) =>
      packageService.update(id, request),
    onSuccess: () => {
      message.success('场景包更新成功');
      queryClient.invalidateQueries({ queryKey: ['scenario-packages'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        message.error('该场景包已被他人修改，请刷新后重试');
      } else {
        message.error(`更新失败: ${error.response?.data?.message || error.message}`);
      }
      queryClient.invalidateQueries({ queryKey: ['scenario-packages'] });
    },
  });
};

/**
 * 删除场景包 Hook
 */
export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: packageService.delete,
    onSuccess: () => {
      message.success('场景包删除成功');
      queryClient.invalidateQueries({ queryKey: ['scenario-packages'] });
    },
    onError: (error: any) => {
      message.error(`删除失败: ${error.response?.data?.message || error.message}`);
    },
  });
};
