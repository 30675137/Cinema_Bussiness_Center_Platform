/**
 * 状态管理统一导出
 *
 * 这个文件统一导出所有Zustand stores，方便其他模块导入使用
 */

// 应用全局状态 Store
export {
  useAppStore,
  useAppUser,
  useAppTheme,
  useAppLayout,
  useAppLoading,
  useAppErrors,
  useAppActions,
} from './appStore';
export type {
  AppState,
  AppActions,
  AppStore,
} from './appStore';

// 产品管理状态 Store
export {
  useProductStore,
  useProducts,
  useProductCategories,
  useSelectedProduct,
  useProductFilters,
  useProductPagination,
  useProductLoading,
  useProductErrors,
  useProductEditing,
  useProductActions,
} from './productStore';
export type {
  Product,
  ProductCategory,
  ProductFilters,
  ProductState,
  ProductActions,
  ProductStore,
} from './productStore';

/**
 * Store 开发工具配置
 */
export const storeDevTools = {
  // 是否启用开发者工具
  enabled: process.env.NODE_ENV === 'development',

  // Store 名称映射
  names: {
    app: 'app-store',
    product: 'product-store',
  } as const,

  // 连接所有 Store 用于全局状态管理
  connectAll: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🗄️  Zustand stores connected');
      console.log('Available stores:', Object.keys(storeDevTools.names));
    }
  },
};

/**
 * 状态持久化配置
 */
export const persistConfig = {
  // 需要持久化的 Store 配置
  stores: {
    app: {
      name: 'cinema-app-store',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // 从版本 0 迁移到版本 1 的逻辑
          return persistedState;
        }
        return persistedState;
      },
    },
  },
};

/**
 * Store 预设配置
 */
export const storePresets = {
  // 产品筛选预设
  productFilters: {
    all: {},
    active: { status: 'active' as const },
    inactive: { status: 'inactive' as const },
    lowStock: { stockRange: [0, 10] as [number, number] },
    outOfStock: { stockRange: [0, 0] as [number, number] },
  },

  // 分页预设
  pagination: {
    small: { current: 1, pageSize: 10 },
    medium: { current: 1, pageSize: 20 },
    large: { current: 1, pageSize: 50 },
  },

  // 主题预设
  themes: {
    light: {
      mode: 'light' as const,
      primaryColor: '#1890ff',
      sidebarBgColor: '#001529',
      headerBgColor: '#ffffff',
    },
    dark: {
      mode: 'dark' as const,
      primaryColor: '#1890ff',
      sidebarBgColor: '#001529',
      headerBgColor: '#001529',
    },
    blue: {
      mode: 'light' as const,
      primaryColor: '#1890ff',
      sidebarBgColor: '#0050b3',
      headerBgColor: '#f0f2f5',
    },
  },
};

/**
 * 状态管理工具函数
 */
export const storeUtils = {
  /**
   * 获取所有 Store 的当前状态（开发时使用）
   */
  getAllStates: () => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('getAllStates is only available in development mode');
      return null;
    }

    // 这里需要在实际使用时动态获取
    return {
      app: 'use useAppStore() to get app state',
      product: 'use useProductStore() to get product state',
    };
  },

  /**
   * 重置所有 Store 状态
   */
  resetAllStores: () => {
    // 在实际使用时需要导入并调用各个 store 的 reset 方法
    console.log('All stores reset requested');
  },

  /**
   * 清除所有持久化数据
   */
  clearPersistedData: () => {
    Object.keys(persistConfig.stores).forEach((storeName) => {
      localStorage.removeItem(`cinema-${storeName}-store`);
    });
    console.log('All persisted data cleared');
  },

  /**
   * 导出状态数据
   */
  exportState: () => {
    const data: Record<string, any> = {};
    Object.keys(persistConfig.stores).forEach((storeName) => {
      const storeData = localStorage.getItem(`cinema-${storeName}-store`);
      if (storeData) {
        try {
          data[storeName] = JSON.parse(storeData);
        } catch (error) {
          console.warn(`Failed to parse ${storeName} store data`);
        }
      }
    });
    return data;
  },

  /**
   * 导入状态数据
   */
  importState: (data: Record<string, any>) => {
    Object.keys(data).forEach((storeName) => {
      if (persistConfig.stores[storeName as keyof typeof persistConfig.stores]) {
        try {
          localStorage.setItem(`cinema-${storeName}-store`, JSON.stringify(data[storeName]));
        } catch (error) {
          console.warn(`Failed to import ${storeName} store data`);
        }
      }
    });
    console.log('State data imported');
  },
};

// 在开发环境中自动连接 stores
if (process.env.NODE_ENV === 'development') {
  storeDevTools.connectAll();
}

export default {
  // Stores
  useAppStore,
  useProductStore,

  // Types
  AppState,
  AppActions,
  AppStore,
  ProductState,
  ProductActions,
  ProductStore,

  // Utilities
  storeDevTools,
  persistConfig,
  storePresets,
  storeUtils,
};