import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import type {
  Product,
  ProductListState,
  ProductFormState,
  ProductFilters,
  ProductFormData,
  ProductQueryParams,
} from '@/types/product';

// 商品列表状态接口
interface ProductListStore extends ProductListState {
  // 数据相关操作
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setTotalCount: (count: number) => void;

  // 筛选和搜索
  setFilters: (filters: Partial<ProductFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // 分页操作
  setPagination: (pagination: Partial<ProductListState['pagination']>) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // 选择操作
  setSelectedProducts: (ids: string[]) => void;
  toggleProductSelection: (id: string) => void;
  selectAllProducts: () => void;
  clearSelection: () => void;

  // 视图操作
  setViewMode: (mode: 'table' | 'grid') => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;

  // 重置操作
  resetList: () => void;
}

// 商品表单状态接口
interface ProductFormStore extends ProductFormState {
  // 表单数据操作
  setFormData: (data: Partial<ProductFormData>) => void;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  resetFormData: () => void;

  // 表单状态操作
  setErrors: (errors: Record<string, string>) => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;

  // 表单标签页
  setActiveTab: (tab: 'basic' | 'content' | 'specs' | 'bom') => void;

  // 表单状态
  setDirty: (dirty: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setValidation: (validation: ProductFormState['validation']) => void;

  // 重置操作
  resetForm: () => void;
}

// 商品列表store
export const useProductListStore = create<ProductListStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        products: [],
        loading: false,
        error: undefined,
        totalCount: 0,
        filters: {},
        searchQuery: '',
        pagination: {
          current: 1,
          pageSize: 20,
          total: 0,
        },
        selectedProductIds: [],
        selectionMode: 'single',
        viewMode: 'table',
        sortBy: 'createdAt',
        sortOrder: 'desc',

        // 数据相关操作
        setProducts: (products) =>
          set((state) => {
            state.products = products;
          }),
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),
        setError: (error) =>
          set((state) => {
            state.error = error;
          }),
        setTotalCount: (totalCount) =>
          set((state) => {
            state.totalCount = totalCount;
            state.pagination.total = totalCount;
          }),

        // 筛选和搜索
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          }),
        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query;
          }),
        clearFilters: () =>
          set((state) => {
            state.filters = {};
            state.searchQuery = '';
          }),

        // 分页操作
        setPagination: (pagination) =>
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          }),
        setCurrentPage: (page) =>
          set((state) => {
            state.pagination.current = page;
          }),
        setPageSize: (pageSize) =>
          set((state) => {
            state.pagination.pageSize = pageSize;
            state.pagination.current = 1; // 重置到第一页
          }),

        // 选择操作
        setSelectedProducts: (ids) =>
          set((state) => {
            state.selectedProductIds = ids;
          }),
        toggleProductSelection: (id) =>
          set((state) => {
            const { selectedProductIds, selectionMode } = state;
            if (selectionMode === 'single') {
              state.selectedProductIds = [id];
            } else {
              const index = selectedProductIds.indexOf(id);
              if (index > -1) {
                selectedProductIds.splice(index, 1);
              } else {
                selectedProductIds.push(id);
              }
            }
          }),
        selectAllProducts: () =>
          set((state) => {
            state.selectedProductIds = state.products.map((p) => p.id);
          }),
        clearSelection: () =>
          set((state) => {
            state.selectedProductIds = [];
          }),

        // 视图操作
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),
        setSorting: (sortBy, sortOrder) =>
          set((state) => {
            state.sortBy = sortBy;
            state.sortOrder = sortOrder;
          }),

        // 重置操作
        resetList: () =>
          set((state) => {
            state.products = [];
            state.loading = false;
            state.error = undefined;
            state.totalCount = 0;
            state.filters = {};
            state.searchQuery = '';
            state.pagination = {
              current: 1,
              pageSize: 20,
              total: 0,
            };
            state.selectedProductIds = [];
            state.selectionMode = 'single';
            state.viewMode = 'table';
            state.sortBy = 'createdAt';
            state.sortOrder = 'desc';
          }),
      })),
      {
        name: 'product-list-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          viewMode: state.viewMode,
          pagination: {
            pageSize: state.pagination.pageSize,
          },
          filters: state.filters,
        }),
      }
    ),
    { name: 'product-list-store' }
  )
);

// 商品表单store
export const useProductFormStore = create<ProductFormStore>()(
  devtools(
    immer((set) => ({
      // 初始状态
      formData: {},
      errors: {},
      touched: {},
      activeTab: 'basic',
      isDirty: false,
      isSubmitting: false,
      validation: {
        isValid: false,
        isValidating: false,
      },
      specifications: [],
      generatedSkus: [],
      bomMaterials: [],

      // 表单数据操作
      setFormData: (data) =>
        set((state) => {
          state.formData = { ...state.formData, ...data };
          state.isDirty = true;
        }),
      updateFormData: (updates) =>
        set((state) => {
          Object.assign(state.formData, updates);
          state.isDirty = true;
        }),
      resetFormData: () =>
        set((state) => {
          state.formData = {};
          state.isDirty = false;
        }),

      // 表单状态操作
      setErrors: (errors) =>
        set((state) => {
          state.errors = errors;
        }),
      setFieldError: (field, error) =>
        set((state) => {
          state.errors[field] = error;
        }),
      clearFieldError: (field) =>
        set((state) => {
          delete state.errors[field];
        }),
      clearAllErrors: () =>
        set((state) => {
          state.errors = {};
        }),

      // 表单标签页
      setActiveTab: (tab) =>
        set((state) => {
          state.activeTab = tab;
        }),

      // 表单状态
      setDirty: (dirty) =>
        set((state) => {
          state.isDirty = dirty;
        }),
      setSubmitting: (submitting) =>
        set((state) => {
          state.isSubmitting = submitting;
        }),
      setValidation: (validation) =>
        set((state) => {
          state.validation = validation;
        }),

      // 重置操作
      resetForm: () =>
        set((state) => {
          state.formData = {};
          state.errors = {};
          state.touched = {};
          state.activeTab = 'basic';
          state.isDirty = false;
          state.isSubmitting = false;
          state.validation = {
            isValid: false,
            isValidating: false,
          };
          state.specifications = [];
          state.generatedSkus = [];
          state.bomMaterials = [];
        }),
    })),
    { name: 'product-form-store' }
  )
);

// React Query Hooks
export const useProductsQuery = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

export const useProductQuery = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10分钟
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      productService.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useBatchDeleteProductsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.batchDeleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// 选择器函数
export const useSelectedProducts = () => {
  const selectedIds = useProductListStore((state) => state.selectedProductIds);
  const products = useProductListStore((state) => state.products);

  return products.filter((product) => selectedIds.includes(product.id));
};

export const useProductCountByStatus = () => {
  const products = useProductListStore((state) => state.products);

  return products.reduce(
    (acc, product) => {
      acc[product.status] = (acc[product.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
};

// 导出别名，方便旧代码兼容
export const useProductStore = useProductListStore;
