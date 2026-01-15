import type { SPUItem, SPUQueryParams, SPUStatus, Brand, Category } from '@/types/spu';
import { generateSPUCode } from '@/utils/spuHelpers';
import { apiService } from './api';

// 状态颜色和文本映射
const statusColors: Record<string, { text: string; color: string }> = {
  active: { text: '启用', color: 'green' },
  inactive: { text: '停用', color: 'red' },
  draft: { text: '草稿', color: 'gray' },
  archived: { text: '已归档', color: 'orange' },
};

/**
 * 后端SPU数据结构（API返回格式 - snake_case）
 * @spec P008-sku-type-refactor: product_type 已移除
 */
interface BackendSpu {
  id: string;
  code: string;
  name: string;
  short_name?: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  status: string;
  // @spec P008-sku-type-refactor: product_type 已移除，SKU 类型由 SKU.skuType 管理
  unit?: string;
  tags?: string[];
  images?: any;
  specifications?: any;
  attributes?: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * 将后端SPU数据转换为前端格式
 * @spec P008-sku-type-refactor: productType 已移除
 */
function transformBackendSpu(backendSpu: BackendSpu): SPUItem {
  return {
    id: backendSpu.id,
    code: backendSpu.code,
    name: backendSpu.name,
    shortName: backendSpu.short_name,
    description: backendSpu.description || '',
    unit: backendSpu.unit,
    brandId: backendSpu.brand_id || '',
    brandName: backendSpu.brand_name,
    // 构建 brand 对象，供 SPUDetail 组件使用
    brand: backendSpu.brand_id ? {
      id: backendSpu.brand_id,
      name: backendSpu.brand_name || '',
    } : undefined,
    categoryId: backendSpu.category_id || '',
    categoryName: backendSpu.category_name,
    // 构建 category 对象，供 SPUDetail 组件使用
    category: backendSpu.category_id ? {
      id: backendSpu.category_id,
      name: backendSpu.category_name || '',
    } : undefined,
    status: ((backendSpu.status || 'draft').toLowerCase()) as SPUStatus,
    // @spec P008-sku-type-refactor: productType 已移除
    tags: backendSpu.tags || [],
    images: Array.isArray(backendSpu.images) ? backendSpu.images : [],
    specifications: Array.isArray(backendSpu.specifications) ? backendSpu.specifications : [],
    attributes: Array.isArray(backendSpu.attributes) ? backendSpu.attributes : [],
    createdAt: backendSpu.created_at || new Date().toISOString(),
    updatedAt: backendSpu.updated_at || new Date().toISOString(),
    createdBy: backendSpu.created_by,
    updatedBy: backendSpu.updated_by,
  };
}

// API 响应类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<{
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {}

// SPU 创建请求参数
// @spec P008-sku-type-refactor: productType 已移除
export interface CreateSPURequest {
  name: string;
  shortName?: string;
  description: string;
  unit?: string;
  brandId: string;
  categoryId: string;
  status: SPUStatus;
  // productType 已移除 - SKU 类型由 SKU.skuType 管理
  tags?: string[];
  images: Array<{
    uid: string;
    name: string;
    url?: string;
    thumbUrl?: string;
    status: 'done' | 'uploading' | 'error' | 'removed';
  }>;
  specifications: Array<{
    name: string;
    value: string;
  }>;
  attributes: Array<{
    name: string;
    value: string;
  }>;
}

// SPU 更新请求参数
// @spec P008-sku-type-refactor: productType 已移除
export interface UpdateSPURequest extends Partial<CreateSPURequest> {
  id: string;
  code?: string;
  status?: SPUStatus;
  // productType 已移除 - SKU 类型由 SKU.skuType 管理
  tags?: string[];
  images?: Array<{
    uid: string;
    name: string;
    url?: string;
    thumbUrl?: string;
    status: 'done' | 'uploading' | 'error' | 'removed';
  }>;
  specifications?: Array<{ name: string; value: string }>;
  attributes?: Array<{ name: string; value: string | number | boolean | string[] }>;
}

/**
 * SPU 服务类
 * 提供SPU相关的API服务，使用Mock数据实现
 */
class SPUService {
  private baseUrl = '/api/spu';

  /**
   * 创建SPU
   * @spec B001-fix-brand-creation
   * @param data SPU创建数据
   * @returns 创建的SPU信息
   */
  async createSPU(data: CreateSPURequest): Promise<ApiResponse<SPUItem>> {
    try {
      // 验证必填字段
      if (!data.name || data.name.trim() === '') {
        throw new Error('SPU名称不能为空');
      }

      if (!data.brandId) {
        throw new Error('请选择品牌');
      }

      if (!data.categoryId) {
        throw new Error('请选择分类');
      }

      if (!data.description || data.description.trim() === '') {
        throw new Error('商品描述不能为空');
      }

      // @spec P008-sku-type-refactor: productType 验证已移除

      if (!data.images || data.images.length === 0) {
        throw new Error('请至少上传一张商品图片');
      }

      // 构建后端请求数据（转换为snake_case）
      // @spec P008-sku-type-refactor: product_type 已移除
      const requestData = {
        name: data.name.trim(),
        short_name: data.shortName?.trim(),
        description: data.description.trim(),
        unit: data.unit?.trim(),
        brand_id: data.brandId,
        category_id: data.categoryId,
        status: data.status || 'draft',
        // product_type 已移除 - SKU 类型由 SKU.skuType 管理
        tags: data.tags || [],
        images: (data.images || [])
          .filter((img: any) => img.url)
          .map((img: any, index: number) => ({
            id: img.uid || `img_${index}`,
            url: img.url,
            alt: img.alt || img.name || `image${index}`,
            sort: img.sort ?? index,
          })),
        specifications: data.specifications || [],
        attributes: data.attributes || [],
      };

      // 调用后端API创建SPU
      const response = await fetch('/api/spu/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '创建失败');
      }

      // 转换后端返回的数据为前端格式
      const createdSPU = transformBackendSpu(result.data);

      return {
        success: true,
        data: createdSPU,
        message: result.message || 'SPU创建成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Create SPU error:', error);
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '创建失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 更新SPU
   * @spec B001-fix-brand-creation
   * @param data SPU更新数据
   * @returns 更新后的SPU信息
   */
  async updateSPU(data: UpdateSPURequest): Promise<ApiResponse<SPUItem>> {
    try {
      if (!data.id) {
        throw new Error('SPU ID不能为空');
      }

      // 验证必填字段
      if (data.name && data.name.trim() === '') {
        throw new Error('SPU名称不能为空');
      }

      // 构建后端请求数据（转换为snake_case）
      // @spec P008-sku-type-refactor: product_type 已移除
      const requestData = {
        name: data.name?.trim(),
        short_name: data.shortName?.trim(),
        description: data.description?.trim(),
        unit: data.unit?.trim(),
        brand_id: data.brandId,
        category_id: data.categoryId,
        status: data.status?.toUpperCase() || 'DRAFT',
        // product_type 已移除 - SKU 类型由 SKU.skuType 管理
        tags: data.tags || [],
        images: (data.images || [])
          .filter((img: any) => img.url)
          .map((img: any, index: number) => ({
            id: img.uid || `img_${index}`,
            url: img.url,
            alt: img.alt || img.name || `image${index}`,
            sort: img.sort ?? index,
          })),
        specifications: data.specifications || [],
        attributes: data.attributes || [],
      };

      // 调用后端API更新SPU
      const response = await fetch(`/api/spu/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '更新失败');
      }

      // 转换后端返回的数据为前端格式
      const updatedSPU = transformBackendSpu(result.data);

      return {
        success: true,
        data: updatedSPU,
        message: result.message || 'SPU更新成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Update SPU error:', error);
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '更新失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 获取SPU详情
   * @spec B001-fix-brand-creation
   * @param id SPU ID
   * @returns SPU详情
   */
  async getSPUDetail(id: string): Promise<ApiResponse<SPUItem>> {
    try {
      // 调用后端API获取SPU详情
      const response = await fetch(`/api/spu/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '获取失败');
      }

      // 转换后端返回的数据为前端格式
      const spuData = transformBackendSpu(result.data);

      return {
        success: true,
        data: spuData,
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Get SPU detail error:', error);
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '获取失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 获取SPU列表
   * @param params 查询参数
   * @returns SPU列表
   */
  async getSPUList(params: SPUQueryParams): Promise<PaginatedResponse<SPUItem>> {
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams();
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.status) queryParams.append('status', params.status);
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.brandId) queryParams.append('brandId', params.brandId);
      queryParams.append('page', String(params.page || 1));
      queryParams.append('pageSize', String(params.pageSize || 20));

      const queryString = queryParams.toString();
      const url = `/spu/list${queryString ? `?${queryString}` : ''}`;

      // 调用后端API
      const response = await apiService.get<{
        success: boolean;
        data: {
          list: BackendSpu[];
          pagination: {
            current: number;
            pageSize: number;
            total: number;
            totalPages: number;
          };
        };
      }>(url);

      // 处理不同的响应结构
      let list: SPUItem[] = [];
      let total = 0;
      let page = params.page || 1;
      let pageSize = params.pageSize || 20;
      let totalPages = 0;

      if (response.data && Array.isArray(response.data)) {
        // 旧格式: data 是数组
        const backendData = response as unknown as {
          data: BackendSpu[];
          total: number;
          page: number;
          pageSize: number;
          totalPages: number;
        };
        list = (backendData.data || []).map(transformBackendSpu);
        total = backendData.total || list.length;
        page = backendData.page || page;
        pageSize = backendData.pageSize || pageSize;
        totalPages = backendData.totalPages || 0;
      } else if (response.data && 'list' in response.data) {
        // 新格式: data 包含 list 和 pagination
        const dataObj = response.data as {
          list: BackendSpu[];
          pagination?: {
            current: number;
            pageSize: number;
            total: number;
            totalPages: number;
          };
          total?: number;
          page?: number;
          pageSize?: number;
          totalPages?: number;
        };

        list = (dataObj.list || []).map(transformBackendSpu);

        if (dataObj.pagination) {
          total = dataObj.pagination.total;
          page = dataObj.pagination.current;
          pageSize = dataObj.pagination.pageSize;
          totalPages = dataObj.pagination.totalPages;
        } else {
          total = dataObj.total || list.length;
          page = dataObj.page || page;
          pageSize = dataObj.pageSize || pageSize;
          totalPages = dataObj.totalPages || 0;
        }
      }

      return {
        success: true,
        data: {
          list,
          total,
          page,
          pageSize,
          totalPages: totalPages || Math.ceil(total / pageSize),
        },
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch SPU list from backend:', error);
      return {
        success: false,
        data: {
          list: [],
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          totalPages: 0,
        },
        message: error instanceof Error ? error.message : '获取失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 删除SPU
   * @param id SPU ID
   * @returns 删除结果
   */
  async deleteSPU(id: string): Promise<ApiResponse<null>> {
    try {
      // 调用后端API删除
      await apiService.delete(`/spu/${id}`);

      return {
        success: true,
        data: null,
        message: '删除成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to delete SPU:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '删除失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 批量删除SPU
   * @spec P007-fix-spu-batch-delete
   * @param ids SPU ID列表
   * @returns 删除结果
   */
  async batchDeleteSPU(ids: string[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    try {
      const response = await fetch('/api/spu/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'delete',
          ids,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: result.success,
        data: {
          success: result.data.processedCount,
          failed: result.data.failedCount,
        },
        message: result.message,
        code: response.status,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: { success: 0, failed: ids.length },
        message: error instanceof Error ? error.message : '批量删除失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 批量更新SPU状态
   * @spec B001-fix-brand-creation
   * @param ids SPU ID列表
   * @param status 新状态
   * @returns 更新结果
   */
  async batchUpdateSPUStatus(
    ids: string[],
    status: SPUStatus
  ): Promise<ApiResponse<{ success: number; failed: number }>> {
    try {
      let successCount = 0;
      let failedCount = 0;

      // 逐个更新每个SPU的状态
      for (const id of ids) {
        try {
          const response = await fetch(`/api/spu/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: status.toUpperCase(),
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              successCount++;
            } else {
              failedCount++;
            }
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }

      const statusText = statusColors[status as keyof typeof statusColors]?.text || status;

      return {
        success: true,
        data: { success: successCount, failed: failedCount },
        message: failedCount > 0
          ? `成功更新${successCount}个SPU状态，失败${failedCount}个`
          : `成功将${successCount}个SPU状态更新为"${statusText}"`,
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: { success: 0, failed: ids.length },
        message: error instanceof Error ? error.message : '批量状态更新失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 批量复制SPU
   * @param ids SPU ID列表
   * @returns 复制结果
   */
  async batchCopySPU(
    ids: string[]
  ): Promise<ApiResponse<{ success: number; failed: number; copiedSPUs?: SPUItem[] }>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 获取原始数据并复制
      const originalData = this.generateMockSPUList(ids.length);
      const copiedSPUs = originalData.map((spu, index) => ({
        ...spu,
        id: this.generateId(),
        code: `SPU${String(Date.now() + index * 1000).slice(-12)}`,
        name: `${spu.name} (副本)`,
        status: 'draft' as SPUStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user',
        updatedBy: 'current_user',
      }));

      // Mock批量复制结果
      return {
        success: true,
        data: {
          success: ids.length,
          failed: 0,
          copiedSPUs,
        },
        message: `成功复制${ids.length}个SPU`,
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: { success: 0, failed: ids.length },
        message: error instanceof Error ? error.message : '批量复制失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 批量导出SPU数据
   * @param ids SPU ID列表 (可选，如果不提供则导出所有)
   * @param format 导出格式
   * @returns 导出结果
   */
  async batchExportSPU(
    ids?: string[],
    format: 'excel' | 'csv' = 'excel'
  ): Promise<ApiResponse<{ downloadUrl: string; fileName: string }>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 获取要导出的数据
      const allSPUData = this.generateMockSPUList(ids ? ids.length : 100);
      const exportData = ids ? allSPUData.filter((spu) => ids.includes(spu.id)) : allSPUData;

      if (exportData.length === 0) {
        return {
          success: false,
          data: { downloadUrl: '', fileName: '' },
          message: '没有可导出的数据',
          code: 400,
          timestamp: Date.now(),
        };
      }

      const fileName = `SPU数据_${format.toUpperCase()}_${new Date().toISOString().slice(0, 10)}`;
      const downloadUrl = `/api/spu/export/${format}?ids=${ids?.join(',') || 'all'}&timestamp=${Date.now()}`;

      // Mock导出结果
      return {
        success: true,
        data: { downloadUrl, fileName },
        message: `${format.toUpperCase()}文件生成成功，包含${exportData.length}条记录`,
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: { downloadUrl: '', fileName: '' },
        message: error instanceof Error ? error.message : '导出失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 更新SPU状态
   * @spec B001-fix-brand-creation
   * @param id SPU ID
   * @param status 新状态
   * @param reason 变更原因
   * @returns 更新结果
   */
  async updateSPUStatus(
    id: string,
    status: SPUStatus,
    reason?: string
  ): Promise<ApiResponse<SPUItem>> {
    try {
      // 调用后端API更新状态
      const response = await fetch(`/api/spu/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || '状态更新失败');
      }

      // 转换后端返回的数据为前端格式
      const updatedSPU = transformBackendSpu(result.data);

      return {
        success: true,
        data: updatedSPU,
        message: '状态更新成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Update SPU status error:', error);
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '状态更新失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 获取SPU状态变更历史
   * @param id SPU ID
   * @returns 状态历史
   */
  async getStatusHistory(id: string): Promise<
    ApiResponse<
      Array<{
        id: string;
        status: SPUStatus;
        previousStatus: SPUStatus | null;
        reason: string;
        operator: string;
        timestamp: string;
        description?: string;
      }>
    >
  > {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock状态历史数据
      const mockHistory = [
        {
          id: `hist_${id}_1`,
          status: 'active' as SPUStatus,
          previousStatus: 'draft' as SPUStatus,
          reason: '商品信息完善，正式上架销售',
          operator: '张三',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          description: '审核通过，状态从草稿变更为启用',
        },
        {
          id: `hist_${id}_2`,
          status: 'draft' as SPUStatus,
          previousStatus: null as SPUStatus,
          reason: '创建新商品SPU',
          operator: '李四',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          description: '初始创建，状态为草稿',
        },
      ];

      return {
        success: true,
        data: mockHistory,
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : '获取状态历史失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 生成Mock SPU数据
   * @param count 生成数量
   * @returns Mock SPU数组
   */
  private generateMockSPUList(count: number): SPUItem[] {
    const spuNames = [
      '可口可乐500ml',
      '百事可乐500ml',
      '农夫山泉550ml',
      '康师傅红烧牛肉面',
      '统一老坛酸菜面',
      '旺旺雪饼',
      '奥利奥饼干',
      '乐事薯片',
      '趣多多饼干',
      '好丽友薯片',
      '百醇威化饼干',
      '品客薯片',
      '可比克薯片',
      '乐事薯片',
      '元气森林气泡水',
      '三只松鼠坚果',
      '良品铺子坚果',
      '百草味坚果',
      '来伊份零食',
      '徐福记糖果',
      '阿尔卑斯糖',
      '德芙巧克力',
      '费列罗巧克力',
      '士力架',
      'M&M巧克力豆',
      '健达巧克力',
      '好时巧克力',
      '吉百利巧克力',
      '星巴克咖啡',
      '雀巢咖啡',
      '立顿茶包',
      '康师傅绿茶',
      '统一冰红茶',
      '王老吉凉茶',
      '加多宝凉茶',
      '和其正凉茶',
      '康师傅冰红茶',
      '统一绿茶',
      '娃哈哈AD钙奶',
      '蒙牛纯牛奶',
      '伊利纯牛奶',
      '光明纯牛奶',
      '特仑苏牛奶',
      '安慕希酸奶',
      '蒙牛酸奶',
      '光明酸奶',
      '君乐宝酸奶',
      '养乐多',
      '脉动维生素饮料',
      '尖叫运动饮料',
      '佳得乐',
      '红牛',
      '东鹏特饮',
      '力保健',
      '启力',
      '激活',
    ];

    const shortNames = ['可乐500ml', '百事500ml', '农夫550ml', '康师傅红烧牛肉面'];
    const descriptions = [
      '经典可口可乐500ml瓶装，清爽口感，解渴佳品。',
      '百事可乐500ml瓶装，独特配方，口感更佳。',
      '农夫山泉550ml瓶装，天然水源，健康之选。',
      '康师傅红烧牛肉面，经典口味，方便美味。',
    ];

    const tags = [
      '饮料',
      '碳酸饮料',
      '果汁',
      '茶饮料',
      '咖啡',
      '能量饮料',
      '运动饮料',
      '乳制品',
      '酸奶',
      '饼干',
      '薯片',
      '坚果',
      '糖果',
      '巧克力',
      '方便面',
      '速食',
      '休闲食品',
      '新品',
      '热销',
      '促销',
      '推荐',
      '限量',
      '进口',
      '国产',
      '有机',
      '无添加',
      '低糖',
      '零糖',
    ];

    const statuses: SPUStatus[] = ['active', 'inactive', 'draft', 'archived'];

    const brands = [
      { id: 'brand_001', name: '可口可乐', code: 'COKE' },
      { id: 'brand_002', name: '百事可乐', code: 'PEPSI' },
      { id: 'brand_003', name: '农夫山泉', code: 'NONGFU' },
      { id: 'brand_004', name: '康师傅', code: 'KSF' },
      { id: 'brand_005', name: '统一', code: 'UNI' },
      { id: 'brand_006', name: '旺旺', code: 'WW' },
      { id: 'brand_007', name: '奥利奥', code: 'OREO' },
      { id: 'brand_008', name: '乐事', code: 'LAYS' },
      { id: 'brand_009', name: '好丽友', code: 'HYF' },
      { id: 'brand_010', name: '百醇', code: 'BAO' },
    ];

    const categories = [
      { id: 'category_001', name: '食品饮料', code: 'FOOD' },
      { id: 'category_002', name: '饮料', code: 'BEVERAGE' },
      { id: 'category_003', name: '碳酸饮料', code: 'CARBONATED' },
      { id: 'category_004', name: '果汁饮料', code: 'JUICE' },
      { id: 'category_005', name: '茶饮料', code: 'TEA' },
      { id: 'category_006', name: '零食', code: 'SNACK' },
      { id: 'category_007', name: '饼干', code: 'COOKIE' },
      { id: 'category_008', name: '薯片', code: 'POTATO' },
      { id: 'category_009', name: '坚果', code: 'NUTS' },
      { id: 'category_010', name: '糖果', code: 'CANDY' },
    ];

    const specifications = [
      { name: '容量', value: '500ml' },
      { name: '容量', value: '550ml' },
      { name: '容量', value: '330ml' },
      { name: '重量', value: '100g' },
      { name: '重量', value: '150g' },
      { name: '包装', value: '瓶装' },
      { name: '包装', value: '罐装' },
      { name: '包装', value: '袋装' },
    ];

    const units = ['瓶', '罐', '袋', '包', '盒', '箱', '个'];

    return Array.from({ length: count }, (_, index) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const selectedTags = Array.from(
        { length: Math.floor(Math.random() * 4) + 1 },
        () => tags[Math.floor(Math.random() * tags.length)]
      ).filter((tag, index, array) => array.indexOf(tag) === index); // 去重

      const selectedSpecs = Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        () => specifications[Math.floor(Math.random() * specifications.length)]
      ).filter((spec, index, array) => array.indexOf(spec) === index); // 去重

      const spuCode = `SPU${String(Date.now() - index * 1000).slice(-12)}`;
      const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // 最近90天内
      const updatedAt = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);

      return {
        id: this.generateId(),
        code: spuCode,
        name: spuNames[index % spuNames.length],
        shortName: shortNames[index % shortNames.length],
        description: descriptions[index % descriptions.length],
        unit: units[Math.floor(Math.random() * units.length)],
        brandId: brand.id,
        categoryId: category.id,
        status,
        tags: selectedTags,
        images: Array.from({ length: Math.floor(Math.random() * 4) }, (_, imgIndex) => ({
          id: `img_${imgIndex}`,
          url: `/images/spu/${spuCode}_${imgIndex + 1}.jpg`,
          alt: `${spuNames[index % spuNames.length]} 图片${imgIndex + 1}`,
          sort: imgIndex,
        })),
        specifications: selectedSpecs,
        attributes: Array.from({ length: Math.floor(Math.random() * 2) }, () => ({
          name: `属性${Math.floor(Math.random() * 3) + 1}`,
          value: `值${Math.floor(Math.random() * 3) + 1}`,
        })),
        brand,
        category,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        createdBy: `user${Math.floor(Math.random() * 5) + 1}`,
        updatedBy: `user${Math.floor(Math.random() * 5) + 1}`,
      };
    });
  }

  /**
   * 生成唯一ID
   * @returns 唯一ID
   */
  private generateId(): string {
    return `spu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证SPU名称唯一性
   * @param name SPU名称
   * @param brandId 品牌ID
   * @param excludeId 排除的SPU ID（用于更新时验证）
   * @returns 验证结果
   */
  async validateSPUNameUnique(
    name: string,
    brandId: string,
    excludeId?: string
  ): Promise<ApiResponse<{ isUnique: boolean }>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Mock验证逻辑（在实际项目中这里会查询数据库）
      // 假设名称是唯一的
      return {
        success: true,
        data: { isUnique: true },
        message: '验证成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: { isUnique: false },
        message: error instanceof Error ? error.message : '验证失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 导出SPU数据
   * @param params 查询参数
   * @param format 导出格式
   * @returns 导出结果
   */
  async exportSPU(
    params: SPUQueryParams,
    format: 'excel' | 'csv' = 'excel'
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock导出结果
      const downloadUrl = `/api/spu/export/${format}?timestamp=${Date.now()}`;

      return {
        success: true,
        data: { downloadUrl },
        message: `${format.toUpperCase()}文件生成成功`,
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: { downloadUrl: '' },
        message: error instanceof Error ? error.message : '导出失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }
}

// 创建服务实例
export const spuService = new SPUService();

// 导出默认服务
export default spuService;
