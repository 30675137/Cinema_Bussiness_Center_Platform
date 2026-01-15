/**
 * @spec O009-miniapp-product-list
 * CategoryTabs Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryTabs from '../index'

describe('CategoryTabs', () => {
  const mockCategories = [
    { id: '1', name: '爆米花' },
    { id: '2', name: '饮料' },
    { id: '3', name: '零食' },
  ]

  it('should render all category tabs', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        selectedId={null}
        onSelect={vi.fn()}
      />
    )

    expect(screen.getByText('全部')).toBeTruthy()
    expect(screen.getByText('爆米花')).toBeTruthy()
    expect(screen.getByText('饮料')).toBeTruthy()
    expect(screen.getByText('零食')).toBeTruthy()
  })

  it('should render "全部" tab as first option', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        selectedId={null}
        onSelect={vi.fn()}
      />
    )

    const tabs = screen.getAllByRole('button')
    expect(tabs[0]).toHaveTextContent('全部')
  })

  it('should highlight "全部" when selectedId is null', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        selectedId={null}
        onSelect={vi.fn()}
      />
    )

    const allTab = screen.getByText('全部').parentElement
    expect(allTab?.getAttribute('data-active')).toBe('true')
  })

  it('should highlight selected category', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        selectedId="2"
        onSelect={vi.fn()}
      />
    )

    const selectedTab = screen.getByText('饮料').parentElement
    expect(selectedTab?.getAttribute('data-active')).toBe('true')
  })

  it('should call onSelect with null when "全部" is clicked', () => {
    const onSelect = vi.fn()
    render(
      <CategoryTabs
        categories={mockCategories}
        selectedId="1"
        onSelect={onSelect}
      />
    )

    const allTab = screen.getByText('全部')
    allTab.click()

    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('should call onSelect with category id when tab is clicked', () => {
    const onSelect = vi.fn()
    render(
      <CategoryTabs
        categories={mockCategories}
        selectedId={null}
        onSelect={onSelect}
      />
    )

    const categoryTab = screen.getByText('饮料')
    categoryTab.click()

    expect(onSelect).toHaveBeenCalledWith('2')
  })

  it('should render with testid', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        selectedId={null}
        onSelect={vi.fn()}
      />
    )

    expect(screen.getByTestId('category-tabs')).toBeTruthy()
  })

  it('should render empty tabs container when no categories', () => {
    render(<CategoryTabs categories={[]} selectedId={null} onSelect={vi.fn()} />)

    expect(screen.getByTestId('category-tabs')).toBeTruthy()
    expect(screen.getByText('全部')).toBeTruthy()
  })

  it('should have data-category-id attribute on each tab', () => {
    render(
      <CategoryTabs
        categories={mockCategories}
        selectedId={null}
        onSelect={vi.fn()}
      />
    )

    const popcornTab = screen.getByText('爆米花').parentElement
    expect(popcornTab?.getAttribute('data-category-id')).toBe('1')
  })

  it('should render tabs in a scrollable container', () => {
    const { container } = render(
      <CategoryTabs
        categories={mockCategories}
        selectedId={null}
        onSelect={vi.fn()}
      />
    )

    // Check that tabs are rendered in a container
    const tabsContainer = container.querySelector('[data-testid="category-tabs"]')
    expect(tabsContainer).toBeTruthy()
    expect(tabsContainer?.children.length).toBeGreaterThan(0)
  })
})
