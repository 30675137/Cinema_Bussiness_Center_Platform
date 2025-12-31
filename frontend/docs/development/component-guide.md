# 组件开发指南

## 概述

本文档详细说明了商品管理中台前端系统的组件开发规范、设计原则和最佳实践，帮助开发人员创建高质量、可复用的React组件。

## 组件开发基础

### 1. 组件类型分类

根据功能和复杂度，我们将组件分为以下类型：

#### 展示组件（Presentational Components）

```typescript
// 纯展示组件，只负责UI渲染
interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
}) => {
  return (
    <Card className={className}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>¥{product.price}</p>
    </Card>
  );
};
```

#### 容器组件（Container Components）

```typescript
// 处理业务逻辑和状态管理
interface ProductListContainerProps {
  categoryId?: string;
}

export const ProductListContainer: React.FC<ProductListContainerProps> = ({
  categoryId,
}) => {
  const { products, loading, error } = useProductList({ categoryId });
  const [selectedProductId, setSelectedProductId] = useState<string>();

  const handleProductSelect = useCallback((productId: string) => {
    setSelectedProductId(productId);
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ProductList
      products={products}
      selectedProductId={selectedProductId}
      onProductSelect={handleProductSelect}
    />
  );
};
```

#### 布局组件（Layout Components）

```typescript
// 页面布局组件
interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebar,
}) => {
  return (
    <div className="main-layout">
      <Header />
      <div className="main-content">
        {sidebar && <aside className="sidebar">{sidebar}</aside>}
        <main className="content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};
```

### 2. 组件创建模板

#### 基础组件模板

```typescript
// ProductCard/index.tsx
import React from 'react';
import { Card, Image, Tag, Button, Space } from 'antd';
import type { Product } from '@/types/product';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  selected?: boolean;
  loading?: boolean;
  className?: string;
  testId?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onEdit,
  onDelete,
  selected = false,
  loading = false,
  className,
  testId = 'product-card',
}) => {
  // 事件处理函数
  const handleSelect = useCallback(() => {
    onSelect?.(product);
  }, [product, onSelect]);

  const handleEdit = useCallback(() => {
    onEdit?.(product);
  }, [product, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete?.(product.id);
  }, [product.id, onDelete]);

  // 渲染函数
  const renderActions = () => (
    <Space>
      <Button size="small" onClick={handleSelect}>
        查看
      </Button>
      <Button size="small" onClick={handleEdit}>
        编辑
      </Button>
      <Button
        size="small"
        danger
        onClick={handleDelete}
        loading={loading}
      >
        删除
      </Button>
    </Space>
  );

  const renderStatus = () => (
    <Tag color={getStatusColor(product.status)}>
      {getStatusText(product.status)}
    </Tag>
  );

  return (
    <Card
      className={`${styles.productCard} ${selected ? styles.selected : ''} ${className || ''}`}
      data-testid={testId}
      data-product-id={product.id}
      hoverable
      cover={
        <Image
          src={product.images[0]?.url}
          alt={product.name}
          fallback="/images/placeholder.png"
          preview={false}
          className={styles.productImage}
        />
      }
      actions={onEdit || onDelete ? renderActions() : undefined}
      onClick={onSelect ? handleSelect : undefined}
    >
      <Card.Meta
        title={
          <div className={styles.productTitle}>
            <span title={product.name}>{product.name}</span>
            {renderStatus()}
          </div>
        }
        description={
          <div className={styles.productDescription}>
            <p title={product.description}>{product.description}</p>
            <div className={styles.productMeta}>
              <span className={styles.price}>¥{product.basePrice}</span>
              <span className={styles.sku}>SKU: {product.skuId}</span>
            </div>
          </div>
        }
      />
    </Card>
  );
};

// 默认导出
export default ProductCard;

// 辅助函数
const getStatusColor = (status: ProductStatus): string => {
  const colorMap: Record<ProductStatus, string> = {
    active: 'success',
    inactive: 'default',
    draft: 'warning',
  };
  return colorMap[status] || 'default';
};

const getStatusText = (status: ProductStatus): string => {
  const textMap: Record<ProductStatus, string> = {
    active: '已发布',
    inactive: '已下架',
    draft: '草稿',
  };
  return textMap[status] || status;
};
```

#### 样式文件模板

```css
/* ProductCard.module.css */
.productCard {
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.productCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.productCard.selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.productImage {
  height: 200px;
  object-fit: cover;
}

.productTitle {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.productTitle span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.productDescription {
  height: 60px;
  overflow: hidden;
}

.productDescription p {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.productMeta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.price {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 16px;
}

.sku {
  color: var(--text-color-secondary);
  font-size: 12px;
}
```

#### 类型定义文件

```typescript
// ProductCard/types.ts
import type { Product } from '@/types/product';

export interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  selected?: boolean;
  loading?: boolean;
  className?: string;
  testId?: string;
}

export interface ProductCardRef {
  focus: () => void;
  click: () => void;
}
```

#### 测试文件模板

```typescript
// ProductCard/ProductCard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './index';
import type { Product } from '@/types/product';

const mockProduct: Product = {
  id: '1',
  name: '测试商品',
  description: '这是一个测试商品的描述',
  basePrice: 99.99,
  status: 'active',
  categoryId: 'cat1',
  materialType: 'finished_goods',
  skuId: 'SKU001',
  images: [
    {
      id: 'img1',
      url: 'https://example.com/image.jpg',
      alt: '测试商品图片',
      sortOrder: 1,
      type: 'main',
    },
  ],
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
    jest.clearAllMocks();
  });

  it('应该正确渲染商品信息', () => {
    render(<ProductCard {...defaultProps} />);

    expect(screen.getByText('测试商品')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试商品的描述')).toBeInTheDocument();
    expect(screen.getByText('¥99.99')).toBeInTheDocument();
    expect(screen.getByText('SKU: SKU001')).toBeInTheDocument();
    expect(screen.getByText('已发布')).toBeInTheDocument();
  });

  it('应该在点击时调用onSelect回调', async () => {
    const mockOnSelect = jest.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        {...defaultProps}
        onSelect={mockOnSelect}
      />
    );

    await user.click(screen.getByTestId('product-card'));

    expect(mockOnSelect).toHaveBeenCalledWith(mockProduct);
  });

  it('应该正确渲染操作按钮', () => {
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();

    render(
      <ProductCard
        {...defaultProps}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: '查看' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '编辑' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument();
  });

  it('应该在选中状态时应用正确的样式', () => {
    render(<ProductCard {...defaultProps} selected />);

    const card = screen.getByTestId('product-card');
    expect(card).toHaveClass('selected');
  });

  it('应该正确处理加载状态', () => {
    render(
      <ProductCard
        {...defaultProps}
        onDelete={jest.fn()}
        loading={true}
      />
    );

    const deleteButton = screen.getByRole('button', { name: '删除' });
    expect(deleteButton).toBeDisabled();
  });

  it('应该使用自定义testId', () => {
    render(<ProductCard {...defaultProps} testId="custom-product-card" />);

    expect(screen.getByTestId('custom-product-card')).toBeInTheDocument();
  });
});
```

### 3. 组件组合模式

#### 高阶组件（HOC）

```typescript
// withLoading.tsx
interface WithLoadingProps {
  loading?: boolean;
}

export const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WithLoadingComponent = (props: P & WithLoadingProps) => {
    const { loading, ...restProps } = props;

    if (loading) {
      return <Skeleton active />;
    }

    return <Component {...(restProps as P)} />;
  };

  WithLoadingComponent.displayName = `withLoading(${
    Component.displayName || Component.name
  })`;

  return WithLoadingComponent;
};

// 使用示例
const ProductCardWithLoading = withLoading(ProductCard);
```

#### 自定义Hook增强

```typescript
// useProductCard.ts
export const useProductCard = (product: Product) => {
  const [loading, setLoading] = useState(false);
  const { showMessage } = useNotification();

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true);
      await productService.deleteProduct(product.id);
      showMessage('success', '商品删除成功');
    } catch (error) {
      showMessage('error', '商品删除失败');
    } finally {
      setLoading(false);
    }
  }, [product.id, showMessage]);

  const handleEdit = useCallback(() => {
    // 跳转到编辑页面
    router.push(`/products/${product.id}/edit`);
  }, [product.id]);

  return {
    loading,
    handleDelete,
    handleEdit,
  };
};
```

#### Render Props模式

```typescript
// DataProvider.tsx
interface DataProviderProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
  }) => React.ReactNode;
}

export function DataProvider<T>({
  url,
  children,
}: DataProviderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get<T>(url);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {children({
        data,
        loading,
        error,
        refetch: fetchData,
      })}
    </>
  );
}

// 使用示例
const ProductList = () => {
  return (
    <DataProvider<Product[]> url="/products">
      {({ data, loading, error, refetch }) => (
        <div>
          {loading && <Loading />}
          {error && <ErrorMessage message={error} onRetry={refetch} />}
          {data && (
            <div>
              {data.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </DataProvider>
  );
};
```

## 组件状态管理

### 1. 本地状态管理

```typescript
// useState最佳实践
const ProductForm = () => {
  // 状态分组
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 状态更新函数
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  return (
    // 组件内容
  );
};
```

### 2. 使用useReducer管理复杂状态

```typescript
// 复杂表单状态管理
type FormAction =
  | { type: 'SET_FIELD'; field: string; value: any }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'TOUCH_FIELD'; field: string }
  | { type: 'RESET_FORM' }
  | { type: 'SET_LOADING'; loading: boolean };

interface FormState {
  data: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  loading: boolean;
  dirty: boolean;
}

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
        dirty: true,
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };

    case 'TOUCH_FIELD':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };

    case 'RESET_FORM':
      return {
        ...initialState,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading,
      };

    default:
      return state;
  }
};

const useProductForm = (initialData: Partial<Product> = {}) => {
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    data: initialData,
  });

  const setField = useCallback((field: string, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
    dispatch({ type: 'TOUCH_FIELD', field });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  return {
    ...state,
    setField,
    setErrors,
    resetForm,
    dispatch,
  };
};
```

### 3. Context状态共享

```typescript
// ProductContext.tsx
interface ProductContextType {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  selectProduct: (product: Product) => void;
  clearSelection: () => void;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts();
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取商品列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const value: ProductContextType = {
    products,
    selectedProduct,
    loading,
    error,
    selectProduct,
    clearSelection,
    refreshProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within ProductProvider');
  }
  return context;
};
```

## 组件优化技巧

### 1. 渲染优化

```typescript
// React.memo优化
export const ProductCard = React.memo<ProductCardProps>(
  ({ product, onSelect, selected, ...props }) => {
    // 组件实现
  },
  (prevProps, nextProps) => {
    // 自定义比较函数
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.updatedAt === nextProps.product.updatedAt &&
      prevProps.selected === nextProps.selected &&
      prevProps.onSelect === nextProps.onSelect
    );
  }
);

// useMemo优化计算
const ProductList = ({ products, filters }: ProductListProps) => {
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.categoryId && product.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters.keyword && !product.name.includes(filters.keyword)) {
        return false;
      }
      if (filters.status && product.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [products, filters]);

  // useCallback优化事件处理
  const handleProductSelect = useCallback((productId: string) => {
    // 处理逻辑
  }, []);

  return (
    <div>
      {filteredProducts.map(product => (
        <ProductItem
          key={product.id}
          product={product}
          onSelect={handleProductSelect}
        />
      ))}
    </div>
  );
};
```

### 2. 虚拟化长列表

```typescript
// 使用react-window优化大列表
import { FixedSizeList as List } from 'react-window';
import { ProductItem } from './ProductItem';

interface VirtualProductListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const VirtualProductList: React.FC<VirtualProductListProps> = ({
  products,
  onProductSelect,
}) => {
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        <ProductItem
          product={products[index]}
          onSelect={onProductSelect}
        />
      </div>
    ),
    [products, onProductSelect]
  );

  return (
    <List
      height={600}
      itemCount={products.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 3. 懒加载和代码分割

```typescript
// 动态导入组件
const ProductChart = lazy(() => import('./ProductChart'));
const ProductForm = lazy(() => import('./ProductForm'));

const ProductDetail: React.FC = () => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h2>商品详情</h2>

      <Suspense fallback={<Loading />}>
        <ProductForm />
      </Suspense>

      {showChart && (
        <Suspense fallback={<Loading />}>
          <ProductChart />
        </Suspense>
      )}

      <Button onClick={() => setShowChart(true)}>
        显示图表
      </Button>
    </div>
  );
};
```

## 组件可访问性（A11y）

### 1. 基础可访问性

```typescript
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const handleClick = () => {
    onSelect?.(product);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`商品: ${product.name}, 价格: ¥${product.price}`}
      aria-describedby={`product-${product.id}-status`}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      className="product-card"
    >
      <img
        src={product.image}
        alt={product.name}
        aria-hidden="true"
      />
      <h3>{product.name}</h3>
      <p id={`product-${product.id}-status`}>
        状态: {getStatusText(product.status)}
      </p>
      <p aria-label={`价格: ${product.price}元`}>
        ¥{product.price}
      </p>
    </div>
  );
};
```

### 2. 表单可访问性

```typescript
const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
  });

  return (
    <form aria-labelledby="product-form-title">
      <h2 id="product-form-title">商品信息</h2>

      <FormField>
        <Label htmlFor="product-name" required>
          商品名称
        </Label>
        <Input
          id="product-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          aria-required="true"
          aria-describedby="product-name-help"
        />
        <HelpText id="product-name-help">
          请输入商品的完整名称，最多100个字符
        </HelpText>
      </FormField>

      <FormField>
        <Label htmlFor="product-price" required>
          商品价格
        </Label>
        <Input
          id="product-price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          aria-required="true"
          aria-describedby="product-price-error"
        />
        {error && (
          <ErrorMessage id="product-price-error" role="alert">
            {error}
          </ErrorMessage>
        )}
      </FormField>

      <Button type="submit" aria-describedby="submit-help">
        保存商品
      </Button>
      <HelpText id="submit-help">
        点击保存按钮将创建新的商品
      </HelpText>
    </form>
  );
};
```

## 组件测试策略

### 1. 测试金字塔

```typescript
// 单元测试 - 测试组件的独立功能
describe('ProductCard', () => {
  it('应该渲染正确的商品信息', () => {
    // 测试基础渲染
  });

  it('应该在点击时调用回调函数', () => {
    // 测试交互行为
  });

  it('应该正确处理不同的商品状态', () => {
    // 测试状态渲染
  });
});

// 集成测试 - 测试组件间的协作
describe('ProductList Integration', () => {
  it('应该正确显示商品列表', () => {
    // 测试列表组件和数据流的协作
  });

  it('应该正确处理商品选择', () => {
    // 测试组件间的状态同步
  });
});

// 端到端测试 - 测试完整用户流程
describe('Product Management E2E', () => {
  it('应该能够创建并查看商品', () => {
    // 测试完整的业务流程
  });
});
```

### 2. 测试工具选择

```typescript
// 使用React Testing Library进行组件测试
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';

// 使用MSW进行API模拟
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/products/:id', (req, res, ctx) => {
    return res(ctx.json({ id: '1', name: '测试商品' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 使用Storybook进行组件文档和测试
export default {
  title: 'Components/ProductCard',
  component: ProductCard,
};

export const Default = {
  args: {
    product: mockProduct,
  },
};

export const Selected = {
  args: {
    product: mockProduct,
    selected: true,
  },
};
```

## 组件文档化

### 1. JSDoc注释

````typescript
/**
 * 商品卡片组件
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={product}
 *   onSelect={handleSelect}
 *   onEdit={handleEdit}
 *   selected={false}
 * />
 * ```
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onEdit,
  onDelete,
  selected = false,
  loading = false,
  className,
  testId = 'product-card',
}) => {
  // 组件实现
};

/**
 * 商品卡片组件属性
 */
export interface ProductCardProps {
  /** 商品数据对象 */
  product: Product;
  /** 商品选择回调函数 */
  onSelect?: (product: Product) => void;
  /** 商品编辑回调函数 */
  onEdit?: (product: Product) => void;
  /** 商品删除回调函数 */
  onDelete?: (productId: string) => void;
  /** 是否选中状态 */
  selected?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 自定义CSS类名 */
  className?: string;
  /** 测试ID，用于测试定位 */
  testId?: string;
}
````

### 2. Storybook文档

```typescript
// ProductCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import { mockProduct } from '@/mocks/product';

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '商品卡片组件，用于展示商品的基本信息和操作按钮。',
      },
    },
  },
  argTypes: {
    product: {
      description: '商品数据对象',
      control: 'object',
    },
    onSelect: {
      description: '商品选择回调函数',
      action: 'selected',
    },
    onEdit: {
      description: '商品编辑回调函数',
      action: 'edited',
    },
    onDelete: {
      description: '商品删除回调函数',
      action: 'deleted',
    },
    selected: {
      description: '是否选中状态',
      control: 'boolean',
    },
    loading: {
      description: '加载状态',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 默认状态
export const Default: Story = {
  args: {
    product: mockProduct,
  },
};

// 选中状态
export const Selected: Story = {
  args: {
    product: mockProduct,
    selected: true,
  },
};

// 加载状态
export const Loading: Story = {
  args: {
    product: mockProduct,
    loading: true,
  },
};

// 无图片状态
export const NoImage: Story = {
  args: {
    product: {
      ...mockProduct,
      images: [],
    },
  },
};
```

## 最佳实践总结

### 1. 组件设计原则

- **单一职责**: 每个组件只负责一个明确的功能
- **可复用性**: 通过props配置不同的行为和外观
- **可测试性**: 组件逻辑清晰，易于单元测试
- **可维护性**: 代码结构清晰，文档完善

### 2. 性能优化原则

- **避免不必要的重渲染**
- **使用React.memo进行组件缓存**
- **合理使用useMemo和useCallback**
- **对大列表使用虚拟化技术**

### 3. 可访问性原则

- **提供语义化HTML结构**
- **支持键盘导航**
- **提供适当的ARIA属性**
- **确保颜色对比度符合标准**

### 4. 测试原则

- **编写全面的单元测试**
- **关注用户行为测试**
- **使用可访问性测试工具**
- **保持高测试覆盖率**

通过遵循这些组件开发指南，我们可以创建出高质量、可维护、用户友好的React组件。
