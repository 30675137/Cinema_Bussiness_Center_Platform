/**
 * @spec O004-beverage-sku-reuse
 * SKU Management TanStack Query Hooks
 *
 * 提供 SKU 管理相关的 TanStack Query hooks,封装服务器状态管理逻辑
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { skuService, type ISkuService } from '@/services/skuService';
import type {
  SKU,
  SkuQueryParams,
  SkuListResponse,
  SkuFormData,
  SkuStatus,
  SPU,
  Unit,
} from '@/types/sku';

/**
 * Query Keys for SKU-related queries
 * 使用工厂函数模式组织 Query Keys,便于管理和失效控制
 */
export const skuQueryKeys = {
  all: ['skus'] as const,
  lists: () => [...skuQueryKeys.all, 'list'] as const,
  list: (params: SkuQueryParams) => [...skuQueryKeys.lists(), params] as const,
  details: () => [...skuQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...skuQueryKeys.details(), id] as const,
  spus: () => ['spus'] as const,
  units: () => ['units'] as const,
};

/**
 * Hook: 获取 SKU 列表
 *
 * @param params - 查询参数(关键字、状态、分页等)
 * @param options - TanStack Query 配置选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSKUs({
 *   keyword: '可乐',
 *   status: 'enabled',
 *   page: 1,
 *   pageSize: 20
 * });
 * ```
 */
export function useSKUs(
  params: SkuQueryParams = {},
  options?: Omit<UseQueryOptions<SkuListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SkuListResponse>({
    queryKey: skuQueryKeys.list(params),
    queryFn: () => skuService.getSkus(params),
    staleTime: 2 * 60 * 1000, // 2分钟缓存,减少重复查询
    ...options,
  });
}

/**
 * Hook: 获取 SKU 详情
 *
 * @param id - SKU ID
 * @param options - TanStack Query 配置选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * const { data: sku, isLoading } = useSKUDetail('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export function useSKUDetail(
  id: string,
  options?: Omit<UseQueryOptions<SKU>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SKU>({
    queryKey: skuQueryKeys.detail(id),
    queryFn: () => skuService.getSkuById(id),
    enabled: !!id, // 只有当 id 存在时才执行查询
    staleTime: 5 * 60 * 1000, // 5分钟缓存,详情数据更新频率较低
    ...options,
  });
}

/**
 * Hook: 获取 SPU 列表(用于 SKU 创建时选择 SPU)
 *
 * @param options - TanStack Query 配置选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * const { data: spus } = useSPUs();
 * ```
 */
export function useSPUs(options?: Omit<UseQueryOptions<SPU[]>, 'queryKey' | 'queryFn'>) {
  return useQuery<SPU[]>({
    queryKey: skuQueryKeys.spus(),
    queryFn: () => skuService.getSpus(),
    staleTime: 10 * 60 * 1000, // 10分钟缓存,SPU 数据相对稳定
    ...options,
  });
}

/**
 * Hook: 获取单位列表(用于 SKU 创建时选择单位)
 *
 * @param options - TanStack Query 配置选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```tsx
 * const { data: units } = useUnits();
 * ```
 */
export function useUnits(options?: Omit<UseQueryOptions<Unit[]>, 'queryKey' | 'queryFn'>) {
  return useQuery<Unit[]>({
    queryKey: skuQueryKeys.units(),
    queryFn: () => skuService.getUnits(),
    staleTime: 30 * 60 * 1000, // 30分钟缓存,单位数据基本不变
    ...options,
  });
}

/**
 * Hook: 创建 SKU
 *
 * @returns TanStack Mutation 结果
 *
 * @example
 * ```tsx
 * const createSKU = useCreateSKU();
 *
 * const handleSubmit = async (formData: SkuFormData) => {
 *   try {
 *     const newSKU = await createSKU.mutateAsync(formData);
 *     message.success('SKU 创建成功');
 *   } catch (error) {
 *     message.error('SKU 创建失败');
 *   }
 * };
 * ```
 */
export function useCreateSKU() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: SkuFormData) => skuService.createSku(formData),
    onSuccess: () => {
      // 创建成功后,失效所有 SKU 列表查询,触发重新获取
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.lists() });
    },
  });
}

/**
 * Hook: 更新 SKU
 *
 * @returns TanStack Mutation 结果
 *
 * @example
 * ```tsx
 * const updateSKU = useUpdateSKU();
 *
 * const handleUpdate = async (id: string, formData: SkuFormData) => {
 *   try {
 *     await updateSKU.mutateAsync({ id, formData });
 *     message.success('SKU 更新成功');
 *   } catch (error) {
 *     message.error('SKU 更新失败');
 *   }
 * };
 * ```
 */
export function useUpdateSKU() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: SkuFormData }) =>
      skuService.updateSku(id, formData),
    onSuccess: (updatedSKU, variables) => {
      // 更新成功后,失效相关查询
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.detail(variables.id) });

      // 可选:乐观更新详情缓存
      queryClient.setQueryData<SKU>(skuQueryKeys.detail(variables.id), updatedSKU);
    },
  });
}

/**
 * Hook: 切换 SKU 状态(启用/禁用)
 *
 * @returns TanStack Mutation 结果
 *
 * @example
 * ```tsx
 * const toggleStatus = useToggleSKUStatus();
 *
 * const handleToggle = async (id: string, status: SkuStatus) => {
 *   try {
 *     await toggleStatus.mutateAsync({ id, status });
 *     message.success(`SKU 已${status === 'enabled' ? '启用' : '禁用'}`);
 *   } catch (error) {
 *     message.error('状态切换失败');
 *   }
 * };
 * ```
 */
export function useToggleSKUStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SkuStatus }) =>
      skuService.toggleSkuStatus(id, status),
    onSuccess: (updatedSKU, variables) => {
      // 状态切换成功后,失效相关查询
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.detail(variables.id) });

      // 可选:乐观更新详情缓存
      queryClient.setQueryData<SKU>(skuQueryKeys.detail(variables.id), updatedSKU);
    },
  });
}

/**
 * Hook: 更新 BOM 配方(成品类型 SKU)
 *
 * @returns TanStack Mutation 结果
 *
 * @example
 * ```tsx
 * const updateBom = useUpdateBom();
 *
 * const handleBomUpdate = async (skuId: string, components: BomComponent[], wasteRate: number) => {
 *   try {
 *     const result = await updateBom.mutateAsync({ skuId, components, wasteRate });
 *     message.success(`BOM 更新成功,计算成本: ¥${result.calculatedCost}`);
 *   } catch (error) {
 *     message.error('BOM 更新失败');
 *   }
 * };
 * ```
 */
export function useUpdateBom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      skuId,
      components,
      wasteRate,
    }: {
      skuId: string;
      components: Array<{
        componentId: string;
        quantity: number;
        unit: string;
        isOptional?: boolean;
        sortOrder?: number;
      }>;
      wasteRate?: number;
    }) => skuService.updateBom(skuId, components, wasteRate),
    onSuccess: (result, variables) => {
      // BOM 更新成功后,失效相关查询
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.detail(variables.skuId) });
    },
  });
}

/**
 * Hook: 更新套餐子项(套餐类型 SKU)
 *
 * @returns TanStack Mutation 结果
 *
 * @example
 * ```tsx
 * const updateComboItems = useUpdateComboItems();
 *
 * const handleComboUpdate = async (skuId: string, items: ComboItem[]) => {
 *   try {
 *     const result = await updateComboItems.mutateAsync({ skuId, items });
 *     message.success(`套餐更新成功,计算成本: ¥${result.calculatedCost}`);
 *   } catch (error) {
 *     message.error('套餐更新失败');
 *   }
 * };
 * ```
 */
export function useUpdateComboItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      skuId,
      items,
    }: {
      skuId: string;
      items: Array<{
        subItemId: string;
        quantity: number;
        unit: string;
        sortOrder?: number;
      }>;
    }) => skuService.updateComboItems(skuId, items),
    onSuccess: (result, variables) => {
      // 套餐子项更新成功后,失效相关查询
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: skuQueryKeys.detail(variables.skuId) });
    },
  });
}
