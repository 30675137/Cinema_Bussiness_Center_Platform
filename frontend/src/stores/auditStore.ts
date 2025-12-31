import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '@/services/auditService';
import {
  AuditRecord,
  AuditQueryParams,
  AuditStatistics,
  AuditActionRequest,
  BatchAuditRequest,
  AuditHistory,
  AuditConfig,
  CreateAuditRequest,
  UpdateAuditRequest,
  AuditStatus,
  AuditType,
} from '@/types/audit';

// 重新导出 AuditStatus 和 AuditType 供其他模块使用（枚举需要直接导出，不能使用 export type）
export { AuditStatus, AuditType } from '@/types/audit';

// 审核列表状态接口
interface AuditListState {
  audits: AuditRecord[];
  loading: boolean;
  error: string | null;
  filters: AuditQueryParams;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  selectedAuditIds: string[];
  statistics: AuditStatistics | null;
}

// 审核详情状态接口
interface AuditDetailState {
  currentAudit: AuditRecord | null;
  history: AuditHistory[];
  loading: boolean;
  error: string | null;
}

// 审核操作状态接口
interface AuditActionState {
  actionLoading: boolean;
  batchActionLoading: boolean;
  lastAction: AuditActionRequest | null;
  actionError: string | null;
}

// 审核存储接口
interface AuditStore extends AuditListState, AuditDetailState, AuditActionState {
  // 列表操作
  setFilters: (filters: Partial<AuditQueryParams>) => void;
  clearFilters: () => void;
  setSelectedAuditIds: (ids: string[]) => void;
  clearSelection: () => void;
  setPagination: (pagination: Partial<AuditListState['pagination']>) => void;

  // 详情操作
  setCurrentAudit: (audit: AuditRecord | null) => void;
  setHistory: (history: AuditHistory[]) => void;

  // 操作状态
  setActionLoading: (loading: boolean) => void;
  setBatchActionLoading: (loading: boolean) => void;
  setLastAction: (action: AuditActionRequest | null) => void;
  setActionError: (error: string | null) => void;

  // 重置
  reset: () => void;
  resetDetail: () => void;
  resetAction: () => void;
}

// 初始状态
const initialState: Omit<
  AuditStore,
  | 'setFilters'
  | 'clearFilters'
  | 'setSelectedAuditIds'
  | 'clearSelection'
  | 'setPagination'
  | 'setCurrentAudit'
  | 'setHistory'
  | 'setActionLoading'
  | 'setBatchActionLoading'
  | 'setLastAction'
  | 'setActionError'
  | 'reset'
  | 'resetDetail'
  | 'resetAction'
> = {
  audits: [],
  loading: false,
  error: null,
  filters: {
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0,
  },
  selectedAuditIds: [],
  statistics: null,
  currentAudit: null,
  history: [],
  actionLoading: false,
  batchActionLoading: false,
  lastAction: null,
  actionError: null,
};

// 创建审核存储
export const useAuditStore = create<AuditStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // 列表操作
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters };
            state.pagination.current = 1; // 重置页码
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {
              page: 1,
              pageSize: 20,
              sortBy: 'createdAt',
              sortOrder: 'desc',
            };
            state.pagination.current = 1;
          }),

        setSelectedAuditIds: (ids) =>
          set((state) => {
            state.selectedAuditIds = ids;
          }),

        clearSelection: () =>
          set((state) => {
            state.selectedAuditIds = [];
          }),

        setPagination: (pagination) =>
          set((state) => {
            state.pagination = { ...state.pagination, ...pagination };
          }),

        // 详情操作
        setCurrentAudit: (audit) =>
          set((state) => {
            state.currentAudit = audit;
          }),

        setHistory: (history) =>
          set((state) => {
            state.history = history;
          }),

        // 操作状态
        setActionLoading: (loading) =>
          set((state) => {
            state.actionLoading = loading;
          }),

        setBatchActionLoading: (loading) =>
          set((state) => {
            state.batchActionLoading = loading;
          }),

        setLastAction: (action) =>
          set((state) => {
            state.lastAction = action;
          }),

        setActionError: (error) =>
          set((state) => {
            state.actionError = error;
          }),

        // 重置
        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),

        resetDetail: () =>
          set((state) => {
            state.currentAudit = null;
            state.history = [];
            state.lastAction = null;
            state.actionError = null;
          }),

        resetAction: () =>
          set((state) => {
            state.actionLoading = false;
            state.batchActionLoading = false;
            state.lastAction = null;
            state.actionError = null;
          }),
      })),
      {
        name: 'audit-store',
        partialize: (state) => ({
          filters: state.filters,
          pagination: state.pagination,
        }),
      }
    ),
    {
      name: 'audit-store',
    }
  )
);

// React Query Hooks
export const useAuditsQuery = (params?: AuditQueryParams) => {
  const queryClient = useQueryClient();
  const { setFilters, setPagination } = useAuditStore();

  return useQuery({
    queryKey: ['audits', params],
    queryFn: () => auditService.getAudits(params),
    onSuccess: (data) => {
      setPagination({
        current: data.pagination.current,
        pageSize: data.pagination.pageSize,
        total: data.pagination.total,
      });
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

export const useAuditQuery = (id: string) => {
  const { setCurrentAudit } = useAuditStore();

  return useQuery({
    queryKey: ['audit', id],
    queryFn: () => auditService.getAudit(id),
    enabled: !!id,
    onSuccess: (data) => {
      setCurrentAudit(data);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAuditHistoryQuery = (auditId: string) => {
  const { setHistory } = useAuditStore();

  return useQuery({
    queryKey: ['audit-history', auditId],
    queryFn: () => auditService.getAuditHistory(auditId),
    enabled: !!auditId,
    onSuccess: (data) => {
      setHistory(data);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAuditStatisticsQuery = (params?: {
  dateRange?: [string, string];
  reviewerId?: string;
}) => {
  const store = useAuditStore();

  return useQuery({
    queryKey: ['audit-statistics', params],
    queryFn: () => auditService.getAuditStatistics(params),
    onSuccess: (data) => {
      store.statistics = data;
    },
    staleTime: 10 * 60 * 1000, // 10分钟
  });
};

export const useMyPendingAuditsQuery = (params?: {
  page?: number;
  pageSize?: number;
  priority?: string[];
}) => {
  return useQuery({
    queryKey: ['my-pending-audits', params],
    queryFn: () => auditService.getMyPendingAudits(params),
    staleTime: 2 * 60 * 1000, // 2分钟
  });
};

export const useMySubmittedAuditsQuery = (params?: {
  page?: number;
  pageSize?: number;
  status?: string[];
}) => {
  return useQuery({
    queryKey: ['my-submitted-audits', params],
    queryFn: () => auditService.getMySubmittedAudits(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations
export const useCreateAuditMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuditRequest) => auditService.createAudit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
    },
  });
};

export const useUpdateAuditMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuditRequest }) =>
      auditService.updateAudit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audit', id] });
    },
  });
};

export const useDeleteAuditMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => auditService.deleteAudit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
    },
  });
};

export const useAuditActionMutation = () => {
  const queryClient = useQueryClient();
  const { setActionLoading, setActionError, setLastAction } = useAuditStore();

  return useMutation({
    mutationFn: (data: AuditActionRequest) => auditService.performAuditAction(data),
    onMutate: () => {
      setActionLoading(true);
      setActionError(null);
    },
    onSuccess: (_, variables) => {
      setLastAction(variables);
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audit', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit-history', variables.auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-audits'] });
    },
    onError: (error: Error) => {
      setActionError(error.message);
    },
    onSettled: () => {
      setActionLoading(false);
    },
  });
};

export const useBatchAuditMutation = () => {
  const queryClient = useQueryClient();
  const { setBatchActionLoading, setActionError, clearSelection } = useAuditStore();

  return useMutation({
    mutationFn: (data: BatchAuditRequest) => auditService.batchAuditAction(data),
    onMutate: () => {
      setBatchActionLoading(true);
      setActionError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-audits'] });
      clearSelection();
    },
    onError: (error: Error) => {
      setActionError(error.message);
    },
    onSettled: () => {
      setBatchActionLoading(false);
    },
  });
};

export const useDetectChangesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      entityType: string;
      entityId: string;
      changes: Array<{
        fieldName: string;
        fieldLabel: string;
        oldValue: any;
        newValue: any;
        isKeyField: boolean;
        category: string;
      }>;
      auditType: string;
      title: string;
      description?: string;
      priority?: string;
    }) => auditService.detectChangesAndCreateAudit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audit-statistics'] });
    },
  });
};

export const usePreviewChangesMutation = () => {
  return useMutation({
    mutationFn: (data: {
      entityType: string;
      entityId: string;
      changes: Array<{
        fieldName: string;
        newValue: any;
      }>;
    }) => auditService.previewAuditChanges(data),
  });
};

// Selectors
export const useAuditSelectors = () => {
  const store = useAuditStore();

  return {
    // 过滤后的审核列表
    filteredAudits: store.audits.filter((audit) => {
      const filters = store.filters;

      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(audit.status)) return false;
      }

      if (filters.auditType && filters.auditType.length > 0) {
        if (!filters.auditType.includes(audit.auditType)) return false;
      }

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        if (
          !audit.title.toLowerCase().includes(keyword) &&
          !audit.description?.toLowerCase().includes(keyword) &&
          !audit.submitterName.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(audit.priority)) return false;
      }

      return true;
    }),

    // 选中的审核记录
    selectedAudits: store.audits.filter((audit) => store.selectedAuditIds.includes(audit.id)),

    // 待审核数量
    pendingCount: store.audits.filter((audit) => audit.status === AuditStatus.PENDING).length,

    // 高优先级待审核数量
    highPriorityPendingCount: store.audits.filter(
      (audit) =>
        audit.status === AuditStatus.PENDING &&
        (audit.priority === 'high' || audit.priority === 'urgent')
    ).length,

    // 我提交的审核数量
    mySubmittedCount: store.audits.filter(
      (audit) => audit.submitterId === 'current-user-id' // 这里应该从用户状态获取
    ).length,

    // 是否有选中的审核记录
    hasSelection: store.selectedAuditIds.length > 0,

    // 当前页的审核记录
    currentPageAudits: store.audits.slice(
      (store.pagination.current - 1) * store.pagination.pageSize,
      store.pagination.current * store.pagination.pageSize
    ),
  };
};
