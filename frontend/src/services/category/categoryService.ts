/**
 * 类目管理功能API服务
 * 封装所有类目相关的HTTP请求，提供统一的API调用接口
 * 遵循项目宪章中的服务层架构规范
 */

// 直接定义所有需要的类型以避免导入问题
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: any;
}

interface CategoryAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'single-select' | 'multi-select';
  required: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  validation?: any[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  code?: string;
  level: 1 | 2 | 3;
  parentId?: string;
  sortOrder?: number;
  status: 'enabled' | 'disabled';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
  path: string;
  isLeaf: boolean;
}

interface AttributeTemplate {
  id: string;
  categoryId: string;
  attributes: CategoryAttribute[];
  createdAt: string;
  updatedAt: string;
}

interface AttributeResponse {
  success: boolean;
  data: CategoryAttribute;
  message?: string;
}

interface AttributeTemplateResponse {
  success: boolean;
  data: AttributeTemplate;
}

interface SuccessResponse {
  success: boolean;
  message: string;
}

interface CreateCategoryRequest {
  name: string;
  parentId?: string;
  sortOrder?: number;
  status?: 'enabled' | 'disabled';
}

interface UpdateCategoryRequest {
  name?: string;
  sortOrder?: number;
  status?: 'enabled' | 'disabled';
}

interface CreateAttributeRequest {
  name: string;
  type: 'text' | 'number' | 'single-select' | 'multi-select';
  required: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  validation?: any[];
}

interface UpdateAttributeRequest {
  name?: string;
  type?: 'text' | 'number' | 'single-select' | 'multi-select';
  required?: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder?: number;
  validation?: any[];
}

interface SaveAttributeTemplateRequest {
  attributes: CreateAttributeRequest[];
}

interface CategoryQueryParams {
  level?: 1 | 2 | 3;
  parentId?: string;
  status?: 'enabled' | 'disabled';
  keyword?: string;
  includeChildren?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface CategoryTreeResponse {
  success: boolean;
  data: CategoryTreeNode[];
  total: number;
}

interface CategoryListResponse {
  success: boolean;
  data: {
    items: Category[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface CategoryChildrenResponse {
  success: boolean;
  data: Category[];
}

// 导出类型供其他模块使用 - 使用单独的 export type 语句
export type { Category };
export type { CategoryTreeNode };
export type { CategoryAttribute };
export type { AttributeTemplate };
export type { CreateCategoryRequest };
export type { UpdateCategoryRequest };
export type { CreateAttributeRequest };
export type { UpdateAttributeRequest };
export type { SaveAttributeTemplateRequest };
export type { CategoryQueryParams };
export type { ApiResponse };
export type { CategoryTreeResponse };
export type { CategoryListResponse };
export type { CategoryChildrenResponse };
export type { AttributeResponse };
export type { AttributeTemplateResponse };
export type { SuccessResponse };

// API基础URL
const API_BASE_URL = '/api';

/**
 * 类目API服务类
 * 封装所有类目相关的HTTP请求方法
 */
class CategoryService {
  /**
   * 获取类目树结构
   * @param keyword 搜索关键词（可选）
   * @returns Promise<CategoryTreeResponse>
   */
  async getCategoryTree(keyword?: string): Promise<CategoryTreeResponse> {
    const url = new URL(`${API_BASE_URL}/categories/tree`, window.location.origin);
    if (keyword) {
      url.searchParams.set('keyword', keyword);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`获取类目树失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 获取类目列表（支持分页和筛选）
   * @param params 查询参数
   * @returns Promise<CategoryListResponse>
   */
  async getCategories(params?: CategoryQueryParams): Promise<CategoryListResponse> {
    const url = new URL(`${API_BASE_URL}/categories`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`获取类目列表失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 获取类目详情
   * @param id 类目ID
   * @returns Promise<ApiResponse<Category>>
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);

    if (!response.ok) {
      throw new Error(`获取类目详情失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 获取子类目列表
   * @param parentId 父类目ID
   * @returns Promise<CategoryChildrenResponse>
   */
  async getChildrenCategories(parentId: string): Promise<CategoryChildrenResponse> {
    const response = await fetch(`${API_BASE_URL}/categories/${parentId}/children`);

    if (!response.ok) {
      throw new Error(`获取子类目列表失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 创建新类目
   * @param data 创建类目请求数据
   * @returns Promise<ApiResponse<Category>>
   */
  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `创建类目失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 更新类目信息
   * @param id 类目ID
   * @param data 更新类目请求数据
   * @returns Promise<ApiResponse<Category>>
   */
  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `更新类目失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 删除类目
   * @param id 类目ID
   * @returns Promise<SuccessResponse>
   */
  async deleteCategory(id: string): Promise<SuccessResponse> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `删除类目失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 获取类目的属性模板
   * @param categoryId 类目ID
   * @returns Promise<AttributeTemplateResponse>
   */
  async getAttributeTemplate(categoryId: string): Promise<AttributeTemplateResponse> {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/attributes`);

    if (!response.ok) {
      throw new Error(`获取属性模板失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 保存属性模板
   * @param categoryId 类目ID
   * @param data 保存属性模板请求数据
   * @returns Promise<AttributeTemplateResponse>
   */
  async saveAttributeTemplate(
    categoryId: string,
    data: SaveAttributeTemplateRequest
  ): Promise<AttributeTemplateResponse> {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/attributes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `保存属性模板失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 新增属性到模板
   * @param categoryId 类目ID
   * @param data 创建属性请求数据
   * @returns Promise<AttributeResponse>
   */
  async addAttribute(categoryId: string, data: CreateAttributeRequest): Promise<AttributeResponse> {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/attributes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `新增属性失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 更新属性
   * @param categoryId 类目ID
   * @param attributeId 属性ID
   * @param data 更新属性请求数据
   * @returns Promise<AttributeResponse>
   */
  async updateAttribute(
    categoryId: string,
    attributeId: string,
    data: UpdateAttributeRequest
  ): Promise<AttributeResponse> {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/attributes/${attributeId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `更新属性失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 删除属性
   * @param categoryId 类目ID
   * @param attributeId 属性ID
   * @returns Promise<SuccessResponse>
   */
  async deleteAttribute(categoryId: string, attributeId: string): Promise<SuccessResponse> {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/attributes/${attributeId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `删除属性失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 搜索类目
   * @param keyword 搜索关键词
   * @returns Promise<ApiResponse<Category[]>>
   */
  async searchCategories(keyword: string): Promise<ApiResponse<Category[]>> {
    const response = await fetch(
      `${API_BASE_URL}/categories/search?keyword=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {
      throw new Error(`搜索类目失败: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 批量操作类目状态
   * @param ids 类目ID列表
   * @param status 状态
   * @returns Promise<ApiResponse<Category[]>>
   */
  async batchUpdateCategoryStatus(
    ids: string[],
    status: 'enabled' | 'disabled'
  ): Promise<ApiResponse<Category[]>> {
    const response = await fetch(`${API_BASE_URL}/categories/batch/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `批量更新状态失败: ${response.status}`);
    }

    return response.json();
  }
}

// 创建服务单例
export const categoryService = new CategoryService();

// 导出类型和服务实例
export { CategoryService };
export default categoryService;
