/**
 * SKU数据钩子
 * 使用TanStack Query进行数据获取和缓存管理
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { skuKeys, createQueryOptions, createMutationOptions } from '@/services';
import { skuService } from '@/services/skuService';
import { showError, showSuccess, getFriendlyErrorMessage } from '@/utils/errorHandler';
import type { SKU, SkuQueryParams, SkuListResponse, SkuFormData, SPU, Unit } from '@/types/sku';
import { SkuStatus } from '@/types/sku';

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
  const cleanFilters = Object.keys(filters).reduce(
    (result, key) => {
      const value = filters[key as keyof typeof filters];
      if (value !== undefined && value !== null && value !== '') {
        result[key] = value;
      }
      return result;
    },
    {} as Record<string, any>
  );

  return useQuery({
    queryKey: skuKeys.skusPaginated(page || 1, pageSize || 20, cleanFilters),
    queryFn: async (): Promise<SkuListResponse> => {
      return skuService.getSkus(params);
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2分钟
  });
};

/**
 * 获取SKU详情Hook
 */
export const useSkuQuery = (id: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: skuKeys.sku(id!),
    queryFn: async (): Promise<SKU> => {
      if (!id) throw new Error('SKU ID is required');
      return skuService.getSkuById(id);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

/**
 * 创建SKU Hook
 */
export const useCreateSkuMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: SkuFormData): Promise<SKU> => {
      return skuService.createSku(formData);
    },
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
  });
};

/**
 * 更新SKU Hook
 */
export const useUpdateSkuMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: SkuFormData }): Promise<SKU> => {
      return skuService.updateSku(id, formData);
    },
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
  });
};

/**
 * 切换SKU状态Hook
 */
export const useToggleSkuStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SkuStatus }): Promise<SKU> => {
      return skuService.toggleSkuStatus(id, status);
    },
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
  });
};

/**
 * 检查条码是否重复Hook
 */
export const useCheckBarcodeDuplicate = (
  barcode: string,
  excludeSkuId?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: skuKeys.custom('barcode-check', barcode, excludeSkuId || ''),
    queryFn: async () => {
      return skuService.checkBarcodeDuplicate(barcode, excludeSkuId);
    },
    enabled: enabled && !!barcode,
    staleTime: 0, // 不缓存，每次都检查
  });
};

/**
 * 检查SKU名称是否重复Hook
 */
export const useCheckSkuNameDuplicate = (
  name: string,
  excludeSkuId?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: skuKeys.custom('name-check', name, excludeSkuId || ''),
    queryFn: async () => {
      return skuService.checkSkuNameDuplicate(name, excludeSkuId);
    },
    enabled: enabled && !!name,
    staleTime: 0, // 不缓存，每次都检查
  });
};

/**
 * 获取SPU列表Hook
 */
export const useSpusQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: skuKeys.spus(),
    queryFn: async (): Promise<SPU[]> => {
      return skuService.getSpus();
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10分钟
    select: (data: SPU[]) => data || [],
  });
};

/**
 * 获取原料和包材列表Hook (BOM选择用)
 * 返回 sku_type 为 raw_material 或 packaging 的 SKU
 */
export const useIngredientsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: skuKeys.custom('ingredients'),
    queryFn: async (): Promise<SKU[]> => {
      // 获取所有 SKU，然后在前端过滤原料和包材
      const response = await skuService.getSkus({ page: 1, pageSize: 1000 });
      const allSkus = response.items || [];
      // 过滤出原料和包材类型
      return allSkus.filter(
        (sku: SKU) => sku.skuType === 'raw_material' || sku.skuType === 'packaging'
      );
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5分钟
    select: (data: SKU[]) => data || [],
  });
};

/**
 * 获取套餐子项列表Hook (Combo选择用)
 * 套餐只能包含成品类型 (finished_product)
 */
export const useComboItemsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: skuKeys.custom('comboItems'),
    queryFn: async (): Promise<SKU[]> => {
      // 获取所有 SKU，然后在前端过滤
      const response = await skuService.getSkus({ page: 1, pageSize: 1000 });
      const allSkus = response.items || [];
      // 套餐子项只能选择成品类型
      return allSkus.filter((sku: SKU) => sku.skuType === 'finished_product');
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5分钟
    select: (data: SKU[]) => data || [],
  });
};

/**
 * 获取单位列表Hook
 */
export const useUnitsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: skuKeys.units(),
    queryFn: async (): Promise<Unit[]> => {
      return skuService.getUnits();
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10分钟
    select: (data: Unit[]) => data || [],
  });
};

/**
 * 检查条码是否重复Mutation Hook
 */
export const useCheckBarcodeMutation = () => {
  return useMutation({
    mutationFn: async ({ barcode, excludeSkuId }: { barcode: string; excludeSkuId?: string }) => {
      return skuService.checkBarcodeDuplicate(barcode, excludeSkuId);
    },
  });
};
