/**
 * 查询键工厂
 *
 * 统一管理所有 TanStack Query 的查询键，确保查询键的一致性和可维护性
 */

/**
 * 基础查询键类
 */
export class QueryKeyFactory {
  constructor(protected readonly baseKey: string) {}

  /**
   * 基础查询键
   */
  base(): string[] {
    return [this.baseKey];
  }

  /**
   * 所有数据查询键
   */
  all(): string[] {
    return [...this.base(), 'all'];
  }

  /**
   * 详情查询键
   */
  detail(id: string | number): string[] {
    return [...this.base(), 'detail', String(id)];
  }

  /**
   * 列表查询键
   */
  list(params?: Record<string, any>): string[] {
    if (params && typeof params === 'object') {
      // 清理 undefined 和 null 值
      const cleanParams = Object.keys(params).reduce((result, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          result[key] = params[key];
        }
        return result;
      }, {} as Record<string, any>);
      if (Object.keys(cleanParams).length > 0) {
        return [...this.base(), 'list', JSON.stringify(cleanParams)];
      }
    }
    return [...this.base(), 'list'];
  }

  /**
   * 分页查询键
   */
  paginated(page: number, pageSize: number, filters?: Record<string, any>): string[] {
    const key = [...this.base(), 'paginated', page, pageSize];
    if (filters && typeof filters === 'object') {
      // 清理 undefined 和 null 值
      const cleanFilters = Object.keys(filters).reduce((result, key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          result[key] = filters[key];
        }
        return result;
      }, {} as Record<string, any>);
      if (Object.keys(cleanFilters).length > 0) {
        key.push(JSON.stringify(cleanFilters));
      }
    }
    return key;
  }

  /**
   * 搜索查询键
   */
  search(query: string, filters?: Record<string, any>): string[] {
    const key = [...this.base(), 'search', query];
    if (filters && typeof filters === 'object') {
      // 清理 undefined 和 null 值
      const cleanFilters = Object.keys(filters).reduce((result, key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          result[key] = filters[key];
        }
        return result;
      }, {} as Record<string, any>);
      if (Object.keys(cleanFilters).length > 0) {
        key.push(JSON.stringify(cleanFilters));
      }
    }
    return key;
  }

  /**
   * 自定义查询键
   */
  custom(...args: (string | number | boolean)[]): string[] {
    return [...this.base(), ...args.map(String)];
  }
}

/**
 * 产品查询键
 */
export const productKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('products');
  }

  // 产品列表
  products(filters?: Record<string, any>) {
    return this.list(filters);
  }

  // 产品详情
  product(id: string | number) {
    return this.detail(id);
  }

  // 产品分页
  productsPaginated(page: number, pageSize: number, filters?: Record<string, any>) {
    return this.paginated(page, pageSize, filters);
  }

  // 产品搜索
  searchProducts(query: string, filters?: Record<string, any>) {
    return this.search(query, filters);
  }

  // 产品分类
  categories() {
    return this.custom('categories');
  }

  // 特定分类的产品
  productsByCategory(categoryId: string, filters?: Record<string, any>) {
    return this.custom('category', categoryId, filters ? JSON.stringify(filters) : null);
  }

  // 低库存产品
  lowStock(threshold?: number) {
    return this.custom('low-stock', threshold ?? 10);
  }

  // 产品统计
  stats() {
    return this.custom('stats');
  }

  // 产品标签
  tags() {
    return this.custom('tags');
  }

  // 产品属性
  attributes(categoryId?: string) {
    return this.custom('attributes', categoryId ?? 'all');
  }
})();

/**
 * 用户查询键
 */
export const userKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('users');
  }

  // 用户列表
  users(filters?: Record<string, any>) {
    return this.list(filters);
  }

  // 用户详情
  user(id: string | number) {
    return this.detail(id);
  }

  // 当前用户信息
  current() {
    return this.custom('current');
  }

  // 用户权限
  permissions(userId: string) {
    return this.custom('permissions', userId);
  }

  // 用户角色
  roles() {
    return this.custom('roles');
  }
})();

/**
 * 订单查询键
 */
export const orderKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('orders');
  }

  // 订单列表
  orders(filters?: Record<string, any>) {
    return this.list(filters);
  }

  // 订单详情
  order(id: string | number) {
    return this.detail(id);
  }

  // 我的订单
  myOrders(filters?: Record<string, any>) {
    return this.custom('my', filters ? JSON.stringify(filters) : null);
  }

  // 订单统计
  stats(period?: 'day' | 'week' | 'month' | 'year') {
    return this.custom('stats', period ?? 'month');
  }
})();

/**
 * 库存查询键
 */
export const inventoryKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('inventory');
  }

  // 库存列表
  inventory(filters?: Record<string, any>) {
    return this.list(filters);
  }

  // 库存详情
  stock(productId: string) {
    return this.detail(productId);
  }

  // 库存变动记录
  movements(productId: string, filters?: Record<string, any>) {
    return this.custom('movements', productId, filters ? JSON.stringify(filters) : null);
  }

  // 库存预警
  alerts() {
    return this.custom('alerts');
  }

  // 库存统计
  stats() {
    return this.custom('stats');
  }
})();

/**
 * 系统查询键
 */
export const systemKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('system');
  }

  // 系统配置
  config() {
    return this.custom('config');
  }

  // 系统状态
  health() {
    return this.custom('health');
  }

  // 应用版本
  version() {
    return this.custom('version');
  }

  // 系统日志
  logs(filters?: Record<string, any>) {
    return this.custom('logs', filters ? JSON.stringify(filters) : null);
  }

  // 系统统计
  stats() {
    return this.custom('stats');
  }
})();

/**
 * 通知查询键
 */
export const notificationKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('notifications');
  }

  // 通知列表
  notifications(filters?: Record<string, any>) {
    return this.list(filters);
  }

  // 未读通知
  unread() {
    return this.custom('unread');
  }

  // 通知计数
  count() {
    return this.custom('count');
  }
})();

/**
 * 文件上传查询键
 */
export const uploadKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('uploads');
  }

  // 上传列表
  uploads(filters?: Record<string, any>) {
    return this.list(filters);
  }

  // 上传详情
  upload(id: string) {
    return this.detail(id);
  }

  // 上传统计
  stats() {
    return this.custom('stats');
  }
})();

/**
 * 报表查询键
 */
export const reportKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('reports');
  }

  // 报表列表
  reports(filters?: Record<string, any>) {
    return this.list(filters);
  }

  // 报表详情
  report(id: string) {
    return this.detail(id);
  }

  // 销售报表
  sales(period: string, filters?: Record<string, any>) {
    return this.custom('sales', period, filters ? JSON.stringify(filters) : null);
  }

  // 库存报表
  inventory(period: string, filters?: Record<string, any>) {
    return this.custom('inventory', period, filters ? JSON.stringify(filters) : null);
  }

  // 财务报表
  finance(period: string, filters?: Record<string, any>) {
    return this.custom('finance', period, filters ? JSON.stringify(filters) : null);
  }
})();

/**
 * SKU查询键
 */
export const skuKeys = new (class extends QueryKeyFactory {
  constructor() {
    super('skus');
  }

  // SKU列表
  skus(filters?: Record<string, any>) {
    return this.list(filters);
  }

  // SKU详情
  sku(id: string | number) {
    return this.detail(id);
  }

  // SKU分页
  skusPaginated(page: number, pageSize: number, filters?: Record<string, any>) {
    return this.paginated(page, pageSize, filters);
  }

  // SKU搜索
  searchSkus(query: string, filters?: Record<string, any>) {
    return this.search(query, filters);
  }

  // SPU列表
  spus() {
    return this.custom('spus');
  }

  // 单位列表
  units() {
    return this.custom('units');
  }
})();

/**
 * 查询键管理器
 */
export const queryKeysManager = {
  /**
   * 获取所有查询键
   */
  all() {
    return {
      products: productKeys,
      users: userKeys,
      orders: orderKeys,
      inventory: inventoryKeys,
      system: systemKeys,
      notifications: notificationKeys,
      uploads: uploadKeys,
      reports: reportKeys,
    };
  },

  /**
   * 清除特定模块的所有缓存
   */
  clearModule(module: keyof ReturnType<typeof queryKeysManager.all>) {
    const keys = queryKeysManager.all();
    return keys[module].all();
  },

  /**
   * 清除所有缓存
   */
  clearAll() {
    const keys = queryKeysManager.all();
    return Object.values(keys).map(key => key.all()).flat();
  },

  /**
   * 根据模式匹配查询键
   */
  match(pattern: string): string[][] {
    const allKeys = queryKeysManager.all();
    const results: string[][] = [];

    Object.values(allKeys).forEach(keyFactory => {
      // 这里可以实现更复杂的匹配逻辑
      if (pattern.includes('products')) {
        results.push(keyFactory.base());
      }
    });

    return results;
  },
};

/**
 * 查询键工具函数
 */
export const queryKeysUtils = {
  /**
   * 创建动态查询键
   */
  createDynamic(base: string, params: Record<string, any>): string[] {
    if (!params || typeof params !== 'object') {
      return [base];
    }
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    return [base, JSON.stringify(sortedParams)];
  },

  /**
   * 序列化查询参数
   */
  serializeParams(params: Record<string, any>): string {
    if (!params || typeof params !== 'object') {
      return JSON.stringify({});
    }
    return JSON.stringify(
      Object.keys(params)
        .sort()
        .reduce((result, key) => {
          if (params[key] !== undefined && params[key] !== null) {
            result[key] = params[key];
          }
          return result;
        }, {} as Record<string, any>)
    );
  },

  /**
   * 比较查询键是否相等
   */
  areEqual(key1: string[], key2: string[]): boolean {
    if (key1.length !== key2.length) return false;
    return key1.every((value, index) => value === key2[index]);
  },

  /**
   * 获取查询键的哈希值
   */
  getHash(key: string[]): string {
    return btoa(key.join(':')).replace(/[^a-zA-Z0-9]/g, '');
  },
};

export default {
  productKeys,
  userKeys,
  orderKeys,
  inventoryKeys,
  systemKeys,
  notificationKeys,
  uploadKeys,
  reportKeys,
  skuKeys,
  queryKeysManager,
  queryKeysUtils,
};