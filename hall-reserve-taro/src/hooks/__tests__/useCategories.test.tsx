/**
 * @spec O009-miniapp-product-list
 * useCategories Hook Tests
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCategories } from '../useCategories'
import * as categoryService from '@/services/categoryService'

vi.mock('@/services/categoryService')

describe('useCategories', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should return loading state initially', () => {
    vi.spyOn(categoryService, 'fetchCategories').mockImplementation(
      () => new Promise(() => {})
    )

    const { result } = renderHook(() => useCategories(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should fetch categories successfully', async () => {
    const mockCategories = {
      data: [
        { id: '1', name: '爆米花', sortOrder: 1 },
        { id: '2', name: '饮料', sortOrder: 2 },
      ],
      total: 2,
    }

    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue(mockCategories)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCategories)
    expect(result.current.data?.data).toHaveLength(2)
  })

  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch categories')
    vi.spyOn(categoryService, 'fetchCategories').mockRejectedValue(mockError)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(mockError)
  })

  it('should use correct query key', () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [],
      total: 0,
    })

    const { result } = renderHook(() => useCategories(), { wrapper })

    // Query key should be ['categories']
    const queryState = queryClient.getQueryState(['categories'])
    expect(queryState).toBeDefined()
  })

  it('should cache categories data', async () => {
    const mockCategories = {
      data: [{ id: '1', name: '爆米花', sortOrder: 1 }],
      total: 1,
    }

    const fetchSpy = vi
      .spyOn(categoryService, 'fetchCategories')
      .mockResolvedValue(mockCategories)

    const { result, rerender } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Rerender should use cache
    rerender()

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('should have staleTime configured', async () => {
    const mockCategories = {
      data: [{ id: '1', name: '爆米花', sortOrder: 1 }],
      total: 1,
    }

    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue(mockCategories)

    renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      const queryState = queryClient.getQueryState(['categories'])
      expect(queryState?.dataUpdatedAt).toBeGreaterThan(0)
    })

    // Data should not be considered stale immediately
    const queryState = queryClient.getQueryState(['categories'])
    expect(queryState?.isInvalidated).toBe(false)
  })

  it('should support refetch', async () => {
    const mockCategories = {
      data: [{ id: '1', name: '爆米花', sortOrder: 1 }],
      total: 1,
    }

    const fetchSpy = vi
      .spyOn(categoryService, 'fetchCategories')
      .mockResolvedValue(mockCategories)

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Refetch
    await result.current.refetch()

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('should return empty array when no categories', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [],
      total: 0,
    })

    const { result } = renderHook(() => useCategories(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.data).toEqual([])
    expect(result.current.data?.total).toBe(0)
  })
})
