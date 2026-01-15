# 影院商品管理系统 - Zustand + TanStack Query 实践示例

基于 React 18 + TypeScript 5.0 + Ant Design 6.x 的完整实现。

## 1. 类型定义

```typescript
// types/product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  images: string[];
  tags: string[];
  inventory: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | 'snack'        // 零食
  | 'beverage'     // 饮料
  | 'ticket'       // 票务
  | 'merchandise'  // 周边商品
  | 'service';     // 服务

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface ProductFilters {
  search?: string;
  category?: ProductCategory | 'all';
  status?: ProductStatus | 'all';
  priceRange?: [number, number];
  inStockOnly?: boolean;
  tags?: string[];
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  tags: string[];
  inventory: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: ProductStatus;
}

export interface PaginationState {
  current: number;
  pageSize: number;
  total?: number;
}

export interface SortConfig {
  field: keyof Product;
  direction: 'asc' | 'desc';
}

// types/api.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

## 2. Zustand Store

```typescript
// stores/slices/productSlice.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Product, ProductFilters, PaginationState, SortConfig } from '../types';

interface ProductSlice {
  // State
  filters: ProductFilters;
  pagination: PaginationState;
  sortConfig: SortConfig;
  selectedProductIds: string[];
  viewMode: 'table' | 'grid';
  sidebarCollapsed: boolean;

  // UI State
  isCreateModalOpen: boolean;
  editingProductId: string | null;
  deleteModalIds: string[];

  // Actions
  setFilters: (filters: Partial<ProductFilters>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setSortConfig: (sortConfig: SortConfig) => void;
  toggleProductSelection: (id: string) => void;
  selectAllProducts: (productIds: string[]) => void;
  clearSelection: () => void;
  setViewMode: (mode: 'table' | 'grid') => void;
  toggleSidebar: () => void;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (id: string) => void;
  closeEditModal: () => void;
  openDeleteModal: (ids: string | string[]) => void;
  closeDeleteModal: () => void;

  // Computed getters
  hasSelectedProducts: () => boolean;
  selectedCount: () => number;
  isProductSelected: (id: string) => boolean;
}

export const useProductStore = create<ProductSlice>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        filters: {
          search: '',
          category: 'all',
          status: 'all',
          priceRange: undefined,
          inStockOnly: false,
          tags: [],
        },
        pagination: {
          current: 1,
          pageSize: 10,
        },
        sortConfig: {
          field: 'createdAt',
          direction: 'desc',
        },
        selectedProductIds: [],
        viewMode: 'table',
        sidebarCollapsed: false,
        isCreateModalOpen: false,
        editingProductId: null,
        deleteModalIds: [],

        // Actions
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters };
            state.pagination.current = 1; // Reset pagination when filters change
          }),

        setPagination: (pagination) =>
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          }),

        setSortConfig: (sortConfig) =>
          set((state) => {
            state.sortConfig = sortConfig;
          }),

        toggleProductSelection: (id) =>
          set((state) => {
            const index = state.selectedProductIds.indexOf(id);
            if (index > -1) {
              state.selectedProductIds.splice(index, 1);
            } else {
              state.selectedProductIds.push(id);
            }
          }),

        selectAllProducts: (productIds) =>
          set((state) => {
            state.selectedProductIds = [...productIds];
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedProductIds = [];
          }),

        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          }),

        openCreateModal: () =>
          set((state) => {
            state.isCreateModalOpen = true;
          }),

        closeCreateModal: () =>
          set((state) => {
            state.isCreateModalOpen = false;
          }),

        openEditModal: (id) =>
          set((state) => {
            state.editingProductId = id;
          }),

        closeEditModal: () =>
          set((state) => {
            state.editingProductId = null;
          }),

        openDeleteModal: (ids) =>
          set((state) => {
            state.deleteModalIds = Array.isArray(ids) ? ids : [ids];
          }),

        closeDeleteModal: () =>
          set((state) => {
            state.deleteModalIds = [];
          }),

        // Computed getters
        hasSelectedProducts: () => get().selectedProductIds.length > 0,
        selectedCount: () => get().selectedProductIds.length,
        isProductSelected: (id) => get().selectedProductIds.includes(id),
      })),
      {
        name: 'product-store',
        partialize: (state) => ({
          filters: state.filters,
          pagination: state.pagination,
          sortConfig: state.sortConfig,
          viewMode: state.viewMode,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'product-store' }
  )
);
```

## 3. API 服务

```typescript
// services/api/productApi.ts
import {
  Product,
  ProductFilters,
  PaginationState,
  CreateProductData,
  UpdateProductData,
  ApiResponse
} from '../types';

// 模拟 API 延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟数据
const mockProducts: Product[] = [
  {
    id: '1',
    name: '爆米花套餐',
    description: '经典焦糖味爆米花配可乐',
    price: 25.00,
    category: 'snack',
    status: 'active',
    images: ['/images/popcorn.jpg'],
    tags: ['热销', '套餐'],
    inventory: 100,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  // ... 更多模拟数据
];

export const productApi = {
  getProducts: async (params: {
    filters?: ProductFilters;
    pagination?: PaginationState;
    sort?: SortConfig;
  }) => {
    await delay(800); // 模拟网络延迟

    let filteredProducts = [...mockProducts];

    // Apply filters
    if (params.filters) {
      const { search, category, status, priceRange, inStockOnly, tags } = params.filters;

      if (search) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === category);
      }

      if (status && status !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.status === status);
      }

      if (priceRange) {
        const [min, max] = priceRange;
        filteredProducts = filteredProducts.filter(product =>
          product.price >= min && product.price <= max
        );
      }

      if (inStockOnly) {
        filteredProducts = filteredProducts.filter(product => product.inventory > 0);
      }

      if (tags && tags.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          tags.some(tag => product.tags.includes(tag))
        );
      }
    }

    // Apply sorting
    if (params.sort) {
      const { field, direction } = params.sort;
      filteredProducts.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    // Apply pagination
    const start = ((params.pagination?.current || 1) - 1) * (params.pagination?.pageSize || 10);
    const end = start + (params.pagination?.pageSize || 10);
    const paginatedProducts = filteredProducts.slice(start, end);

    return {
      data: paginatedProducts,
      success: true,
      pagination: {
        current: params.pagination?.current || 1,
        pageSize: params.pagination?.pageSize || 10,
        total: filteredProducts.length,
      },
    };
  },

  getProduct: async (id: string) => {
    await delay(500);
    const product = mockProducts.find(p => p.id === id);

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    return {
      data: product,
      success: true,
    };
  },

  createProduct: async (data: CreateProductData) => {
    await delay(1000);

    const newProduct: Product = {
      id: Date.now().toString(),
      ...data,
      status: 'draft',
      images: data.images || [],
      tags: data.tags || [],
      inventory: data.inventory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProducts.push(newProduct);

    return {
      data: newProduct,
      success: true,
      message: 'Product created successfully',
    };
  },

  updateProduct: async (id: string, data: UpdateProductData) => {
    await delay(1000);

    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: mockProducts[productIndex],
      success: true,
      message: 'Product updated successfully',
    };
  },

  deleteProduct: async (id: string) => {
    await delay(800);

    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    mockProducts.splice(productIndex, 1);

    return {
      data: null,
      success: true,
      message: 'Product deleted successfully',
    };
  },

  batchDeleteProducts: async (ids: string[]) => {
    await delay(1500);

    const deletedCount = ids.filter(id => {
      const index = mockProducts.findIndex(p => p.id === id);
      if (index > -1) {
        mockProducts.splice(index, 1);
        return true;
      }
      return false;
    }).length;

    return {
      data: { deletedCount },
      success: true,
      message: `${deletedCount} products deleted successfully`,
    };
  },
};
```

## 4. TanStack Query Hooks

```typescript
// hooks/api/useProductQueries.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../services/api/productApi';
import { useProductStore } from '../../stores/slices/productSlice';
import { Product, ProductFilters, PaginationState, SortConfig } from '../../types';

export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productStats: ['product-stats'] as const,
} as const;

// Products query hook
export const useProductsQuery = () => {
  const { filters, pagination, sortConfig } = useProductStore();

  return useQuery({
    queryKey: ['products', filters, pagination, sortConfig],
    queryFn: () => productApi.getProducts({ filters, pagination, sort: sortConfig }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    select: (response) => response.data,
    keepPreviousData: true, // Keep previous data while loading new data
  });
};

// Single product query hook
export const useProductQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => productApi.getProduct(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!id,
    select: (response) => response.data,
  });
};

// Product statistics query hook
export const useProductStatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.productStats,
    queryFn: async () => {
      const { data } = await productApi.getProducts({});
      const products = data;

      return {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        inactive: products.filter(p => p.status === 'inactive').length,
        draft: products.filter(p => p.status === 'draft').length,
        lowStock: products.filter(p => p.inventory < 10).length,
        outOfStock: products.filter(p => p.inventory === 0).length,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Prefetch product hook
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.product(id),
      queryFn: () => productApi.getProduct(id),
      staleTime: 2 * 60 * 1000,
    });
  };
};
```

```typescript
// hooks/mutations/useProductMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message, Modal } from 'antd';
import { productApi } from '../../services/api/productApi';
import { queryKeys } from '../api/useProductQueries';
import { useProductStore } from '../../stores/slices/productSlice';
import { CreateProductData, UpdateProductData } from '../../types';

// Create product mutation
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  const closeCreateModal = useProductStore(state => state.closeCreateModal);

  return useMutation({
    mutationFn: (data: CreateProductData) => productApi.createProduct(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.productStats });
      closeCreateModal();
      message.success('产品创建成功');
    },
    onError: (error) => {
      message.error(`创建失败: ${error.message}`);
    },
  });
};

// Update product mutation
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  const closeEditModal = useProductStore(state => state.closeEditModal);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) =>
      productApi.updateProduct(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.setQueryData(
        queryKeys.product(variables.id),
        response
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.productStats });
      closeEditModal();
      message.success('产品更新成功');
    },
    onError: (error) => {
      message.error(`更新失败: ${error.message}`);
    },
  });
};

// Delete product mutation
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  const closeDeleteModal = useProductStore(state => state.closeDeleteModal);

  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.productStats });
      closeDeleteModal();
      message.success('产品删除成功');
    },
    onError: (error) => {
      message.error(`删除失败: ${error.message}`);
    },
  });
};

// Batch delete mutation
export const useBatchDeleteMutation = () => {
  const queryClient = useQueryClient();
  const clearSelection = useProductStore(state => state.clearSelection);
  const closeDeleteModal = useProductStore(state => state.closeDeleteModal);

  return useMutation({
    mutationFn: (ids: string[]) => productApi.batchDeleteProducts(ids),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.productStats });
      clearSelection();
      closeDeleteModal();
      message.success(`成功删除 ${response.data.deletedCount} 个产品`);
    },
    onError: (error) => {
      message.error(`批量删除失败: ${error.message}`);
    },
  });
};

// Change product status mutation
export const useChangeStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' | 'archived' }) =>
      productApi.updateProduct(id, { status }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.setQueryData(
        queryKeys.product(variables.id),
        response
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.productStats });
      message.success(`状态已更新为: ${variables.status}`);
    },
    onError: (error) => {
      message.error(`状态更新失败: ${error.message}`);
    },
  });
};
```

## 5. 组件实现

```typescript
// components/ProductFilters/index.tsx
import React from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Switch } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useProductStore } from '../../stores/slices/productSlice';
import { ProductCategory, ProductStatus } from '../../types';

const { RangePicker } = DatePicker;

export const ProductFilters: React.FC = () => {
  const {
    filters,
    sortConfig,
    setFilters,
    setSortConfig,
  } = useProductStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    setFilters({ category });
  };

  const handleStatusChange = (status: ProductStatus | 'all') => {
    setFilters({ status });
  };

  const handleInStockChange = (inStockOnly: boolean) => {
    setFilters({ inStockOnly });
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-');
    setSortConfig({
      field: field as any,
      direction: direction as 'asc' | 'desc',
    });
  };

  const handleClear = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'all',
      priceRange: undefined,
      inStockOnly: false,
      tags: [],
    });
  };

  return (
    <div className="product-filters p-4 bg-white rounded-lg shadow-sm mb-4">
      <Form layout="inline" className="w-full">
        <Form.Item className="mb-2">
          <Input
            placeholder="搜索产品名称或描述"
            value={filters.search}
            onChange={handleSearchChange}
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
          />
        </Form.Item>

        <Form.Item className="mb-2">
          <Select
            placeholder="产品类别"
            value={filters.category}
            onChange={handleCategoryChange}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="snack">零食</Select.Option>
            <Select.Option value="beverage">饮料</Select.Option>
            <Select.Option value="ticket">票务</Select.Option>
            <Select.Option value="merchandise">周边</Select.Option>
            <Select.Option value="service">服务</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item className="mb-2">
          <Select
            placeholder="状态"
            value={filters.status}
            onChange={handleStatusChange}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="active">上架</Select.Option>
            <Select.Option value="inactive">下架</Select.Option>
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="archived">归档</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item className="mb-2">
          <Select
            placeholder="排序方式"
            value={`${sortConfig.field}-${sortConfig.direction}`}
            onChange={handleSortChange}
            style={{ width: 150 }}
          >
            <Select.Option value="createdAt-desc">创建时间 ↓</Select.Option>
            <Select.Option value="createdAt-asc">创建时间 ↑</Select.Option>
            <Select.Option value="name-asc">名称 A-Z</Select.Option>
            <Select.Option value="name-desc">名称 Z-A</Select.Option>
            <Select.Option value="price-asc">价格 ↑</Select.Option>
            <Select.Option value="price-desc">价格 ↓</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item className="mb-2">
          <Space>
            <Switch
              checked={filters.inStockOnly}
              onChange={handleInStockChange}
              checkedChildren="有库存"
              unCheckedChildren="全部"
            />
          </Space>
        </Form.Item>

        <Form.Item className="mb-2">
          <Button
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={
              !filters.search &&
              filters.category === 'all' &&
              filters.status === 'all' &&
              !filters.inStockOnly
            }
          >
            清空
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
```

```typescript
// components/ProductTable/index.tsx
import React, { useMemo } from 'react';
import { Table, Tag, Button, Space, Image, Dropdown, Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Product, ProductCategory, ProductStatus } from '../../types';
import { useProductStore } from '../../stores/slices/productSlice';
import { usePrefetchProduct } from '../../hooks/api/useProductQueries';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
}

const categoryColors: Record<ProductCategory, string> = {
  snack: 'orange',
  beverage: 'blue',
  ticket: 'green',
  merchandise: 'purple',
  service: 'pink',
};

const statusColors: Record<ProductStatus, string> = {
  active: 'success',
  inactive: 'warning',
  draft: 'default',
  archived: 'error',
};

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  onEdit,
  onView,
}) => {
  const {
    selectedProductIds,
    toggleProductSelection,
    selectAllProducts,
    clearSelection,
  } = useProductStore();

  const prefetchProduct = usePrefetchProduct();

  const columns = useMemo<ColumnsType<Product>>(() => [
    {
      title: '产品图片',
      dataIndex: 'images',
      width: 80,
      render: (images: string[], record) => (
        <Image
          width={60}
          height={60}
          src={images[0] || '/placeholder.png'}
          alt={record.name}
          className="rounded object-cover"
          preview={false}
        />
      ),
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      width: 200,
      render: (name: string, record) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500 truncate max-w-[180px]">
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      width: 100,
      render: (category: ProductCategory) => (
        <Tag color={categoryColors[category]}>
          {category === 'snack' && '零食'}
          {category === 'beverage' && '饮料'}
          {category === 'ticket' && '票务'}
          {category === 'merchandise' && '周边'}
          {category === 'service' && '服务'}
        </Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 120,
      render: (price: number) => (
        <span className="font-medium text-green-600">
          ¥{price.toFixed(2)}
        </span>
      ),
    },
    {
      title: '库存',
      dataIndex: 'inventory',
      width: 100,
      render: (inventory: number) => (
        <span className={inventory < 10 ? 'text-red-600 font-medium' : ''}>
          {inventory}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: ProductStatus) => (
        <Tag color={statusColors[status]}>
          {status === 'active' && '上架'}
          {status === 'inactive' && '下架'}
          {status === 'draft' && '草稿'}
          {status === 'archived' && '归档'}
        </Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <Tag key={tag} size="small">{tag}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      render: (date: string) => (
        new Date(date).toLocaleDateString()
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView?.(record)}
              onMouseEnter={() => prefetchProduct(record.id)}
            />
          </Tooltip>

          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit?.(record)}
              onMouseEnter={() => prefetchProduct(record.id)}
            />
          </Tooltip>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'duplicate',
                  label: '复制产品',
                  icon: <ShoppingCartOutlined />,
                },
                {
                  key: 'delete',
                  label: '删除',
                  icon: <DeleteOutlined />,
                  danger: true,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              size="small"
            />
          </Dropdown>
        </Space>
      ),
    },
  ], [onEdit, onView, prefetchProduct]);

  const rowSelection = {
    selectedRowKeys: selectedProductIds,
    onChange: (selectedRowKeys: string[]) => {
      selectAllProducts(selectedRowKeys);
    },
    getCheckboxProps: (record: Product) => ({
      name: record.name,
    }),
  };

  return (
    <Table<Product>
      columns={columns}
      dataSource={products}
      rowKey="id"
      loading={loading}
      rowSelection={rowSelection}
      pagination={false}
      scroll={{ x: 1200 }}
      size="small"
    />
  );
};
```

## 6. 完整的页面组件

```typescript
// pages/products/ProductListPage.tsx
import React, { useEffect, useMemo } from 'react';
import {
  Layout,
  Card,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  Modal,
  message
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProductFilters } from '../../components/ProductFilters';
import { ProductTable } from '../../components/ProductTable';
import { CreateProductModal } from '../../components/CreateProductModal';
import { EditProductModal } from '../../components/EditProductModal';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { ProductDetailDrawer } from '../../components/ProductDetailDrawer';

import { useProductStore } from '../../stores/slices/productSlice';
import {
  useProductsQuery,
  useProductStatsQuery,
  useBatchDeleteMutation
} from '../../hooks';
import { Product } from '../../types';

const { Content } = Layout;

export const ProductListPage: React.FC = () => {
  // Zustand state
  const {
    filters,
    pagination,
    selectedProductIds,
    deleteModalIds,
    viewMode,
    setPagination,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    hasSelectedProducts,
    selectedCount,
  } = useProductStore();

  // TanStack Query
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useProductsQuery();

  const {
    data: stats,
    isLoading: statsLoading
  } = useProductStatsQuery();

  const batchDeleteMutation = useBatchDeleteMutation();

  // Event handlers
  const handleCreate = () => {
    openCreateModal();
  };

  const handleEdit = (product: Product) => {
    openEditModal(product.id);
  };

  const handleView = (product: Product) => {
    // Open detail drawer
    // ...
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedCount} 个产品吗？此操作不可撤销。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        batchDeleteMutation.mutate(selectedProductIds);
      },
    });
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  // Memoized filtered products count
  const filteredCount = useMemo(() => {
    return products.length;
  }, [products]);

  return (
    <Content className="p-6 bg-gray-50 min-h-screen">
      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总产品数"
              value={stats?.total || 0}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="上架产品"
              value={stats?.active || 0}
              valueStyle={{ color: '#52c41a' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="低库存预警"
              value={stats?.lowStock || 0}
              valueStyle={{ color: '#faad14' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="缺货产品"
              value={stats?.outOfStock || 0}
              valueStyle={{ color: '#ff4d4f' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <ProductFilters />

      {/* Actions Bar */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建产品
            </Button>

            {hasSelectedProducts() && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                loading={batchDeleteMutation.isLoading}
              >
                删除选中 ({selectedCount()})
              </Button>
            )}
          </div>

          <div className="text-gray-500">
            共 {filteredCount} 个产品
          </div>
        </div>
      </Card>

      {/* Product Table */}
      <Card>
        <ProductTable
          products={products}
          loading={productsLoading}
          onEdit={handleEdit}
          onView={handleView}
        />

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          {/* Ant Design Pagination component */}
          {/* ... */}
        </div>
      </Card>

      {/* Modals and Drawers */}
      <CreateProductModal />
      <EditProductModal />
      <DeleteConfirmModal />
      <ProductDetailDrawer />
    </Content>
  );
};
```

## 7. 总结

这个完整的影院商品管理系统展示了 Zustand + TanStack Query 的最佳实践：

### 核心特点

1. **清晰的职责分离**
   - Zustand 管理客户端状态（UI 状态、表单数据、选择状态）
   - TanStack Query 管理服务器状态（API 数据、缓存、同步）

2. **类型安全**
   - 完整的 TypeScript 类型定义
   - 编译时错误检测
   - 智能代码提示

3. **优秀的用户体验**
   - 乐观更新提供即时反馈
   - 智能缓存减少不必要的网络请求
   - 优雅的加载和错误状态

4. **性能优化**
   - 选择性订阅避免不必要的重渲染
   - 数据预取提升用户体验
   - 批量操作优化

5. **可维护性**
   - 模块化的代码组织
   - 可复用的自定义 Hooks
   - 清晰的组件层次结构

这种架构模式特别适合中大型 React 应用，提供了出色的开发体验和运行时性能。