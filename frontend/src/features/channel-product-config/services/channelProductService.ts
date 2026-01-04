/**
 * @spec O005-channel-product-config
 * @spec O008-channel-product-category-migration
 * Frontend Service for Channel Product Configuration API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ChannelProductConfig,
  ChannelProductListResponse,
  ChannelProductQueryParams,
  CreateChannelProductRequest,
  UpdateChannelProductRequest,
  UpdateStatusRequest,
  ChannelProductStatus,
} from '../types';

// ============================================================================
// API Functions
// ============================================================================

const BASE_URL = '/api/channel-products';

/**
 * Convert snake_case keys to camelCase
 */
const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((acc: any, key: string) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

/**
 * Fetch channel product list
 */
const fetchChannelProducts = async (
  params: ChannelProductQueryParams
): Promise<ChannelProductListResponse> => {
  const queryParams = new URLSearchParams();
  if (params.channelType) queryParams.append('channelType', params.channelType);
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.status) queryParams.append('status', params.status);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.size) queryParams.append('size', params.size.toString());

  const response = await fetch(`${BASE_URL}?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch channel products');
  }
  const result = await response.json();

  // Convert snake_case to camelCase
  const camelData = toCamelCase(result.data);

  return {
    items: camelData.content || [],
    total: camelData.totalElements || 0,
    page: (camelData.number || 0) + 1,
    size: camelData.size || 20,
  };
};

/**
 * Fetch single channel product by ID
 */
const fetchChannelProduct = async (id: string): Promise<ChannelProductConfig> => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch channel product');
  }
  const result = await response.json();
  return toCamelCase(result.data);
};

/**
 * Create channel product
 */
const createChannelProduct = async (
  data: CreateChannelProductRequest
): Promise<ChannelProductConfig> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create channel product');
  }
  const result = await response.json();
  return result.data;
};

/**
 * Update channel product
 */
const updateChannelProduct = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateChannelProductRequest;
}): Promise<ChannelProductConfig> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update channel product');
  }
  const result = await response.json();
  return result.data;
};

/**
 * Update channel product status
 */
const updateStatus = async ({
  id,
  status,
}: {
  id: string;
  status: ChannelProductStatus;
}): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update status');
  }
};

/**
 * Delete channel product
 */
const deleteChannelProduct = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete channel product');
  }
};

/**
 * Upload channel product image to Supabase Storage
 */
export const uploadChannelProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/upload-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '图片上传失败');
  }

  const result = await response.json();
  return result.data; // Returns the public URL
};

// ============================================================================
// Query Keys
// ============================================================================

export const channelProductKeys = {
  all: ['channel-products'] as const,
  lists: () => [...channelProductKeys.all, 'list'] as const,
  list: (params: ChannelProductQueryParams) => [...channelProductKeys.lists(), params] as const,
  details: () => [...channelProductKeys.all, 'detail'] as const,
  detail: (id: string) => [...channelProductKeys.details(), id] as const,
};

// ============================================================================
// React Query Hooks
// ============================================================================

export const useChannelProducts = (params: ChannelProductQueryParams) => {
  return useQuery({
    queryKey: channelProductKeys.list(params),
    queryFn: () => fetchChannelProducts(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

export const useChannelProduct = (id: string, enabled = true) => {
  return useQuery({
    queryKey: channelProductKeys.detail(id),
    queryFn: () => fetchChannelProduct(id),
    enabled: !!id && enabled,
  });
};

export const useCreateChannelProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChannelProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelProductKeys.lists() });
    },
  });
};

export const useUpdateChannelProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateChannelProduct,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: channelProductKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: channelProductKeys.lists() });
    },
  });
};

export const useUpdateChannelProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStatus,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: channelProductKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: channelProductKeys.lists() });
    },
  });
};

export const useDeleteChannelProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChannelProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelProductKeys.lists() });
    },
  });
};
