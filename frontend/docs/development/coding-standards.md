# 代码规范指南

## 概述

本文档定义了商品管理中台前端项目的代码规范和最佳实践，所有团队成员都需要遵循这些规范以确保代码质量和一致性。

## 代码风格规范

### 1. TypeScript/JavaScript规范

#### 变量命名

```typescript
// ✅ 正确的命名方式
const userName = 'john_doe'; // camelCase，语义明确
const productList: Product[] = []; // 类型注解，复数形式
const isLoading = false; // 布尔值使用is/has/can前缀
const handleSubmit = () => {}; // 函数使用动词开头
const API_BASE_URL = 'https://api.example.com'; // 常量使用UPPER_SNAKE_CASE

// ❌ 错误的命名方式
const user_name = 'john_doe'; // 应该使用camelCase
const list = []; // 命名不够语义化
const flag = false; // 布尔值命名不够明确
const data = {}; // 过于通用，不够具体
```

#### 类型定义

```typescript
// ✅ 正确的类型定义
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface ProductListProps {
  products: Product[];
  onProductSelect: (productId: string) => void;
  loading?: boolean;
}

type ProductStatus = 'active' | 'inactive' | 'draft';

// 使用泛型提高复用性
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ❌ 错误的类型定义
interface user {
  // 接口名应该使用PascalCase
  id: any; // 避免使用any类型
  name: string;
  email: string;
}
```

#### 函数定义

```typescript
// ✅ 正确的函数定义
// 使用箭头函数和明确的返回类型
const getProductById = async (id: string): Promise<Product> => {
  const response = await apiService.get<Product>(`/products/${id}`);
  return response.data;
};

// 使用函数重载处理不同参数
function createUser(userData: CreateUserRequest): Promise<User>;
function createUser(userData: CreateUserRequest, options: CreateUserOptions): Promise<User>;
function createUser(userData: CreateUserRequest, options?: CreateUserOptions): Promise<User> {
  return userService.create(userData, options);
}

// ❌ 错误的函数定义
function getProduct(id) {
  // 缺少参数类型和返回类型
  return api.get('/products/' + id); // 应该使用模板字符串
}
```

### 2. React组件规范

#### 组件结构

```typescript
// ✅ 正确的组件结构
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Space } from 'antd';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onEdit,
  onDelete,
}) => {
  // 1. 状态定义
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // 2. 副作用
  useEffect(() => {
    // 组件挂载时的副作用
  }, []);

  // 3. 事件处理函数（使用useCallback优化）
  const handleSelect = useCallback(() => {
    onSelect?.(product);
  }, [product, onSelect]);

  const handleEdit = useCallback(() => {
    onEdit?.(product);
  }, [product, onEdit]);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      await onDelete?.(product.id);
    } finally {
      setLoading(false);
    }
  }, [product.id, onDelete]);

  // 4. 渲染函数
  const renderActions = () => (
    <Space>
      <Button type="primary" onClick={handleSelect}>
        查看
      </Button>
      <Button onClick={handleEdit}>
        编辑
      </Button>
      <Button danger onClick={handleDelete} loading={loading}>
        删除
      </Button>
    </Space>
  );

  // 5. 返回JSX
  return (
    <Card
      title={product.name}
      extra={renderActions()}
      className="product-card"
      data-product-id={product.id}
    >
      <div className="product-content">
        <p>{product.description}</p>
        <p className="product-price">¥{product.basePrice}</p>
      </div>
    </Card>
  );
};

export default ProductCard;
```

#### Props类型定义

```typescript
// ✅ 正确的Props类型定义
interface ButtonProps {
  // 基础属性
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';

  // 状态属性
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;

  // 事件属性
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  // 样式属性
  className?: string;
  style?: React.CSSProperties;

  // 扩展属性
  'data-testid'?: string;
}

// 使用泛型的组件Props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyText?: string;
}
```

### 3. Hooks规范

#### 自定义Hook

```typescript
// ✅ 正确的自定义Hook
import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services/productService';
import type { Product, ProductQueryParams } from '@/types/product';

interface UseProductListOptions {
  params?: ProductQueryParams;
  immediate?: boolean;
}

interface UseProductListReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useProductList = (options: UseProductListOptions = {}): UseProductListReturn => {
  const { params = {}, immediate = true } = options;

  // 状态定义
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // 获取数据函数
  const fetchProducts = useCallback(
    async (pageNum: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await productService.getProducts({
          ...params,
          page: pageNum,
        });

        if (pageNum === 1) {
          setProducts(response.data);
        } else {
          setProducts((prev) => [...prev, ...response.data]);
        }

        setTotal(response.pagination.total);
        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取商品列表失败');
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  // 重新获取
  const refetch = useCallback(async () => {
    setPage(1);
    await fetchProducts(1);
  }, [fetchProducts]);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (!loading && products.length < total) {
      await fetchProducts(page + 1);
    }
  }, [loading, products.length, total, page, fetchProducts]);

  // 初始化
  useEffect(() => {
    if (immediate) {
      fetchProducts();
    }
  }, [immediate, fetchProducts]);

  return {
    products,
    loading,
    error,
    total,
    refetch,
    loadMore,
  };
};
```

#### Hook使用规范

```typescript
// ✅ 正确的Hook使用
const ProductList: React.FC = () => {
  // 在组件顶部调用所有Hook
  const {
    products,
    loading,
    error,
    total,
    refetch,
    loadMore,
  } = useProductList({
    params: { status: ['active'] },
    immediate: true,
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 其他Hook
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { user } = useAuth();
  const { showMessage } = useNotification();

  // 事件处理函数
  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  }, []);

  // 条件渲染
  if (loading && products.length === 0) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="product-list">
      {/* 组件内容 */}
    </div>
  );
};

// ❌ 错误的Hook使用
const BadComponent = () => {
  const [count, setCount] = useState(0);

  // ❌ 不要在条件语句中使用Hook
  if (count > 0) {
    const [data, setData] = useState(null); // 错误！
  }

  // ❌ 不要在循环中使用Hook
  for (let i = 0; i < count; i++) {
    const [item, setItem] = useState(null); // 错误！
  }

  // ❌ 不要在嵌套函数中使用Hook
  const handleClick = () => {
    const [loading, setLoading] = useState(false); // 错误！
  };
};
```

### 4. 样式规范

#### CSS/SCSS规范

```scss
// ✅ 正确的CSS变量定义
:root {
  // 主色调
  --primary-color: #1890ff;
  --primary-hover: #40a9ff;
  --primary-active: #096dd9;

  // 中性色
  --text-color: #262626;
  --text-color-secondary: #8c8c8c;
  --border-color: #d9d9d9;
  --background-color: #f5f5f5;

  // 间距
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  // 字体
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
}

// BEM命名规范
.product-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-base);

  &__header {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
  }

  &__title {
    font-size: var(--font-size-lg);
    font-weight: 500;
    color: var(--text-color);
    margin: 0;
  }

  &__content {
    padding: var(--spacing-md);
    flex: 1;
  }

  &__footer {
    padding: var(--spacing-md);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
  }

  // 修饰符
  &--selected {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  &--loading {
    opacity: 0.6;
    pointer-events: none;
  }
}
```

#### CSS Modules

```typescript
// ProductCard.module.css
.container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.header {
  padding: 16px;
  background: #fafafa;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0;
}

// ProductCard.tsx
import styles from './ProductCard.module.css';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{product.name}</h3>
      </div>
    </div>
  );
};
```

#### Styled Components

```typescript
// ✅ 正确的Styled Components使用
import styled from 'styled-components';

interface StyledButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  /* Size variants */
  ${(props) => {
    switch (props.size) {
      case 'small':
        return `
          padding: 8px 12px;
          font-size: 12px;
        `;
      case 'large':
        return `
          padding: 12px 24px;
          font-size: 16px;
        `;
      default:
        return `
          padding: 10px 16px;
          font-size: 14px;
        `;
    }
  }}

  /* Color variants */
  ${(props) => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: transparent;
          color: var(--primary-color);
          border: 1px solid var(--primary-color);

          &:hover {
            background: var(--primary-color);
            color: white;
          }
        `;
      default:
        return `
          background: var(--primary-color);
          color: white;

          &:hover {
            background: var(--primary-hover);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
```

### 5. 文件和目录结构

#### 目录命名

```typescript
// ✅ 正确的目录结构
src/
├── components/           # 通用组件
│   ├── Button/
│   │   ├── index.ts
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.module.css
│   │   └── types.ts
│   └── Input/
├── features/            # 功能模块
│   ├── product-management/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── user-management/
├── hooks/              # 全局Hooks
├── services/           # API服务
├── types/              # 类型定义
├── utils/              # 工具函数
├── constants/          # 常量定义
└── assets/             # 静态资源

// ❌ 错误的目录命名
src/
├── Components/         # 应该使用小写
├── ProductManagement/  # 应该使用kebab-case
├── img/               # 命名不够明确
└── util/              # 应该使用复数形式
```

#### 文件命名

```typescript
// ✅ 正确的文件命名
ProductCard.tsx          # React组件使用PascalCase
useProductList.ts        # Hook使用use前缀和camelCase
productService.ts        # 服务文件使用camelCase + Service后缀
product.types.ts         # 类型文件使用camelCase + .types后缀
constants.ts            # 常量文件使用camelCase
utils.ts                # 工具文件使用camelCase

// 组件相关文件
ProductCard/
├── index.ts             # 导出文件
├── ProductCard.tsx      # 主组件文件
├── ProductCard.test.tsx # 测试文件
├── ProductCard.stories.tsx # Storybook文件
├── ProductCard.module.css # 样式文件
└── types.ts            # 类型定义文件

// ❌ 错误的文件命名
productcard.tsx         # 应该使用PascalCase
productListHook.ts      # Hook应该以use开头
Product_Service.ts      # 不应该使用下划线
productTypes.ts         # 类型文件应该有.types后缀
```

## 错误处理规范

### 1. 错误边界

```typescript
// ✅ 正确的错误边界实现
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // 发送错误报告到监控服务
    this.props.onError?.(error, errorInfo);

    // 发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>出现了一些问题</h2>
          <p>请刷新页面重试，如果问题持续存在，请联系技术支持。</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用示例
const App: React.FC = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 发送错误报告
        reportError(error, errorInfo);
      }}
    >
      <Router>
        <Routes>
          {/* 路由配置 */}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};
```

### 2. 异步错误处理

```typescript
// ✅ 正确的异步错误处理
const useProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProducts();

      // 数据验证
      if (!response.success) {
        throw new Error(response.message || '获取商品列表失败');
      }

      setProducts(response.data);
    } catch (err) {
      // 错误分类处理
      if (err instanceof Error) {
        if (err.message.includes('Network Error')) {
          setError('网络连接失败，请检查网络设置');
        } else if (err.message.includes('401')) {
          setError('登录已过期，请重新登录');
        } else if (err.message.includes('403')) {
          setError('权限不足，请联系管理员');
        } else {
          setError(err.message || '获取商品列表失败');
        }
      } else {
        setError('未知错误，请重试');
      }

      // 错误日志记录
      console.error('Fetch products error:', err);

      // 发送错误报告
      if (process.env.NODE_ENV === 'production') {
        // reportError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, error, fetchProducts };
};
```

## 性能优化规范

### 1. 组件优化

```typescript
// ✅ 正确的组件优化
import React, { memo, useMemo, useCallback } from 'react';

interface ProductListProps {
  products: Product[];
  onProductSelect: (productId: string) => void;
  loading?: boolean;
}

// 使用React.memo优化组件渲染
export const ProductList = memo<ProductListProps>(({
  products,
  onProductSelect,
  loading = false
}) => {
  // 使用useMemo缓存计算结果
  const sortedProducts = useMemo(() => {
    return products.sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // 使用useCallback缓存事件处理函数
  const handleProductSelect = useCallback((productId: string) => {
    onProductSelect(productId);
  }, [onProductSelect]);

  if (loading) {
    return <ProductListSkeleton />;
  }

  return (
    <div className="product-list">
      {sortedProducts.map(product => (
        <ProductItem
          key={product.id}
          product={product}
          onSelect={handleProductSelect}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.products.length === nextProps.products.length &&
    prevProps.products.every((product, index) =>
      product.id === nextProps.products[index]?.id &&
      product.updatedAt === nextProps.products[index]?.updatedAt
    ) &&
    prevProps.onProductSelect === nextProps.onProductSelect
  );
});

ProductList.displayName = 'ProductList';
```

### 2. 数据获取优化

```typescript
// ✅ 正确的数据获取优化
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';

// 使用React Query进行数据缓存和状态管理
export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
    cacheTime: 10 * 60 * 1000, // 10分钟后清除缓存
    refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取
    retry: (failureCount, error) => {
      // 网络错误重试，其他错误不重试
      if (error instanceof Error && error.message.includes('Network Error')) {
        return failureCount < 3;
      }
      return false;
    },
  });
};

// 无限滚动数据获取
export const useInfiniteProducts = (params?: ProductQueryParams) => {
  return useInfiniteQuery({
    queryKey: ['infinite-products', params],
    queryFn: ({ pageParam = 1 }) => productService.getProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.current + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
```

## 测试规范

### 1. 单元测试

```typescript
// ✅ 正确的单元测试写法
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

// Mock数据
const mockProduct: Product = {
  id: '1',
  name: '测试商品',
  description: '这是一个测试商品',
  basePrice: 100,
  status: 'active',
  categoryId: 'cat1',
  materialType: 'finished_goods',
  images: [],
  specifications: [],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  createdBy: 'user1',
  updatedBy: 'user1',
};

describe('ProductCard', () => {
  const defaultProps = {
    product: mockProduct,
  };

  beforeEach(() => {
    // 每个测试前重置mock
    jest.clearAllMocks();
  });

  it('应该正确渲染商品信息', () => {
    render(<ProductCard {...defaultProps} />);

    expect(screen.getByText('测试商品')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试商品')).toBeInTheDocument();
    expect(screen.getByText('¥100')).toBeInTheDocument();
  });

  it('应该在点击商品时调用onSelect回调', async () => {
    const mockOnSelect = jest.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        {...defaultProps}
        onSelect={mockOnSelect}
      />
    );

    await user.click(screen.getByRole('article'));

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockProduct);
  });

  it('应该在加载状态下显示加载指示器', () => {
    render(<ProductCard {...defaultProps} loading />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('应该正确应用选中状态的样式', () => {
    render(<ProductCard {...defaultProps} selected />);

    const card = screen.getByRole('article');
    expect(card).toHaveClass('product-card--selected');
  });

  // 测试边界情况
  it('应该处理空的商品图片', () => {
    const productWithNoImages = {
      ...mockProduct,
      images: [],
    };

    render(<ProductCard product={productWithNoImages} />);

    expect(screen.getByAltText('商品图片')).toBeInTheDocument();
  });

  // 异步操作测试
  it('应该在删除按钮点击时显示确认对话框', async () => {
    const mockOnDelete = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <ProductCard
        {...defaultProps}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /删除/i });
    await user.click(deleteButton);

    expect(screen.getByText('确定删除此商品吗？')).toBeInTheDocument();
  });
});
```

### 2. 集成测试

```typescript
// ✅ 正确的集成测试写法
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductListPage } from './ProductListPage';
import { productService } from '@/services/productService';

// Mock API服务
jest.mock('@/services/productService');
const mockProductService = productService as jest.Mocked<typeof productService>;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ProductListPage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确显示商品列表', async () => {
    const mockProducts = [
      { id: '1', name: '商品1' },
      { id: '2', name: '商品2' },
    ];

    mockProductService.getProducts.mockResolvedValue({
      success: true,
      data: mockProducts,
      pagination: {
        current: 1,
        pageSize: 20,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      message: 'Success',
      timestamp: new Date().toISOString(),
    });

    renderWithQueryClient(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText('商品1')).toBeInTheDocument();
      expect(screen.getByText('商品2')).toBeInTheDocument();
    });
  });

  it('应该处理API错误情况', async () => {
    mockProductService.getProducts.mockRejectedValue(
      new Error('网络连接失败')
    );

    renderWithQueryClient(<ProductListPage />);

    await waitFor(() => {
      expect(screen.getByText(/网络连接失败/)).toBeInTheDocument();
    });
  });
});
```

## Git提交规范

### 1. 提交信息格式

```bash
# 提交信息格式
<type>(<scope>): <subject>

<body>

<footer>
```

### 2. 提交类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构代码
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回滚提交

### 3. 提交示例

```bash
# 新功能提交
feat(product): 添加商品图片上传功能

- 支持拖拽上传
- 添加图片预览
- 限制上传大小和格式

Closes #123

# 修复bug提交
fix(auth): 修复登录token过期不跳转问题

修复用户在token过期时没有自动跳转到登录页面的bug

# 重构提交
refactor(product): 重构商品列表组件性能

- 使用React.memo优化渲染
- 添加虚拟滚动支持
- 优化数据获取逻辑
```

## 代码审查清单

### 1. 代码质量

- [ ] 代码符合TypeScript/JavaScript规范
- [ ] 组件命名语义化，符合命名规范
- [ ] 函数和变量命名清晰明确
- [ ] 没有未使用的导入和变量
- [ ] 没有调试代码（console.log等）

### 2. 功能实现

- [ ] 功能实现符合需求
- [ ] 边界情况处理完善
- [ ] 错误处理机制健全
- [ ] 加载状态处理正确
- [ ] 表单验证逻辑完整

### 3. 性能考虑

- [ ] 避免不必要的重渲染
- [ ] 合理使用memo、useMemo、useCallback
- [ ] 大列表使用虚拟滚动
- [ ] 图片懒加载和优化
- [ ] API调用优化（防抖、节流等）

### 4. 测试覆盖

- [ ] 单元测试覆盖核心逻辑
- [ ] 集成测试覆盖主要流程
- [ ] 边界情况测试
- [ ] 错误场景测试
- [ ] 测试用例命名清晰

### 5. 安全考虑

- [ ] 输入验证和数据清理
- [ ] XSS防护
- [ ] 敏感信息处理
- [ ] 权限检查
- [ ] API安全性

通过遵循这些代码规范，我们可以确保代码质量、提高开发效率、降低维护成本，并构建出高质量的前端应用。
