import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { httpClient, createQueryOptions, createMutationOptions } from '../../../services';
import { productKeys } from '../../../services/queryKeys';
import type { Product, ProductFilters, ProductCategory, PaginatedResponse } from '../../../stores';

/**
 * 产品查询参数接口
 */
export interface UseProductsParams {
  filters?: ProductFilters;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * 创建产品参数接口
 */
export interface CreateProductParams {
  name: string;
  description?: string;
  category: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  barcode?: string;
  sku: string;
  images?: string[];
  tags?: string[];
  attributes?: Record<string, any>;
  supplier?: {
    id: string;
    name: string;
    contact?: string;
  };
}

/**
 * 更新产品参数接口
 */
export interface UpdateProductParams extends Partial<CreateProductParams> {
  id: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

/**
 * 批量操作参数接口
 */
export interface BatchOperationParams {
  ids: string[];
  updates?: Partial<Product>;
}

/**
 * 获取产品列表 Hook
 */
export const useProducts = ({
  filters,
  page = 1,
  pageSize = 20,
  enabled = true,
}: UseProductsParams = {}) => {
  return useQuery(
    productKeys.productsPaginated(page, pageSize, filters),
    async (): Promise<PaginatedResponse<Product>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters || {}).filter(([_, value]) => value !== undefined && value !== '')
        ),
      });

      const response = await httpClient.get<PaginatedResponse<Product>>(`/products?${params}`);
      return response.data;
    },
    createQueryOptions({
      enabled,
      staleTime: 2 * 60 * 1000, // 2 分钟
      select: (data) => ({
        ...data,
        items: data.items || [],
      }),
    })
  );
};

/**
 * 获取产品详情 Hook
 */
export const useProduct = (id: string, enabled: boolean = true) => {
  return useQuery(
    productKeys.product(id),
    async (): Promise<Product> => {
      const response = await httpClient.get<Product>(`/products/${id}`);
      return response.data;
    },
    createQueryOptions({
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000, // 5 分钟
    })
  );
};

/**
 * 搜索产品 Hook
 */
export const useProductSearch = (
  query: string,
  filters?: ProductFilters,
  enabled: boolean = query.length > 0
) => {
  return useQuery(
    productKeys.searchProducts(query, filters),
    async (): Promise<Product[]> => {
      const params = new URLSearchParams({
        q: query,
        ...Object.fromEntries(
          Object.entries(filters || {}).filter(([_, value]) => value !== undefined && value !== '')
        ),
      });

      const response = await httpClient.get<Product[]>(`/products/search?${params}`);
      return response.data;
    },
    createQueryOptions({
      enabled,
      staleTime: 30 * 1000, // 30 秒
      select: (data) => data || [],
    })
  );
};

/**
 * 获取产品分类 Hook
 */
export const useProductCategories = (enabled: boolean = true) => {
  return useQuery(
    productKeys.categories(),
    async (): Promise<ProductCategory[]> => {
      const response = await httpClient.get<ProductCategory[]>('/products/categories');
      return response.data;
    },
    createQueryOptions({
      enabled,
      staleTime: 10 * 60 * 1000, // 10 分钟
      select: (data) => data || [],
    })
  );
};

/**
 * 获取低库存产品 Hook
 */
export const useLowStockProducts = (threshold: number = 10, enabled: boolean = true) => {
  return useQuery(
    productKeys.lowStock(threshold),
    async (): Promise<Product[]> => {
      const response = await httpClient.get<Product[]>(`/products/low-stock?threshold=${threshold}`);
      return response.data;
    },
    createQueryOptions({
      enabled,
      staleTime: 60 * 1000, // 1 分钟
      select: (data) => data || [],
    })
  );
};

/**
 * 获取产品统计 Hook
 */
export const useProductStats = (enabled: boolean = true) => {
  return useQuery(
    productKeys.stats(),
    async () => {
      const response = await httpClient.get('/products/stats');
      return response.data;
    },
    createQueryOptions({
      enabled,
      staleTime: 5 * 60 * 1000, // 5 分钟
    })
  );
};

/**
 * 创建产品 Hook
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (params: CreateProductParams): Promise<Product> => {
      const response = await httpClient.post<Product>('/products', params);
      return response.data;
    },
    createMutationOptions({
      onSuccess: (data) => {
        message.success('产品创建成功');

        // 更新产品列表缓存
        queryClient.invalidateQueries({ queryKey: productKeys.products() });

        // 预取新创建的产品详情
        queryClient.prefetchQuery({
          queryKey: productKeys.product(data.id),
          queryFn: () => Promise.resolve(data),
        });
      },
      onError: (error) => {
        console.error('创建产品失败:', error);
      },
    })
  );
};

/**
 * 更新产品 Hook
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, ...updates }: UpdateProductParams): Promise<Product> => {
      const response = await httpClient.put<Product>(`/products/${id}`, updates);
      return response.data;
    },
    createMutationOptions({
      onSuccess: (data) => {
        message.success('产品更新成功');

        // 更新产品详情缓存
        queryClient.setQueryData(productKeys.product(data.id), data);

        // 更新产品列表缓存
        queryClient.invalidateQueries({ queryKey: productKeys.products() });
      },
      onError: (error) => {
        console.error('更新产品失败:', error);
      },
    })
  );
};

/**
 * 删除产品 Hook
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: string): Promise<void> => {
      await httpClient.delete(`/products/${id}`);
    },
    createMutationOptions({
      onSuccess: (_, id) => {
        message.success('产品删除成功');

        // 移除产品详情缓存
        queryClient.removeQueries({ queryKey: productKeys.product(id) });

        // 更新产品列表缓存
        queryClient.invalidateQueries({ queryKey: productKeys.products() });
      },
      onError: (error) => {
        console.error('删除产品失败:', error);
      },
    })
  );
};

/**
 * 批量删除产品 Hook
 */
export const useBatchDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (ids: string[]): Promise<void> => {
      await httpClient.post('/products/batch-delete', { ids });
    },
    createMutationOptions({
      onSuccess: (_, ids) => {
        message.success(`成功删除 ${ids.length} 个产品`);

        // 批量移除产品详情缓存
        ids.forEach(id => {
          queryClient.removeQueries({ queryKey: productKeys.product(id) });
        });

        // 更新产品列表缓存
        queryClient.invalidateQueries({ queryKey: productKeys.products() });
      },
      onError: (error) => {
        console.error('批量删除产品失败:', error);
      },
    })
  );
};

/**
 * 批量更新产品 Hook
 */
export const useBatchUpdateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ ids, updates }: BatchOperationParams): Promise<Product[]> => {
      const response = await httpClient.post<Product[]>('/products/batch-update', { ids, updates });
      return response.data;
    },
    createMutationOptions({
      onSuccess: (updatedProducts, { ids }) => {
        message.success(`成功更新 ${ids.length} 个产品`);

        // 批量更新产品详情缓存
        updatedProducts.forEach(product => {
          queryClient.setQueryData(productKeys.product(product.id), product);
        });

        // 更新产品列表缓存
        queryClient.invalidateQueries({ queryKey: productKeys.products() });
      },
      onError: (error) => {
        console.error('批量更新产品失败:', error);
      },
    })
  );
};

/**
 * 更新产品库存 Hook
 */
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, stock }: { id: string; stock: number }): Promise<Product> => {
      const response = await httpClient.patch<Product>(`/products/${id}/stock`, { stock });
      return response.data;
    },
    createMutationOptions({
      onSuccess: (data) => {
        message.success('库存更新成功');

        // 更新产品详情缓存
        queryClient.setQueryData(productKeys.product(data.id), data);

        // 更新产品列表缓存
        queryClient.invalidateQueries({ queryKey: productKeys.products() });

        // 更新低库存产品缓存
        queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      },
      onError: (error) => {
        console.error('更新库存失败:', error);
      },
    })
  );
};

/**
 * 上传产品图片 Hook
 */
export const useUploadProductImages = () => {
  return useMutation(
    async (files: File[]): Promise<string[]> => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/products/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      return result.data;
    },
    createMutationOptions({
      onSuccess: () => {
        message.success('图片上传成功');
      },
      onError: (error) => {
        console.error('图片上传失败:', error);
      },
    })
  );
};

/**
 * 预取产品数据 Hook
 */
export const usePrefetchProducts = () => {
  const queryClient = useQueryClient();

  return (params: UseProductsParams) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.productsPaginated(params.page, params.pageSize, params.filters),
      queryFn: async (): Promise<PaginatedResponse<Product>> => {
        const queryParams = new URLSearchParams({
          page: (params.page || 1).toString(),
          pageSize: (params.pageSize || 20).toString(),
          ...Object.fromEntries(
            Object.entries(params.filters || {}).filter(([_, value]) => value !== undefined && value !== '')
          ),
        });

        const response = await httpClient.get<PaginatedResponse<Product>>(`/products?${queryParams}`);
        return response.data;
      },
      staleTime: 2 * 60 * 1000, // 2 分钟
    });
  };
};

export default {
  useProducts,
  useProduct,
  useProductSearch,
  useProductCategories,
  useLowStockProducts,
  useProductStats,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBatchDeleteProducts,
  useBatchUpdateProducts,
  useUpdateProductStock,
  useUploadProductImages,
  usePrefetchProducts,
};