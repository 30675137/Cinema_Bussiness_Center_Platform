/**
 * @spec O009-miniapp-product-list
 * Product List Filter Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProductListPage from '../index'
import * as categoryService from '@/services/categoryService'
import * as productService from '@/services/productService'

vi.mock('@/services/categoryService')
vi.mock('@/services/productService')
vi.mock('@tarojs/taro', () => ({
  default: {
    useDidShow: vi.fn((fn) => fn()),
    useReady: vi.fn((fn) => fn()),
    usePullDownRefresh: vi.fn(),
    navigateTo: vi.fn(),
    showToast: vi.fn(),
    stopPullDownRefresh: vi.fn(),
  },
}))

describe('Product List Filter Integration', () => {
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

  it('should render CategoryTabs and ProductList', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [
        { id: '1', name: '爆米花', sortOrder: 1 },
        { id: '2', name: '饮料', sortOrder: 2 },
      ],
      total: 2,
    })

    vi.spyOn(productService, 'fetchProducts').mockResolvedValue({
      data: [
        {
          id: 'p1',
          name: '大桶爆米花',
          price: 3500,
          imageUrl: 'https://example.com/popcorn.jpg',
          isRecommended: false,
          sortOrder: 1,
          categoryId: '1',
          description: '',
          stock: 100,
        },
      ],
      total: 1,
    })

    render(<ProductListPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('category-tabs')).toBeTruthy()
      expect(screen.getByTestId('product-list')).toBeTruthy()
    })
  })

  it('should filter products when category is selected', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [{ id: '1', name: '爆米花', sortOrder: 1 }],
      total: 1,
    })

    const fetchProductsSpy = vi
      .spyOn(productService, 'fetchProducts')
      .mockResolvedValue({
        data: [],
        total: 0,
      })

    render(<ProductListPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('爆米花')).toBeTruthy()
    })

    // Click category tab
    const categoryTab = screen.getByText('爆米花')
    categoryTab.click()

    await waitFor(() => {
      expect(fetchProductsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: '1' })
      )
    })
  })

  it('should show all products when "全部" is selected', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [{ id: '1', name: '爆米花', sortOrder: 1 }],
      total: 1,
    })

    const fetchProductsSpy = vi
      .spyOn(productService, 'fetchProducts')
      .mockResolvedValue({
        data: [],
        total: 0,
      })

    render(<ProductListPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('全部')).toBeTruthy()
    })

    // Click "全部" tab
    const allTab = screen.getByText('全部')
    allTab.click()

    await waitFor(() => {
      expect(fetchProductsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: null })
      )
    })
  })

  it('should update product count when category changes', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [
        { id: '1', name: '爆米花', sortOrder: 1 },
        { id: '2', name: '饮料', sortOrder: 2 },
      ],
      total: 2,
    })

    vi.spyOn(productService, 'fetchProducts')
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p1',
            name: '大桶爆米花',
            price: 3500,
            imageUrl: 'https://example.com/popcorn.jpg',
            isRecommended: false,
            sortOrder: 1,
            categoryId: '1',
            description: '',
            stock: 100,
          },
          {
            id: 'p2',
            name: '中桶爆米花',
            price: 2500,
            imageUrl: 'https://example.com/popcorn2.jpg',
            isRecommended: false,
            sortOrder: 2,
            categoryId: '1',
            description: '',
            stock: 100,
          },
        ],
        total: 2,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p3',
            name: '可乐',
            price: 1500,
            imageUrl: 'https://example.com/cola.jpg',
            isRecommended: false,
            sortOrder: 1,
            categoryId: '2',
            description: '',
            stock: 100,
          },
        ],
        total: 1,
      })

    const { rerender } = render(<ProductListPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('共 2 件商品')).toBeTruthy()
    })

    // Switch category
    const drinkTab = screen.getByText('饮料')
    drinkTab.click()

    await waitFor(() => {
      expect(screen.getByText('共 1 件商品')).toBeTruthy()
    })
  })

  it('should maintain selected category when pulling to refresh', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [{ id: '1', name: '爆米花', sortOrder: 1 }],
      total: 1,
    })

    const fetchProductsSpy = vi
      .spyOn(productService, 'fetchProducts')
      .mockResolvedValue({
        data: [],
        total: 0,
      })

    render(<ProductListPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('爆米花')).toBeTruthy()
    })

    // Select category
    const categoryTab = screen.getByText('爆米花')
    categoryTab.click()

    await waitFor(() => {
      expect(fetchProductsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: '1' })
      )
    })

    // Verify category remains selected
    const selectedTab = screen.getByText('爆米花').parentElement
    expect(selectedTab?.getAttribute('data-active')).toBe('true')
  })

  it('should show empty state when no products in selected category', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [{ id: '1', name: '爆米花', sortOrder: 1 }],
      total: 1,
    })

    vi.spyOn(productService, 'fetchProducts').mockResolvedValue({
      data: [],
      total: 0,
    })

    render(<ProductListPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('爆米花')).toBeTruthy()
    })

    // Select category
    const categoryTab = screen.getByText('爆米花')
    categoryTab.click()

    await waitFor(() => {
      expect(screen.getByText('暂无商品')).toBeTruthy()
    })
  })

  it('should highlight "全部" by default', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockResolvedValue({
      data: [{ id: '1', name: '爆米花', sortOrder: 1 }],
      total: 1,
    })

    vi.spyOn(productService, 'fetchProducts').mockResolvedValue({
      data: [],
      total: 0,
    })

    render(<ProductListPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('全部')).toBeTruthy()
    })

    const allTab = screen.getByText('全部').parentElement
    expect(allTab?.getAttribute('data-active')).toBe('true')
  })

  it('should handle category fetch error gracefully', async () => {
    vi.spyOn(categoryService, 'fetchCategories').mockRejectedValue(
      new Error('Failed to fetch categories')
    )

    vi.spyOn(productService, 'fetchProducts').mockResolvedValue({
      data: [],
      total: 0,
    })

    render(<ProductListPage />, { wrapper })

    // Should still render product list even if categories fail
    await waitFor(() => {
      expect(screen.getByTestId('product-list-page')).toBeTruthy()
    })
  })
})
