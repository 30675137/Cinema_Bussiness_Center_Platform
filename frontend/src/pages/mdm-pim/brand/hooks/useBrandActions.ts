import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  Brand,
  CreateBrandRequest,
  UpdateBrandRequest,
  UpdateBrandStatusRequest,
} from '../types/brand.types';
import { brandQueryKeys } from '../types/brand.types';
import { brandService } from '../services/brandService';

// 临时定义ApiResponse类型以避免循环导入问题
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message: string;
  timestamp: string;
}

// Mock API 服务 - 在实际应用中应该替换为真实的API调用
const brandApi = {
  createBrand: async (data: CreateBrandRequest): Promise<ApiResponse<Brand>> => {
    // Mock API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟创建品牌响应
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      brandCode: `BRAND${Date.now()}`,
      name: data.name,
      englishName: data.englishName,
      brandType: data.brandType,
      primaryCategories: data.primaryCategories,
      company: data.company,
      brandLevel: data.brandLevel,
      tags: data.tags || [],
      description: data.description,
      logoUrl: null,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin',
    };

    return {
      success: true,
      data: newBrand,
      message: '品牌创建成功',
      timestamp: new Date().toISOString(),
    };
  },

  updateBrand: async (id: string, data: UpdateBrandRequest): Promise<ApiResponse<Brand>> => {
    // Mock API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟更新品牌响应
    const updatedBrand: Brand = {
      id,
      brandCode: 'BRAND001',
      name: data.name || '默认品牌名',
      englishName: data.englishName,
      brandType: data.brandType || 'own',
      primaryCategories: data.primaryCategories || [],
      company: data.company,
      brandLevel: data.brandLevel,
      tags: data.tags || [],
      description: data.description,
      logoUrl: null,
      status: 'enabled',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin',
    };

    return {
      success: true,
      data: updatedBrand,
      message: '品牌更新成功',
      timestamp: new Date().toISOString(),
    };
  },

  deleteBrand: async (id: string): Promise<ApiResponse<void>> => {
    // Mock API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟删除品牌响应
    return {
      success: true,
      message: '品牌删除成功',
      timestamp: new Date().toISOString(),
    };
  },

  updateBrandStatus: async (id: string, data: UpdateBrandStatusRequest): Promise<ApiResponse<Brand>> => {
    // Mock API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟状态更新响应
    const updatedBrand: Brand = {
      id,
      brandCode: 'BRAND001',
      name: '测试品牌',
      englishName: 'Test Brand',
      brandType: 'own',
      primaryCategories: [],
      company: '测试公司',
      brandLevel: 'A',
      tags: [],
      description: '测试描述',
      logoUrl: null,
      status: data.status,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin',
    };

    return {
      success: true,
      data: updatedBrand,
      message: '品牌状态更新成功',
      timestamp: new Date().toISOString(),
    };
  },

  uploadLogo: async (id: string, file: File): Promise<ApiResponse<{ logoUrl: string; updatedAt: string }>> => {
    // Mock API 延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟Logo上传响应
    return {
      success: true,
      data: {
        logoUrl: `https://example.com/brand-logos/${id}-${file.name}`,
        updatedAt: new Date().toISOString(),
      },
      message: 'Logo上传成功',
      timestamp: new Date().toISOString(),
    };
  },

  checkNameDuplication: async (
    params: { name: string; brandType: string; excludeId?: string }
  ): Promise<ApiResponse<{ isDuplicate: boolean }>> => {
    // Mock API 延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟重复检查逻辑
    const existingBrands = ['可口可乐', '百事可乐', '农夫山泉'];
    const isDuplicate = existingBrands.includes(params.name) && !params.excludeId;

    return {
      success: true,
      data: { isDuplicate },
      message: '检查完成',
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * 品牌操作Hook
 * 提供品牌创建、更新、删除、状态变更等功能
 */
export const useBrandActions = () => {
  const queryClient = useQueryClient();

  // 创建品牌
  const createBrandMutation = useMutation({
    mutationFn: (data: CreateBrandRequest) => brandApi.createBrand(data),
    onSuccess: (response) => {
      message.success('品牌创建成功');

      // 刷新品牌列表
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists });

      return response.data;
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || '品牌创建失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 更新品牌
  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) =>
      brandApi.updateBrand(id, data),
    onSuccess: (response, variables) => {
      message.success('品牌更新成功');

      // 更新列表缓存中的特定品牌
      queryClient.setQueriesData(
        { queryKey: brandQueryKeys.all },
        (oldData: any) => {
          if (!oldData) return oldData;

          // 处理列表数据
          if (Array.isArray(oldData)) {
            return oldData.map((brand: Brand) =>
              brand.id === variables.id ? response.data : brand
            );
          }

          // 处理分页数据
          if (oldData.data && Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.map((brand: Brand) =>
                brand.id === variables.id ? response.data : brand
              ),
            };
          }

          return oldData;
        }
      );

      // 刷新详情缓存
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(variables.id) });

      return response.data;
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || '品牌更新失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 删除品牌
  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => brandApi.deleteBrand(id),
    onSuccess: () => {
      message.success('品牌删除成功');

      // 刷新品牌列表
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.lists });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || '品牌删除失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 更新品牌状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      brandService.updateBrandStatus(id, status, reason),
    onSuccess: (response, variables) => {
      const statusText = variables.status === 'enabled' ? '启用' : variables.status === 'disabled' ? '停用' : '设置状态';
      message.success(`品牌${statusText}成功`);

      // 更新列表缓存中的品牌状态
      queryClient.setQueriesData(
        { queryKey: brandQueryKeys.all },
        (oldData: any) => {
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
        }
      );

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

  // 上传Logo
  const uploadLogoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => brandApi.uploadLogo(id, file),
    onSuccess: (response, variables) => {
      message.success('Logo上传成功');

      // 更新列表和详情缓存中的Logo URL
      queryClient.setQueriesData(
        { queryKey: brandQueryKeys.all },
        (oldData: any) => {
          if (!oldData) return oldData;

          // 处理列表数据
          if (Array.isArray(oldData)) {
            return oldData.map((brand: Brand) =>
              brand.id === variables.id
                ? { ...brand, logoUrl: response.data.logoUrl, updatedAt: response.data.updatedAt }
                : brand
            );
          }

          // 处理分页数据
          if (oldData.data && Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.map((brand: Brand) =>
                brand.id === variables.id
                  ? { ...brand, logoUrl: response.data.logoUrl, updatedAt: response.data.updatedAt }
                  : brand
              ),
            };
          }

          return oldData;
        }
      );

      // 刷新详情缓存
      queryClient.invalidateQueries({ queryKey: brandQueryKeys.detail(variables.id) });

      return response.data;
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Logo上传失败';
      message.error(errorMessage);

      throw error;
    },
  });

  // 检查品牌名称重复
  const checkNameDuplicationMutation = useMutation({
    mutationFn: (params: { name: string; brandType: string; excludeId?: string }) =>
      brandApi.checkNameDuplication(params),
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
    isLoading: createBrandMutation.isPending ||
               updateBrandMutation.isPending ||
               deleteBrandMutation.isPending ||
               updateStatusMutation.isPending ||
               uploadLogoMutation.isPending,

    // 错误状态
    error: createBrandMutation.error ||
            updateBrandMutation.error ||
            deleteBrandMutation.error ||
            updateStatusMutation.error ||
            uploadLogoMutation.error ||
            checkNameDuplicationMutation.error,
  };
};

export default useBrandActions;