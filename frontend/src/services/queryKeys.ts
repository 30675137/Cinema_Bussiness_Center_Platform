/**
 * TanStack Query v5 查询键管理
 * 遵循项目宪章中的TanStack Query v5使用规范
 * 使用QueryKeyFactory模式确保查询键的一致性和可维护性
 */

// QueryKeyFactory 基础类
export class QueryKeyFactory {
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  // 获取所有查询键
  all(): readonly any[] {
    return [this.prefix];
  }

  // 获取详情查询键
  detail(id: string): readonly any[] {
    return [this.prefix, 'detail', id];
  }

  // 获取列表查询键
  list(params?: Record<string, any>): readonly any[] {
    return params ? [this.prefix, 'list', params] : [this.prefix, 'list'];
  }

  // 获取分页查询键
  paginated(page: number, pageSize: number, filters?: Record<string, any>): readonly any[] {
    return [this.prefix, 'paginated', page, pageSize, filters];
  }

  // 获取搜索查询键
  search(keyword: string, filters?: Record<string, any>): readonly any[] {
    return [this.prefix, 'search', keyword, filters];
  }

  // 获取树结构查询键
  tree(): readonly any[] {
    return [this.prefix, 'tree'];
  }

  // 获取子类目查询键
  children(parentId: string): readonly any[] {
    return [this.prefix, 'children', parentId];
  }

  // 自定义查询键
  custom(...args: any[]): readonly any[] {
    return [this.prefix, ...args];
  }
}

// 类目相关查询键
export const categoryKeys = new QueryKeyFactory('categories') as {
  all: () => readonly string[];
  detail: (id: string) => readonly string[];
  list: (params?: Record<string, any>) => readonly string[];
  paginated: (page: number, pageSize: number, filters?: Record<string, any>) => readonly string[];
  search: (keyword: string, filters?: Record<string, any>) => readonly string[];
  tree: () => readonly string[];
  children: (parentId: string) => readonly string[];
  custom: (...args: any[]) => readonly string[];
} as QueryKeyFactory;

// 属性模板相关查询键
export const attributeTemplateKeys = new QueryKeyFactory('attributeTemplates') as {
  all: () => readonly string[];
  detail: (categoryId: string) => readonly string[];
  byCategory: (categoryId: string) => readonly string[];
  custom: (...args: any[]) => readonly string[];
} as QueryKeyFactory;

// SKU相关查询键
export const skuKeys = {
  skus: () => ['skus'] as const,
  sku: (id: string) => ['skus', 'detail', id] as const,
  skusPaginated: (page: number, pageSize: number, filters?: Record<string, any>) => 
    ['skus', 'paginated', page, pageSize, filters] as const,
  spus: () => ['skus', 'spus'] as const,
  units: () => ['skus', 'units'] as const,
  custom: (...args: any[]) => ['skus', ...args] as const,
};

// SPU相关查询键（用于检查使用情况）
export const spuKeys = new QueryKeyFactory('spus') as {
  all: () => readonly string[];
  byCategory: (categoryId: string) => readonly string[];
  checkUsage: (categoryId: string) => readonly string[];
  custom: (...args: any[]) => readonly string[];
} as QueryKeyFactory;

// 查询键清理工具函数
export const cleanQueryParams = (params: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

// 查询键序列化工具函数
export const serializeQueryKey = (queryKey: readonly any[]): string => {
  return JSON.stringify(queryKey);
};

// 查询键比较工具函数
export const isQueryKeyEqual = (key1: readonly any[], key2: readonly any[]): boolean => {
  if (key1.length !== key2.length) return false;
  return key1.every((value, index) => value === key2[index]);
};

// 常用查询键组合
export const commonQueryKeys = {
  // 刷新所有相关查询
  invalidateAll: () => [
    ...categoryKeys.all(),
    ...attributeTemplateKeys.all(),
    ...spuKeys.all(),
  ],

  // 刷新类目相关查询
  invalidateCategories: () => [
    ...categoryKeys.all(),
    ...attributeTemplateKeys.all(),
  ],

  // 刷新特定类目的所有相关查询
  invalidateCategory: (categoryId: string) => [
    categoryKeys.detail(categoryId),
    attributeTemplateKeys.detail(categoryId),
    attributeTemplateKeys.byCategory(categoryId),
    spuKeys.byCategory(categoryId),
    spuKeys.checkUsage(categoryId),
  ],
};

export default categoryKeys;