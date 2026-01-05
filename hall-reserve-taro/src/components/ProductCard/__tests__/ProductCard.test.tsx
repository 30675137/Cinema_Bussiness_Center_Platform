/**
 * @spec O009-miniapp-product-list
 * Unit tests for ProductCard component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProductCard from '../index'
import type { ProductCard as ProductCardProps } from '@/types/product'

const mockProduct: ProductCardProps = {
  id: 'test-product-id',
  name: '可口可乐',
  price: '¥28.00',
  imageUrl: 'https://example.com/coke.jpg',
  isRecommended: true,
  badge: '推荐',
}

describe('ProductCard Component', () => {
  it('should render product name', () => {
    render(<ProductCard {...mockProduct} />)

    expect(screen.getByText('可口可乐')).toBeInTheDocument()
  })

  it('should render product price', () => {
    render(<ProductCard {...mockProduct} />)

    expect(screen.getByText('¥28.00')).toBeInTheDocument()
  })

  it('should render product image with correct src', () => {
    render(<ProductCard {...mockProduct} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/coke.jpg')
  })

  it('should render recommended badge when isRecommended is true', () => {
    render(<ProductCard {...mockProduct} />)

    expect(screen.getByText('推荐')).toBeInTheDocument()
  })

  it('should not render badge when isRecommended is false', () => {
    const nonRecommendedProduct = {
      ...mockProduct,
      isRecommended: false,
      badge: undefined,
    }

    render(<ProductCard {...nonRecommendedProduct} />)

    expect(screen.queryByText('推荐')).not.toBeInTheDocument()
  })

  it('should render placeholder image when imageUrl is empty', () => {
    const productWithoutImage = {
      ...mockProduct,
      imageUrl: '/assets/images/placeholder-product.svg',
    }

    render(<ProductCard {...productWithoutImage} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/assets/images/placeholder-product.svg')
  })

  it('should apply lazy load to image', () => {
    render(<ProductCard {...mockProduct} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('lazy-load', 'true')
  })

  it('should have product name as alt text', () => {
    render(<ProductCard {...mockProduct} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', '可口可乐')
  })

  it('should render with correct data-testid', () => {
    render(<ProductCard {...mockProduct} />)

    const card = screen.getByTestId('product-card')
    expect(card).toBeInTheDocument()
  })

  it('should render product id in data attribute', () => {
    render(<ProductCard {...mockProduct} />)

    const card = screen.getByTestId('product-card')
    expect(card).toHaveAttribute('data-product-id', 'test-product-id')
  })

  it('should handle long product names', () => {
    const longNameProduct = {
      ...mockProduct,
      name: '超级无敌美味好喝的冰爽可口可乐大瓶装500ml特价优惠',
    }

    render(<ProductCard {...longNameProduct} />)

    expect(screen.getByText(/超级无敌美味好喝/)).toBeInTheDocument()
  })

  it('should handle free products (price = ¥0.00)', () => {
    const freeProduct = {
      ...mockProduct,
      price: '免费',
    }

    render(<ProductCard {...freeProduct} />)

    expect(screen.getByText('免费')).toBeInTheDocument()
  })
})
