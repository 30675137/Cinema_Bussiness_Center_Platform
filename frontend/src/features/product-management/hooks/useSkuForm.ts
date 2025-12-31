/**
 * @spec O004-beverage-sku-reuse
 * SKU Form Hook (React Hook Form + Zod)
 *
 * 封装 SKU 创建/编辑表单的 React Hook Form 配置,集成 Zod 验证
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  skuCreateSchema,
  skuEditSchema,
  type SkuCreateFormData,
  type SkuEditFormData,
} from '../schemas/skuSchema';
import type { SKU } from '@/types/sku';

/**
 * Hook: 创建 SKU 表单
 *
 * 使用 React Hook Form 管理表单状态,Zod 进行验证
 *
 * @param defaultValues - 表单默认值(可选,用于恢复草稿)
 * @returns React Hook Form 实例
 *
 * @example
 * ```tsx
 * const form = useSkuCreateForm();
 *
 * const handleSubmit = form.handleSubmit(async (data) => {
 *   try {
 *     await createSKU.mutateAsync(data);
 *     message.success('SKU 创建成功');
 *   } catch (error) {
 *     message.error('SKU 创建失败');
 *   }
 * });
 *
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <input {...form.register('name')} />
 *     {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
 *   </form>
 * );
 * ```
 */
export function useSkuCreateForm(
  defaultValues?: Partial<SkuCreateFormData>
): UseFormReturn<SkuCreateFormData> {
  return useForm<SkuCreateFormData>({
    resolver: zodResolver(skuCreateSchema),
    defaultValues: {
      name: '',
      spuId: '',
      skuType: undefined,
      mainUnitId: '',
      mainBarcode: '',
      standardCost: undefined,
      price: undefined,
      storeScope: [],
      status: 'draft' as const,
      bomComponents: [],
      wasteRate: 0,
      comboItems: [],
      ...defaultValues,
    },
    mode: 'onChange', // 实时验证,提供即时反馈
    reValidateMode: 'onChange', // 重新验证模式
  });
}

/**
 * Hook: 编辑 SKU 表单
 *
 * 使用 React Hook Form 管理表单状态,Zod 进行验证
 * 从现有 SKU 数据初始化表单
 *
 * @param sku - 现有 SKU 数据
 * @returns React Hook Form 实例
 *
 * @example
 * ```tsx
 * const { data: sku } = useSKUDetail(skuId);
 * const form = useSkuEditForm(sku);
 *
 * const handleSubmit = form.handleSubmit(async (data) => {
 *   try {
 *     await updateSKU.mutateAsync({ id: skuId, formData: data });
 *     message.success('SKU 更新成功');
 *   } catch (error) {
 *     message.error('SKU 更新失败');
 *   }
 * });
 * ```
 */
export function useSkuEditForm(sku?: SKU): UseFormReturn<SkuEditFormData> {
  return useForm<SkuEditFormData>({
    resolver: zodResolver(skuEditSchema),
    defaultValues: sku
      ? {
          name: sku.name,
          mainUnitId: sku.mainUnitId,
          standardCost: sku.standardCost,
          price: sku.price,
          storeScope: sku.storeScope,
          status: sku.status,
        }
      : {
          name: '',
          mainUnitId: '',
          standardCost: undefined,
          price: undefined,
          storeScope: [],
          status: 'draft' as const,
        },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
}

/**
 * Hook: BOM 配方表单
 *
 * 用于管理成品类型 SKU 的 BOM 配方
 *
 * @param initialComponents - 初始 BOM 组件列表
 * @returns React Hook Form 实例
 *
 * @example
 * ```tsx
 * const bomForm = useBomForm(sku?.bomComponents);
 *
 * const handleBomSubmit = bomForm.handleSubmit(async (data) => {
 *   try {
 *     await updateBom.mutateAsync({
 *       skuId: sku.id,
 *       components: data.components,
 *       wasteRate: data.wasteRate,
 *     });
 *     message.success('BOM 配方更新成功');
 *   } catch (error) {
 *     message.error('BOM 配方更新失败');
 *   }
 * });
 * ```
 */
export function useBomForm(initialComponents?: any[]) {
  return useForm({
    defaultValues: {
      components: initialComponents || [],
      wasteRate: 0,
    },
    mode: 'onChange',
  });
}

/**
 * Hook: 套餐子项表单
 *
 * 用于管理套餐类型 SKU 的子项配置
 *
 * @param initialItems - 初始套餐子项列表
 * @returns React Hook Form 实例
 *
 * @example
 * ```tsx
 * const comboForm = useComboForm(sku?.comboItems);
 *
 * const handleComboSubmit = comboForm.handleSubmit(async (data) => {
 *   try {
 *     await updateComboItems.mutateAsync({
 *       skuId: sku.id,
 *       items: data.items,
 *     });
 *     message.success('套餐子项更新成功');
 *   } catch (error) {
 *     message.error('套餐子项更新失败');
 *   }
 * });
 * ```
 */
export function useComboForm(initialItems?: any[]) {
  return useForm({
    defaultValues: {
      items: initialItems || [],
    },
    mode: 'onChange',
  });
}
