/**
 * SKU数据钩子
 * 使用TanStack Query进行数据获取和缓存管理
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { skuKeys, createQueryOptions, createMutationOptions } from '@/services';
import { skuService } from '@/services/skuService';
import { showError, showSuccess, getFriendlyErrorMessage } from '@/utils/errorHandler';
import {
  SKU,
  SkuQueryParams,
  SkuListResponse,
  SkuFormData,
  SkuStatus,
  SPU,
  Unit,
} from '@/types/sku';

/**
 * 获取SKU列表Hook
 */
export const useSkuListQuery = (params: SkuQueryParams, enabled: boolean = true) => {
  // 确保 params 是有效对象
  if (!params || typeof params !== 'object') {
    params = { page: 1, pageSize: 20 };
  }
  
  // 从 params 中提取 filters（排除分页和排序参数）
  const { page, pageSize, sortField, sortOrder, ...filters } = params;
  
  // 清理 filters，移除 undefined 和 null
  const cleanFilters = Object.keys(filters).reduce((result, key) => {
    const value = filters[key as keyof typeof filters];
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
    return result;
  }, {} as Record<string, any>);
  
  return useQuery(
    skuKeys.skusPaginated(page || 1, pageSize || 20, cleanFilters),
    async (): Promise<SkuListResponse> => {
      return skuService.getSkus(params);
    },
    createQueryOptions({
      enabled,
      staleTime: 2 * 60 * 1000, // 2分钟
    })
  );
};

/**
 * 获取SKU详情Hook
 */
export const useSkuQuery = (id: string | null, enabled: boolean = true) => {
  return useQuery(
    skuKeys.sku(id!),
    async (): Promise<SKU> => {
      if (!id) throw new Error('SKU ID is required');
      return skuService.getSkuById(id);
    },
    createQueryOptions({
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000, // 5分钟
    })
  );
};

/**
 * 创建SKU Hook
 */
export const useCreateSkuMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (formData: SkuFormData): Promise<SKU> => {
      return skuService.createSku(formData);
    },
    createMutationOptions({
      onSuccess: (data) => {
        showSuccess('SKU创建成功');
        
        // 更新SKU列表缓存
        queryClient.invalidateQueries({ queryKey: skuKeys.skus() });
        
        // 预取新创建的SKU详情
        queryClient.prefetchQuery({
          queryKey: skuKeys.sku(data.id),
          queryFn: () => Promise.resolve(data),
        });
      },
      onError: (error: any) => {
        showError(error, 'SKU创建失败');
      },
    })
  );
};

/**
 * 更新SKU Hook
 */
export const useUpdateSkuMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, formData }: { id: string; formData: SkuFormData }): Promise<SKU> => {
      return skuService.updateSku(id, formData);
    },
    createMutationOptions({
      onSuccess: (data) => {
        showSuccess('SKU更新成功');
        
        // 更新SKU详情缓存
        queryClient.setQueryData(skuKeys.sku(data.id), data);
        
        // 更新SKU列表缓存
        queryClient.invalidateQueries({ queryKey: skuKeys.skus() });
      },
      onError: (error: any) => {
        showError(error, 'SKU更新失败');
      },
    })
  );
};

/**
 * 切换SKU状态Hook
 */
export const useToggleSkuStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, status }: { id: string; status: SkuStatus }): Promise<SKU> => {
      return skuService.toggleSkuStatus(id, status);
    },
    createMutationOptions({
      onSuccess: (data) => {
        const statusText = data.status === SkuStatus.ENABLED ? '启用' : '停用';
        showSuccess(`SKU已${statusText}`);
        
        // 更新SKU详情缓存
        queryClient.setQueryData(skuKeys.sku(data.id), data);
        
        // 更新SKU列表缓存
        queryClient.invalidateQueries({ queryKey: skuKeys.skus() });
      },
      onError: (error: any) => {
        showError(error, '状态切换失败');
      },
    })
  );
};

/**
 * 检查条码是否重复Hook
 */
export const useCheckBarcodeDuplicate = (
  barcode: string,
  excludeSkuId?: string,
  enabled: boolean = true
) => {
  return useQuery(
    skuKeys.custom('barcode-check', barcode, excludeSkuId || ''),
    async () => {
      return skuService.checkBarcodeDuplicate(barcode, excludeSkuId);
    },
    createQueryOptions({
      enabled: enabled && !!barcode,
      staleTime: 0, // 不缓存，每次都检查
    })
  );
};

/**
 * 检查SKU名称是否重复Hook
 */
export const useCheckSkuNameDuplicate = (
  name: string,
  excludeSkuId?: string,
  enabled: boolean = true
) => {
  return useQuery(
    skuKeys.custom('name-check', name, excludeSkuId || ''),
    async () => {
      return skuService.checkSkuNameDuplicate(name, excludeSkuId);
    },
    createQueryOptions({
      enabled: enabled && !!name,
      staleTime: 0, // 不缓存，每次都检查
    })
  );
};

/**
 * 获取SPU列表Hook
 */
export const useSpusQuery = (enabled: boolean = true) => {
  return useQuery(
    skuKeys.spus(),
    async (): Promise<SPU[]> => {
      return skuService.getSpus();
    },
    createQueryOptions({
      enabled,
      staleTime: 10 * 60 * 1000, // 10分钟
      select: (data) => data || [],
    })
  );
};

/**
 * 获取单位列表Hook
 */
export const useUnitsQuery = (enabled: boolean = true) => {
  return useQuery(
    skuKeys.units(),
    async (): Promise<Unit[]> => {
      return skuService.getUnits();
    },
    createQueryOptions({
      enabled,
      staleTime: 10 * 60 * 1000, // 10分钟
      select: (data) => data || [],
    })
  );
};

/**
 * 检查条码是否重复Mutation Hook
 */
export const useCheckBarcodeMutation = () => {
  return useMutation(
    async ({ barcode, excludeSkuId }: { barcode: string; excludeSkuId?: string }) => {
      return skuService.checkBarcodeDuplicate(barcode, excludeSkuId);
    }
  );
};

