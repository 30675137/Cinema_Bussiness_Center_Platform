import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

/**
 * 产品接口
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  barcode?: string;
  sku: string;
  images: string[];
  status: 'active' | 'inactive' | 'discontinued';
  tags: string[];
  attributes: Record<string, any>;
  supplier?: {
    id: string;
    name: string;
    contact?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 产品分类接口
 */
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  icon?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/**
 * 产品筛选条件
 */
export interface ProductFilters {
  keyword?: string;
  category?: string;
  status?: Product['status'];
  priceRange?: [number, number];
  stockRange?: [number, number];
  tags?: string[];
  supplier?: string;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 产品状态接口
 */
export interface ProductState {
  // 产品列表
  products: Product[];
  categories: ProductCategory[];

  // 当前选中的产品
  selectedProduct: Product | null;

  // 筛选和分页
  filters: ProductFilters;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };

  // 加载状态
  loading: {
    products: boolean;
    categories: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };

  // 错误状态
  errors: {
    products?: string;
    categories?: string;
    create?: string;
    update?: string;
    delete?: string;
  };

  // 编辑状态
  editing: boolean;
  draftProduct: Partial<Product> | null;
}

/**
 * 产品操作接口
 */
export interface ProductActions {
  // 产品数据操作
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setSelectedProduct: (product: Product | null) => void;

  // 分类操作
  setCategories: (categories: ProductCategory[]) => void;
  addCategory: (category: ProductCategory) => void;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => void;
  removeCategory: (id: string) => void;

  // 筛选和分页
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<ProductState['pagination']>) => void;

  // 加载状态
  setLoading: (key: keyof ProductState['loading'], loading: boolean) => void;

  // 错误处理
  setError: (key: keyof ProductState['errors'], error?: string) => void;
  clearErrors: () => void;

  // 编辑操作
  startEditing: (product?: Product) => void;
  cancelEditing: () => void;
  updateDraft: (updates: Partial<Product>) => void;
  saveDraft: () => Promise<void>;

  // 批量操作
  batchDelete: (ids: string[]) => Promise<void>;
  batchUpdate: (ids: string[], updates: Partial<Product>) => Promise<void>;

  // 重置状态
  resetState: () => void;
}

/**
 * 产品状态初始值
 */
const initialState: ProductState = {
  products: [],
  categories: [],
  selectedProduct: null,
  filters: {},
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0,
  },
  loading: {
    products: false,
    categories: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  errors: {},
  editing: false,
  draftProduct: null,
};

/**
 * 产品管理状态Store
 */
export type ProductStore = ProductState & ProductActions;

/**
 * 创建产品管理状态Store
 */
export const useProductStore = create<ProductStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // 产品数据操作
      setProducts: (products) =>
        set({ products }, false, 'setProducts'),

      addProduct: (product) =>
        set(
          (state) => ({
            products: [...state.products, product],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
          }),
          false,
          'addProduct'
        ),

      updateProduct: (id, updates) =>
        set(
          (state) => ({
            products: state.products.map((product) =>
              product.id === id ? { ...product, ...updates } : product
            ),
            selectedProduct:
              state.selectedProduct?.id === id
                ? { ...state.selectedProduct, ...updates }
                : state.selectedProduct,
          }),
          false,
          'updateProduct'
        ),

      removeProduct: (id) =>
        set(
          (state) => ({
            products: state.products.filter((product) => product.id !== id),
            selectedProduct:
              state.selectedProduct?.id === id ? null : state.selectedProduct,
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
            },
          }),
          false,
          'removeProduct'
        ),

      setSelectedProduct: (selectedProduct) =>
        set({ selectedProduct }, false, 'setSelectedProduct'),

      // 分类操作
      setCategories: (categories) =>
        set({ categories }, false, 'setCategories'),

      addCategory: (category) =>
        set(
          (state) => ({
            categories: [...state.categories, category],
          }),
          false,
          'addCategory'
        ),

      updateCategory: (id, updates) =>
        set(
          (state) => ({
            categories: state.categories.map((category) =>
              category.id === id ? { ...category, ...updates } : category
            ),
          }),
          false,
          'updateCategory'
        ),

      removeCategory: (id) =>
        set(
          (state) => ({
            categories: state.categories.filter((category) => category.id !== id),
          }),
          false,
          'removeCategory'
        ),

      // 筛选和分页
      setFilters: (filters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, current: 1 },
          }),
          false,
          'setFilters'
        ),

      clearFilters: () =>
        set(
          (state) => ({
            filters: {},
            pagination: { ...state.pagination, current: 1 },
          }),
          false,
          'clearFilters'
        ),

      setPagination: (pagination) =>
        set(
          (state) => ({
            pagination: { ...state.pagination, ...pagination },
          }),
          false,
          'setPagination'
        ),

      // 加载状态
      setLoading: (key, loading) =>
        set(
          (state) => ({
            loading: { ...state.loading, [key]: loading },
          }),
          false,
          'setLoading'
        ),

      // 错误处理
      setError: (key, error) =>
        set(
          (state) => ({
            errors: { ...state.errors, [key]: error },
          }),
          false,
          'setError'
        ),

      clearErrors: () =>
        set({ errors: {} }, false, 'clearErrors'),

      // 编辑操作
      startEditing: (product) =>
        set(
          (state) => ({
            editing: true,
            draftProduct: product ? { ...product } : {},
          }),
          false,
          'startEditing'
        ),

      cancelEditing: () =>
        set(
          (state) => ({
            editing: false,
            draftProduct: null,
            errors: { ...state.errors, create: undefined, update: undefined },
          }),
          false,
          'cancelEditing'
        ),

      updateDraft: (updates) =>
        set(
          (state) => ({
            draftProduct: state.draftProduct
              ? { ...state.draftProduct, ...updates }
              : updates,
          }),
          false,
          'updateDraft'
        ),

      saveDraft: async () => {
        const state = get();
        if (!state.draftProduct) return;

        try {
          if (state.draftProduct.id) {
            // 更新现有产品
            set(
              (prevState) => ({
                loading: { ...prevState.loading, updating: true },
              }),
              false,
              'saveDraft:start'
            );

            // 这里应该调用API更新产品
            // await updateProductAPI(state.draftProduct.id, state.draftProduct);

            set(
              (prevState) => ({
                products: prevState.products.map((product) =>
                  product.id === state.draftProduct!.id
                    ? { ...product, ...state.draftProduct! }
                    : product
                ),
                editing: false,
                draftProduct: null,
                loading: { ...prevState.loading, updating: false },
                errors: { ...prevState.errors, update: undefined },
              }),
              false,
              'saveDraft:success'
            );
          } else {
            // 创建新产品
            set(
              (prevState) => ({
                loading: { ...prevState.loading, creating: true },
              }),
              false,
              'saveDraft:start'
            );

            // 这里应该调用API创建产品
            // const newProduct = await createProductAPI(state.draftProduct);

            const newProduct: Product = {
              ...state.draftProduct as Product,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            set(
              (prevState) => ({
                products: [...prevState.products, newProduct],
                editing: false,
                draftProduct: null,
                loading: { ...prevState.loading, creating: false },
                errors: { ...prevState.errors, create: undefined },
                pagination: {
                  ...prevState.pagination,
                  total: prevState.pagination.total + 1,
                },
              }),
              false,
              'saveDraft:success'
            );
          }
        } catch (error) {
          set(
            (prevState) => ({
              loading: { ...prevState.loading, creating: false, updating: false },
              errors: {
                ...prevState.errors,
                create: state.draftProduct.id ? undefined : '创建产品失败',
                update: state.draftProduct.id ? '更新产品失败' : undefined,
              },
            }),
            false,
            'saveDraft:error'
          );
        }
      },

      // 批量操作
      batchDelete: async (ids) => {
        try {
          set(
            (state) => ({
              loading: { ...state.loading, deleting: true },
            }),
            false,
            'batchDelete:start'
          );

          // 这里应该调用API批量删除
          // await batchDeleteProductsAPI(ids);

          set(
            (state) => ({
              products: state.products.filter((product) => !ids.includes(product.id)),
              selectedProduct: state.selectedProduct && ids.includes(state.selectedProduct.id)
                ? null
                : state.selectedProduct,
              loading: { ...state.loading, deleting: false },
              pagination: {
                ...state.pagination,
                total: Math.max(0, state.pagination.total - ids.length),
              },
            }),
            false,
            'batchDelete:success'
          );
        } catch (error) {
          set(
            (state) => ({
              loading: { ...state.loading, deleting: false },
              errors: { ...state.errors, delete: '批量删除失败' },
            }),
            false,
            'batchDelete:error'
          );
        }
      },

      batchUpdate: async (ids, updates) => {
        try {
          set(
            (state) => ({
              loading: { ...state.loading, updating: true },
            }),
            false,
            'batchUpdate:start'
          );

          // 这里应该调用API批量更新
          // await batchUpdateProductsAPI(ids, updates);

          set(
            (state) => ({
              products: state.products.map((product) =>
                ids.includes(product.id) ? { ...product, ...updates } : product
              ),
              selectedProduct:
                state.selectedProduct && ids.includes(state.selectedProduct.id)
                  ? { ...state.selectedProduct, ...updates }
                  : state.selectedProduct,
              loading: { ...state.loading, updating: false },
            }),
            false,
            'batchUpdate:success'
          );
        } catch (error) {
          set(
            (state) => ({
              loading: { ...state.loading, updating: false },
              errors: { ...state.errors, update: '批量更新失败' },
            }),
            false,
            'batchUpdate:error'
          );
        }
      },

      // 重置状态
      resetState: () => set(initialState, false, 'resetState'),
    })),
    {
      name: 'product-store',
    }
  )
);

/**
 * 选择器 hooks
 */
export const useProducts = () => useProductStore((state) => state.products);
export const useProductCategories = () => useProductStore((state) => state.categories);
export const useSelectedProduct = () => useProductStore((state) => state.selectedProduct);
export const useProductFilters = () => useProductStore((state) => state.filters);
export const useProductPagination = () => useProductStore((state) => state.pagination);
export const useProductLoading = () => useProductStore((state) => state.loading);
export const useProductErrors = () => useProductStore((state) => state.errors);
export const useProductEditing = () => useProductStore((state) => ({
  editing: state.editing,
  draftProduct: state.draftProduct,
}));

/**
 * 操作 hooks
 */
export const useProductActions = () => useProductStore((state) => ({
  setProducts: state.setProducts,
  addProduct: state.addProduct,
  updateProduct: state.updateProduct,
  removeProduct: state.removeProduct,
  setSelectedProduct: state.setSelectedProduct,
  setCategories: state.setCategories,
  addCategory: state.addCategory,
  updateCategory: state.updateCategory,
  removeCategory: state.removeCategory,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  setPagination: state.setPagination,
  setLoading: state.setLoading,
  setError: state.setError,
  clearErrors: state.clearErrors,
  startEditing: state.startEditing,
  cancelEditing: state.cancelEditing,
  updateDraft: state.updateDraft,
  saveDraft: state.saveDraft,
  batchDelete: state.batchDelete,
  batchUpdate: state.batchUpdate,
  resetState: state.resetState,
}));