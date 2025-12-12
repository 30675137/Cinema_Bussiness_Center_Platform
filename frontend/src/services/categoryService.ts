import type { Category, CategoryTree } from '@/types/category'

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
      await new Promise(resolve => setTimeout(resolve, 300))

      // 使用新的 Mock 数据生成器
      const { getCategoryById } = await import('@/mocks/data/categoryMockData')
      const category = getCategoryById(id)

      if (!category) {
        return {
          success: false,
          data: null as any,
          message: '分类不存在',
          code: 404,
          timestamp: Date.now(),
        }
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
   * 获取子类目列表（懒加载）
   * @param parentId 父类目ID
   * @returns 子类目列表
   */
  async getCategoryChildren(parentId: string): Promise<ApiResponse<Category[]>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 300))

      // 使用新的 Mock 数据生成器
      const { getCategoryChildren } = await import('@/mocks/data/categoryMockData')
      const children = getCategoryChildren(parentId)

      return {
        success: true,
        data: children,
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
   * 搜索类目
   * @param keyword 搜索关键词
   * @returns 匹配的类目列表
   */
  async searchCategories(keyword: string): Promise<ApiResponse<Category[]>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 300))

      if (!keyword || keyword.trim() === '') {
        return {
          success: false,
          data: [],
          message: '搜索关键词不能为空',
          code: 400,
          timestamp: Date.now(),
        }
      }

      // 使用新的 Mock 数据生成器
      const { searchCategories } = await import('@/mocks/data/categoryMockData')
      const results = searchCategories(keyword)

      return {
        success: true,
        data: results,
        message: '搜索成功',
        code: 200,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : '搜索失败',
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
      await new Promise(resolve => setTimeout(resolve, 600))

      // 验证必填字段
      if (!data.name || data.name.trim() === '') {
        return {
          success: false,
          data: null as any,
          message: '类目名称不能为空',
          code: 400,
          timestamp: Date.now(),
        }
      }

      // 使用新的 Mock 数据生成器
      const { createCategory: createCategoryData, getCategoryById } = await import('@/mocks/data/categoryMockData')
      
      // 确定层级
      let level: 1 | 2 | 3 = 1
      let parentName: string | undefined
      if (data.parentId) {
        const parent = getCategoryById(data.parentId)
        if (!parent) {
          return {
            success: false,
            data: null as any,
            message: '父类目不存在',
            code: 400,
            timestamp: Date.now(),
          }
        }
        level = (parent.level + 1) as 1 | 2 | 3
        if (level > 3) {
          return {
            success: false,
            data: null as any,
            message: '类目层级不能超过三级',
            code: 400,
            timestamp: Date.now(),
          }
        }
        parentName = parent.name
      }

      // 构建路径
      const path: string[] = []
      if (data.parentId) {
        const parent = getCategoryById(data.parentId)
        if (parent) {
          path.push(...parent.path)
        }
      }
      path.push(data.name)

      const newCategory = createCategoryData({
        ...data,
        level,
        parentName,
        path,
        status: data.status || 'active',
        sortOrder: data.sortOrder || 0,
      })

      return {
        success: true,
        data: newCategory,
        message: '类目创建成功',
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
      await new Promise(resolve => setTimeout(resolve, 500))

      if (!data.id) {
        return {
          success: false,
          data: null as any,
          message: '类目ID不能为空',
          code: 400,
          timestamp: Date.now(),
        }
      }

      // 验证必填字段
      if (data.name && data.name.trim() === '') {
        return {
          success: false,
          data: null as any,
          message: '类目名称不能为空',
          code: 400,
          timestamp: Date.now(),
        }
      }

      // 使用新的 Mock 数据生成器
      const { updateCategory: updateCategoryData, getCategoryById } = await import('@/mocks/data/categoryMockData')
      
      const existingCategory = getCategoryById(data.id)
      if (!existingCategory) {
        return {
          success: false,
          data: null as any,
          message: '类目不存在',
          code: 404,
          timestamp: Date.now(),
        }
      }

      // 使用新的 Mock 数据生成器更新
      const updatedCategory = updateCategoryData(data.id, {
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder,
        status: data.status,
      })

      return {
        success: true,
        data: updatedCategory,
        message: '类目更新成功',
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

      // 使用新的 Mock 数据生成器
      const { deleteCategory: deleteCategoryData, getCategoryById, getCategoryChildren } = await import('@/mocks/data/categoryMockData')
      
      const category = getCategoryById(id)
      if (!category) {
        return {
          success: false,
          data: null,
          message: '类目不存在',
          code: 404,
          timestamp: Date.now(),
        }
      }

      // 检查是否被SPU使用
      if (category.spuCount > 0) {
        return {
          success: false,
          data: null,
          message: '该类目已有 SPU 使用，不可删除',
          code: 400,
          timestamp: Date.now(),
        }
      }

      // 检查是否有子类目
      const children = getCategoryChildren(id)
      if (children.length > 0) {
        return {
          success: false,
          data: null,
          message: '无法删除包含子类目的类目',
          code: 400,
          timestamp: Date.now(),
        }
      }

      // 执行删除
      const success = deleteCategoryData(id)
      if (!success) {
        return {
          success: false,
          data: null,
          message: '删除失败',
          code: 500,
          timestamp: Date.now(),
        }
      }

      return {
        success: true,
        data: null,
        message: '类目删除成功',
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
   * 获取分类树形结构（支持懒加载）
   * @param lazy 是否懒加载，默认 true（只返回一级类目）
   * @returns 树形结构数据
   */
  async getCategoryTree(lazy: boolean = true): Promise<ApiResponse<CategoryTree[]>> {
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 400))

      // 使用新的 Mock 数据生成器
      const { generateCategoryTree } = await import('@/mocks/data/categoryMockData')
      const tree = generateCategoryTree(lazy)

      return {
        success: true,
        data: tree,
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

      // 使用新的 Mock 数据生成器
      const { updateCategoryStatus: updateStatusData, getCategoryById } = await import('@/mocks/data/categoryMockData')
      
      const category = getCategoryById(id)
      if (!category) {
        return {
          success: false,
          data: null as any,
          message: '类目不存在',
          code: 404,
          timestamp: Date.now(),
        }
      }

      const updatedCategory = updateStatusData(id, status)

      return {
        success: true,
        data: updatedCategory,
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