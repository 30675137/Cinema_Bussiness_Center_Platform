import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '../types/brand.types';
import { brandQueryKeys } from '../types/brand.types';
import { brandService } from '../services/brandService';

// @spec B001-fix-brand-creation
// 注意：已移除内部 brandApi mock，现在所有 mutation 都使用 brandService
// 调用真实 API（在开发环境中被 MSW 拦截）

/**
 * 品牌操作Hook
 * 提供品牌创建、更新、删除、状态变更等功能
 */
export const useBrandActions = () => {
  const queryClient = useQueryClient();

  // 创建品牌 - 使用 brandService 调用真实 API (被 MSW 拦截)
  // @spec B001-fix-brand-creation
  const createBrandMutation = useMutation({
    mutationFn: (data: CreateBrandRequest) => brandService.createBrand(data),
    onSuccess: (brand) => {
      message.success('品牌创建成功');

      // 刷新品牌列表 - 使用宽泛的 key 匹配所有 'brands' 开头的查询
      queryClient.invalidateQueries({ queryKey: ['brands'] });

      return brand;
    },
    onError: (error: any) => {
      const errorMessage = error.message || '品牌创建失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 更新品牌 - 使用 brandService 调用真实 API
  // @spec B001-fix-brand-creation
  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) =>
      brandService.updateBrand(id, data),
    onSuccess: (updatedBrand, variables) => {
      message.success('品牌更新成功');

      // 更新列表缓存中的特定品牌
      queryClient.setQueriesData({ queryKey: ['brands'] }, (oldData: any) => {
        if (!oldData) return oldData;

        // 处理列表数据
        if (Array.isArray(oldData)) {
          return oldData.map((brand: Brand) => (brand.id === variables.id ? updatedBrand : brand));
        }

        // 处理分页数据
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map((brand: Brand) =>
              brand.id === variables.id ? updatedBrand : brand
            ),
          };
        }

        return oldData;
      });

      // 刷新详情缓存
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(variables.id) });

      return updatedBrand;
    },
    onError: (error: any) => {
      const errorMessage = error.message || '品牌更新失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 删除品牌 - 使用 brandService 调用真实 API
  // @spec B001-fix-brand-creation
  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => brandService.deleteBrand(id),
    onSuccess: () => {
      message.success('品牌删除成功');

      // 刷新品牌列表
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || '品牌删除失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 更新品牌状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      brandService.updateBrandStatus(id, status, reason),
    onSuccess: (response, variables) => {
      const statusText =
        variables.status === 'enabled'
          ? '启用'
          : variables.status === 'disabled'
            ? '停用'
            : '设置状态';
      message.success(`品牌${statusText}成功`);

      // 更新列表缓存中的品牌状态
      queryClient.setQueriesData({ queryKey: brandQueryKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;

        // 处理列表数据
        if (Array.isArray(oldData)) {
          return oldData.map((brand: Brand) =>
            brand.id === variables.id ? { ...brand, ...response.data.data } : brand
          );
        }

        // 处理分页数据
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map((brand: Brand) =>
              brand.id === variables.id ? { ...brand, ...response.data.data } : brand
            ),
          };
        }

        return oldData;
      });

      // 刷新详情缓存
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(variables.id) });

      return response.data.data;
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || '状态更新失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 上传Logo - 使用 brandService 调用真实 API
  // @spec B001-fix-brand-creation
  const uploadLogoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => brandService.uploadLogo(id, file),
    onSuccess: (result, variables) => {
      message.success('Logo上传成功');

      // 更新列表和详情缓存中的Logo URL
      queryClient.setQueriesData({ queryKey: ['brands'] }, (oldData: any) => {
        if (!oldData) return oldData;

        // 处理列表数据
        if (Array.isArray(oldData)) {
          return oldData.map((brand: Brand) =>
            brand.id === variables.id
              ? { ...brand, logoUrl: result.logoUrl, updatedAt: new Date().toISOString() }
              : brand
          );
        }

        // 处理分页数据
        if (oldData.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map((brand: Brand) =>
              brand.id === variables.id
                ? { ...brand, logoUrl: result.logoUrl, updatedAt: new Date().toISOString() }
                : brand
            ),
          };
        }

        return oldData;
      });

      // 刷新详情缓存
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(variables.id) });

      return result;
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Logo上传失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 检查品牌名称重复 - 使用 brandService 调用真实 API
  // @spec B001-fix-brand-creation
  const checkNameDuplicationMutation = useMutation({
    mutationFn: (params: { name: string; brandType: string; excludeId?: string }) =>
      brandService.checkNameDuplication(params),
    onError: (error: any) => {
      console.error('品牌名称重复检查失败:', error);
      // 这个错误通常不显示给用户，只用于表单验证
    },
  });

  // 返回操作方法和状态
  return {
    // 创建相关
    createBrand: createBrandMutation.mutateAsync,
    isCreating: createBrandMutation.isPending,

    // 更新相关
    updateBrand: updateBrandMutation.mutateAsync,
    isUpdating: updateBrandMutation.isPending,

    // 删除相关
    deleteBrand: deleteBrandMutation.mutateAsync,
    isDeleting: deleteBrandMutation.isPending,

    // 状态变更相关
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    // Logo上传相关
    uploadLogo: uploadLogoMutation.mutateAsync,
    isUploadingLogo: uploadLogoMutation.isPending,

    // 名称重复检查
    checkNameDuplication: checkNameDuplicationMutation.mutateAsync,
    isCheckingName: checkNameDuplicationMutation.isPending,

    // 批量操作状态
    isLoading:
      createBrandMutation.isPending ||
      updateBrandMutation.isPending ||
      deleteBrandMutation.isPending ||
      updateStatusMutation.isPending ||
      uploadLogoMutation.isPending,

    // 错误状态
    error:
      createBrandMutation.error ||
      updateBrandMutation.error ||
      deleteBrandMutation.error ||
      updateStatusMutation.error ||
      uploadLogoMutation.error ||
      checkNameDuplicationMutation.error,
  };
};

export default useBrandActions;
