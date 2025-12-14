import type {
  Brand,
  BrandQueryParams,
  BrandListResponse,
  BrandDetailResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
  UpdateBrandStatusRequest,
  BrandUsageStatistics,
} from '../types/brand.types';

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

/**
 * 品牌管理API服务
 * 提供品牌相关的所有API调用接口
 */
class BrandService {
  private readonly baseURL = '/api/v1/brands';

  /**
   * 获取品牌列表
   */
  async getBrands(params?: BrandQueryParams): Promise<BrandListResponse> {
    const queryParams = new URLSearchParams();

    // 构建查询参数
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.pageSize) {
      queryParams.append('pageSize', params.pageSize.toString());
    }
    if (params?.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    if (params?.brandType) {
      queryParams.append('brandType', params.brandType);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params?.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }

    const url = `${this.baseURL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取品牌列表失败');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 获取品牌详情
   */
  async getBrandById(id: string): Promise<BrandDetailResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取品牌详情失败');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 创建品牌
   */
  async createBrand(data: CreateBrandRequest): Promise<Brand> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '创建品牌失败');
      }

      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 更新品牌信息
   */
  async updateBrand(id: string, data: UpdateBrandRequest): Promise<Brand> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '更新品牌失败');
      }

      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 删除品牌
   */
  async deleteBrand(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '删除品牌失败');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 更新品牌状态
   */
  async updateBrandStatus(id: string, status: string, reason?: string): Promise<any> {
    try {
      const requestData: any = { status };
      if (reason) {
        requestData.reason = reason;
      }

      const response = await fetch(`${this.baseURL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || '更新品牌状态失败');
      }

      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 上传品牌LOGO
   */
  async uploadLogo(brandId: string, file: File): Promise<{ logoUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${this.baseURL}/${brandId}/logo`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '上传LOGO失败');
      }

      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 获取品牌使用统计
   */
  async getBrandUsageStatistics(brandId: string): Promise<BrandUsageStatistics> {
    try {
      const response = await fetch(`${this.baseURL}/${brandId}/usage`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取品牌使用统计失败');
      }

      return data.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 批量操作品牌
   */
  async batchOperate(operation: 'enable' | 'disable' | 'delete', brandIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          ids: brandIds,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '批量操作失败');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 导出品牌数据
   */
  async exportBrands(params?: BrandQueryParams): Promise<Blob> {
    const queryParams = new URLSearchParams();

    // 构建查询参数
    if (params?.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    if (params?.brandType) {
      queryParams.append('brandType', params.brandType);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }

    const url = `${this.baseURL}/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '导出失败');
      }

      return response.blob();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 检查品牌名称是否重复
   */
  async checkNameDuplication(
    params: { name: string; brandType: string; excludeId?: string }
  ): Promise<ApiResponse<{ isDuplicate: boolean }>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('name', params.name);
      queryParams.append('brandType', params.brandType);
      if (params.excludeId) {
        queryParams.append('excludeId', params.excludeId);
      }

      const response = await fetch(`${this.baseURL}/check-name?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '检查品牌名称失败');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 获取品牌使用统计（别名方法）
   */
  async getBrandUsageStats(brandId: string): Promise<ApiResponse<BrandUsageStatistics>> {
    try {
      const response = await fetch(`${this.baseURL}/${brandId}/usage`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取品牌使用统计失败');
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }

  /**
   * 获取品牌详情（别名方法）
   */
  async getBrand(id: string): Promise<BrandDetailResponse> {
    return this.getBrandById(id);
  }

  /**
   * 检查品牌编码是否重复
   */
  async checkBrandCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append('code', code);
      if (excludeId) {
        params.append('excludeId', excludeId);
      }

      const response = await fetch(`${this.baseURL}/check-code?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '检查品牌编码失败');
      }

      return data.data.exists;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '网络错误');
    }
  }
}

// 创建单例实例
export const brandService = new BrandService();

export default brandService;