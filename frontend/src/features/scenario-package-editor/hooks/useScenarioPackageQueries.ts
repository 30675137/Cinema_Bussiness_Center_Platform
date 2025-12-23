/**
 * 场景包编辑器 TanStack Query Hooks
 * Feature: 001-scenario-package-tabs
 * 
 * 包含乐观更新支持 (T091)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccessMessage, showErrorMessage, logError } from '../utils/errorHandling';
import { scenarioPackageApi } from '../services/apiClient';
import type {
  ScenarioPackageFullData,
  PackageTier,
  AddOnItem,
  ScenarioPackageAddOn,
  TimeSlotTemplate,
  TimeSlotOverride,
  UpdateBasicInfoRequest,
  CreatePackageTierRequest,
  UpdatePackageTierRequest,
  UpdateAddOnsRequest,
  CreateTimeSlotTemplateRequest,
  CreateTimeSlotOverrideRequest,
  UpdatePublishSettingsRequest,
  PublishValidationResult,
} from '../types';

// ========== Query Keys ==========

export const scenarioPackageEditorKeys = {
  all: ['scenario-package-editor'] as const,

  // 完整数据
  detail: (id: string) => [...scenarioPackageEditorKeys.all, 'detail', id] as const,

  // 套餐相关
  packages: (packageId: string) => [...scenarioPackageEditorKeys.all, 'packages', packageId] as const,

  // 加购项相关
  allAddons: () => [...scenarioPackageEditorKeys.all, 'addons', 'all'] as const,
  packageAddons: (packageId: string) => [...scenarioPackageEditorKeys.all, 'addons', packageId] as const,

  // 时段相关
  timeSlotTemplates: (packageId: string) => [...scenarioPackageEditorKeys.all, 'time-slot-templates', packageId] as const,
  timeSlotOverrides: (packageId: string) => [...scenarioPackageEditorKeys.all, 'time-slot-overrides', packageId] as const,

  // 发布验证
  publishValidation: (packageId: string) => [...scenarioPackageEditorKeys.all, 'publish-validation', packageId] as const,
};

// ========== 查询 Hooks ==========

/**
 * 获取场景包完整数据
 */
export function useScenarioPackageDetail(packageId: string | null) {
  return useQuery<ScenarioPackageFullData>({
    queryKey: scenarioPackageEditorKeys.detail(packageId || ''),
    queryFn: () => scenarioPackageApi.getPackageDetail(packageId!),
    enabled: !!packageId,
    staleTime: 30 * 1000, // 30秒
  });
}

/**
 * 获取套餐列表
 */
export function usePackageTiers(packageId: string | null) {
  return useQuery<PackageTier[]>({
    queryKey: scenarioPackageEditorKeys.packages(packageId || ''),
    queryFn: () => scenarioPackageApi.getPackageTiers(packageId!),
    enabled: !!packageId,
    staleTime: 30 * 1000,
  });
}

/**
 * 获取所有可用加购项
 */
export function useAllAddOnItems() {
  return useQuery<AddOnItem[]>({
    queryKey: scenarioPackageEditorKeys.allAddons(),
    queryFn: () => scenarioPackageApi.getAllAddOnItems(),
    staleTime: 60 * 1000, // 1分钟
  });
}

/**
 * 获取场景包关联的加购项
 */
export function usePackageAddOns(packageId: string | null) {
  return useQuery<ScenarioPackageAddOn[]>({
    queryKey: scenarioPackageEditorKeys.packageAddons(packageId || ''),
    queryFn: () => scenarioPackageApi.getPackageAddOns(packageId!),
    enabled: !!packageId,
    staleTime: 30 * 1000,
  });
}

/**
 * 获取时段模板
 */
export function useTimeSlotTemplates(packageId: string | null) {
  return useQuery<TimeSlotTemplate[]>({
    queryKey: scenarioPackageEditorKeys.timeSlotTemplates(packageId || ''),
    queryFn: () => scenarioPackageApi.getTimeSlotTemplates(packageId!),
    enabled: !!packageId,
    staleTime: 30 * 1000,
  });
}

/**
 * 获取时段覆盖
 */
export function useTimeSlotOverrides(packageId: string | null) {
  return useQuery<TimeSlotOverride[]>({
    queryKey: scenarioPackageEditorKeys.timeSlotOverrides(packageId || ''),
    queryFn: () => scenarioPackageApi.getTimeSlotOverrides(packageId!),
    enabled: !!packageId,
    staleTime: 30 * 1000,
  });
}

/**
 * 获取发布验证结果
 */
export function usePublishValidation(packageId: string | null) {
  return useQuery<PublishValidationResult>({
    queryKey: scenarioPackageEditorKeys.publishValidation(packageId || ''),
    queryFn: () => scenarioPackageApi.validateForPublish(packageId!),
    enabled: !!packageId,
    staleTime: 10 * 1000, // 10秒
  });
}

// ========== 变更 Hooks ==========

/**
 * 更新基础信息
 */
export function useUpdateBasicInfo(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBasicInfoRequest) =>
      scenarioPackageApi.updateBasicInfo(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.detail(packageId) });
    },
  });
}

/**
 * 创建套餐 - 支持乐观更新
 */
export function useCreatePackageTier(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePackageTierRequest) =>
      scenarioPackageApi.createPackageTier(packageId, data),
    onMutate: async (newTier) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: scenarioPackageEditorKeys.packages(packageId) });
      
      // 保存当前状态用于回滚
      const previousTiers = queryClient.getQueryData<PackageTier[]>(
        scenarioPackageEditorKeys.packages(packageId)
      );
      
      // 乐观更新 - 添加临时数据
      if (previousTiers) {
        const optimisticTier: PackageTier = {
          id: `temp-${Date.now()}`,
          scenarioPackageId: packageId,
          sortOrder: previousTiers.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...newTier,
        };
        queryClient.setQueryData(
          scenarioPackageEditorKeys.packages(packageId),
          [...previousTiers, optimisticTier]
        );
      }
      
      return { previousTiers };
    },
    onError: (error, _newTier, context) => {
      // 回滚到之前的状态
      if (context?.previousTiers) {
        queryClient.setQueryData(
          scenarioPackageEditorKeys.packages(packageId),
          context.previousTiers
        );
      }
      showErrorMessage(error, '创建套餐失败');
      logError(error, { operation: 'createPackageTier', packageId });
    },
    onSuccess: () => {
      showSuccessMessage('套餐创建成功');
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.packages(packageId) });
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.publishValidation(packageId) });
    },
  });
}

/**
 * 更新套餐
 */
export function useUpdatePackageTier(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePackageTierRequest) =>
      scenarioPackageApi.updatePackageTier(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.packages(packageId) });
    },
  });
}

/**
 * 删除套餐 - 支持乐观更新
 */
export function useDeletePackageTier(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tierId: string) =>
      scenarioPackageApi.deletePackageTier(packageId, tierId),
    onMutate: async (tierId) => {
      await queryClient.cancelQueries({ queryKey: scenarioPackageEditorKeys.packages(packageId) });
      
      const previousTiers = queryClient.getQueryData<PackageTier[]>(
        scenarioPackageEditorKeys.packages(packageId)
      );
      
      // 乐观删除
      if (previousTiers) {
        queryClient.setQueryData(
          scenarioPackageEditorKeys.packages(packageId),
          previousTiers.filter((tier) => tier.id !== tierId)
        );
      }
      
      return { previousTiers };
    },
    onError: (error, _tierId, context) => {
      if (context?.previousTiers) {
        queryClient.setQueryData(
          scenarioPackageEditorKeys.packages(packageId),
          context.previousTiers
        );
      }
      showErrorMessage(error, '删除套餐失败');
      logError(error, { operation: 'deletePackageTier', packageId });
    },
    onSuccess: () => {
      showSuccessMessage('套餐已删除');
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.packages(packageId) });
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.publishValidation(packageId) });
    },
  });
}

/**
 * 更新套餐排序
 */
export function useReorderPackageTiers(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tierIds: string[]) =>
      scenarioPackageApi.reorderPackageTiers(packageId, tierIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.packages(packageId) });
    },
  });
}

/**
 * 更新加购项关联
 */
export function useUpdatePackageAddOns(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAddOnsRequest) =>
      scenarioPackageApi.updatePackageAddOns(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.packageAddons(packageId) });
    },
  });
}

/**
 * 创建时段模板
 */
export function useCreateTimeSlotTemplate(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeSlotTemplateRequest) =>
      scenarioPackageApi.createTimeSlotTemplate(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.timeSlotTemplates(packageId) });
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.publishValidation(packageId) });
    },
  });
}

/**
 * 更新时段模板
 */
export function useUpdateTimeSlotTemplate(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Partial<CreateTimeSlotTemplateRequest> }) =>
      scenarioPackageApi.updateTimeSlotTemplate(packageId, templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.timeSlotTemplates(packageId) });
    },
  });
}

/**
 * 删除时段模板
 */
export function useDeleteTimeSlotTemplate(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      scenarioPackageApi.deleteTimeSlotTemplate(packageId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.timeSlotTemplates(packageId) });
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.publishValidation(packageId) });
    },
  });
}

/**
 * 创建时段覆盖
 */
export function useCreateTimeSlotOverride(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeSlotOverrideRequest) =>
      scenarioPackageApi.createTimeSlotOverride(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.timeSlotOverrides(packageId) });
    },
  });
}

/**
 * 删除时段覆盖
 */
export function useDeleteTimeSlotOverride(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (overrideId: string) =>
      scenarioPackageApi.deleteTimeSlotOverride(packageId, overrideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.timeSlotOverrides(packageId) });
    },
  });
}

/**
 * 更新发布设置
 */
export function useUpdatePublishSettings(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePublishSettingsRequest) =>
      scenarioPackageApi.updatePublishSettings(packageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.detail(packageId) });
    },
  });
}

/**
 * 发布场景包
 */
export function usePublishPackage(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scenarioPackageApi.publishPackage(packageId),
    onError: (error) => {
      showErrorMessage(error, '发布失败');
      logError(error, { operation: 'publishPackage', packageId });
    },
    onSuccess: () => {
      showSuccessMessage('场景包已发布');
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.detail(packageId) });
    },
  });
}

/**
 * 下架场景包
 */
export function useArchivePackage(packageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scenarioPackageApi.archivePackage(packageId),
    onError: (error) => {
      showErrorMessage(error, '下架失败');
      logError(error, { operation: 'archivePackage', packageId });
    },
    onSuccess: () => {
      showSuccessMessage('场景包已下架');
      queryClient.invalidateQueries({ queryKey: scenarioPackageEditorKeys.detail(packageId) });
    },
  });
}
