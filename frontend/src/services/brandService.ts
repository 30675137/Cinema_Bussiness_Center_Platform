import type { Brand } from '@/types/spu';

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

// 品牌创建请求参数
export interface CreateBrandRequest {
  name: string;
  code: string;
  status: 'active' | 'inactive';
  logo?: string;
  description?: string;
  website?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  sortOrder?: number;
}

// 品牌更新请求参数
export interface UpdateBrandRequest extends Partial<CreateBrandRequest> {
  id: string;
}

// 品牌查询参数
export interface BrandQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'code' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 品牌服务类
 * 提供品牌相关的API服务，使用Mock数据实现
 */
class BrandService {
  private baseUrl = '/api/brands';

  /**
   * 获取品牌列表
   * @param params 查询参数
   * @returns 品牌列表
   */
  async getBrandList(params: BrandQueryParams = {}): Promise<PaginatedResponse<Brand>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 600));

      // 生成Mock数据
      const allBrands = this.generateMockBrands();

      // 应用筛选条件
      const filteredData = allBrands.filter((brand) => {
        // 关键词搜索
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          const searchableText =
            `${brand.name} ${brand.code} ${brand.description || ''} ${brand.contactPerson || ''}`.toLowerCase();
          if (!searchableText.includes(keyword)) {
            return false;
          }
        }

        // 状态筛选
        if (params.status && brand.status !== params.status) {
          return false;
        }

        return true;
      });

      // 排序
      if (params.sortBy) {
        filteredData.sort((a, b) => {
          let aValue: any = a[params.sortBy as keyof Brand];
          let bValue: any = b[params.sortBy as keyof Brand];

          if (params.sortBy === 'createdAt' || params.sortBy === 'updatedAt') {
            aValue = new Date(aValue || '1970-01-01').getTime();
            bValue = new Date(bValue || '1970-01-01').getTime();
          }

          if (aValue === bValue) return 0;
          const comparison = aValue > bValue ? 1 : -1;
          return params.sortOrder === 'asc' ? comparison : -comparison;
        });
      }

      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          list: paginatedData,
          total: filteredData.length,
          page,
          pageSize,
          totalPages: Math.ceil(filteredData.length / pageSize),
        },
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
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
   * 获取品牌详情
   * @param id 品牌ID
   * @returns 品牌详情
   */
  async getBrandDetail(id: string): Promise<ApiResponse<Brand>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      const allBrands = this.generateMockBrands();
      const brand = allBrands.find((b) => b.id === id);

      if (!brand) {
        throw new Error('品牌不存在');
      }

      return {
        success: true,
        data: brand,
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
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
   * 创建品牌
   * @param data 品牌创建数据
   * @returns 创建的品牌信息
   */
  async createBrand(data: CreateBrandRequest): Promise<ApiResponse<Brand>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 验证必填字段
      if (!data.name || data.name.trim() === '') {
        throw new Error('品牌名称不能为空');
      }

      if (!data.code || data.code.trim() === '') {
        throw new Error('品牌编码不能为空');
      }

      // 检查编码唯一性
      const allBrands = this.generateMockBrands();
      const existingBrand = allBrands.find((brand) => brand.code === data.code.trim());
      if (existingBrand) {
        throw new Error('品牌编码已存在');
      }

      // 验证邮箱格式
      if (data.contactEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.contactEmail)) {
          throw new Error('联系邮箱格式不正确');
        }
      }

      // 验证网址格式
      if (data.website) {
        try {
          new URL(data.website);
        } catch {
          throw new Error('网站地址格式不正确');
        }
      }

      // 生成新品牌
      const newBrand: Brand = {
        id: `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name.trim(),
        code: data.code.trim(),
        status: data.status,
        logo: data.logo,
        description: data.description?.trim(),
        website: data.website,
        contactPerson: data.contactPerson?.trim(),
        contactPhone: data.contactPhone?.trim(),
        contactEmail: data.contactEmail?.trim(),
        sortOrder: data.sortOrder || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: newBrand,
        message: '品牌创建成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
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
   * 更新品牌
   * @param data 品牌更新数据
   * @returns 更新后的品牌信息
   */
  async updateBrand(data: UpdateBrandRequest): Promise<ApiResponse<Brand>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (!data.id) {
        throw new Error('品牌ID不能为空');
      }

      // 验证必填字段
      if (data.name && data.name.trim() === '') {
        throw new Error('品牌名称不能为空');
      }

      if (data.code && data.code.trim() === '') {
        throw new Error('品牌编码不能为空');
      }

      // Mock更新逻辑
      const updatedBrand: Brand = {
        id: data.id,
        name: data.name,
        code: data.code,
        status: data.status,
        logo: data.logo,
        description: data.description,
        website: data.website,
        contactPerson: data.contactPerson,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        sortOrder: data.sortOrder,
        updatedAt: new Date().toISOString(),
      } as Brand;

      return {
        success: true,
        data: updatedBrand,
        message: '品牌更新成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
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
   * 删除品牌
   * @param id 品牌ID
   * @returns 删除结果
   */
  async deleteBrand(id: string): Promise<ApiResponse<null>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 检查品牌是否被使用（在实际项目中需要检查关联的SPU）
      // const usedBrands = await this.checkBrandUsage(id)
      // if (usedBrands > 0) {
      //   throw new Error(`该品牌已被${usedBrands}个SPU使用，无法删除`)
      // }

      return {
        success: true,
        data: null,
        message: '品牌删除成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
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
   * 批量删除品牌
   * @param ids 品牌ID列表
   * @returns 删除结果
   */
  async batchDeleteBrands(
    ids: string[]
  ): Promise<ApiResponse<{ success: number; failed: number }>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock批量删除结果
      return {
        success: true,
        data: { success: ids.length, failed: 0 },
        message: `成功删除${ids.length}个品牌`,
        code: 200,
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
   * 更新品牌状态
   * @param id 品牌ID
   * @param status 新状态
   * @returns 更新结果
   */
  async updateBrandStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<Brand>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 400));

      return {
        success: true,
        data: {
          id,
          status,
          updatedAt: new Date().toISOString(),
        } as Brand,
        message: '状态更新成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
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
   * 批量更新品牌状态
   * @param ids 品牌ID列表
   * @param status 新状态
   * @returns 更新结果
   */
  async batchUpdateBrandStatus(
    ids: string[],
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<{ success: number; failed: number }>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        success: true,
        data: { success: ids.length, failed: 0 },
        message: `成功更新${ids.length}个品牌状态`,
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
   * 获取活跃品牌列表（用于下拉选择）
   * @returns 活跃品牌列表
   */
  async getActiveBrands(): Promise<ApiResponse<Brand[]>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 400));

      const allBrands = this.generateMockBrands();
      const activeBrands = allBrands.filter((brand) => brand.status === 'active');

      return {
        success: true,
        data: activeBrands,
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : '获取失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 验证品牌编码唯一性
   * @param code 品牌编码
   * @param excludeId 排除的品牌ID（用于更新时验证）
   * @returns 验证结果
   */
  async validateBrandCodeUnique(
    code: string,
    excludeId?: string
  ): Promise<ApiResponse<{ isUnique: boolean }>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 300));

      const allBrands = this.generateMockBrands();
      const existingBrand = allBrands.find(
        (brand) => brand.code === code && brand.id !== excludeId
      );

      return {
        success: true,
        data: { isUnique: !existingBrand },
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
   * 检查品牌使用情况
   * @param brandId 品牌ID
   * @returns 使用数量
   */
  async checkBrandUsage(brandId: string): Promise<ApiResponse<{ count: number }>> {
    try {
      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Mock数据 - 在实际项目中这里会查询数据库
      return {
        success: true,
        data: { count: Math.floor(Math.random() * 20) },
        message: '检查成功',
        code: 200,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        data: { count: 0 },
        message: error instanceof Error ? error.message : '检查失败',
        code: 500,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * 生成Mock品牌数据
   * @returns Mock品牌数组
   */
  private generateMockBrands(): Brand[] {
    return [
      {
        id: 'brand_001',
        name: '可口可乐',
        code: 'COKE',
        status: 'active',
        logo: '/images/brands/coke-logo.png',
        description: '全球知名的饮料品牌，生产可乐、雪碧、芬达等经典饮料',
        website: 'https://www.coca-cola.com',
        contactPerson: '张经理',
        contactPhone: '13800138001',
        contactEmail: 'coke@example.com',
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'brand_002',
        name: '百事可乐',
        code: 'PEPSI',
        status: 'active',
        logo: '/images/brands/pepsi-logo.png',
        description: '世界著名的饮料公司，旗下有百事可乐、七喜、美年达等品牌',
        website: 'https://www.pepsico.com',
        contactPerson: '李经理',
        contactPhone: '13800138002',
        contactEmail: 'pepsi@example.com',
        sortOrder: 2,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: 'brand_003',
        name: '农夫山泉',
        code: 'NONGFU',
        status: 'active',
        logo: '/images/brands/nongfu-logo.png',
        description: '中国领先的饮用水和饮料生产企业',
        website: 'https://www.nongfuspring.com',
        contactPerson: '王经理',
        contactPhone: '13800138003',
        contactEmail: 'nongfu@example.com',
        sortOrder: 3,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      },
      {
        id: 'brand_004',
        name: '康师傅',
        code: 'KSF',
        status: 'active',
        logo: '/images/brands/ksf-logo.png',
        description: '知名的食品饮料品牌，以方便面和饮料闻名',
        website: 'https://www.masterkong.com.cn',
        contactPerson: '赵经理',
        contactPhone: '13800138004',
        contactEmail: 'ksf@example.com',
        sortOrder: 4,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      },
      {
        id: 'brand_005',
        name: '统一',
        code: 'UNI',
        status: 'active',
        logo: '/images/brands/uni-logo.png',
        description: '台湾知名的食品企业，产品涵盖饮料、零食等',
        website: 'https://www.uni-president.com',
        contactPerson: '刘经理',
        contactPhone: '13800138005',
        contactEmail: 'uni@example.com',
        sortOrder: 5,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z',
      },
      {
        id: 'brand_006',
        name: '旺旺',
        code: 'WW',
        status: 'active',
        logo: '/images/brands/wangwang-logo.png',
        description: '台湾知名的休闲食品品牌',
        website: 'https://www.want-want.com',
        contactPerson: '陈经理',
        contactPhone: '13800138006',
        contactEmail: 'wangwang@example.com',
        sortOrder: 6,
        createdAt: '2024-01-06T00:00:00Z',
        updatedAt: '2024-01-06T00:00:00Z',
      },
      {
        id: 'brand_007',
        name: '奥利奥',
        code: 'OREO',
        status: 'inactive',
        logo: '/images/brands/oreo-logo.png',
        description: '亿滋国际旗下的经典饼干品牌',
        website: 'https://www.oreo.com',
        contactPerson: '周经理',
        contactPhone: '13800138007',
        contactEmail: 'oreo@example.com',
        sortOrder: 7,
        createdAt: '2024-01-07T00:00:00Z',
        updatedAt: '2024-01-07T00:00:00Z',
      },
      {
        id: 'brand_008',
        name: '乐事',
        code: 'LAYS',
        status: 'active',
        logo: '/images/brands/lays-logo.png',
        description: '百事公司旗下的薯片品牌',
        website: 'https://www.lays.com',
        contactPerson: '吴经理',
        contactPhone: '13800138008',
        contactEmail: 'lays@example.com',
        sortOrder: 8,
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-08T00:00:00Z',
      },
    ];
  }
}

// 创建服务实例
export const brandService = new BrandService();

// 导出别名 brandAPI
export const brandAPI = brandService;

// 导出默认服务
export default brandService;
