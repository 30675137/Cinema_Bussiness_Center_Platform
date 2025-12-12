import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { priceService } from '@/services/priceService';
import type {
  PriceConfig,
  PriceListState,
  PriceFormData,
  PriceQueryParams,
  PriceFilters,
  PriceRule,
  PriceHistory,
  PriceChangeRequest,
  PriceStatus,
  PriceType
} from '@/types/price';

// 价格列表状态接口
interface PriceListStore extends PriceListState {
  // 数据相关操作
  setPrices: (prices: PriceConfig[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setTotalCount: (count: number) => void;

  // 筛选和搜索
  setFilters: (filters: Partial<PriceFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // 分页操作
  setPagination: (pagination: Partial<PriceListState['pagination']>) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // 选择操作
  setSelectedPrices: (ids: string[]) => void;
  togglePriceSelection: (id: string) => void;
  selectAllPrices: () => void;
  clearSelection: () => void;

  // 视图操作
  setViewMode: (mode: 'table' | 'grid') => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;

  // 重置操作
  resetList: () => void;
}

// 价格表单状态接口
interface PriceFormStore {
  formData: Partial<PriceFormData>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;

  // 表单数据操作
  setFormData: (data: Partial<PriceFormData>) => void;
  updateFormData: (updates: Partial<PriceFormData>) => void;
  resetFormData: () => void;

  // 表单状态操作
  setErrors: (errors: Record<string, string>) => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;

  // 表单状态
  setDirty: (dirty: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setValid: (valid: boolean) => void;

  // 重置操作
  resetForm: () => void;
}

// 价格列表store
export const usePriceListStore = create<PriceListStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状态
        prices: [],
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
        selectedPriceIds: [],
        viewMode: 'table',
        sortBy: 'createdAt',
        sortOrder: 'desc',

        // 数据相关操作
        setPrices: (prices) =>
          set((state) => {
            state.prices = prices;
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
        setSelectedPrices: (ids) =>
          set((state) => {
            state.selectedPriceIds = ids;
          }),
        togglePriceSelection: (id) =>
          set((state) => {
            const index = state.selectedPriceIds.indexOf(id);
            if (index > -1) {
              state.selectedPriceIds.splice(index, 1);
            } else {
              state.selectedPriceIds.push(id);
            }
          }),
        selectAllPrices: () =>
          set((state) => {
            state.selectedPriceIds = state.prices.map(p => p.id);
          }),
        clearSelection: () =>
          set((state) => {
            state.selectedPriceIds = [];
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
            state.prices = [];
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
            state.selectedPriceIds = [];
            state.viewMode = 'table';
            state.sortBy = 'createdAt';
            state.sortOrder = 'desc';
          }),
      })),
      {
        name: 'price-list-store',
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
    { name: 'price-list-store' }
  )
);

// 价格表单store
export const usePriceFormStore = create<PriceFormStore>()(
  devtools(
    immer((set) => ({
      // 初始状态
      formData: {},
      errors: {},
      touched: {},
      isDirty: false,
      isSubmitting: false,
      isValid: false,

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

      // 表单状态
      setDirty: (dirty) =>
        set((state) => {
          state.isDirty = dirty;
        }),
      setSubmitting: (submitting) =>
        set((state) => {
          state.isSubmitting = submitting;
        }),
      setValid: (valid) =>
        set((state) => {
          state.isValid = valid;
        }),

      // 重置操作
      resetForm: () =>
        set((state) => {
          state.formData = {};
          state.errors = {};
          state.touched = {};
          state.isDirty = false;
          state.isSubmitting = false;
          state.isValid = false;
        }),
    })),
    { name: 'price-form-store' }
  )
);

// React Query Hooks
export const usePricesQuery = (params?: PriceQueryParams) => {
  return useQuery({
    queryKey: ['prices', params],
    queryFn: () => priceService.getPrices(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

export const usePriceQuery = (id: string) => {
  return useQuery({
    queryKey: ['price', id],
    queryFn: () => priceService.getPriceById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10分钟
  });
};

export const useCreatePriceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: priceService.createPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    },
  });
};

export const useUpdatePriceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PriceFormData> }) =>
      priceService.updatePrice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
      queryClient.invalidateQueries({ queryKey: ['price', id] });
    },
  });
};

export const useDeletePriceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: priceService.deletePrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    },
  });
};

export const useBatchUpdatePricesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<PriceFormData> }) =>
      priceService.batchUpdatePrices(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    },
  });
};

// 价格规则查询hooks
export const usePriceRulesQuery = () => {
  return useQuery({
    queryKey: ['price-rules'],
    queryFn: () => priceService.getPriceRules(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePriceRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: priceService.createPriceRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-rules'] });
    },
  });
};

export const useUpdatePriceRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PriceRule> }) =>
      priceService.updatePriceRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-rules'] });
    },
  });
};

export const useDeletePriceRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => priceService.deletePriceRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-rules'] });
    },
  });
};

export const useApplyPriceRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, productIds }: { ruleId: string; productIds: string[] }) =>
      priceService.applyPriceRule(ruleId, productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-rules'] });
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    },
  });
};

// 价格历史查询hooks
export const usePriceHistoryQuery = (priceConfigId: string) => {
  return useQuery({
    queryKey: ['price-history', priceConfigId],
    queryFn: () => priceService.getPriceHistory(priceConfigId),
    enabled: !!priceConfigId,
    staleTime: 2 * 60 * 1000,
  });
};

// 价格变更请求hooks
export const usePriceChangeRequestsQuery = () => {
  return useQuery({
    queryKey: ['price-change-requests'],
    queryFn: () => priceService.getPriceChangeRequests(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useApprovePriceChangeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      priceService.approvePriceChange(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['prices'] });
    },
  });
};

export const useRejectPriceChangeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      priceService.rejectPriceChange(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-change-requests'] });
    },
  });
};

// 价格计算hooks
export const useCalculatePriceQuery = (productId: string, params?: {
  quantity?: number;
  memberLevel?: string;
  channel?: string;
  date?: string;
}) => {
  return useQuery({
    queryKey: ['calculate-price', productId, params],
    queryFn: () => priceService.calculatePrice(productId, params),
    enabled: !!productId,
    staleTime: 1 * 60 * 1000, // 1分钟
  });
};

// 选择器函数
export const useSelectedPrices = () => {
  const selectedIds = usePriceListStore(state => state.selectedPriceIds);
  const prices = usePriceListStore(state => state.prices);

  return prices.filter(price => selectedIds.includes(price.id));
};

export const usePriceCountByStatus = () => {
  const prices = usePriceListStore(state => state.prices);

  return prices.reduce((acc, price) => {
    acc[price.status] = (acc[price.status] || 0) + 1;
    return acc;
  }, {} as Record<PriceStatus, number>);
};

export const usePriceCountByType = () => {
  const prices = usePriceListStore(state => state.prices);

  return prices.reduce((acc, price) => {
    acc[price.priceType] = (acc[price.priceType] || 0) + 1;
    return acc;
  }, {} as Record<PriceType, number>);
};

// 价格统计hooks
export const usePriceStatistics = (filters?: PriceQueryParams) => {
  const { data: pricesData } = usePricesQuery(filters);
  const prices = pricesData?.items || [];
  
  const activePrices = prices.filter(p => p.status === PriceStatus.ACTIVE).length;
  const totalPrices = prices.length;
  const averagePrice = totalPrices > 0 
    ? prices.reduce((sum, p) => sum + p.currentPrice, 0) / totalPrices 
    : 0;
  const upcomingChanges = prices.filter(p => p.status === PriceStatus.PENDING).length;
  
  return {
    totalPrices,
    averagePrice,
    activePrices,
    upcomingChanges,
    byStatus: prices.reduce((acc, price) => {
      acc[price.status] = (acc[price.status] || 0) + 1;
      return acc;
    }, {} as Record<PriceStatus, number>),
    byType: prices.reduce((acc, price) => {
      acc[price.priceType] = (acc[price.priceType] || 0) + 1;
      return acc;
    }, {} as Record<PriceType, number>),
  };
};