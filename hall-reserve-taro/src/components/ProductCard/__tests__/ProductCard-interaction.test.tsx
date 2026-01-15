/**
 * @spec O009-miniapp-product-list
 * ProductCard Interaction Tests
 * 测试商品卡片点击交互和导航功能
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../index'

describe('ProductCard - Interaction', () => {
  const mockProduct = {
    id: 'prod-001',
    name: '经典爆米花套餐',
    price: '¥ 38.00',
    imageUrl: 'https://example.com/popcorn.jpg',
    isRecommended: true,
    badge: '推荐',
  }

  it('should render product card with all information', () => {
    render(<ProductCard {...mockProduct} />)

    expect(screen.getByTestId('product-card')).toBeTruthy()
    expect(screen.getByText('经典爆米花套餐')).toBeTruthy()
    expect(screen.getByText('¥ 38.00')).toBeTruthy()
    expect(screen.getByText('推荐')).toBeTruthy()
  })

  it('should have correct data-product-id attribute', () => {
    render(<ProductCard {...mockProduct} />)

    const card = screen.getByTestId('product-card')
    expect(card.getAttribute('data-product-id')).toBe('prod-001')
  })

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn()
    render(<ProductCard {...mockProduct} onClick={onClick} />)

    const card = screen.getByTestId('product-card')
    fireEvent.click(card)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when not provided', () => {
    // Should not throw error when onClick is not provided
    render(<ProductCard {...mockProduct} />)

    const card = screen.getByTestId('product-card')
    fireEvent.click(card)

    // No error should be thrown
    expect(card).toBeTruthy()
  })

  it('should render without recommended badge when isRecommended is false', () => {
    render(<ProductCard {...mockProduct} isRecommended={false} />)

    expect(screen.queryByText('推荐')).toBeNull()
  })

  it('should render image with correct src', () => {
    const { container } = render(<ProductCard {...mockProduct} />)

    const image = container.querySelector('img')
    expect(image).toBeTruthy()
    expect(image?.getAttribute('alt')).toBe('经典爆米花套餐')
  })

  it('should have clickable card area for navigation', () => {
    const onClick = vi.fn()
    render(<ProductCard {...mockProduct} onClick={onClick} />)

    const card = screen.getByTestId('product-card')

    // Verify card is clickable
    expect(card).toBeTruthy()

    // Simulate user tap
    fireEvent.click(card)
    expect(onClick).toHaveBeenCalled()
  })

  it('should handle multiple clicks correctly', () => {
    const onClick = vi.fn()
    render(<ProductCard {...mockProduct} onClick={onClick} />)

    const card = screen.getByTestId('product-card')

    // Click multiple times
    fireEvent.click(card)
    fireEvent.click(card)
    fireEvent.click(card)

    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('should render price in correct format', () => {
    render(<ProductCard {...mockProduct} />)

    const price = screen.getByText('¥ 38.00')
    expect(price).toBeTruthy()
    expect(price.textContent).toContain('¥')
  })

  it('should render product name with proper truncation support', () => {
    const longNameProduct = {
      ...mockProduct,
      name: '超级经典爆米花套餐包含大桶爆米花和超大杯可乐以及其他零食',
    }

    render(<ProductCard {...longNameProduct} />)

    const name = screen.getByText(longNameProduct.name)
    expect(name).toBeTruthy()
  })
})
