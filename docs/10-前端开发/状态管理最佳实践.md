# Zustand + TanStack Query 组合架构最佳实践指南

## 概述

本指南基于 React 18 + TypeScript 5.0 + Ant Design 6.x 环境，深入探讨 Zustand 和 TanStack Query 的组合架构模式。这种架构已成为现代 React 应用的主流选择，通过明确的职责分离和强大的功能组合，提供了清晰、可维护的状态管理方案。

## 1. Zustand 和 TanStack Query 的职责划分

### 1.1 核心职责分离

#### Zustand：客户端状态管理
```typescript
// Zustand 负责的状态类型
interface ClientState {
  // UI 状态
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';

  // 表单状态
  formData: Record<string, any>;
  formErrors: Record<string, string>;

  // 交互状态
  selectedItems: string[];
  modalStates: {
    createModalOpen: boolean;
    editModalOpen: boolean;
    deleteModalOpen: boolean;
  };

  // 临时状态
  filters: ProductFilters;
  pagination: PaginationState;
  sortConfig: SortConfig;
}
```

#### TanStack Query：服务器状态管理
```typescript
// TanStack Query 负责的状态类型
interface ServerStateQueries {
  // 产品数据
  products: UseQueryResult<Product[], Error>;
  product: UseQueryResult<Product, Error>;

  // 库存数据
  inventory: UseQueryResult<InventoryItem[], Error>;

  // 定价数据
  pricing: UseQueryResult<PricingPlan[], Error>;

  // 评价数据
  reviews: UseQueryResult<Review[], Error>;
}

interface ServerStateMutations {
  // 变更操作
  createProduct: UseMutationResult<Product, Error, CreateProductData>;
  updateProduct: UseMutationResult<Product, Error, UpdateProductData>;
  deleteProduct: UseMutationResult<void, Error, string>;
}
```

### 1.2 决策矩阵

| 状态类型 | Zustand ✅ | TanStack Query ✅ | 说明 |
|---------|------------|-------------------|------|
| API 数据 | ❌ | ✅ | 来自服务器的数据 |
| 用户界面状态 | ✅ | ❌ | 折叠状态、主题、模态框 |
| 表单输入 | ✅ | ❌ | 未提交的表单数据 |
| 缓存策略 | ❌ | ✅ | 后台刷新、重新获取 |
| 乐观更新 | ❌ | ✅ | 即时 UI 反馈 |
| 全局配置 | ✅ | ❌ | 应用设置、用户偏好 |
| 临时数据 | ✅ | ❌ | 搜索过滤器、分页 |

## 2. 状态管理的数据流模式

### 2.1 数据流向图

```
用户交互 → Zustand Store → UI 组件
                ↓
          TanStack Query
                ↓
            API 服务器
                ↓
          缓存更新 → UI 重新渲染
```

### 2.2 典型数据流实现

#### 产品列表页面示例
```typescript
// 1. Zustand Store - 管理客户端状态
interface ProductListState {
  filters: ProductFilters;
  pagination: PaginationState;
  selectedProductIds: string[];
  isCreateModalOpen: boolean;

  // Actions
  setFilters: (filters: ProductFilters) => void;
  setPagination: (pagination: PaginationState) => void;
  toggleProductSelection: (id: string) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
}

const useProductListStore = create<ProductListState>((set) => ({
  filters: { category: '', status: 'all', search: '' },
  pagination: { current: 1, pageSize: 10 },
  selectedProductIds: [],
  isCreateModalOpen: false,

  setFilters: (filters) => set({ filters }),
  setPagination: (pagination) => set({ pagination }),
  toggleProductSelection: (id) => set((state) => ({
    selectedProductIds: state.selectedProductIds.includes(id)
      ? state.selectedProductIds.filter(productId => productId !== id)
      : [...state.selectedProductIds, id]
  })),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
}));
```

```typescript
// 2. TanStack Query Hooks - 管理服务器状态
const useProductsQuery = () => {
  const { filters, pagination } = useProductListStore();

  return useQuery({
    queryKey: ['products', filters, pagination],
    queryFn: () => productApi.getProducts({ filters, pagination }),
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
  });
};

const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const closeCreateModal = useProductListStore(state => state.closeCreateModal);

  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeCreateModal();
      message.success('产品创建成功');
    },
    onError: (error) => {
      message.error(`创建失败: ${error.message}`);
    },
  });
};
```

### 2.3 高级数据流模式

#### 选择性订阅优化
```typescript
// 避免不必要的重渲染
const ProductFilters = () => {
  const filters = useProductListStore(state => state.filters);
  const setFilters = useProductListStore(state => state.setFilters);

  return (
    <Form layout="inline">
      <Input
        placeholder="搜索产品"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
      <Select
        value={filters.category}
        onChange={(category) => setFilters({ ...filters, category })}
      >
        <Option value="">全部</Option>
        <Option value="electronics">电子产品</Option>
        <Option value="clothing">服装</Option>
      </Select>
    </Form>
  );
};
```

#### 衍生状态模式
```typescript
// 使用 selector 进行衍生状态计算
const useProductListStats = () => {
  return useProductListStore(state => {
    const filteredProducts = state.products?.filter(product =>
      matchesFilters(product, state.filters)
    ) || [];

    return {
      total: filteredProducts.length,
      activeCount: filteredProducts.filter(p => p.status === 'active').length,
      inactiveCount: filteredProducts.filter(p => p.status === 'inactive').length,
    };
  });
};
```

## 3. 组件中的使用模式和最佳实践

### 3.1 容器组件模式 (Container/Presentational Pattern)

```typescript
// 容器组件 - 处理逻辑和数据
const ProductListContainer: React.FC = () => {
  // Zustand 状态
  const { filters, pagination, selectedProductIds } = useProductListStore();

  // TanStack Query 数据
  const { data: products, isLoading, error, refetch } = useProductsQuery();

  // 变更操作
  const deleteMutation = useDeleteProductMutation();

  const handleDelete = useCallback((id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个产品吗？',
      onOk: () => deleteMutation.mutate(id),
    });
  }, [deleteMutation]);

  if (isLoading) return <ProductListSkeleton />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  return (
    <ProductListPresentation
      products={products || []}
      selectedProductIds={selectedProductIds}
      filters={filters}
      pagination={pagination}
      onDelete={handleDelete}
      onRefresh={refetch}
    />
  );
};

// 展示组件 - 纯 UI 逻辑
interface ProductListPresentationProps {
  products: Product[];
  selectedProductIds: string[];
  filters: ProductFilters;
  pagination: PaginationState;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const ProductListPresentation: React.FC<ProductListPresentationProps> = ({
  products,
  selectedProductIds,
  onDelete,
  onRefresh,
}) => {
  const columns = useProductTableColumns({ onDelete });

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h2>产品列表</h2>
        <Button onClick={onRefresh}>刷新</Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        rowSelection={{
          selectedRowKeys: selectedProductIds,
          onChange: useProductListStore.getState().toggleProductSelection,
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: products.length,
          onChange: useProductListStore.getState().setPagination,
        }}
      />
    </div>
  );
};
```

### 3.2 Custom Hook 模式

```typescript
// 自定义 Hook - 封装复杂逻辑
const useProductManagement = () => {
  const queryClient = useQueryClient();
  const {
    filters,
    pagination,
    selectedProductIds,
    setFilters,
    setPagination
  } = useProductListStore();

  // 查询
  const productsQuery = useProductsQuery();

  // 变更
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  // 批量操作
  const batchDelete = useCallback(async () => {
    try {
      await Promise.all(
        selectedProductIds.map(id => productApi.deleteProduct(id))
      );

      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success(`成功删除 ${selectedProductIds.length} 个产品`);
    } catch (error) {
      message.error('批量删除失败');
    }
  }, [selectedProductIds, queryClient]);

  // 搜索和过滤
  const handleSearch = useCallback((searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm });
  }, [filters, setFilters]);

  const handleFilterChange = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters({ ...filters, ...newFilters });
  }, [filters, setFilters]);

  return {
    // 数据
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    selectedCount: selectedProductIds.length,

    // 操作
    refetch: productsQuery.refetch,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    batchDelete,

    // 过滤和搜索
    filters,
    pagination,
    handleSearch,
    handleFilterChange,
    setPagination,
  };
};
```

### 3.3 错误边界模式

```typescript
// 错误边界组件
const QueryErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <Result
          status="error"
          title="数据加载失败"
          subTitle={error.message}
          extra={
            <Button type="primary" onClick={reset}>
              重试
            </Button>
          }
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

// 在路由中使用
const AppRoutes = () => (
  <QueryClientProvider client={queryClient}>
    <QueryErrorBoundary>
      <Routes>
        <Route path="/products" element={<ProductListContainer />} />
        <Route path="/inventory" element={<InventoryListContainer />} />
      </Routes>
    </QueryErrorBoundary>
  </QueryClientProvider>
);
```

## 4. 错误处理和加载状态管理

### 4.1 统一错误处理策略

```typescript
// 全局错误处理
const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Global error:', error);

      // 根据错误类型显示不同的消息
      if (error.name === 'NetworkError') {
        message.error('网络连接失败，请检查网络设置');
      } else if (error.name === 'UnauthorizedError') {
        message.error('登录已过期，请重新登录');
        // 跳转到登录页
      } else {
        message.error(error.message || '操作失败');
      }
    };

    // 监听全局错误
    window.addEventListener('error', (event) => handleError(event.error));

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
};
```

### 4.2 优雅的加载状态

```typescript
// 骨架屏组件
const ProductTableSkeleton: React.FC = () => {
  return (
    <Table
      dataSource={Array.from({ length: 5 }).map((_, index) => ({ key: index }))}
      columns={[
        { title: '产品名称', dataIndex: 'name', render: () => <Skeleton.Input active /> },
        { title: '类别', dataIndex: 'category', render: () => <Skeleton.Input active /> },
        { title: '价格', dataIndex: 'price', render: () => <Skeleton.Input active /> },
        { title: '状态', dataIndex: 'status', render: () => <Skeleton.Input active /> },
        { title: '操作', dataIndex: 'actions', render: () => <Skeleton.Button active /> },
      ]}
      pagination={false}
    />
  );
};

// 加载状态 Hook
const useLoadingStates = () => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState<Record<string, boolean>>({});

  const setLocalLoadingState = useCallback((key: string, loading: boolean) => {
    setLocalLoading(prev => ({ ...prev, [key]: loading }));
  }, []);

  return {
    globalLoading,
    localLoading,
    setGlobalLoading,
    setLocalLoadingState,
  };
};
```

### 4.3 变更操作的乐观更新

```typescript
// 乐观更新示例
const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();

  const updateProduct = useMutation({
    mutationFn: productApi.updateProduct,
    onMutate: async (updatedProduct) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // 保存之前的快照
      const previousProducts = queryClient.getQueryData(['products']);

      // 乐观更新
      queryClient.setQueryData(['products'], (old: Product[] | undefined) =>
        old?.map(product =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

      return { previousProducts };
    },
    onError: (error, updatedProduct, context) => {
      // 如果出错，回滚到之前的状态
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
    },
    onSettled: () => {
      // 无论成功失败，都重新获取数据
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return { updateProduct };
};
```

## 5. TypeScript 类型定义最佳实践

### 5.1 严格的类型定义

```typescript
// 通用类型定义
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  images: string[];
  tags: string[];
}

interface ProductFilters {
  search?: string;
  category?: string;
  status?: Product['status'] | 'all';
  priceRange?: [number, number];
  tags?: string[];
}

interface PaginationState {
  current: number;
  pageSize: number;
  total?: number;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// API 响应类型
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
}

// 错误类型
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

### 5.2 Zustand 类型安全的 Store

```typescript
// 使用泛型创建类型安全的 Store
interface ZustandStore<T> {
  state: T;
  actions: {
    [K in keyof T as T[K] extends Function ? K : never]: T[K];
  };
}

// 创建类型安全的 Zustand Store
const createTypedStore = <S, A extends Record<string, Function>>(
  initialState: S,
  actions: A
) => {
  type Store = S & { [K in keyof A]: A[K] };

  return create<Store>((set, get) => ({
    ...initialState,
    ...Object.fromEntries(
      Object.entries(actions).map(([key, action]) => [
        key,
        (...args: any[]) => action(...args)(set, get)
      ])
    ),
  }));
};

// 使用示例
const useProductStore = createTypedStore(
  {
    products: [] as Product[],
    selectedProductId: null as string | null,
    filters: {} as ProductFilters,
    pagination: { current: 1, pageSize: 10 } as PaginationState,
  },
  {
    setProducts: (products: Product[]) => (set) => set({ products }),
    setSelectedProduct: (id: string | null) => (set) => set({ selectedProductId: id }),
    setFilters: (filters: Partial<ProductFilters>) => (set, get) =>
      set({ filters: { ...get().filters, ...filters } }),
    setPagination: (pagination: Partial<PaginationState>) => (set, get) =>
      set({ pagination: { ...get().pagination, ...pagination } }),
  }
);
```

### 5.3 TanStack Query 类型安全

```typescript
// 类型安全的 Query Key
type QueryKey =
  | ['products']
  | ['products', string] // product id
  | ['products', ProductFilters, PaginationState]
  | ['inventory']
  | ['pricing'];

// 类型安全的 Query 工厂
const createTypedQuery = <
  TKey extends QueryKey,
  TData,
  TError = ApiError
>(
  key: TKey,
  queryFn: (...args: TKey) => Promise<TData>
) => {
  return (...args: TKey) => useQuery({
    queryKey: key,
    queryFn: () => queryFn(...args),
  });
};

// 使用示例
const useProductsQuery = createTypedQuery(
  ['products', ProductFilters, PaginationState],
  (filters, pagination) => productApi.getProducts({ filters, pagination })
);

// 类型安全的 Mutation
const createTypedMutation = <TData, TVariables, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn,
  });
};

const useCreateProductMutation = () =>
  createTypedMutation<Product, Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>(
    productApi.createProduct
  );
```

### 5.4 组件 Props 类型定义

```typescript
// 使用泛型创建可复用的组件 Props
interface DataTableProps<T> {
  data: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  pagination?: TablePaginationConfig;
  rowSelection?: TableRowSelection<T>;
  onRow?: (record: T) => React.HTMLAttributes<HTMLElement>;
  scroll?: { x?: number; y?: number };
}

// 具体的产品表格
const ProductTable: React.FC<DataTableProps<Product>> = ({
  data,
  columns,
  loading,
  pagination,
  rowSelection,
}) => {
  return (
    <Table<Product>
      dataSource={data}
      columns={columns}
      loading={loading}
      pagination={pagination}
      rowSelection={rowSelection}
      rowKey="id"
    />
  );
};
```

## 6. 项目结构最佳实践

### 6.1 目录结构

```
src/
├── components/
│   ├── common/
│   │   ├── DataTable/
│   │   ├── ErrorBoundary/
│   │   └── LoadingSpinner/
│   └── layout/
├── hooks/
│   ├── api/
│   │   ├── useProductsQuery.ts
│   │   └── useInventoryQuery.ts
│   ├── mutations/
│   │   └── useProductMutations.ts
│   └── stores/
│       ├── useProductStore.ts
│       └── useAppStore.ts
├── stores/
│   ├── slices/
│   │   ├── productSlice.ts
│   │   └── appSlice.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── productApi.ts
│   │   └── inventoryApi.ts
│   └── types/
│       ├── api.ts
│       ├── product.ts
│       └── common.ts
├── pages/
│   ├── products/
│   │   ├── components/
│   │   ├── ProductList.tsx
│   │   └── ProductDetail.tsx
│   └── inventory/
└── utils/
    ├── queryKeys.ts
    ├── queryOptions.ts
    └── selectors.ts
```

### 6.2 代码组织模式

```typescript
// services/api/productApi.ts
import { Product, ProductFilters, PaginationState, ApiResponse } from '../types';

export const productApi = {
  getProducts: (params: { filters?: ProductFilters; pagination?: PaginationState }) =>
    request.get<ApiResponse<Product[]>>('/products', { params }),

  getProduct: (id: string) =>
    request.get<ApiResponse<Product>>(`/products/${id}`),

  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    request.post<ApiResponse<Product>>('/products', data),

  updateProduct: (id: string, data: Partial<Product>) =>
    request.put<ApiResponse<Product>>(`/products/${id}`, data),

  deleteProduct: (id: string) =>
    request.delete<ApiResponse<void>>(`/products/${id}`),
};
```

```typescript
// utils/queryKeys.ts
export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productsWithFilters: (filters: ProductFilters, pagination: PaginationState) =>
    ['products', filters, pagination] as const,

  inventory: ['inventory'] as const,
  inventoryItem: (id: string) => ['inventory', id] as const,

  pricing: ['pricing'] as const,
} as const;
```

```typescript
// utils/queryOptions.ts
import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { productApi } from '../services/api/productApi';

export const productQueryOptions = {
  all: () => queryOptions({
    queryKey: queryKeys.products,
    queryFn: () => productApi.getProducts(),
  }),

  byId: (id: string) => queryOptions({
    queryKey: queryKeys.product(id),
    queryFn: () => productApi.getProduct(id),
  }),

  withFilters: (filters: ProductFilters, pagination: PaginationState) => queryOptions({
    queryKey: queryKeys.productsWithFilters(filters, pagination),
    queryFn: () => productApi.getProducts({ filters, pagination }),
  }),
};
```

## 7. 性能优化策略

### 7.1 避免不必要的重渲染

```typescript
// 使用浅比较优化选择器
const shallowCompare = <T>(a: T, b: T): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

// 自定义选择器 Hook
const useShallowSelector = <T, R>(
  selector: (state: T) => R,
  compare: (a: R, b: R) => boolean = shallowCompare
) => {
  const state = useStore();
  return useMemo(() => selector(state), [state, selector, compare]);
};
```

### 7.2 查询优化策略

```typescript
// 智能缓存策略
const useSmartProductsQuery = () => {
  const { filters, pagination } = useProductListStore();

  return useQuery({
    queryKey: ['products', filters, pagination],
    queryFn: () => productApi.getProducts({ filters, pagination }),
    staleTime: getStaleTime(filters), // 根据过滤条件动态调整
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error.status === 404) return false;
      return failureCount < 3;
    },
  });
};

const getStaleTime = (filters: ProductFilters): number => {
  // 搜索结果缓存时间较短
  if (filters.search) return 2 * 60 * 1000;
  // 默认缓存时间
  return 5 * 60 * 1000;
};
```

## 8. 总结

Zustand + TanStack Query 的组合架构提供了现代 React 应用中最优雅和高效的状态管理方案：

### 核心优势

1. **清晰的职责分离** - 客户端状态和服务器状态各司其职
2. **强大的类型安全** - TypeScript 完整支持，编译时错误检测
3. **优秀的开发体验** - 最小化样板代码，直观的 API
4. **自动缓存管理** - TanStack Query 处理复杂的缓存逻辑
5. **高度可组合性** - 易于测试和维护的模块化架构

### 关键实践要点

- 始终保持状态职责的清晰界限
- 利用 TypeScript 确保类型安全
- 实施优雅的错误处理和加载状态
- 优化组件重渲染和查询性能
- 建立一致的项目结构和代码组织

这种架构模式已经在大量生产项目中得到验证，是构建现代 React 应用的理想选择。

---

## 参考资源

- [Zustand 官方文档](https://github.com/pmndrs/zustand)
- [TanStack Query 官方文档](https://tanstack.com/query/latest)
- [Combining Zustand and TanStack Query for State Management](https://blog.logrocket.com/)
- [Separating Client State from Server State](https://tkdodo.eu/)