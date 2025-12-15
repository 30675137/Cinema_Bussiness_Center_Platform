/**
 * TanStack Query hooks for Attribute Template queries
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { attributeService } from '../services/attributeService';
import {
  attributeTemplateKeys,
  type AttributeTemplateListParams,
} from '../types/attribute.types';
import type { AttributeTemplate, Attribute } from '@/features/attribute-dictionary/types';

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 2,
  refetchOnWindowFocus: false,
} as const;

interface AttributeTemplateListResponse {
  data: AttributeTemplate[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook to fetch list of attribute templates
 */
export function useAttributeTemplatesQuery(
  params?: AttributeTemplateListParams,
  options?: Omit<
    UseQueryOptions<AttributeTemplateListResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<AttributeTemplateListResponse, Error>({
    queryKey: attributeTemplateKeys.list(params),
    queryFn: async () => {
      const response = await attributeService.getAttributeTemplates(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch attribute templates');
      }
      return response.data;
    },
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}

/**
 * Hook to fetch a single attribute template by ID
 */
export function useAttributeTemplateQuery(
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<AttributeTemplate & { attributes: Attribute[] }, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<AttributeTemplate & { attributes: Attribute[] }, Error>({
    queryKey: attributeTemplateKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Attribute template ID is required');
      }
      const response = await attributeService.getAttributeTemplate(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch attribute template');
      }
      return response.data;
    },
    enabled: !!id,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}

/**
 * Hook to fetch attribute template by category ID
 */
export function useAttributeTemplateByCategoryQuery(
  categoryId: string | undefined,
  options?: Omit<
    UseQueryOptions<AttributeTemplate & { attributes: Attribute[] } | null, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<AttributeTemplate & { attributes: Attribute[] } | null, Error>({
    queryKey: attributeTemplateKeys.byCategory(categoryId || ''),
    queryFn: async () => {
      if (!categoryId) {
        throw new Error('Category ID is required');
      }
      const response = await attributeService.getAttributeTemplateByCategory(categoryId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch attribute template');
      }
      return response.data;
    },
    enabled: !!categoryId,
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
  });
}

