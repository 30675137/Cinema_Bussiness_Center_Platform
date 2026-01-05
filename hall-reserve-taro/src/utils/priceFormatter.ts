/**
 * @spec O009-miniapp-product-list
 * Price formatting utilities for product prices
 */

/**
 * Format price from cents to currency string
 * @param priceInCents - Price in cents (整数,单位:分)
 * @returns Formatted price string (e.g., "¥28.00", "免费")
 * @example
 * formatPrice(2800) // "¥28.00"
 * formatPrice(0) // "免费"
 * formatPrice(null) // "价格未设置"
 */
export const formatPrice = (priceInCents: number | null): string => {
  // Handle null/undefined
  if (priceInCents === null || priceInCents === undefined) {
    return '价格未设置'
  }

  // Handle zero price
  if (priceInCents === 0) {
    return '免费'
  }

  // Handle negative price (invalid)
  if (priceInCents < 0) {
    return '价格无效'
  }

  // Convert cents to yuan with 2 decimal places
  const yuan = priceInCents / 100
  return `¥${yuan.toFixed(2)}`
}

/**
 * Parse price string to cents
 * @param priceString - Price string (e.g., "¥28.00", "28", "28.5")
 * @returns Price in cents, or null if invalid
 * @example
 * parsePrice("¥28.00") // 2800
 * parsePrice("28.5") // 2850
 * parsePrice("invalid") // null
 */
export const parsePrice = (priceString: string): number | null => {
  if (!priceString || typeof priceString !== 'string') {
    return null
  }

  // Remove currency symbol and whitespace
  const cleaned = priceString.replace(/[¥\s,]/g, '').trim()

  // Parse to number
  const yuan = parseFloat(cleaned)

  // Validate
  if (isNaN(yuan) || yuan < 0) {
    return null
  }

  // Convert to cents and round to avoid floating point issues
  return Math.round(yuan * 100)
}

/**
 * Format price range
 * @param minPrice - Minimum price in cents
 * @param maxPrice - Maximum price in cents
 * @returns Formatted price range string
 * @example
 * formatPriceRange(2800, 5600) // "¥28.00 - ¥56.00"
 * formatPriceRange(2800, 2800) // "¥28.00"
 */
export const formatPriceRange = (
  minPrice: number | null,
  maxPrice: number | null
): string => {
  if (minPrice === null && maxPrice === null) {
    return '价格未设置'
  }

  if (minPrice === null) {
    return `最高 ${formatPrice(maxPrice)}`
  }

  if (maxPrice === null) {
    return `最低 ${formatPrice(minPrice)}`
  }

  if (minPrice === maxPrice) {
    return formatPrice(minPrice)
  }

  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price in cents
 * @param discountedPrice - Discounted price in cents
 * @returns Discount percentage (0-100), or null if invalid
 * @example
 * calculateDiscount(10000, 8000) // 20
 * calculateDiscount(10000, 10000) // 0
 */
export const calculateDiscount = (
  originalPrice: number,
  discountedPrice: number
): number | null => {
  if (originalPrice <= 0 || discountedPrice < 0 || discountedPrice > originalPrice) {
    return null
  }

  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
  return Math.round(discount)
}
