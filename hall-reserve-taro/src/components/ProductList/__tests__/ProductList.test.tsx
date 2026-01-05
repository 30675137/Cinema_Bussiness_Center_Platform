/**
 * @spec O009-miniapp-product-list
 * Unit tests for ProductList component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductList from '../index'
import type { ChannelProductDTO } from '@/types/product'

// Mock useProducts hook
vi.mock('@/hooks/useProducts', () => ({
  useProducts: vi.fn(),
}))

import { useProducts } from '@/hooks/useProducts'

const mockProducts: ChannelProductDTO[] = [
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
  {
    id: 'product-3',
    skuId: 'sku-3',
    categoryId: 'cat-1',
    displayName: '芬达',
    basePrice: 2500,
    mainImage: 'https://example.com/fanta.jpg',
    isRecommended: true,
    sortOrder: 0,
    status: 'ACTIVE',
    channel: 'MINIAPP',
  },
]

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

describe('ProductList Component', () => {
  it('should render loading skeleton when data is loading', () => {
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any)

    renderWithQueryClient(<ProductList />)

    expect(screen.getByTestId('product-list-loading')).toBeInTheDocument()
  })

  it('should render product cards when data is loaded', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: {
        success: true,
        data: mockProducts,
        total: 3,
        hasNext: false,
        timestamp: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithQueryClient(<ProductList />)

    await waitFor(() => {
      expect(screen.getByText('可口可乐')).toBeInTheDocument()
      expect(screen.getByText('雪碧')).toBeInTheDocument()
      expect(screen.getByText('芬达')).toBeInTheDocument()
    })
  })

  it('should sort recommended products first', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: {
        success: true,
        data: mockProducts,
        total: 3,
        hasNext: false,
        timestamp: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithQueryClient(<ProductList />)

    await waitFor(() => {
      const productCards = screen.getAllByTestId('product-card')
      // 芬达 (recommended, sortOrder=0) should be first
      expect(productCards[0]).toHaveTextContent('芬达')
      // 可口可乐 (recommended, sortOrder=1) should be second
      expect(productCards[1]).toHaveTextContent('可口可乐')
      // 雪碧 (not recommended, sortOrder=2) should be last
      expect(productCards[2]).toHaveTextContent('雪碧')
    })
  })

  it('should render empty state when no products', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: {
        success: true,
        data: [],
        total: 0,
        hasNext: false,
        timestamp: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithQueryClient(<ProductList />)

    await waitFor(() => {
      expect(screen.getByText('暂无商品')).toBeInTheDocument()
    })
  })

  it('should render error state when query fails', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch products'),
    } as any)

    renderWithQueryClient(<ProductList />)

    await waitFor(() => {
      expect(screen.getByText(/加载失败/)).toBeInTheDocument()
    })
  })

  it('should filter products by category when categoryId is provided', () => {
    const categoryId = 'cat-specific'

    renderWithQueryClient(<ProductList categoryId={categoryId} />)

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId })
    )
  })

  it('should render all product details correctly', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: {
        success: true,
        data: [mockProducts[0]],
        total: 1,
        hasNext: false,
        timestamp: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithQueryClient(<ProductList />)

    await waitFor(() => {
      expect(screen.getByText('可口可乐')).toBeInTheDocument()
      expect(screen.getByText('¥28.00')).toBeInTheDocument()
      expect(screen.getByText('推荐')).toBeInTheDocument()
    })
  })

  it('should handle mixed recommended and non-recommended products', async () => {
    vi.mocked(useProducts).mockReturnValue({
      data: {
        success: true,
        data: mockProducts,
        total: 3,
        hasNext: false,
        timestamp: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderWithQueryClient(<ProductList />)

    await waitFor(() => {
      const badges = screen.getAllByText('推荐')
      // Only 2 recommended products (芬达 and 可口可乐)
      expect(badges).toHaveLength(2)
    })
  })
})
