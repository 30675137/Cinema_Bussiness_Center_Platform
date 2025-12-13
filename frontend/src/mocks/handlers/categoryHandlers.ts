/**
 * 类目管理功能的MSW API处理器
 * 提供完整的RESTful API模拟，支持类目CRUD操作和属性模板管理
 * 遵循项目宪章中的MSW使用规范
 */

import { http, HttpResponse } from 'msw';
// 临时定义以避免模块导入问题
type CategoryLevel = 1 | 2 | 3;
type CategoryStatus = 'enabled' | 'disabled';
type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';

type Category = {
  id: string;
  name: string;
  code?: string;
  level: CategoryLevel;
  parentId?: string;
  sortOrder?: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

type CategoryTreeNode = Category & {
  children?: CategoryTreeNode[];
  path: string;
  isLeaf: boolean;
};

type CategoryAttribute = {
  id: string;
  name: string;
  type: AttributeType;
  required: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  validation?: any[];
  createdAt: string;
  updatedAt: string;
};

type AttributeTemplate = {
  id: string;
  categoryId: string;
  attributes: CategoryAttribute[];
  createdAt: string;
  updatedAt: string;
};

type CreateCategoryRequest = {
  name: string;
  parentId?: string;
  sortOrder?: number;
  status?: CategoryStatus;
};

type UpdateCategoryRequest = {
  name?: string;
  sortOrder?: number;
  status?: CategoryStatus;
};

type CreateAttributeRequest = {
  name: string;
  type: AttributeType;
  required: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  validation?: any[];
};

type UpdateAttributeRequest = {
  name?: string;
  type?: AttributeType;
  required?: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder?: number;
  validation?: any[];
};

type SaveAttributeTemplateRequest = {
  attributes: CreateAttributeRequest[];
};

type CategoryQueryParams = {
  level?: CategoryLevel;
  parentId?: string;
  status?: CategoryStatus;
  keyword?: string;
  includeChildren?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: any;
};

type CategoryTreeResponse = {
  success: boolean;
  data: CategoryTreeNode[];
  total: number;
};

type CategoryListResponse = {
  success: boolean;
  data: {
    items: Category[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

type CategoryChildrenResponse = {
  success: boolean;
  data: Category[];
};

type AttributeTemplateResponse = {
  success: boolean;
  data: AttributeTemplate;
};

type AttributeResponse = {
  success: boolean;
  data: CategoryAttribute;
};

type SuccessResponse = {
  success: boolean;
  message: string;
};

enum ErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_NAME_EXISTS = 'CATEGORY_NAME_EXISTS',
  CATEGORY_HAS_CHILDREN = 'CATEGORY_HAS_CHILDREN',
  CATEGORY_IN_USE = 'CATEGORY_IN_USE',
  INVALID_CATEGORY_LEVEL = 'INVALID_CATEGORY_LEVEL',
  INVALID_PARENT_CATEGORY = 'INVALID_PARENT_CATEGORY',
  ATTRIBUTE_NOT_FOUND = 'ATTRIBUTE_NOT_FOUND',
  ATTRIBUTE_NAME_EXISTS = 'ATTRIBUTE_NAME_EXISTS',
  ATTRIBUTE_IN_USE = 'ATTRIBUTE_IN_USE',
  INVALID_ATTRIBUTE_TYPE = 'INVALID_ATTRIBUTE_TYPE',
  REQUIRED_OPTIONAL_VALUES = 'REQUIRED_OPTIONAL_VALUES',
}

const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_REQUEST]: '请求参数无效',
  [ErrorCode.UNAUTHORIZED]: '未授权访问',
  [ErrorCode.FORBIDDEN]: '权限不足',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.CATEGORY_NOT_FOUND]: '类目不存在',
  [ErrorCode.CATEGORY_NAME_EXISTS]: '类目名称已存在',
  [ErrorCode.CATEGORY_HAS_CHILDREN]: '类目下存在子类目，无法删除',
  [ErrorCode.CATEGORY_IN_USE]: '类目已被SPU使用，无法删除',
  [ErrorCode.INVALID_CATEGORY_LEVEL]: '类目等级无效',
  [ErrorCode.INVALID_PARENT_CATEGORY]: '上级类目无效',
  [ErrorCode.ATTRIBUTE_NOT_FOUND]: '属性不存在',
  [ErrorCode.ATTRIBUTE_NAME_EXISTS]: '属性名称已存在',
  [ErrorCode.ATTRIBUTE_IN_USE]: '属性已被SPU使用，无法删除',
  [ErrorCode.INVALID_ATTRIBUTE_TYPE]: '属性类型无效',
  [ErrorCode.REQUIRED_OPTIONAL_VALUES]: '选择类型属性必须提供可选值',
};

// Mock数据存储
class MockDataStore {
  private static instance: MockDataStore;
  private categories: Category[] = [];
  private attributeTemplates: Record<string, AttributeTemplate> = {};
  private nextCategoryId = 1;
  private nextAttributeId = 1;

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  private initializeMockData() {
    // 初始化一级类目
    const level1Categories: Category[] = [
      {
        id: 'cat-001',
        name: '食品饮料',
        level: 1,
        sortOrder: 1,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'cat-002',
        name: '日用百货',
        level: 1,
        sortOrder: 2,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'cat-003',
        name: '娱乐用品',
        level: 1,
        sortOrder: 3,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    // 初始化二级类目
    const level2Categories: Category[] = [
      {
        id: 'cat-001-001',
        name: '爆米花',
        level: 2,
        parentId: 'cat-001',
        sortOrder: 1,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'cat-001-002',
        name: '饮料',
        level: 2,
        parentId: 'cat-001',
        sortOrder: 2,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'cat-002-001',
        name: '洗漱用品',
        level: 2,
        parentId: 'cat-002',
        sortOrder: 1,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    // 初始化三级类目
    const level3Categories: Category[] = [
      {
        id: 'cat-001-001-001',
        name: '甜味爆米花',
        level: 3,
        parentId: 'cat-001-001',
        sortOrder: 1,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'cat-001-001-002',
        name: '咸味爆米花',
        level: 3,
        parentId: 'cat-001-001',
        sortOrder: 2,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'cat-001-002-001',
        name: '碳酸饮料',
        level: 3,
        parentId: 'cat-001-002',
        sortOrder: 1,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'cat-001-002-002',
        name: '果汁饮料',
        level: 3,
        parentId: 'cat-001-002',
        sortOrder: 2,
        status: 'enabled',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    this.categories = [...level1Categories, ...level2Categories, ...level3Categories];
    this.nextCategoryId = this.categories.length + 1;

    // 初始化属性模板
    this.initializeAttributeTemplates();
  }

  private initializeAttributeTemplates() {
    // 爆米花属性模板
    const popcornAttributes: CategoryAttribute[] = [
      {
        id: 'attr-popcorn-001',
        name: '口味',
        type: 'single-select',
        required: true,
        optionalValues: ['甜味', '咸味', '焦糖味', '巧克力味'],
        placeholder: '请选择口味',
        description: '爆米花的主要口味分类',
        sortOrder: 1,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'attr-popcorn-002',
        name: '容量',
        type: 'single-select',
        required: true,
        optionalValues: ['小份', '中份', '大份', '超大份'],
        placeholder: '请选择容量',
        description: '爆米花的包装容量规格',
        sortOrder: 2,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];

    this.attributeTemplates['cat-001-001'] = {
      id: 'template-popcorn-001',
      categoryId: 'cat-001-001',
      attributes: popcornAttributes,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    };

    // 饮料属性模板
    const drinkAttributes: CategoryAttribute[] = [
      {
        id: 'attr-drink-001',
        name: '品牌',
        type: 'single-select',
        required: true,
        optionalValues: ['可口可乐', '百事可乐', '农夫山泉', '康师傅'],
        placeholder: '请选择品牌',
        description: '饮料品牌',
        sortOrder: 1,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'attr-drink-002',
        name: '容量(ml)',
        type: 'number',
        required: true,
        placeholder: '请输入容量',
        description: '饮料容量，单位为毫升',
        sortOrder: 2,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];

    this.attributeTemplates['cat-001-002'] = {
      id: 'template-drink-001',
      categoryId: 'cat-001-002',
      attributes: drinkAttributes,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    };

    this.nextAttributeId = Object.values(this.attributeTemplates)
      .reduce((total, template) => total + template.attributes.length, 0) + 1;
  }

  // 类目相关方法
  getCategories(params?: CategoryQueryParams): Category[] {
    let filteredCategories = [...this.categories];

    if (params) {
      if (params.level) {
        filteredCategories = filteredCategories.filter(cat => cat.level === params.level);
      }

      if (params.parentId) {
        filteredCategories = filteredCategories.filter(cat => cat.parentId === params.parentId);
      }

      if (params.status) {
        filteredCategories = filteredCategories.filter(cat => cat.status === params.status);
      }

      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredCategories = filteredCategories.filter(cat =>
          cat.name.toLowerCase().includes(keyword)
        );
      }

      if (params.sortBy) {
        filteredCategories.sort((a, b) => {
          let aValue: any = a[params.sortBy!];
          let bValue: any = b[params.sortBy!];

          if (params.sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }
    }

    return filteredCategories;
  }

  getCategoryById(id: string): Category | null {
    return this.categories.find(cat => cat.id === id) || null;
  }

  getCategoryTree(): CategoryTreeNode[] {
    const buildTree = (parentId?: string): CategoryTreeNode[] => {
      const children = this.categories
        .filter(cat => cat.parentId === parentId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      return children.map(category => ({
        ...category,
        path: this.getCategoryPath(category.id),
        isLeaf: !this.categories.some(cat => cat.parentId === category.id),
        children: buildTree(category.id)
      }));
    };

    return buildTree();
  }

  getChildrenCategories(parentId: string): Category[] {
    return this.categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  createCategory(request: CreateCategoryRequest): Category {
    const level = request.parentId
      ? (this.getCategoryById(request.parentId)?.level || 0) + 1 as CategoryLevel
      : 1;

    if (level > 3) {
      throw new Error('不能创建三级以上的类目');
    }

    const newCategory: Category = {
      id: `cat-${String(this.nextCategoryId++).padStart(3, '0')}`,
      name: request.name,
      level,
      parentId: request.parentId,
      sortOrder: request.sortOrder || this.getNextSortOrder(request.parentId),
      status: request.status || 'enabled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user'
    };

    this.categories.push(newCategory);
    return newCategory;
  }

  updateCategory(id: string, request: UpdateCategoryRequest): Category {
    const categoryIndex = this.categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new Error('类目不存在');
    }

    const updatedCategory = {
      ...this.categories[categoryIndex],
      ...request,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user'
    };

    this.categories[categoryIndex] = updatedCategory;
    return updatedCategory;
  }

  deleteCategory(id: string): void {
    // 检查是否有子类目
    const hasChildren = this.categories.some(cat => cat.parentId === id);
    if (hasChildren) {
      throw new Error('类目下存在子类目，无法删除');
    }

    // 模拟检查SPU使用情况（这里简化处理）
    const hasSPUUsage = this.checkSPUUsage(id);
    if (hasSPUUsage) {
      throw new Error('类目已被SPU使用，无法删除');
    }

    this.categories = this.categories.filter(cat => cat.id !== id);

    // 删除对应的属性模板
    delete this.attributeTemplates[id];
  }

  // 属性模板相关方法
  getAttributeTemplate(categoryId: string): AttributeTemplate | null {
    return this.attributeTemplates[categoryId] || null;
  }

  saveAttributeTemplate(categoryId: string, request: SaveAttributeTemplateRequest): AttributeTemplate {
    const attributes = request.attributes.map((attr, index) => ({
      id: `attr-${String(this.nextAttributeId++).padStart(3, '0')}`,
      name: attr.name,
      type: attr.type,
      required: attr.required,
      optionalValues: attr.optionalValues,
      defaultValue: attr.defaultValue,
      placeholder: attr.placeholder,
      description: attr.description,
      sortOrder: attr.sortOrder,
      validation: attr.validation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const template: AttributeTemplate = {
      id: `template-${categoryId}`,
      categoryId,
      attributes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.attributeTemplates[categoryId] = template;
    return template;
  }

  addAttribute(categoryId: string, request: CreateAttributeRequest): CategoryAttribute {
    const template = this.attributeTemplates[categoryId];
    if (!template) {
      throw new Error('类目属性模板不存在');
    }

    // 检查属性名称是否重复
    if (template.attributes.some(attr => attr.name === request.name)) {
      throw new Error('属性名称已存在');
    }

    const newAttribute: CategoryAttribute = {
      id: `attr-${String(this.nextAttributeId++).padStart(3, '0')}`,
      ...request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    template.attributes.push(newAttribute);
    template.attributes.sort((a, b) => a.sortOrder - b.sortOrder);
    template.updatedAt = new Date().toISOString();

    return newAttribute;
  }

  updateAttribute(categoryId: string, attributeId: string, request: UpdateAttributeRequest): CategoryAttribute {
    const template = this.attributeTemplates[categoryId];
    if (!template) {
      throw new Error('类目属性模板不存在');
    }

    const attributeIndex = template.attributes.findIndex(attr => attr.id === attributeId);
    if (attributeIndex === -1) {
      throw new Error('属性不存在');
    }

    // 检查属性名称是否重复（排除自己）
    if (request.name && template.attributes.some((attr, index) =>
      attr.name === request.name && index !== attributeIndex
    )) {
      throw new Error('属性名称已存在');
    }

    const updatedAttribute = {
      ...template.attributes[attributeIndex],
      ...request,
      updatedAt: new Date().toISOString()
    };

    template.attributes[attributeIndex] = updatedAttribute;
    template.updatedAt = new Date().toISOString();

    return updatedAttribute;
  }

  deleteAttribute(categoryId: string, attributeId: string): void {
    const template = this.attributeTemplates[categoryId];
    if (!template) {
      throw new Error('类目属性模板不存在');
    }

    // 模拟检查SPU使用情况
    const hasSPUUsage = this.checkAttributeUsage(attributeId);
    if (hasSPUUsage) {
      throw new Error('属性已被SPU使用，无法删除');
    }

    template.attributes = template.attributes.filter(attr => attr.id !== attributeId);
    template.updatedAt = new Date().toISOString();
  }

  // 工具方法
  private getCategoryPath(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    if (!category) return '';

    if (!category.parentId) return category.name;

    const parentPath = this.getCategoryPath(category.parentId);
    return parentPath ? `${parentPath} > ${category.name}` : category.name;
  }

  private getNextSortOrder(parentId?: string): number {
    const siblings = this.categories.filter(cat => cat.parentId === parentId);
    const maxSortOrder = Math.max(...siblings.map(cat => cat.sortOrder || 0));
    return maxSortOrder + 1;
  }

  private checkSPUUsage(categoryId: string): boolean {
    // 模拟检查SPU使用情况，这里简化处理
    // 实际实现中需要查询SPU数据
    return Math.random() > 0.8; // 20%概率返回true，模拟被使用的情况
  }

  private checkAttributeUsage(attributeId: string): boolean {
    // 模拟检查属性使用情况
    return Math.random() > 0.9; // 10%概率返回true，模拟被使用的情况
  }
}

// 获取Mock数据存储实例
const mockDataStore = MockDataStore.getInstance();

// 辅助函数：创建成功响应
const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data
});

// 辅助函数：创建错误响应
const createErrorResponse = (code: ErrorCode, message?: string): ApiResponse => ({
  success: false,
  message: message || ErrorMessages[code],
  code
});

// 工具函数：根据关键词过滤树结构
function filterTreeByKeyword(tree: CategoryTreeNode[], keyword: string): CategoryTreeNode[] {
  const lowerKeyword = keyword.toLowerCase();

  const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
    const nameMatches = node.name.toLowerCase().includes(lowerKeyword);
    const filteredChildren = node.children
      ? node.children.map(filterNode).filter(Boolean) as CategoryTreeNode[]
      : [];

    if (nameMatches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren
      };
    }

    return null;
  };

  return tree.map(filterNode).filter(Boolean) as CategoryTreeNode[];
}

// 工具函数：计算树节点数量
function countTreeNodes(tree: CategoryTreeNode[]): number {
  return tree.reduce((total, node) => {
    return total + 1 + (node.children ? countTreeNodes(node.children) : 0);
  }, 0);
}

// 基础API延迟模拟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 类目相关API处理器
 * 基于类型定义和OpenAPI规范实现
 */
export const categoryHandlers = [
  // 获取类目树
  http.get('/api/categories/tree', async ({ request }) => {
    await delay(300);
    try {
      const url = new URL(request.url);
      const keyword = url.searchParams.get('keyword');

      let tree = mockDataStore.getCategoryTree();

      // 如果有搜索关键词，过滤树结构
      if (keyword) {
        tree = filterTreeByKeyword(tree, keyword);
      }

      const response: CategoryTreeResponse = {
        success: true,
        data: tree,
        total: countTreeNodes(tree)
      };

      return HttpResponse.json(response);
    } catch (error) {
      const response = createErrorResponse(ErrorCode.INVALID_REQUEST);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 获取类目列表
  http.get('/api/categories', async ({ request }) => {
    await delay(400);
    try {
      const url = new URL(request.url);
      const params: CategoryQueryParams = {
        level: url.searchParams.get('level') as CategoryLevel || undefined,
        parentId: url.searchParams.get('parentId') || undefined,
        status: url.searchParams.get('status') as CategoryStatus || undefined,
        keyword: url.searchParams.get('keyword') || undefined,
        page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined,
        pageSize: url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize')!) : undefined,
        sortBy: url.searchParams.get('sortBy') as any || undefined,
        sortOrder: url.searchParams.get('sortOrder') as any || undefined
      };

      const categories = mockDataStore.getCategories(params);
      const total = categories.length;
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = categories.slice(startIndex, endIndex);

      const response: CategoryListResponse = {
        success: true,
        data: {
          items,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };

      return HttpResponse.json(response);
    } catch (error) {
      const response = createErrorResponse(ErrorCode.INVALID_REQUEST);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 获取类目详情
  http.get('/api/categories/:id', async ({ params }) => {
    await delay(300);
    try {
      const category = mockDataStore.getCategoryById(params.id as string);

      if (!category) {
        const response = createErrorResponse(ErrorCode.CATEGORY_NOT_FOUND);
        return HttpResponse.json(response, { status: 404 });
      }

      const response = createSuccessResponse(category);
      return HttpResponse.json(response);
    } catch (error) {
      const response = createErrorResponse(ErrorCode.INVALID_REQUEST);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 获取子类目
  http.get('/api/categories/:id/children', async ({ params }) => {
    await delay(300);
    try {
      const children = mockDataStore.getChildrenCategories(params.id as string);
      const response: CategoryChildrenResponse = {
        success: true,
        data: children
      };

      return HttpResponse.json(response);
    } catch (error) {
      const response = createErrorResponse(ErrorCode.INVALID_REQUEST);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 创建类目
  http.post('/api/categories', async ({ request }) => {
    await delay(600);
    try {
      const body = await request.json() as CreateCategoryRequest;

      if (!body.name || body.name.trim() === '') {
        const response = createErrorResponse(ErrorCode.INVALID_REQUEST, '类目名称不能为空');
        return HttpResponse.json(response, { status: 400 });
      }

      // 检查同级类目名称是否重复
      const siblings = mockDataStore.getCategories({ parentId: body.parentId });
      if (siblings.some(cat => cat.name === body.name.trim())) {
        const response = createErrorResponse(ErrorCode.CATEGORY_NAME_EXISTS);
        return HttpResponse.json(response, { status: 400 });
      }

      const category = mockDataStore.createCategory(body);
      const response = createSuccessResponse(category);
      return HttpResponse.json(response, { status: 201 });
    } catch (error: any) {
      let code = ErrorCode.INVALID_REQUEST;
      let message = '创建类目失败';

      if (error.message === '不能创建三级以上的类目') {
        code = ErrorCode.INVALID_CATEGORY_LEVEL;
        message = error.message;
      }

      const response = createErrorResponse(code, message);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 更新类目
  http.put('/api/categories/:id', async ({ params, request }) => {
    await delay(500);
    try {
      const id = params.id as string;
      const body = await request.json() as UpdateCategoryRequest;

      if (body.name !== undefined && (!body.name || body.name.trim() === '')) {
        const response = createErrorResponse(ErrorCode.INVALID_REQUEST, '类目名称不能为空');
        return HttpResponse.json(response, { status: 400 });
      }

      // 检查类目是否存在
      const existingCategory = mockDataStore.getCategoryById(id);
      if (!existingCategory) {
        const response = createErrorResponse(ErrorCode.CATEGORY_NOT_FOUND);
        return HttpResponse.json(response, { status: 404 });
      }

      // 如果修改名称，检查同级类目名称是否重复
      if (body.name && body.name !== existingCategory.name) {
        const siblings = mockDataStore.getCategories({ parentId: existingCategory.parentId });
        if (siblings.some(cat => cat.id !== id && cat.name === body.name.trim())) {
          const response = createErrorResponse(ErrorCode.CATEGORY_NAME_EXISTS);
          return HttpResponse.json(response, { status: 400 });
        }
      }

      const category = mockDataStore.updateCategory(id, body);
      const response = createSuccessResponse(category);
      return HttpResponse.json(response);
    } catch (error) {
      const response = createErrorResponse(ErrorCode.INVALID_REQUEST);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 删除类目
  http.delete('/api/categories/:id', async ({ params }) => {
    await delay(400);
    try {
      const id = params.id as string;

      // 检查类目是否存在
      const category = mockDataStore.getCategoryById(id);
      if (!category) {
        const response = createErrorResponse(ErrorCode.CATEGORY_NOT_FOUND);
        return HttpResponse.json(response, { status: 404 });
      }

      mockDataStore.deleteCategory(id);
      const response: SuccessResponse = {
        success: true,
        message: '类目删除成功'
      };

      return HttpResponse.json(response);
    } catch (error: any) {
      let code = ErrorCode.INVALID_REQUEST;
      let message = '删除类目失败';

      if (error.message === '类目下存在子类目，无法删除') {
        code = ErrorCode.CATEGORY_HAS_CHILDREN;
        message = error.message;
      } else if (error.message === '类目已被SPU使用，无法删除') {
        code = ErrorCode.CATEGORY_IN_USE;
        message = error.message;
      }

      const response = createErrorResponse(code, message);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 获取属性模板
  http.get('/api/categories/:categoryId/attributes', async ({ params }) => {
    await delay(300);
    try {
      const categoryId = params.categoryId as string;
      const template = mockDataStore.getAttributeTemplate(categoryId);

      if (!template) {
        const response = createSuccessResponse({
          id: '',
          categoryId,
          attributes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as AttributeTemplate);
        return HttpResponse.json(response);
      }

      const response: AttributeTemplateResponse = {
        success: true,
        data: template
      };

      return HttpResponse.json(response);
    } catch (error) {
      const response = createErrorResponse(ErrorCode.INVALID_REQUEST);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 保存属性模板
  http.put('/api/categories/:categoryId/attributes', async ({ params, request }) => {
    await delay(500);
    try {
      const categoryId = params.categoryId as string;
      const body = await request.json() as SaveAttributeTemplateRequest;

      // 验证属性名称唯一性
      const attributeNames = body.attributes.map(attr => attr.name);
      const uniqueNames = [...new Set(attributeNames)];
      if (attributeNames.length !== uniqueNames.length) {
        const response = createErrorResponse(ErrorCode.ATTRIBUTE_NAME_EXISTS, '属性名称不能重复');
        return HttpResponse.json(response, { status: 400 });
      }

      // 验证选择类型属性必须有可选值
      for (const attr of body.attributes) {
        if ((attr.type === 'single-select' || attr.type === 'multi-select') &&
            (!attr.optionalValues || attr.optionalValues.length === 0)) {
          const response = createErrorResponse(ErrorCode.REQUIRED_OPTIONAL_VALUES,
            `属性"${attr.name}"是选择类型，必须提供可选值`);
          return HttpResponse.json(response, { status: 400 });
        }
      }

      const template = mockDataStore.saveAttributeTemplate(categoryId, body);
      const response: AttributeTemplateResponse = {
        success: true,
        data: template
      };

      return HttpResponse.json(response);
    } catch (error) {
      const response = createErrorResponse(ErrorCode.INVALID_REQUEST);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 新增属性
  http.post('/api/categories/:categoryId/attributes', async ({ params, request }) => {
    await delay(400);
    try {
      const categoryId = params.categoryId as string;
      const body = await request.json() as CreateAttributeRequest;

      if (!body.name || body.name.trim() === '') {
        const response = createErrorResponse(ErrorCode.INVALID_REQUEST, '属性名称不能为空');
        return HttpResponse.json(response, { status: 400 });
      }

      if ((body.type === 'single-select' || body.type === 'multi-select') &&
          (!body.optionalValues || body.optionalValues.length === 0)) {
        const response = createErrorResponse(ErrorCode.REQUIRED_OPTIONAL_VALUES,
          '选择类型属性必须提供可选值');
        return HttpResponse.json(response, { status: 400 });
      }

      const attribute = mockDataStore.addAttribute(categoryId, body);
      const response: AttributeResponse = {
        success: true,
        data: attribute
      };

      return HttpResponse.json(response, { status: 201 });
    } catch (error: any) {
      let code = ErrorCode.INVALID_REQUEST;
      let message = '新增属性失败';

      if (error.message === '类目属性模板不存在') {
        code = ErrorCode.ATTRIBUTE_NOT_FOUND;
        message = error.message;
      } else if (error.message === '属性名称已存在') {
        code = ErrorCode.ATTRIBUTE_NAME_EXISTS;
        message = error.message;
      }

      const response = createErrorResponse(code, message);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 更新属性
  http.put('/api/categories/:categoryId/attributes/:attributeId', async ({ params, request }) => {
    await delay(400);
    try {
      const categoryId = params.categoryId as string;
      const attributeId = params.attributeId as string;
      const body = await request.json() as UpdateAttributeRequest;

      if (body.name !== undefined && (!body.name || body.name.trim() === '')) {
        const response = createErrorResponse(ErrorCode.INVALID_REQUEST, '属性名称不能为空');
        return HttpResponse.json(response, { status: 400 });
      }

      if (body.type && (body.type === 'single-select' || body.type === 'multi-select') &&
          body.optionalValues !== undefined && body.optionalValues.length === 0) {
        const response = createErrorResponse(ErrorCode.REQUIRED_OPTIONAL_VALUES,
          '选择类型属性必须提供可选值');
        return HttpResponse.json(response, { status: 400 });
      }

      const attribute = mockDataStore.updateAttribute(categoryId, attributeId, body);
      const response: AttributeResponse = {
        success: true,
        data: attribute
      };

      return HttpResponse.json(response);
    } catch (error: any) {
      let code = ErrorCode.INVALID_REQUEST;
      let message = '更新属性失败';

      if (error.message === '类目属性模板不存在' || error.message === '属性不存在') {
        code = ErrorCode.ATTRIBUTE_NOT_FOUND;
        message = error.message;
      } else if (error.message === '属性名称已存在') {
        code = ErrorCode.ATTRIBUTE_NAME_EXISTS;
        message = error.message;
      }

      const response = createErrorResponse(code, message);
      return HttpResponse.json(response, { status: 400 });
    }
  }),

  // 删除属性
  http.delete('/api/categories/:categoryId/attributes/:attributeId', async ({ params }) => {
    await delay(400);
    try {
      const categoryId = params.categoryId as string;
      const attributeId = params.attributeId as string;

      mockDataStore.deleteAttribute(categoryId, attributeId);
      const response: SuccessResponse = {
        success: true,
        message: '属性删除成功'
      };

      return HttpResponse.json(response);
    } catch (error: any) {
      let code = ErrorCode.INVALID_REQUEST;
      let message = '删除属性失败';

      if (error.message === '类目属性模板不存在' || error.message === '属性不存在') {
        code = ErrorCode.ATTRIBUTE_NOT_FOUND;
        message = error.message;
      } else if (error.message === '属性已被SPU使用，无法删除') {
        code = ErrorCode.ATTRIBUTE_IN_USE;
        message = error.message;
      }

      const response = createErrorResponse(code, message);
      return HttpResponse.json(response, { status: 400 });
    }
  })
];

export default categoryHandlers;

