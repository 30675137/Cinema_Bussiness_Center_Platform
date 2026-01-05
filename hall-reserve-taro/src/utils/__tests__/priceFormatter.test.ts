/**
 * @spec O009-miniapp-product-list
 * Unit tests for price formatting utilities
 */

import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  parsePrice,
  formatPriceRange,
  calculateDiscount,
} from '../priceFormatter'

describe('formatPrice', () => {
  it('should format positive price correctly', () => {
    expect(formatPrice(2800)).toBe('¥28.00')
    expect(formatPrice(100)).toBe('¥1.00')
    expect(formatPrice(1)).toBe('¥0.01')
    expect(formatPrice(9999)).toBe('¥99.99')
  })

  it('should format zero price as "免费"', () => {
    expect(formatPrice(0)).toBe('免费')
  })

  it('should format null price as "价格未设置"', () => {
    expect(formatPrice(null)).toBe('价格未设置')
  })

  it('should format negative price as "价格无效"', () => {
    expect(formatPrice(-100)).toBe('价格无效')
  })

  it('should handle large prices correctly', () => {
    expect(formatPrice(1000000)).toBe('¥10000.00')
    expect(formatPrice(9999999)).toBe('¥99999.99')
  })
})

describe('parsePrice', () => {
  it('should parse price string correctly', () => {
    expect(parsePrice('¥28.00')).toBe(2800)
    expect(parsePrice('28')).toBe(2800)
    expect(parsePrice('28.5')).toBe(2850)
    expect(parsePrice('99.99')).toBe(9999)
  })

  it('should handle price with currency symbol and spaces', () => {
    expect(parsePrice('¥ 28.00')).toBe(2800)
    expect(parsePrice('  28.00  ')).toBe(2800)
  })

  it('should handle price with comma separators', () => {
    expect(parsePrice('1,000.00')).toBe(100000)
    expect(parsePrice('¥1,234.56')).toBe(123456)
  })

  it('should return null for invalid input', () => {
    expect(parsePrice('invalid')).toBeNull()
    expect(parsePrice('')).toBeNull()
    expect(parsePrice('abc123')).toBeNull()
  })

  it('should return null for negative prices', () => {
    expect(parsePrice('-100')).toBeNull()
    expect(parsePrice('¥-50.00')).toBeNull()
  })

  it('should return zero for zero price', () => {
    expect(parsePrice('0')).toBe(0)
    expect(parsePrice('¥0.00')).toBe(0)
  })
})

describe('formatPriceRange', () => {
  it('should format price range correctly', () => {
    expect(formatPriceRange(2800, 5600)).toBe('¥28.00 - ¥56.00')
    expect(formatPriceRange(1000, 9999)).toBe('¥10.00 - ¥99.99')
  })

  it('should format same price as single price', () => {
    expect(formatPriceRange(2800, 2800)).toBe('¥28.00')
  })

  it('should handle null min price', () => {
    expect(formatPriceRange(null, 5600)).toBe('最高 ¥56.00')
  })

  it('should handle null max price', () => {
    expect(formatPriceRange(2800, null)).toBe('最低 ¥28.00')
  })

  it('should handle both null prices', () => {
    expect(formatPriceRange(null, null)).toBe('价格未设置')
  })

  it('should handle zero prices', () => {
    expect(formatPriceRange(0, 0)).toBe('免费')
    expect(formatPriceRange(0, 2800)).toBe('免费 - ¥28.00')
  })
})

describe('calculateDiscount', () => {
  it('should calculate discount percentage correctly', () => {
    expect(calculateDiscount(10000, 8000)).toBe(20)
    expect(calculateDiscount(10000, 5000)).toBe(50)
    expect(calculateDiscount(10000, 9000)).toBe(10)
  })

  it('should return 0 for no discount', () => {
    expect(calculateDiscount(10000, 10000)).toBe(0)
  })

  it('should return null for invalid input', () => {
    expect(calculateDiscount(0, 5000)).toBeNull()
    expect(calculateDiscount(-100, 50)).toBeNull()
    expect(calculateDiscount(10000, -100)).toBeNull()
  })

  it('should return null when discounted price > original price', () => {
    expect(calculateDiscount(5000, 10000)).toBeNull()
  })

  it('should handle 100% discount', () => {
    expect(calculateDiscount(10000, 0)).toBe(100)
  })

  it('should round discount percentage', () => {
    expect(calculateDiscount(10000, 6666)).toBe(33) // 33.34% rounded
    expect(calculateDiscount(10000, 3333)).toBe(67) // 66.67% rounded
  })
})
