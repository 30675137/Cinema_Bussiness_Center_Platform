import { apiService } from './api';
import type {
  Product,
  ProductQueryParams,
  ProductFilters,
  PaginatedResponse,
  ApiResponse,
  ProductFormData,
} from '@/types';

export interface ProductService {
  // 基础CRUD操作
  getProducts: (params?: ProductQueryParams) => Promise<PaginatedResponse<Product>>;
  getProductById: (id: string) => Promise<ApiResponse<Product>>;
  createProduct: (data: ProductFormData) => Promise<ApiResponse<Product>>;
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<ApiResponse<Product>>;
  deleteProduct: (id: string) => Promise<ApiResponse<void>>;

  // 批量操作
  batchDeleteProducts: (ids: string[]) => Promise<ApiResponse<void>>;
  batchUpdateProducts: (ids: string[], data: Partial<ProductFormData>) => Promise<ApiResponse<Product[]>>;

  // 搜索和筛选
  searchProducts: (keyword: string, params?: ProductQueryParams) => Promise<PaginatedResponse<Product>>;
  filterProducts: (filters: ProductFilters, params?: ProductQueryParams) => Promise<PaginatedResponse<Product>>;

  // 导入导出
  exportProducts: (params?: ProductQueryParams) => Promise<ApiResponse<{ url: string }>>;
  importProducts: (file: File, onProgress?: (progress: number) => void) => Promise<ApiResponse<any>>;

  // 其他业务操作
  duplicateProduct: (id: string) => Promise<ApiResponse<Product>>;
  publishProduct: (id: string) => Promise<ApiResponse<Product>>;
  unpublishProduct: (id: string) => Promise<ApiResponse<Product>>;
  archiveProduct: (id: string) => Promise<ApiResponse<Product>>;
  restoreProduct: (id: string) => Promise<ApiResponse<Product>>;
}

class ProductServiceImpl implements ProductService {
  private readonly baseUrl = '/products';

  // 基础CRUD操作
  async getProducts(params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.skuId) queryParams.append('skuId', params.skuId);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.materialType) queryParams.append('materialType', params.materialType);
    if (params?.status?.length) {
      params.status.forEach(status => queryParams.append('status', status));
    }
    if (params?.priceRange) {
      queryParams.append('minPrice', params.priceRange[0].toString());
      queryParams.append('maxPrice', params.priceRange[1].toString());
    }
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    const response = await apiService.get<Product[]>(url);
    // 添加缺失的pagination属性
    const paginatedResponse: PaginatedResponse<Product> = {
      success: true,
      data: response.data || [],
      message: 'Success',
      timestamp: new Date().toISOString(),
      pagination: {
        current: 1,
        pageSize: 20,
        total: response.data?.length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
    return paginatedResponse;
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiService.get<Product>(`${this.baseUrl}/${id}`);
  }

  async createProduct(data: ProductFormData): Promise<ApiResponse<Product>> {
    return apiService.post<Product>(this.baseUrl, data);
  }

  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<ApiResponse<Product>> {
    return apiService.put<Product>(`${this.baseUrl}/${id}`, data);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // 批量操作
  async batchDeleteProducts(ids: string[]): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseUrl}/batch/delete`, { ids });
  }

  async batchUpdateProducts(ids: string[], data: Partial<ProductFormData>): Promise<ApiResponse<Product[]>> {
    return apiService.post<Product[]>(`${this.baseUrl}/batch/update`, { ids, data });
  }

  // 搜索和筛选
  async searchProducts(keyword: string, params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ ...params, keyword });
  }

  async filterProducts(filters: ProductFilters, params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
    const queryParams: ProductQueryParams = { ...params };

    if (filters.categoryId) queryParams.categoryId = filters.categoryId;
    if (filters.materialType) queryParams.materialType = filters.materialType;
    if (filters.status?.length) queryParams.status = filters.status;
    if (filters.priceRange) queryParams.priceRange = filters.priceRange;
    if (filters.keyword) queryParams.keyword = filters.keyword;

    return this.getProducts(queryParams);
  }

  // 导入导出
  async exportProducts(params?: ProductQueryParams): Promise<ApiResponse<{ url: string }>> {
    const queryParams = new URLSearchParams();

    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.materialType) queryParams.append('materialType', params.materialType);
    if (params?.status?.length) {
      params.status.forEach(status => queryParams.append('status', status));
    }

    const url = `${this.baseUrl}/export?${queryParams.toString()}`;
    return apiService.get<{ url: string }>(url);
  }

  async importProducts(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<any>> {
    return apiService.upload<any>(`${this.baseUrl}/import`, file, onProgress);
  }

  // 其他业务操作
  async duplicateProduct(id: string): Promise<ApiResponse<Product>> {
    return apiService.post<Product>(`${this.baseUrl}/${id}/duplicate`);
  }

  async publishProduct(id: string): Promise<ApiResponse<Product>> {
    return apiService.post<Product>(`${this.baseUrl}/${id}/publish`);
  }

  async unpublishProduct(id: string): Promise<ApiResponse<Product>> {
    return apiService.post<Product>(`${this.baseUrl}/${id}/unpublish`);
  }

  async archiveProduct(id: string): Promise<ApiResponse<Product>> {
    return apiService.post<Product>(`${this.baseUrl}/${id}/archive`);
  }

  async restoreProduct(id: string): Promise<ApiResponse<Product>> {
    return apiService.post<Product>(`${this.baseUrl}/${id}/restore`);
  }
}

// 创建服务实例
export const productService = new ProductServiceImpl();

