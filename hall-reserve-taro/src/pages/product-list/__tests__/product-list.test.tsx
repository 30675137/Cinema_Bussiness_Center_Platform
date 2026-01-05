/**
 * @spec O009-miniapp-product-list
 * Unit tests for product-list page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductListPage from '../index'

// Mock Taro APIs
vi.mock('@tarojs/taro', () => ({
  default: {
    useDidShow: vi.fn((callback) => callback()),
    useReady: vi.fn((callback) => callback()),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    showToast: vi.fn(),
    stopPullDownRefresh: vi.fn(),
  },
}))

// Mock useProducts hook
vi.mock('@/hooks/useProducts', () => ({
  useProducts: vi.fn(),
}))

import { useProducts } from '@/hooks/useProducts'
import type { ProductListResponse } from '@/types/product'

const mockProductsResponse: ProductListResponse = {
  success: true,
  data: [
    {
      id: 'product-1',
      skuId: 'sku-1',
      categoryId: 'cat-1',
      displayName: '可口可乐',
      basePrice: 2800,
      mainImage: 'https://example.com/coke.jpg',
      isRecommended: true,
      sortOrder: 1,
      status: 'ACTIVE',
      channel: 'MINIAPP',
    },
  ],
  total: 1,
  hasNext: false,
  timestamp: '2025-01-01T00:00:00Z',
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page title', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    renderWithQueryClient(<ProductListPage />)

    expect(screen.getByText('商品列表')).toBeInTheDocument()
  })

  it('should show loading skeleton on initial load', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    renderWithQueryClient(<ProductListPage />)

    expect(screen.getByTestId('product-list-loading')).toBeInTheDocument()
  })

  it('should render ProductList component when data is loaded', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: mockProductsResponse,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    renderWithQueryClient(<ProductListPage />)

    await waitFor(() => {
      expect(screen.getByTestId('product-list')).toBeInTheDocument()
    })
  })

  it('should display product count', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: mockProductsResponse,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    renderWithQueryClient(<ProductListPage />)

    await waitFor(() => {
      expect(screen.getByText('共 1 件商品')).toBeInTheDocument()
    })
  })

  it('should handle loading error gracefully', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: vi.fn(),
    } as any)

    renderWithQueryClient(<ProductListPage />)

    await waitFor(() => {
      expect(screen.getByText(/加载失败/)).toBeInTheDocument()
    })
  })

  it('should show retry button on error', async () => {
    const mockRefetch = vi.fn()
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: mockRefetch,
    } as any)

    renderWithQueryClient(<ProductListPage />)

    await waitFor(() => {
      const retryButton = screen.getByText('重试')
      expect(retryButton).toBeInTheDocument()
    })
  })

  it('should handle empty product list', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: {
        ...mockProductsResponse,
        data: [],
        total: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    renderWithQueryClient(<ProductListPage />)

    await waitFor(() => {
      expect(screen.getByText('暂无商品')).toBeInTheDocument()
    })
  })

  it('should render multiple products correctly', async () => {
    const multipleProducts = {
      ...mockProductsResponse,
      data: [
        ...mockProductsResponse.data,
        {
          id: 'product-2',
          skuId: 'sku-2',
          categoryId: 'cat-1',
          displayName: '雪碧',
          basePrice: 2500,
          mainImage: 'https://example.com/sprite.jpg',
          isRecommended: false,
          sortOrder: 2,
          status: 'ACTIVE',
          channel: 'MINIAPP',
        },
      ],
      total: 2,
    }

    vi.mocked(useProducts).mockReturnValue({
      data: multipleProducts,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    renderWithQueryClient(<ProductListPage />)

    await waitFor(() => {
      expect(screen.getByText('可口可乐')).toBeInTheDocument()
      expect(screen.getByText('雪碧')).toBeInTheDocument()
      expect(screen.getByText('共 2 件商品')).toBeInTheDocument()
    })
  })

  it('should have correct page structure', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: mockProductsResponse,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    renderWithQueryClient(<ProductListPage />)

    expect(screen.getByTestId('product-list-page')).toBeInTheDocument()
  })
})
