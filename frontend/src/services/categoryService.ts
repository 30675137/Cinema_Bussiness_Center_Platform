import type { Category } from '@/types/spu'

// API 响应类型定义
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  code: number
  timestamp: number
}

export interface PaginatedResponse<T> extends ApiResponse<{
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {}

// 分类创建请求参数
export interface CreateCategoryRequest {
  name: string
  code: string
  level: number
  parentId?: string
  status: 'active' | 'inactive'
  description?: string
  sortOrder?: number
}

// 分类更新请求参数
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string
}

// 分类查询参数
export interface CategoryQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: 'active' | 'inactive'
  level?: number
  parentId?: string
  sortBy?: 'name' | 'code' | 'sortOrder' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分类服务类
 * 提供分类相关的API服务，使用Mock数据实现
 */
class CategoryService {
  private baseUrl = '/api/categories'

  /**
   * 获取分类列表
   * @param params 查询参数
   * @returns 分类列表
   */
  async getCategoryList(params: CategoryQueryParams = {}): Promise<PaginatedResponse<Category>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 600))

      // 生成Mock数据
      const allCategories = this.generateMockCategories()

      // 应用筛选条件
      let filteredData = allCategories.filter(category => {
        // 关键词搜索
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase()
          const searchableText = `${category.name} ${category.code} ${category.description || ''}`.toLowerCase()
          if (!searchableText.includes(keyword)) {
            return false
          }
        }

        // 状态筛选
        if (params.status && category.status !== params.status) {
          return false
        }

        // 级别筛选
        if (params.level && category.level !== params.level) {
          return false
        }

        // 父级筛选
        if (params.parentId) {
          if (params.parentId === 'root') {
            // 根级别筛选
            if (category.parentId) {
              return false
            }
          } else if (category.parentId !== params.parentId) {
            return false
          }
        }

        return true
      })

      // 排序
      if (params.sortBy) {
        filteredData.sort((a, b) => {
          let aValue: any = a[params.sortBy as keyof Category]
          let bValue: any = b[params.sortBy as keyof Category]

          if (params.sortBy === 'createdAt' || params.sortBy === 'updatedAt') {
            aValue = new Date(aValue || '1970-01-01').getTime()
            bValue = new Date(bValue || '1970-01-01').getTime()
          }

          if (aValue === bValue) return 0
          const comparison = aValue > bValue ? 1 : -1
          return params.sortOrder === 'asc' ? comparison : -comparison
        })
      }

      // 分页处理
      const page = params.page || 1
      const pageSize = params.pageSize || 20
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredData.slice(startIndex, endIndex)

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
      }
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
      }
    }
  }

  /**
   * 获取分类详情
   * @param id 分类ID
   * @returns 分类详情
   */
  async getCategoryDetail(id: string): Promise<ApiResponse<Category>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))

      const allCategories = this.generateMockCategories()
      const category = allCategories.find(cat => cat.id === id)

      if (!category) {
        throw new Error('分类不存在')
      }

      return {
        success: true,
        data: category,
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '获取失败',
        code: 500,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 创建分类
   * @param data 分类创建数据
   * @returns 创建的分类信息
   */
  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800))

      // 验证必填字段
      if (!data.name || data.name.trim() === '') {
        throw new Error('分类名称不能为空')
      }

      if (!data.code || data.code.trim() === '') {
        throw new Error('分类编码不能为空')
      }

      // 检查编码唯一性
      const allCategories = this.generateMockCategories()
      const existingCategory = allCategories.find(cat => cat.code === data.code.trim())
      if (existingCategory) {
        throw new Error('分类编码已存在')
      }

      // 检查级别限制
      if (data.level < 1 || data.level > 3) {
        throw new Error('分类级别必须在1-3之间')
      }

      // 如果指定了父级，验证父级存在且级别合法
      if (data.parentId) {
        const parentCategory = allCategories.find(cat => cat.id === data.parentId)
        if (!parentCategory) {
          throw new Error('父级分类不存在')
        }
        if (parentCategory.level >= data.level) {
          throw new Error('子分类级别必须大于父分类级别')
        }
      }

      // 生成新分类
      const newCategory: Category = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name.trim(),
        code: data.code.trim(),
        level: data.level,
        parentId: data.parentId,
        status: data.status,
        description: data.description?.trim(),
        sortOrder: data.sortOrder || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return {
        success: true,
        data: newCategory,
        message: '分类创建成功',
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '创建失败',
        code: 500,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 更新分类
   * @param data 分类更新数据
   * @returns 更新后的分类信息
   */
  async updateCategory(data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 600))

      if (!data.id) {
        throw new Error('分类ID不能为空')
      }

      // 验证必填字段
      if (data.name && data.name.trim() === '') {
        throw new Error('分类名称不能为空')
      }

      if (data.code && data.code.trim() === '') {
        throw new Error('分类编码不能为空')
      }

      // Mock更新逻辑
      const updatedCategory: Category = {
        id: data.id,
        name: data.name,
        code: data.code,
        level: data.level,
        parentId: data.parentId,
        status: data.status,
        description: data.description,
        sortOrder: data.sortOrder,
        updatedAt: new Date().toISOString()
      } as Category

      return {
        success: true,
        data: updatedCategory,
        message: '分类更新成功',
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '更新失败',
        code: 500,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 删除分类
   * @param id 分类ID
   * @returns 删除结果
   */
  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500))

      // 检查是否有子分类
      const allCategories = this.generateMockCategories()
      const hasChildren = allCategories.some(cat => cat.parentId === id)
      if (hasChildren) {
        throw new Error('无法删除包含子分类的分类')
      }

      return {
        success: true,
        data: null,
        message: '分类删除成功',
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '删除失败',
        code: 500,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 批量删除分类
   * @param ids 分类ID列表
   * @returns 删除结果
   */
  async batchDeleteCategories(ids: string[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock批量删除结果
      return {
        success: true,
        data: { success: ids.length, failed: 0 },
        message: `成功删除${ids.length}个分类`,
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: { success: 0, failed: ids.length },
        message: error instanceof Error ? error.message : '批量删除失败',
        code: 500,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 获取分类树形结构
   * @param level 获取层级深度，默认获取全部
   * @returns 树形结构数据
   */
  async getCategoryTree(level?: number): Promise<ApiResponse<Category[]>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 400))

      const allCategories = this.generateMockCategories()

      // 如果指定了层级，过滤数据
      let filteredCategories = allCategories
      if (level && level > 0) {
        filteredCategories = allCategories.filter(cat => cat.level <= level)
      }

      return {
        success: true,
        data: filteredCategories,
        message: '获取成功',
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : '获取失败',
        code: 500,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 更新分类状态
   * @param id 分类ID
   * @param status 新状态
   * @returns 更新结果
   */
  async updateCategoryStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<Category>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 400))

      return {
        success: true,
        data: {
          id,
          status,
          updatedAt: new Date().toISOString()
        } as Category,
        message: '状态更新成功',
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '状态更新失败',
        code: 500,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 验证分类编码唯一性
   * @param code 分类编码
   * @param excludeId 排除的分类ID（用于更新时验证）
   * @returns 验证结果
   */
  async validateCategoryCodeUnique(
    code: string,
    excludeId?: string
  ): Promise<ApiResponse<{ isUnique: boolean }>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 300))

      const allCategories = this.generateMockCategories()
      const existingCategory = allCategories.find(cat =>
        cat.code === code && cat.id !== excludeId
      )

      return {
        success: true,
        data: { isUnique: !existingCategory },
        message: '验证成功',
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: { isUnique: false },
        message: error instanceof Error ? error.message : '验证失败',
        code: 500,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * 生成Mock分类数据
   * @returns Mock分类数组
   */
  private generateMockCategories(): Category[] {
    return [
      {
        id: 'cat_001',
        name: '食品饮料',
        code: 'food_beverage',
        level: 1,
        status: 'active',
        description: '各类食品和饮料商品',
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: [
          {
            id: 'cat_001_001',
            name: '饮料',
            code: 'beverage',
            level: 2,
            status: 'active',
            parentId: 'cat_001',
            description: '各类饮料商品',
            sortOrder: 1,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]
      },
      {
        id: 'cat_002',
        name: '日用百货',
        code: 'daily_goods',
        level: 1,
        status: 'active',
        description: '日常生活用品',
        sortOrder: 2,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  }
}

// 创建服务实例
export const categoryService = new CategoryService()

// 导出默认服务
export default categoryService